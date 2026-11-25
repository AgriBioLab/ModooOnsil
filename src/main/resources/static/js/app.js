(() => {
  'use strict';

  const {
    ready,
    notify: toast,
    escapeHtml,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu
  } = window.ModooCommon;

  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  const htmlText = escapeHtml;
  const clone = value => JSON.parse(JSON.stringify(value));

  const CYCLE_SEED_REV = '2026-11-18-v2';
  const TRASH_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';
  const CALENDAR_SVG =
    '<svg class="drp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  const STD_METRIC_COLS = [
    ['dayTempC', '주간 온도(°C)'],
    ['nightTempC', '야간 온도(°C)'],
    ['humidityPct', '습도(%RH)'],
    ['co2Ppm', 'CO₂(ppm)'],
    ['solarWm2', '일사량(W/m²)'],
    ['lightUmolM2S', '광도(μmol/m²/s)'],
    ['substrateTempC', '배지 온도(°C)'],
    ['substrateMoisturePct', '배지 수분(%)'],
    ['substrateEcMsCm', '배지 EC(mS/cm)'],
    ['substratePh', '배지 pH']
  ];

  const config = clone(sampleData);
  const diaryRows = [];
  const pages = {};
  const state = {
    page: 'list',
    selectedId: null,
    selectedCycleId: null,
    selectedGhId: null,
    selectedIssueId: null
  };
  const main = $('#main');

  const pad2 = value => String(value).padStart(2, '0');
  const formatYearMonth = (year, month) => `${year}-${pad2(month + 1)}`;
  const shiftYearMonth = ([year, month], delta) => {
    const shifted = new Date(year, month + delta, 1);
    return [shifted.getFullYear(), shifted.getMonth()];
  };

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }

  function storageKey(kind) {
    return `modoo-sprint2:${sampleData.meta.version}:${config.header.currentUser.id}:${kind}`;
  }

  function buildPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    if (currentPage <= 3) endPage = 5;
    if (currentPage >= totalPages - 2) startPage = totalPages - 4;
    const list = [1];
    if (startPage > 2) list.push('...');
    for (let page = startPage; page <= endPage; page += 1) list.push(page);
    if (endPage < totalPages - 1) list.push('...');
    list.push(totalPages);
    return list;
  }

  function pageBtns(currentPage, totalPages, attributeName) {
    return buildPageNumbers(currentPage, totalPages)
      .map(page =>
        page === '...'
          ? '<span class="page-ellipsis" aria-hidden="true">…</span>'
          : `<button type="button" class="page-button" ${attributeName}="${page}" ${page === currentPage ? 'aria-current="page"' : ''} aria-label="${page}페이지">${page}</button>`
      )
      .join('');
  }

  function options(items, selectedValue) {
    return items
      .map(
        item =>
          `<option value="${escapeHtml(item.value)}" ${String(item.value) === String(selectedValue) ? 'selected' : ''}>${escapeHtml(item.label)}</option>`
      )
      .join('');
  }

  const getCycle = id => config.cycles.find(cycle => cycle.cycleId === id) || config.cycles[0];
  const gh = id => config.greenhouses.find(house => house.greenhouseId === id);
  const cropOf = cycle => config.crops.find(crop => crop.cropId === cycle.cropId);
  const varietyOf = cycle =>
    (cropOf(cycle)?.varieties || []).find(variety => variety.varietyId === cycle.varietyId);
  const getStage = id =>
    config.growthStages.find(stage => stage.stageId === id) || config.growthStages[0];
  const stageOrder = id => getStage(id).order;
  const getSelectedCycle = () =>
    config.cycles.find(cycle => cycle.cycleId === state.selectedCycleId) || config.cycles[0];
  const cycleStatus = cycle => cycle.status || '미진행';

  function stageByDate(cycle, date) {
    const events = [...cycle.stageHistory]
      .filter(event => event.effectiveDate <= date)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    return events.at(-1)?.stageId || config.growthStages[0].stageId;
  }

  function lastEvent(cycle) {
    return [...cycle.stageHistory]
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
      .at(-1);
  }

  const timeOf = task => String(task.startedAt || '').slice(11, 16) || '09:00';
  const timeSort = (a, b) =>
    timeOf(a).localeCompare(timeOf(b)) || (a.taskId || '').localeCompare(b.taskId || '');
  const makeStarted = (date, time) => `${date}T${time}:00`;
  const formatAt = timestamp =>
    timestamp ? String(timestamp).replace('T', ' ').slice(0, 16) : '—';
  const dateFrom = timestamp => String(timestamp || '').slice(0, 10);
  const fmtVal = value => (value === null || value === undefined ? '—' : String(value));

  const statusBadge = (label, toneMap = {}) =>
    `<span class="krds-badge ${toneMap[label] || 'bg-light-gray'}">${htmlText(label)}</span>`;
  const taskTone = status => (status === '완료' ? 'bg-light-success' : 'bg-light-gray');

  function getCriteria(cycle, stageId) {
    const standard =
      config.standardSets.find(item => item.id === cycle?.environmentStandardSetId) ||
      config.standardSets[0];
    return config.stageEnvironmentalCriteria.find(
      item => item.varietyId === standard.varietyId && item.stageId === stageId
    );
  }

  function toReason(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
      return Object.values(value)
        .filter(Boolean)
        .map(item => String(item).trim())
        .join(' / ');
    }
    return '';
  }

  function getReasons(reason) {
    const text = toReason(reason);
    return text ? `<p class="reason-text">${htmlText(text)}</p>` : '';
  }

  function persist() {
    try {
      const cycleStageHistories = Object.fromEntries(
        config.cycles.map(cycle => [cycle.cycleId, cycle.stageHistory])
      );
      localStorage.setItem(
        storageKey('diaries'),
        JSON.stringify({ diaries: diaryRows, cycleStageHistories })
      );
    } catch {}
  }

  function loadSaved() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey('diaries')) || 'null');
    } catch {}
    const sourceDiaries = Array.isArray(saved?.diaries)
      ? saved.diaries
      : clone(config.sampleDiaries);
    diaryRows.splice(0, diaryRows.length, ...sourceDiaries);

    if (saved?.cycleStageHistories) {
      for (const cycle of config.cycles) {
        const savedHistory = saved.cycleStageHistories[cycle.cycleId];
        if (!Array.isArray(savedHistory)) continue;
        cycle.stageHistory = savedHistory.map(({ reasons, ...rest }) => ({
          ...rest,
          reason: toReason(rest.reason || reasons)
        }));
      }
    }

    diaryRows.forEach(diary => {
      delete diary.title;
      diary.stageChangeReason = toReason(diary.stageChangeReason || diary.stageChangeReasons);
      delete diary.stageChangeReasons;
      diary.tasks = (diary.tasks || [])
        .map(task => ({
          ...task,
          startedAt: task.startedAt || makeStarted(diary.workDate, task.time || '09:00'),
          name: task.name || task.type,
          content: task.content ?? ''
        }))
        .sort(timeSort);
    });
  }

  function storeCycleExtras() {
    try {
      localStorage.setItem(
        storageKey('cycles'),
        JSON.stringify({ seedRev: CYCLE_SEED_REV, cycles: config.cycles })
      );
    } catch {}
  }

  function loadCycleExtras() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey('cycles')) || 'null');
      if (!Array.isArray(saved?.cycles)) return;
      const validCycles = saved.cycles
        .filter(
          cycle => cycle && cycle.cycleId && cycle.greenhouseId && cycle.environmentStandardSetId
        )
        .map(cycle => ({
          ...cycle,
          stageHistory: Array.isArray(cycle.stageHistory) ? cycle.stageHistory : []
        }));
      if (saved.seedRev !== CYCLE_SEED_REV) {
        const seedIds = new Set(sampleData.cycles.map(seed => seed.cycleId));
        const customCycles = validCycles.filter(cycle => !seedIds.has(cycle.cycleId));
        config.cycles = [...clone(sampleData.cycles), ...customCycles];
        storeCycleExtras();
        return;
      }
      if (validCycles.length) {
        config.cycles = validCycles;
      }
    } catch {}
  }

  function storeIssueExtras() {
    try {
      localStorage.setItem(storageKey('issues'), JSON.stringify({ issues: config.issueSamples }));
    } catch {}
  }

  function loadIssueExtras() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey('issues')) || 'null');
      if (Array.isArray(saved?.issues) && saved.issues.length) {
        config.issueSamples = saved.issues;
      }
    } catch {}
  }

  function storeGreenhouseExtras() {
    try {
      localStorage.setItem(
        storageKey('greenhouses'),
        JSON.stringify({ greenhouses: config.greenhouses })
      );
    } catch {}
  }

  function loadGreenhouseExtras() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey('greenhouses')) || 'null');
      if (!Array.isArray(saved?.greenhouses) || !saved.greenhouses.length) return;
      config.greenhouses = saved.greenhouses.map(house => {
        const hasValidImage =
          house.imageUrl !== undefined && !String(house.imageUrl || '').endsWith('.svg');
        if (hasValidImage) return house;
        const fallbackImage =
          sampleData.greenhouses.find(seed => seed.greenhouseId === house.greenhouseId)?.imageUrl ??
          null;
        return { ...house, imageUrl: fallbackImage };
      });
    } catch {}
  }

  function error(message) {
    const errorEl = $('#formError');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    toast(message);
  }

  function resolveMenuEntry(page) {
    if (page === 'cycle-create') return 'cycle-create';
    if (page.startsWith('cycle-')) return 'cycle-list';
    if (page === 'gh-create') return 'gh-create';
    if (page.startsWith('gh-')) return 'gh-list';
    if (page.startsWith('env-')) return 'env-list';
    if (page.startsWith('issue-')) return 'issue-list';
    if (page === 'create') return 'create';
    return 'list';
  }

  function updateNavigation() {
    if (state.page === 'home') {
      setCurrentMenu('home');
      $('#crumb').textContent = '홈 / 농장 현황';
      return;
    }
    const currentLink = setCurrentMenu(resolveMenuEntry(state.page));
    const viewKey = state.page.replace(/^(cycle-|gh-|env-|issue-)/, '');
    const stepLabel =
      { list: '목록', create: '등록', detail: '상세', edit: '수정' }[viewKey] || '목록';
    const isGreenhouseSection =
      state.page.startsWith('gh-') ||
      state.page.startsWith('env-') ||
      state.page.startsWith('issue-');
    const sectionLabel = state.page.startsWith('cycle-')
      ? '작기계획'
      : state.page.startsWith('gh-')
        ? '온실 정보'
        : state.page.startsWith('env-') || state.page.startsWith('issue-')
          ? currentLink?.textContent || ''
          : '재배일지작업';
    const crumbs = isGreenhouseSection
      ? ['온실', sectionLabel, stepLabel]
      : [sectionLabel, stepLabel];
    $('#crumb').textContent = crumbs.filter(Boolean).join(' / ');
  }

  function resolvePageFile(target) {
    if (target === 'home') return 'index.html';
    if (target.startsWith('cycle-')) return 'cultivationPlanList.html';
    if (target.startsWith('gh-')) return 'greenhouseList.html';
    if (target.startsWith('env-')) return 'environmentChangeList.html';
    if (target.startsWith('issue-')) return 'environmentIssueList.html';
    if (target === 'member') return 'mypage?tab=pw';
    if (target === 'profile') return 'mypage';
    if (target === 'cert') return 'mypage?tab=cert';
    return 'cultivation-diaries';
  }

  function go(target, id) {
    if (target === 'create') {
      location.assign(new URL('cultivation-diaries/new', document.baseURI));
      return;
    }
    if (target === 'detail' || target === 'edit') {
      const path = 'cultivation-diaries/' + encodeURIComponent(id) + (target === 'edit' ? '/edit' : '');
      location.assign(new URL(path, document.baseURI));
      return;
    }
    if (target === 'list' && document.body.dataset.diaryView && document.body.dataset.diaryView !== 'list') {
      location.assign(new URL('cultivation-diaries', document.baseURI));
      return;
    }
    const hostPage = document.body?.dataset?.page;
    const targetFile = resolvePageFile(target);
    if (hostPage && targetFile.split('?')[0] !== resolvePageFile(hostPage).split('?')[0]) {
      const destination = new URL(targetFile, document.baseURI);
      if (target !== hostPage && target !== 'cert') destination.searchParams.set('view', target);
      if (id) destination.searchParams.set('id', id);
      location.href = destination.href;
      return;
    }
    if (target.startsWith('issue-') && id) state.selectedIssueId = id;
    else if (target.startsWith('cycle-') && id) state.selectedCycleId = id;
    else if (target.startsWith('gh-') && id) state.selectedGhId = id;
    else if (id) state.selectedId = id;

    state.page = target;
    render();
  }

  function render() {
    updateNavigation();
    if (state.page === 'home') {
      pages.home?.renderHome();
      return;
    }
    if (state.page.startsWith('cycle-')) {
      if (state.page === 'cycle-list') pages.cycle?.renderCycleList();
      else if (state.page === 'cycle-detail') pages.cycle?.renderCycleDetail();
      else pages.cycle?.renderCycleEditor(state.page === 'cycle-edit');
      return;
    }
    if (state.page.startsWith('gh-')) {
      if (state.page === 'gh-list') pages.greenhouse?.renderGreenhouseList();
      else if (state.page === 'gh-detail') pages.greenhouse?.renderGreenhouseDetail();
      else pages.greenhouse?.renderGreenhouseEditor(state.page === 'gh-edit');
      return;
    }
    if (state.page.startsWith('env-')) {
      pages.environment?.renderEnvList();
      return;
    }
    if (state.page.startsWith('issue-')) {
      pages.environment?.renderIssues(state.page === 'issue-detail');
      return;
    }
    if (state.page === 'list') {
      pages.diary?.renderList();
      return;
    }
    if (state.page === 'detail') {
      pages.diary?.renderDetail();
      return;
    }
    pages.diary?.renderEditor(state.page === 'edit');
  }

  function heading(title, description = '', showBack = false) {
    return `<div class="pagehead">
      <div>
        <h1>${title}</h1>
        ${description ? `<p>${htmlText(description)}</p>` : ''}
      </div>
      ${showBack ? '<button type="button" class="backlink" id="returnList">← 재배일지작업 목록으로</button>' : ''}
    </div>`;
  }

  function bindBack() {
    const backButton = $('#returnList');
    if (backButton) backButton.addEventListener('click', () => go('list'));
  }

  function moduleHeading(title, caption = '', backLabel = '', backTarget = '') {
    return `<div class="pagehead">
      <div>
        <h1>${htmlText(title)}</h1>
        ${caption ? `<p>${htmlText(caption)}</p>` : ''}
      </div>
      ${backLabel ? `<button type="button" class="backlink" id="moduleBack" data-goto="${backTarget}">← ${htmlText(backLabel)}</button>` : ''}
    </div>`;
  }

  function bindModuleBack() {
    const backButton = $('#moduleBack');
    if (backButton) backButton.onclick = () => go(backButton.dataset.goto);
  }

  function pageControls(totalCount, currentPage, pageSize, label) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    return `<div class="list-foot">
      <nav class="pagination" aria-label="${htmlText(label)} 페이지 이동">
        <button class="page-button" data-modpage="prev" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
        ${pageBtns(currentPage, totalPages, 'data-modpage')}
        <button class="page-button" data-modpage="next" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
      </nav>
    </div>`;
  }

  function bindPages(getPage, setPage, totalCount, pageSize, redraw) {
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    $$('[data-modpage]').forEach(button => {
      button.onclick = () => {
        const value = button.dataset.modpage;
        if (value === 'prev') setPage(Math.max(1, getPage() - 1));
        else if (value === 'next') setPage(Math.min(maxPage, getPage() + 1));
        else setPage(Number(value));
        redraw();
      };
    });
  }

  function unifiedListPanel({
    title,
    count,
    actionHtml = '',
    filterHtml = '',
    filterTag = 'div',
    filterId = '',
    filterClass = '',
    bodyHtml = '',
    footHtml = '',
    ariaLabel
  }) {
    const filterIdAttr = filterId ? ` id="${filterId}"` : '';
    const filterCls = filterClass ? `list-filter-strip ${filterClass}` : 'list-filter-strip';
    const filterBar = filterHtml
      ? `<${filterTag} class="${filterCls}"${filterIdAttr}>${filterHtml}</${filterTag}>`
      : '';
    const summaryBar = `<div class="list-summary-bar">
      <span class="list-total-count">총 <strong>${count}</strong>건</span>
      ${actionHtml ? `<div class="list-summary-actions">${actionHtml}</div>` : ''}
    </div>`;
    return `<section class="panel list-section" aria-label="${htmlText(ariaLabel || title)}">${filterBar}${summaryBar}${bodyHtml}${footHtml}</section>`;
  }

  function listFilterField(id, label, controlHtml, extraClass = '') {
    const fieldClass = extraClass ? `list-ctrl-field ${extraClass}` : 'list-ctrl-field';
    return `<label class="${fieldClass}"${id ? ` for="${id}"` : ''}><span>${htmlText(label)}</span>${controlHtml}</label>`;
  }

  function closeAllDatePopovers() {
    document.querySelectorAll('.drp-popover').forEach(popover => popover.classList.add('hidden'));
    document
      .querySelectorAll('.drp-trigger')
      .forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  }

  function bindDatePopoverDismiss() {
    if (window.__drpDocClick) document.removeEventListener('click', window.__drpDocClick);
    window.__drpDocClick = event => {
      if (!event.target.closest('.drp-wrap')) closeAllDatePopovers();
    };
    document.addEventListener('click', window.__drpDocClick);

    if (window.__drpDocKey) document.removeEventListener('keydown', window.__drpDocKey);
    window.__drpDocKey = event => {
      if (event.key !== 'Escape') return;
      const openPopover = document.querySelector('.drp-popover:not(.hidden)');
      if (!openPopover) return;
      const activeTrigger = openPopover.closest('.drp-wrap')?.querySelector('.drp-trigger');
      closeAllDatePopovers();
      if (activeTrigger) activeTrigger.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', window.__drpDocKey);
  }

  function dateRangeControl(idPrefix, fromValue, toValue) {
    const hasValue = Boolean(fromValue || toValue);
    const label = hasValue
      ? `${fromValue || '시작일'} ~ ${toValue || '종료일'}`
      : '연도-월-일 ~ 연도-월-일';
    return `<div class="drp-wrap" id="${idPrefix}Wrap">
      <input type="hidden" id="${idPrefix}From" value="${htmlText(fromValue)}">
      <input type="hidden" id="${idPrefix}To" value="${htmlText(toValue)}">
      <button type="button" class="ctrl drp-trigger${hasValue ? '' : ' is-placeholder'}" id="${idPrefix}Trigger" aria-expanded="false">
        <span>${htmlText(label)}</span>${CALENDAR_SVG}
      </button>
      <div class="drp-popover hidden" id="${idPrefix}Pop" role="dialog" aria-label="기간 선택 달력"></div>
    </div>`;
  }

  function mountDateRangePicker(idPrefix) {
    const wrap = $(`#${idPrefix}Wrap`);
    const trigger = $(`#${idPrefix}Trigger`);
    const popover = $(`#${idPrefix}Pop`);
    const fromInput = $(`#${idPrefix}From`);
    const toInput = $(`#${idPrefix}To`);
    if (!wrap || !trigger || !popover || !fromInput || !toInput) return;

    let draftFrom = fromInput.value;
    let draftTo = toInput.value;
    const baseStart = draftFrom
      ? new Date(`${draftFrom}T00:00:00`)
      : new Date(`${today()}T00:00:00`);
    let startYM = [baseStart.getFullYear(), baseStart.getMonth()];
    let endYM = draftTo
      ? [new Date(`${draftTo}T00:00:00`).getFullYear(), new Date(`${draftTo}T00:00:00`).getMonth()]
      : shiftYearMonth(startYM, 1);

    const closePopover = () => {
      popover.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const buildCalendarPane = (title, [year, month], side) => {
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      let cells = '';

      for (let i = firstWeekday - 1; i >= 0; i -= 1) {
        cells += `<span class="drp-day is-out">${prevMonthDays - i}</span>`;
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const iso = `${formatYearMonth(year, month)}-${pad2(day)}`;
        const isEdge = iso === draftFrom || iso === draftTo;
        const isInRange = draftFrom && draftTo && iso > draftFrom && iso < draftTo;
        cells += `<button type="button" class="drp-day${isEdge ? ' is-selected' : ''}${isInRange ? ' is-in-range' : ''}" data-drp-pick="${side}" data-drp-date="${iso}">${day}</button>`;
      }
      const remainder = (firstWeekday + daysInMonth) % 7;
      if (remainder) {
        for (let day = 1; day <= 7 - remainder; day += 1) {
          cells += `<span class="drp-day is-out">${day}</span>`;
        }
      }

      return `<div class="drp-pane">
        <div class="drp-pane-title">${title}</div>
        <div class="drp-nav">
          <button type="button" class="drp-nav-btn" data-drp-nav="${side}:-1" aria-label="이전 달">‹</button>
          <strong>${year}년 ${month + 1}월</strong>
          <button type="button" class="drp-nav-btn" data-drp-nav="${side}:1" aria-label="다음 달">›</button>
        </div>
        <div class="drp-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>
        <div class="drp-days">${cells}</div>
        <div class="drp-pane-foot"><button type="button" class="btn xs" data-drp-today="${side}">오늘</button></div>
      </div>`;
    };

    const drawPopover = () => {
      popover.innerHTML = `<div class="drp-grid">
          ${buildCalendarPane('시작일', startYM, 'from')}
          ${buildCalendarPane('종료일', endYM, 'to')}
        </div>
        <div class="drp-foot">
          <button type="button" class="btn xs" data-drp-action="clear">초기화</button>
          <div class="drp-foot-right">
            <button type="button" class="btn xs" data-drp-action="close">닫기</button>
            <button type="button" class="btn main xs" data-drp-action="apply">선택완료</button>
          </div>
        </div>`;

      popover.querySelectorAll('[data-drp-nav]').forEach(button => {
        button.onclick = () => {
          const [side, delta] = button.dataset.drpNav.split(':');
          if (side === 'from') startYM = shiftYearMonth(startYM, Number(delta));
          else endYM = shiftYearMonth(endYM, Number(delta));
          drawPopover();
        };
      });

      popover.querySelectorAll('[data-drp-pick]').forEach(button => {
        button.onclick = () => {
          const side = button.dataset.drpPick;
          const date = button.dataset.drpDate;
          if (side === 'from') {
            draftFrom = date;
            if (draftTo && draftFrom > draftTo) draftTo = draftFrom;
          } else {
            draftTo = date;
            if (draftFrom && draftTo < draftFrom) draftFrom = draftTo;
          }
          drawPopover();
        };
      });

      popover.querySelectorAll('[data-drp-today]').forEach(button => {
        button.onclick = () => {
          const side = button.dataset.drpToday;
          const todayIso = today();
          const todayYM = [Number(todayIso.slice(0, 4)), Number(todayIso.slice(5, 7)) - 1];
          if (side === 'from') {
            draftFrom = todayIso;
            startYM = todayYM;
            if (draftTo && draftFrom > draftTo) draftTo = draftFrom;
          } else {
            draftTo = todayIso;
            endYM = todayYM;
            if (draftFrom && draftTo < draftFrom) draftFrom = draftTo;
          }
          drawPopover();
        };
      });

      popover.querySelector('[data-drp-action="clear"]').onclick = () => {
        draftFrom = '';
        draftTo = '';
        fromInput.value = '';
        toInput.value = '';
        trigger.classList.add('is-placeholder');
        trigger.querySelector('span').textContent = '연도-월-일 ~ 연도-월-일';
        closePopover();
      };

      popover.querySelector('[data-drp-action="close"]').onclick = closePopover;

      popover.querySelector('[data-drp-action="apply"]').onclick = () => {
        fromInput.value = draftFrom;
        toInput.value = draftTo;
        const hasValue = Boolean(draftFrom || draftTo);
        trigger.classList.toggle('is-placeholder', !hasValue);
        trigger.querySelector('span').textContent = hasValue
          ? `${draftFrom || '시작일'} ~ ${draftTo || '종료일'}`
          : '연도-월-일 ~ 연도-월-일';
        closePopover();
      };
    };

    popover.onclick = event => event.stopPropagation();
    trigger.onclick = event => {
      event.stopPropagation();
      const willOpen = popover.classList.contains('hidden');
      closeAllDatePopovers();
      if (!willOpen) return;
      draftFrom = fromInput.value;
      draftTo = toInput.value;
      drawPopover();
      popover.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    };

    bindDatePopoverDismiss();
  }

  function singleDateControl(id, value = '', opts = {}) {
    const currentValue = value || '';
    const hasValue = Boolean(currentValue);
    const placeholder = opts.placeholder || '연도-월-일';
    return `<div class="drp-wrap drp-single-wrap" id="${id}Wrap">
      <input type="hidden" id="${id}" value="${htmlText(currentValue)}" data-min="${htmlText(opts.min || '')}" data-max="${htmlText(opts.max || '')}" data-placeholder="${htmlText(placeholder)}"${opts.clearable === false ? ' data-clearable="0"' : ''}>
      <button type="button" class="ctrl drp-trigger${hasValue ? '' : ' is-placeholder'}" id="${id}Trigger" aria-expanded="false"${opts.disabled ? ' disabled' : ''}>
        <span>${htmlText(hasValue ? currentValue : placeholder)}</span>${CALENDAR_SVG}
      </button>
      <div class="drp-popover drp-single hidden" id="${id}Pop" role="dialog" aria-label="날짜 선택 달력"></div>
    </div>`;
  }

  function setSingleDateValue(id, value, opts = {}) {
    const input = $(`#${id}`);
    const trigger = $(`#${id}Trigger`);
    if (!input) return;
    const nextValue = value || '';
    input.value = nextValue;
    if (opts.min !== undefined) input.dataset.min = opts.min || '';
    if (opts.max !== undefined) input.dataset.max = opts.max || '';
    if (!trigger) return;
    const placeholder = input.dataset.placeholder || '연도-월-일';
    trigger.classList.toggle('is-placeholder', !nextValue);
    const labelSpan = trigger.querySelector('span');
    if (labelSpan) labelSpan.textContent = nextValue || placeholder;
  }

  function mountSingleDatePicker(id) {
    const wrap = $(`#${id}Wrap`);
    const trigger = $(`#${id}Trigger`);
    const popover = $(`#${id}Pop`);
    const input = $(`#${id}`);
    if (!wrap || !trigger || !popover || !input || trigger.disabled) return;

    let viewYM = null;

    const initViewMonth = () => {
      const baseDate = input.value
        ? new Date(`${input.value}T00:00:00`)
        : new Date(`${today()}T00:00:00`);
      viewYM = [baseDate.getFullYear(), baseDate.getMonth()];
    };

    const closePopover = () => {
      popover.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const pickDate = iso => {
      setSingleDateValue(id, iso);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      closePopover();
    };

    const drawPopover = () => {
      const [year, month] = viewYM;
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      const minDate = input.dataset.min || '';
      const maxDate = input.dataset.max || '';
      const selectedDate = input.value || '';
      const clearable = input.dataset.clearable !== '0';
      let cells = '';

      for (let i = firstWeekday - 1; i >= 0; i -= 1) {
        cells += `<span class="drp-day is-out">${prevMonthDays - i}</span>`;
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const iso = `${formatYearMonth(year, month)}-${pad2(day)}`;
        const disabled = (minDate && iso < minDate) || (maxDate && iso > maxDate);
        cells += `<button type="button" class="drp-day${iso === selectedDate ? ' is-selected' : ''}" data-sdp-date="${iso}"${disabled ? ' disabled' : ''}>${day}</button>`;
      }
      const remainder = (firstWeekday + daysInMonth) % 7;
      if (remainder) {
        for (let day = 1; day <= 7 - remainder; day += 1) {
          cells += `<span class="drp-day is-out">${day}</span>`;
        }
      }

      const todayIso = today();
      const todayDisabled = (minDate && todayIso < minDate) || (maxDate && todayIso > maxDate);

      popover.innerHTML = `<div class="drp-pane">
          <div class="drp-nav">
            <button type="button" class="drp-nav-btn" data-sdp-nav="-1" aria-label="이전 달">‹</button>
            <strong>${year}년 ${month + 1}월</strong>
            <button type="button" class="drp-nav-btn" data-sdp-nav="1" aria-label="다음 달">›</button>
          </div>
          <div class="drp-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>
          <div class="drp-days">${cells}</div>
        </div>
        <div class="drp-foot">
          ${clearable ? '<button type="button" class="btn xs" data-sdp-action="clear">초기화</button>' : '<span></span>'}
          <div class="drp-foot-right">
            <button type="button" class="btn xs" data-sdp-action="today"${todayDisabled ? ' disabled' : ''}>오늘</button>
            <button type="button" class="btn xs" data-sdp-action="close">닫기</button>
          </div>
        </div>`;

      popover.querySelectorAll('[data-sdp-nav]').forEach(button => {
        button.onclick = () => {
          viewYM = shiftYearMonth(viewYM, Number(button.dataset.sdpNav));
          drawPopover();
        };
      });
      popover.querySelectorAll('[data-sdp-date]').forEach(button => {
        button.onclick = () => pickDate(button.dataset.sdpDate);
      });
      const clearButton = popover.querySelector('[data-sdp-action="clear"]');
      if (clearButton) clearButton.onclick = () => pickDate('');
      popover.querySelector('[data-sdp-action="today"]').onclick = () => pickDate(today());
      popover.querySelector('[data-sdp-action="close"]').onclick = closePopover;
    };

    popover.onclick = event => event.stopPropagation();
    trigger.onclick = event => {
      event.stopPropagation();
      const willOpen = popover.classList.contains('hidden');
      closeAllDatePopovers();
      if (!willOpen) return;
      initViewMonth();
      drawPopover();
      popover.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    };

    bindDatePopoverDismiss();
  }

  function signIn(member, initialPage = 'list', initialId = null) {
    Object.assign(config, clone(sampleData));
    config.header.currentUser = member;
    config.greenhouses = config.greenhouses.filter(row => row.memberId === member.id);
    config.cycles = config.cycles.filter(row => row.memberId === member.id);
    const memberCycleIds = new Set(config.cycles.map(row => row.cycleId));
    for (const key of ['sampleDiaries', 'environmentChanges', 'issueSamples']) {
      config[key] = config[key].filter(row => memberCycleIds.has(row.cycleId));
    }

    state.page = initialPage;
    state.selectedId = null;
    state.selectedCycleId = null;
    state.selectedGhId = null;
    state.selectedIssueId = null;

    if (state.page.startsWith('issue-') && initialId) state.selectedIssueId = initialId;
    else if (state.page.startsWith('cycle-') && initialId) state.selectedCycleId = initialId;
    else if (state.page.startsWith('gh-') && initialId) state.selectedGhId = initialId;
    else if (initialId) state.selectedId = initialId;

    showAccount(member);
    loadGreenhouseExtras();
    loadCycleExtras();
    loadIssueExtras();
    loadSaved();
    render();
    if (main) main.focus({ preventScroll: true });
  }

  async function init() {
    const hostPage = document.body?.dataset?.page || 'entry';
    const member = await currentMember();
    window.__modooSignedIn = Boolean(member);
    if (hostPage === 'entry') {
      location.replace(member ? '/cultivation-diaries' : '/login');
      return;
    }

    if (!member) {
      if (hostPage === 'home') {
        await ready;
        pages.home?.renderLanding();
        return;
      }
      location.replace('/login');
      return;
    }

    await ready;

    bindAccount(() => go('profile'));
    for (const button of $$('#navigation [data-go]')) {
      button.addEventListener('click', event => {
        event.preventDefault();
        go(button.dataset.go);
      });
    }
    for (const button of $$('[data-close-dialog]')) {
      button.addEventListener('click', () =>
        document.getElementById(button.dataset.closeDialog).close()
      );
    }
    if ($('#cycleStartConfirm'))
      $('#cycleStartConfirm').onclick = () => pages.cycle?.commitCycleStart();
    if ($('#cycleEndConfirm')) $('#cycleEndConfirm').onclick = () => pages.cycle?.commitCycleEnd();

    const params = new URLSearchParams(location.search);
    const diaryView = document.body.dataset.diaryView;
    const initialView = diaryView || params.get('view') || hostPage;
    if (initialView === 'profile' || initialView === 'cert') {
      location.replace(resolvePageFile(initialView));
      return;
    }

    const initialId = diaryView ? document.body.dataset.diaryId : params.get('id');
    const initialCycleId = params.get('cycleId');
    signIn(member, initialView, initialId);
    const initialCycle = config.cycles.find(cycle => cycle.cycleId === initialCycleId);
    if (initialCycle && initialView === 'list') {
      pages.diary?.applyCycleFilter(initialCycle.name);
    }
  }

  window.ModooApp = {
    state,
    config,
    diaryRows,
    pages,
    $,
    $$,
    escapeHtml,
    htmlText,
    clone,
    toast,
    today,
    options,
    pageBtns,
    pageControls,
    bindPages,
    getCycle,
    gh,
    cropOf,
    varietyOf,
    getStage,
    stageOrder,
    stageByDate,
    lastEvent,
    timeOf,
    timeSort,
    makeStarted,
    statusBadge,
    taskTone,
    trashSvg: TRASH_SVG,
    formatAt,
    dateFrom,
    getSelectedCycle,
    getCriteria,
    fmtVal,
    stdMetricCols: STD_METRIC_COLS,
    toReason,
    getReasons,
    persist,
    storeCycleExtras,
    storeIssueExtras,
    storeGreenhouseExtras,
    error,
    go,
    heading,
    bindBack,
    moduleHeading,
    bindModuleBack,
    cycleStatus,
    unifiedListPanel,
    listFilterField,
    dateRangeControl,
    mountDateRangePicker,
    singleDateControl,
    setSingleDateValue,
    mountSingleDatePicker
  };

  document.addEventListener('DOMContentLoaded', init);
})();

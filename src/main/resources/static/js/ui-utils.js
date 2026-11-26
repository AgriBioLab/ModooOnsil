// sampleData에 의존하지 않는 공용 UI 유틸리티와 페이지 진입점.
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

  const {
    today,
    dateRangeControl,
    mountDateRangePicker,
    singleDateControl,
    setSingleDateValue,
    mountSingleDatePicker
  } = window.ModooDatePicker;

  const $ = (selector, base = document) => base.querySelector(selector);
  const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
  const htmlText = escapeHtml;
  const clone = value => JSON.parse(JSON.stringify(value));

  const TRASH_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';

  const config = {
    workTypes: [
      { value: '관수', label: '관수' },
      { value: '방제', label: '방제' },
      { value: '환경 조절', label: '환경 조절' },
      { value: '생육 관리', label: '생육 관리' },
      { value: '기타', label: '기타' }
    ],
    taskStatuses: [
      { value: '완료', label: '완료' },
      { value: '미완료', label: '미완료' }
    ]
  };

  const pages = {};
  const state = {
    page: 'list',
    selectedId: null,
    selectedCycleId: null,
    selectedGhId: null,
    selectedIssueId: null
  };
  const main = $('#main');

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

  function error(message) {
    const box = $('#formError');
    if (!box) return;
    box.textContent = message;
    box.classList.remove('hidden');
  }

  function resolveMenuEntry(page) {
    if (page === 'home') return 'home';
    if (page.startsWith('cycle-')) return 'cycle-list';
    if (page.startsWith('gh-')) return 'gh-list';
    if (page.startsWith('env-')) return 'env-list';
    if (page.startsWith('issue-')) return 'issue-list';
    if (page === 'create') return 'create';
    return 'list';
  }

  function updateNavigation() {
    const active = resolveMenuEntry(state.page);
    setCurrentMenu(active);
    const labels = {
      home: '홈 / 농장 현황',
      'cycle-list': '작기계획 / 목록',
      'cycle-detail': '작기계획 / 상세',
      'cycle-create': '작기계획 / 등록',
      'cycle-edit': '작기계획 / 수정',
      'gh-list': '온실 / 온실 목록',
      'gh-detail': '온실 / 온실 상세',
      'gh-create': '온실 / 온실 등록',
      'gh-edit': '온실 / 온실 수정',
      'env-list': '온실 / 온실 환경변화 / 목록',
      'issue-list': '온실 / 온실 환경 이슈 / 목록',
      'issue-detail': '온실 / 온실 환경 이슈 / 상세',
      list: '재배일지작업 / 목록',
      detail: '재배일지작업 / 상세',
      create: '재배일지작업 / 등록',
      edit: '재배일지작업 / 수정'
    };
    const crumb = $('#crumb');
    if (crumb) crumb.textContent = labels[state.page] || '재배일지작업';
  }

  function resolvePageFile(target) {
    if (target === 'home') return '/index.html';
    if (target.startsWith('cycle-')) return '/cultivationPlanList.html';
    if (target.startsWith('gh-')) return '/greenhouseList.html';
    if (target.startsWith('env-')) return '/environmentChangeList.html';
    if (target.startsWith('issue-')) return '/environmentIssueList.html';
    if (target === 'profile') return '/mypage.html';
    if (target === 'cert') return '/mypage.html?tab=cert';
    return '/cultivationDiaryList.html';
  }

  function go(target, id) {
    const hostPage = document.body?.dataset?.page;
    const targetFile = resolvePageFile(target);
    if (hostPage && targetFile !== resolvePageFile(hostPage).split('?')[0]) {
      const destination = new URL(targetFile, location.origin);
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
    return `
      <div class="pagehead">
        <div>
          <h1>${title}</h1>
          ${description ? `<p>${htmlText(description)}</p>` : ''}
        </div>
        ${showBack ? '<button type="button" class="backlink" id="returnList">← 재배일지작업 목록으로</button>' : ''}
      </div>
    `;
  }

  function bindBack() {
    const backButton = $('#returnList');
    if (backButton) backButton.addEventListener('click', () => go('list'));
  }

  function moduleHeading(title, caption = '', backLabel = '', backTarget = '') {
    return `
      <div class="pagehead">
        <div>
          <h1>${htmlText(title)}</h1>
          ${caption ? `<p>${htmlText(caption)}</p>` : ''}
        </div>
        ${backLabel ? `<button type="button" class="backlink" id="moduleBack" data-goto="${backTarget}">← ${htmlText(backLabel)}</button>` : ''}
      </div>
    `;
  }

  function bindModuleBack() {
    const backButton = $('#moduleBack');
    if (backButton) backButton.onclick = () => go(backButton.dataset.goto);
  }

  function pageControls(totalCount, currentPage, pageSize, label) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    return `
      <div class="list-foot">
        <nav class="pagination" aria-label="${htmlText(label)} 페이지 이동">
          <button class="page-button" data-modpage="prev" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
          ${pageBtns(currentPage, totalPages, 'data-modpage')}
          <button class="page-button" data-modpage="next" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
        </nav>
      </div>
    `;
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

  async function init() {
    const hostPage = document.body?.dataset?.page || 'entry';
    const member = await currentMember();
    window.__modooSignedIn = Boolean(member);

    if (hostPage === 'entry') {
      location.replace(member ? '/cultivationDiaryList.html' : '/login.html');
      return;
    }

    if (!member) {
      if (hostPage === 'home') {
        await ready;
        pages.home?.renderLanding();
        return;
      }
      location.replace('/login.html');
      return;
    }

    await ready;
    showAccount(member);
    bindAccount(() => go('profile'));

    for (const button of $$('#navigation [data-go]')) {
      button.addEventListener('click', event => {
        event.preventDefault();
        go(button.dataset.go);
      });
    }

    const params = new URLSearchParams(location.search);
    const initialView = params.get('view') || hostPage;
    if (initialView === 'profile' || initialView === 'cert') {
      location.replace(resolvePageFile(initialView));
      return;
    }

    const initialId = params.get('id');
    if (initialView.startsWith('issue-') && initialId) state.selectedIssueId = initialId;
    else if (initialView.startsWith('cycle-') && initialId) state.selectedCycleId = initialId;
    else if (initialId) state.selectedId = initialId;

    state.page = initialView;
    render();
    if (main) main.focus({ preventScroll: true });
  }

  window.ModooApp = {
    state,
    config,
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
    timeOf,
    timeSort,
    makeStarted,
    statusBadge,
    taskTone,
    trashSvg: TRASH_SVG,
    formatAt,
    dateFrom,
    fmtVal,
    toReason,
    getReasons,
    error,
    go,
    heading,
    bindBack,
    moduleHeading,
    bindModuleBack,
    dateRangeControl,
    mountDateRangePicker,
    singleDateControl,
    setSingleDateValue,
    mountSingleDatePicker
  };

  document.addEventListener('DOMContentLoaded', init);
})();

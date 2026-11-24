(() => {
  'use strict';

  const {
    config,
    diaryRows,
    pages,
    $,
    $$,
    htmlText,
    toast,
    today,
    options,
    pageControls,
    bindPages,
    gh,
    cropOf,
    varietyOf,
    statusBadge,
    dateFrom,
    getSelectedCycle,
    getCriteria,
    stdMetricCols,
    persist,
    storeCycleExtras,
    go,
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
  } = window.ModooApp;

  const CYCLE_STATUS_TONE = {
    진행: 'bg-light-success',
    미진행: 'bg-light-information',
    종료: 'bg-light-gray'
  };

  const DEFAULT_FILTERS = {
    plan: 'all',
    status: 'all',
    greenhouse: 'all',
    crop: 'all',
    variety: 'all',
    periodType: 'planned',
    from: '',
    to: ''
  };

  let currentPage = 1;
  let filters = { ...DEFAULT_FILTERS };

  function renderStageCriteriaRows(cycle) {
    return config.growthStages
      .map(stage => {
        const criterion = getCriteria(cycle, stage.stageId);
        const ranges = criterion?.thresholds || {};
        const metricCells = stdMetricCols
          .map(([key]) => `<td class="tnum">${ranges[key]?.join(' ~ ') || '—'}</td>`)
          .join('');
        return `<tr>
          <td>${stage.order}단계 · ${htmlText(stage.name)}</td>
          <td>${criterion?.standardDays ?? '—'}일</td>
          ${metricCells}
        </tr>`;
      })
      .join('');
  }

  function renderCycleList() {
    const main = $('#main');
    const filteredCycles = config.cycles
      .filter(cycle => {
        if (filters.plan !== 'all' && cycle.cycleId !== filters.plan) return false;
        if (filters.status !== 'all' && cycle.status !== filters.status) return false;
        if (filters.greenhouse !== 'all' && cycle.greenhouseId !== filters.greenhouse) return false;
        if (filters.crop !== 'all' && cycle.cropId !== filters.crop) return false;
        if (filters.variety !== 'all' && cycle.varietyId !== filters.variety) return false;
        if (filters.from || filters.to) {
          const startDate =
            filters.periodType === 'actual'
              ? dateFrom(cycle.actualStartAt)
              : dateFrom(cycle.plannedStartAt);
          const endDate =
            filters.periodType === 'actual'
              ? dateFrom(cycle.actualEndAt) || (startDate ? today() : '')
              : dateFrom(cycle.expectedEndAt);
          if (!startDate) return false;
          if (filters.from && (endDate || startDate) < filters.from) return false;
          if (filters.to && startDate > filters.to) return false;
        }
        return true;
      })
      .sort((a, b) => (b.plannedStartAt || '').localeCompare(a.plannedStartAt || ''));

    const planOptions = [...config.cycles]
      .sort((a, b) => (b.plannedStartAt || '').localeCompare(a.plannedStartAt || ''))
      .map(cycle => ({ value: cycle.cycleId, label: cycle.name }));

    const usedCropIds = new Set(config.cycles.map(cycle => cycle.cropId));
    const usedVarietyIds = new Set(config.cycles.map(cycle => cycle.varietyId));
    const cropOptions = config.crops
      .filter(crop => usedCropIds.has(crop.cropId))
      .map(crop => ({ value: crop.cropId, label: crop.name }));
    const varietyOptions = config.crops
      .filter(
        crop =>
          usedCropIds.has(crop.cropId) && (filters.crop === 'all' || crop.cropId === filters.crop)
      )
      .flatMap(crop =>
        crop.varieties
          .filter(variety => usedVarietyIds.has(variety.varietyId))
          .map(variety => ({ value: variety.varietyId, label: variety.name }))
      );

    const pageSize = config.pagination.cyclePageSize || 5;
    currentPage = Math.min(
      Math.max(1, currentPage),
      Math.max(1, Math.ceil(filteredCycles.length / pageSize))
    );
    const startIndex = (currentPage - 1) * pageSize;
    const pagedRows = filteredCycles.slice(startIndex, startIndex + pageSize);

    const filterHtml = [
      listFilterField(
        'cycleFilterPlan',
        '작기계획명',
        `<select class="ctrl" id="cycleFilterPlan">${options([{ value: 'all', label: '전체 작기' }, ...planOptions], filters.plan)}</select>`
      ),
      listFilterField(
        'cycleFilterGH',
        '온실명',
        `<select class="ctrl" id="cycleFilterGH">${options(
          [
            { value: 'all', label: '전체 온실' },
            ...config.greenhouses.map(house => ({ value: house.greenhouseId, label: house.name }))
          ],
          filters.greenhouse
        )}</select>`
      ),
      listFilterField(
        'cycleFilterCrop',
        '품목명',
        `<select class="ctrl" id="cycleFilterCrop">${options([{ value: 'all', label: '전체 품목' }, ...cropOptions], filters.crop)}</select>`
      ),
      listFilterField(
        'cycleFilterVariety',
        '품종명',
        `<select class="ctrl" id="cycleFilterVariety">${options([{ value: 'all', label: '전체 품종' }, ...varietyOptions], filters.variety)}</select>`
      ),
      listFilterField(
        'cycleFilterState',
        '작기 상태',
        `<select class="ctrl" id="cycleFilterState">${options(
          ['all', '미진행', '진행', '종료'].map(status => ({
            value: status,
            label: status === 'all' ? '전체 상태' : status
          })),
          filters.status
        )}</select>`
      ),
      listFilterField(
        'cycleFilterPeriodType',
        '조회 기간',
        `<div class="cycle-period-inline">
          <select class="ctrl cycle-period-select" id="cycleFilterPeriodType" aria-label="기간 기준">
            ${options(
              [
                { value: 'planned', label: '계획 기간' },
                { value: 'actual', label: '실제 기간' }
              ],
              filters.periodType
            )}
          </select>
          ${dateRangeControl('cycleFilter', filters.from, filters.to)}
        </div>`,
        'is-span-2'
      ),
      `<div class="list-filter-actions">
        <button type="button" class="btn list-reset-btn" id="cycleResetFilter">초기화</button>
        <button type="button" class="btn main list-search-btn" id="cycleDoFilter">검색</button>
      </div>`
    ].join('');

    const tableRowsHtml = pagedRows
      .map((cycle, index) => {
        const plannedText = `${dateFrom(cycle.plannedStartAt) || '—'} ~ ${dateFrom(cycle.expectedEndAt) || '—'}`;
        const actualText = cycle.actualStartAt
          ? `${dateFrom(cycle.actualStartAt)} ~ ${dateFrom(cycle.actualEndAt) || '진행 중'}`
          : '미시작';
        return `<tr>
          <td class="row-index">${filteredCycles.length - startIndex - index}</td>
          <td><button class="linkbtn" data-cycle-detail="${cycle.cycleId}">${htmlText(cycle.name)}</button></td>
          <td>${htmlText(gh(cycle.greenhouseId)?.name || '—')}</td>
          <td>${htmlText(cropOf(cycle)?.name || '—')}</td>
          <td>${htmlText(varietyOf(cycle)?.name || '—')}</td>
          <td class="col-date">${htmlText(plannedText)}</td>
          <td class="col-date">${htmlText(actualText)}</td>
          <td>${statusBadge(cycleStatus(cycle), CYCLE_STATUS_TONE)}</td>
        </tr>`;
      })
      .join('');

    main.innerHTML =
      moduleHeading('작기계획 목록') +
      unifiedListPanel({
        title: '작기계획 목록',
        count: filteredCycles.length,
        actionHtml:
          '<button type="button" class="btn main xs" id="cycleCreate">+ 작기계획 등록</button>',
        filterHtml,
        bodyHtml: `<div class="tablewrap">
        <table class="data-table module-table cycle-table">
          <caption class="sr-only">작기계획 목록</caption>
          <thead>
            <tr>
              <th class="row-index" scope="col">번호</th>
              <th scope="col">작기계획명</th>
              <th scope="col">온실명</th>
              <th scope="col">품목명</th>
              <th scope="col">품종명</th>
              <th scope="col">계획 기간</th>
              <th scope="col">실제 기간</th>
              <th scope="col">작기 상태</th>
            </tr>
          </thead>
          <tbody>${tableRowsHtml || '<tr><td colspan="8" class="empty empty-cell">조회 결과가 없습니다.</td></tr>'}</tbody>
        </table>
      </div>`,
        footHtml: pageControls(filteredCycles.length, currentPage, pageSize, '작기계획')
      });

    mountDateRangePicker('cycleFilter');

    $('#cycleFilterCrop').onchange = () => {
      const selectedCrop = $('#cycleFilterCrop').value;
      const matchingVarieties = config.crops
        .filter(
          crop =>
            usedCropIds.has(crop.cropId) && (selectedCrop === 'all' || crop.cropId === selectedCrop)
        )
        .flatMap(crop =>
          crop.varieties
            .filter(variety => usedVarietyIds.has(variety.varietyId))
            .map(variety => ({ value: variety.varietyId, label: variety.name }))
        );
      const varietySelect = $('#cycleFilterVariety');
      const previousValue = varietySelect.value;
      const nextValue = matchingVarieties.some(item => item.value === previousValue)
        ? previousValue
        : 'all';
      varietySelect.innerHTML = options(
        [{ value: 'all', label: '전체 품종' }, ...matchingVarieties],
        nextValue
      );
    };

    $('#cycleResetFilter').onclick = () => {
      filters = { ...DEFAULT_FILTERS };
      currentPage = 1;
      renderCycleList();
    };

    $('#cycleDoFilter').onclick = () => {
      const from = $('#cycleFilterFrom').value;
      const to = $('#cycleFilterTo').value;
      if (from && to && from > to) {
        toast('조회 시작일과 종료일을 확인하세요.');
        return;
      }
      filters = {
        plan: $('#cycleFilterPlan').value,
        status: $('#cycleFilterState').value,
        greenhouse: $('#cycleFilterGH').value,
        crop: $('#cycleFilterCrop').value,
        variety: $('#cycleFilterVariety').value,
        periodType: $('#cycleFilterPeriodType').value,
        from,
        to
      };
      currentPage = 1;
      renderCycleList();
    };

    $('#cycleCreate').onclick = () => go('cycle-create');
    $$('[data-cycle-detail]').forEach(button => {
      button.onclick = () => go('cycle-detail', button.dataset.cycleDetail);
    });
    bindPages(
      () => currentPage,
      value => {
        currentPage = value;
      },
      filteredCycles.length,
      pageSize,
      renderCycleList
    );
  }

  function commitCycleStart() {
    const cycle = getSelectedCycle();
    const startDate = $('#cycleStartTime').value;
    if (!startDate || dateFrom(startDate) > today()) {
      toast('실제 시작일을 확인하세요.');
      return;
    }
    if (
      config.cycles.some(
        other =>
          other.cycleId !== cycle.cycleId &&
          other.greenhouseId === cycle.greenhouseId &&
          other.status === '진행'
      )
    ) {
      toast('같은 온실에 진행 중인 작기가 있습니다.');
      return;
    }
    if (cycle.status !== '미진행') {
      toast('미진행 상태에서만 작기를 시작할 수 있습니다.');
      return;
    }
    cycle.actualStartDate = dateFrom(startDate);
    cycle.actualStartAt = `${cycle.actualStartDate}T00:00:00`;
    cycle.status = '진행';
    cycle.stageHistory = [
      {
        eventId: `EV-START-${Date.now()}`,
        stageId: 'VEG',
        effectiveDate: cycle.actualStartDate,
        sourceDiaryId: null,
        reason: ''
      }
    ];
    storeCycleExtras();
    persist();
    toast('작기를 시작했습니다.');
    renderCycleDetail();
  }

  function commitCycleEnd() {
    const cycle = getSelectedCycle();
    const endDate = $('#cycleEndTime').value;
    const reason = $('#cycleEndReason').value.trim();
    if (
      cycle.status !== '진행' ||
      !endDate ||
      dateFrom(endDate) < dateFrom(cycle.actualStartAt) ||
      dateFrom(endDate) > today()
    ) {
      toast('실제 종료일을 확인하세요.');
      return;
    }
    cycle.actualEndAt = `${dateFrom(endDate)}T23:59:59`;
    cycle.endReason = reason;
    cycle.status = '종료';
    storeCycleExtras();
    toast('작기를 종료했습니다.');
    renderCycleDetail();
  }

  function renderCycleDetail() {
    const main = $('#main');
    const cycle = getSelectedCycle();
    if (!cycle) {
      go('cycle-list');
      return;
    }

    const greenhouseName = gh(cycle.greenhouseId)?.name || '—';
    const cropLabel = `${cropOf(cycle)?.name || '—'} · ${varietyOf(cycle)?.name || '—'}`;
    const plannedPeriod = `${dateFrom(cycle.plannedStartAt) || '—'} ~ ${dateFrom(cycle.expectedEndAt) || '—'}`;
    const actualPeriod = cycle.actualStartAt
      ? `${dateFrom(cycle.actualStartAt)} ~ ${dateFrom(cycle.actualEndAt) || '진행 중'}`
      : '미시작';

    const facts = [
      ['온실명', greenhouseName],
      ['품목명 · 품종명', cropLabel],
      ['계획 기간', plannedPeriod],
      ['실제 기간', actualPeriod]
    ];
    if (cycle.status === '종료' || cycle.endReason) {
      facts.push(['종료 사유', cycle.endReason || '—']);
    }

    const factsHtml = `<dl class="profile-facts facts-2col">${facts
      .map(([label, value]) => `<dt>${htmlText(label)}</dt><dd>${htmlText(value)}</dd>`)
      .join('')}</dl>`;

    const status = cycleStatus(cycle);
    const hasActiveInGreenhouse =
      status === '미진행' &&
      config.cycles.some(
        other =>
          other.cycleId !== cycle.cycleId &&
          other.greenhouseId === cycle.greenhouseId &&
          cycleStatus(other) === '진행'
      );

    const activeNoticeHtml = hasActiveInGreenhouse
      ? `<div class="cycle-active-notice" role="status">현재 <strong>${htmlText(greenhouseName)}</strong>에 진행 중인 작기가 있어, 기존 작기를 종료한 뒤 시작할 수 있습니다.</div>`
      : '';

    const metricHeaderCells = stdMetricCols
      .map(([, label]) => `<th scope="col">${htmlText(label)}</th>`)
      .join('');
    const pendingButtonsHtml =
      status === '미진행'
        ? `<button class="btn danger" id="cycleDelete">삭제</button>
         <button class="btn" id="cycleToEdit">작기계획 수정</button>
         <button class="btn main" id="cycleStart"${hasActiveInGreenhouse ? ' disabled' : ''}>작기 시작</button>`
        : '';
    const activeButtonHtml =
      status === '진행' ? '<button class="btn main" id="cycleEnd">작기 종료</button>' : '';

    main.innerHTML =
      moduleHeading('작기계획 상세', '') +
      `<div class="module-scroll">
      <section class="panel">
        <div class="panel-head">
          <div class="panel-head-title">
            <h2>${htmlText(cycle.name)}</h2>
            ${statusBadge(status, CYCLE_STATUS_TONE)}
          </div>
          <span class="counter">등록일 ${htmlText(dateFrom(cycle.registeredAt) || '—')}</span>
        </div>
        <div class="panel-body">${factsHtml}</div>
      </section>
      <section class="panel" style="margin-top:12px">
        <div class="panel-head">
          <h2>생육단계별 환경기준</h2>
          <span class="counter">${htmlText(cropLabel)} 기준</span>
        </div>
        <div class="tablewrap">
          <table class="data-table module-table std-criteria-table">
            <caption class="sr-only">생육단계별 환경기준</caption>
            <thead>
              <tr>
                <th scope="col">생육단계</th>
                <th scope="col">기준 기간</th>
                ${metricHeaderCells}
              </tr>
            </thead>
            <tbody>${renderStageCriteriaRows(cycle)}</tbody>
          </table>
        </div>
      </section>
    </div>
    <section class="panel hidden" id="cycleStartPanel">
      <div class="panel-head"><h2>작기 실제 시작일 등록</h2></div>
      <div class="panel-body">
        <div class="filterbar">
          <div class="field">
            <label for="cycleStartTimeTrigger">실제 시작일 *</label>
            ${singleDateControl('cycleStartTime', '', { max: today(), clearable: false })}
          </div>
          <button class="btn" type="button" id="cycleStartCancel">취소</button>
          <button class="btn main" type="button" id="cycleStartConfirm">작기 시작 확정</button>
        </div>
      </div>
    </section>
    <section class="panel hidden" id="cycleEndPanel">
      <div class="panel-head"><h2>작기 종료</h2></div>
      <div class="panel-body">
        <div class="module-input-grid">
          <div class="field">
            <label for="cycleEndTimeTrigger">실제 종료일 *</label>
            ${singleDateControl('cycleEndTime', '', { min: dateFrom(cycle.actualStartAt), max: today(), clearable: false })}
          </div>
          <div class="field wide">
            <label for="cycleEndReason">종료 사유</label>
            <textarea class="ctrl textarea" id="cycleEndReason" placeholder="종료 사유를 입력하세요"></textarea>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn" type="button" id="cycleEndCancel">취소</button>
          <button class="btn main" type="button" id="cycleEndConfirm">종료 확정</button>
        </div>
      </div>
    </section>
    <section class="panel hidden" id="cycleDeleteConfirm">
      <div class="panel-body" style="display:flex;align-items:center;justify-content:flex-end;gap:8px">
        <span>미진행 상태의 작기계획을 삭제하시겠습니까?</span>
        <button type="button" class="btn" id="cycleDeleteCancel">취소</button>
        <button type="button" class="btn danger" id="cycleDeleteOk">삭제 확인</button>
      </div>
    </section>
    ${activeNoticeHtml}
    <div class="module-actions">
      <div class="module-actions-left"><button class="btn" id="cycleToList">목록</button></div>
      ${pendingButtonsHtml}
      ${activeButtonHtml}
    </div>`;

    mountSingleDatePicker('cycleStartTime');
    mountSingleDatePicker('cycleEndTime');
    bindModuleBack();

    $('#cycleToList').onclick = () => go('cycle-list');
    if ($('#cycleToEdit')) $('#cycleToEdit').onclick = () => go('cycle-edit');
    if ($('#cycleDelete'))
      $('#cycleDelete').onclick = () => $('#cycleDeleteConfirm').classList.remove('hidden');
    if ($('#cycleDeleteCancel'))
      $('#cycleDeleteCancel').onclick = () => $('#cycleDeleteConfirm').classList.add('hidden');
    if ($('#cycleDeleteOk')) {
      $('#cycleDeleteOk').onclick = () => {
        if (cycleStatus(cycle) !== '미진행') {
          toast('미진행 상태의 작기계획만 삭제할 수 있습니다.');
          return;
        }
        config.cycles = config.cycles.filter(item => item.cycleId !== cycle.cycleId);
        storeCycleExtras();
        toast('작기계획을 삭제했습니다.');
        go('cycle-list');
      };
    }

    const startButton = $('#cycleStart');
    if (startButton) {
      startButton.onclick = () => {
        setSingleDateValue('cycleStartTime', today(), { max: today() });
        $('#cycleStartPanel').classList.remove('hidden');
        $('#cycleStartTimeTrigger').focus();
      };
    }

    const endButton = $('#cycleEnd');
    if (endButton) {
      endButton.onclick = () => {
        setSingleDateValue('cycleEndTime', today(), {
          min: dateFrom(cycle.actualStartAt),
          max: today()
        });
        $('#cycleEndReason').value = '';
        $('#cycleEndPanel').classList.remove('hidden');
        $('#cycleEndTimeTrigger').focus();
      };
    }

    if ($('#cycleStartCancel'))
      $('#cycleStartCancel').onclick = () => $('#cycleStartPanel').classList.add('hidden');
    if ($('#cycleEndCancel'))
      $('#cycleEndCancel').onclick = () => $('#cycleEndPanel').classList.add('hidden');
    if ($('#cycleStartConfirm')) $('#cycleStartConfirm').onclick = commitCycleStart;
    if ($('#cycleEndConfirm')) $('#cycleEndConfirm').onclick = commitCycleEnd;
  }

  function renderCycleEditor(isEdit) {
    const main = $('#main');
    if (!config.greenhouses.length) {
      main.innerHTML = moduleHeading(
        '작기계획 등록',
        '등록된 온실이 없습니다.',
        '작기계획 목록으로',
        'cycle-list'
      );
      bindModuleBack();
      return;
    }

    const existing = isEdit ? getSelectedCycle() : null;
    if (isEdit && existing && cycleStatus(existing) !== '미진행') {
      toast('미진행 상태의 작기만 수정할 수 있습니다.');
      go('cycle-detail', existing.cycleId);
      return;
    }

    const defaults = {
      cycleId: '',
      name: '',
      greenhouseId: config.greenhouses[0].greenhouseId,
      cropId: config.crops[0]?.cropId || '',
      varietyId: config.crops[0]?.varieties[0]?.varietyId || '',
      plannedStartAt: `${today()}T00:00:00`,
      expectedEndAt: '2027-03-01T23:59:59',
      environmentStandardSetId: config.standardSets[0]?.id || ''
    };
    const row = existing || defaults;
    const hasLinkedDiaries = Boolean(
      existing && diaryRows.some(diary => diary.cycleId === existing.cycleId)
    );
    const greenhouseOptions = config.greenhouses.map(house => ({
      value: house.greenhouseId,
      label:
        house.registeredArea != null
          ? `${house.name} (${Number(house.registeredArea).toLocaleString()}㎡)`
          : house.name
    }));
    const metricHeaderCells = stdMetricCols
      .map(([, label]) => `<th>${htmlText(label)}</th>`)
      .join('');

    main.innerHTML =
      moduleHeading(isEdit ? '작기계획 수정' : '작기계획 등록', '') +
      `<form class="module-form panel" id="cycleForm" novalidate>
      <div class="panel-head">
        <h2>작기 기본 정보</h2>
        <span class="counter">* 필수 입력</span>
      </div>
      <div class="module-form-scroll">
        <div class="module-input-grid cycle-basic-grid">
          <div class="field">
            <label for="cycleName">작기계획명 *</label>
            <input class="ctrl" id="cycleName" maxlength="80" value="${htmlText(row.name)}" placeholder="예: 2026년 가을 4차 작기">
          </div>
          <div class="field">
            <label for="cycleGreenhouse">온실명 *</label>
            <select class="ctrl" id="cycleGreenhouse" ${hasLinkedDiaries ? 'disabled' : ''}>
              ${options(greenhouseOptions, row.greenhouseId)}
            </select>
          </div>
          <div class="field">
            <label for="cyclePlanStartTrigger">계획 시작일 *</label>
            ${singleDateControl('cyclePlanStart', dateFrom(row.plannedStartAt), { clearable: false })}
          </div>
          <div class="field">
            <label for="cycleExpectedEndTrigger">예상 종료일 *</label>
            ${singleDateControl('cycleExpectedEnd', dateFrom(row.expectedEndAt), { clearable: false })}
          </div>
        </div>
        <div class="subsection">
          <div class="subsection-head">
            <h3>생육단계별 환경기준</h3>
            <span class="counter" id="cycleStdHint"></span>
          </div>
          <div class="module-input-grid cycle-crop-bar">
            <div class="field">
              <label for="cycleCrop">재배 품목 *</label>
              <select class="ctrl" id="cycleCrop" ${hasLinkedDiaries ? 'disabled' : ''}></select>
            </div>
            <div class="field">
              <label for="cycleVariety">재배 품종 *</label>
              <select class="ctrl" id="cycleVariety" ${hasLinkedDiaries ? 'disabled' : ''}></select>
            </div>
            ${hasLinkedDiaries ? '' : '<div class="field cycle-load-action"><button type="button" class="btn" id="cycleLoadStdBtn">환경기준 불러오기</button></div>'}
          </div>
          <div class="tablewrap" style="margin-top:14px">
            <table class="data-table module-table std-criteria-table">
              <thead>
                <tr>
                  <th>생육단계</th>
                  <th>기준 기간</th>
                  ${metricHeaderCells}
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
        <div class="errorbox hidden" id="cycleFormError" role="alert"></div>
      </div>
      <div class="module-actions inside">
        <button type="button" class="btn" id="cycleCancel">취소</button>
        <button type="submit" class="btn main">${isEdit ? '수정 저장' : '작기계획 등록'}</button>
      </div>
    </form>`;

    mountSingleDatePicker('cyclePlanStart');
    mountSingleDatePicker('cycleExpectedEnd');

    const allPairs = config.crops.flatMap(crop =>
      crop.varieties.map(variety => ({ cropId: crop.cropId, varietyId: variety.varietyId }))
    );
    let selectedCropId = row.cropId || allPairs[0]?.cropId || '';
    let selectedVarietyId = row.varietyId || allPairs[0]?.varietyId || '';
    let standardsLoaded = Boolean(isEdit);

    const findStandardSet = varietyId =>
      config.standardSets.find(set => set.varietyId === varietyId) || config.standardSets[0];

    const paintStandards = () => {
      const standard = findStandardSet(selectedVarietyId);
      const hintEl = $('#cycleStdHint');
      if (hintEl) {
        const crop = config.crops.find(item => item.cropId === selectedCropId);
        const variety = crop?.varieties.find(item => item.varietyId === selectedVarietyId);
        hintEl.textContent =
          standardsLoaded && crop && variety ? `${crop.name} · ${variety.name} 기준` : '';
      }
      const loadButton = $('#cycleLoadStdBtn');
      if (loadButton) loadButton.classList.toggle('main', !standardsLoaded);

      if (!standardsLoaded) {
        $('#cycleForm tbody').innerHTML =
          '<tr><td colspan="12" class="empty empty-cell">불러온 환경기준이 없습니다.</td></tr>';
        return;
      }
      $('#cycleForm tbody').innerHTML = renderStageCriteriaRows({
        ...row,
        environmentStandardSetId: standard?.id || ''
      });
    };

    const syncCropSelectors = () => {
      const cropOptions = config.crops.map(crop => ({ value: crop.cropId, label: crop.name }));
      if (!cropOptions.some(item => item.value === selectedCropId)) {
        selectedCropId = cropOptions[0]?.value || '';
      }
      $('#cycleCrop').innerHTML = options(cropOptions, selectedCropId);

      const varietyOptions = (
        config.crops.find(crop => crop.cropId === selectedCropId)?.varieties || []
      ).map(variety => ({ value: variety.varietyId, label: variety.name }));
      if (!varietyOptions.some(item => item.value === selectedVarietyId)) {
        selectedVarietyId = varietyOptions[0]?.value || '';
      }
      $('#cycleVariety').innerHTML = options(varietyOptions, selectedVarietyId);
      paintStandards();
    };

    $('#cycleCrop').onchange = () => {
      selectedCropId = $('#cycleCrop').value;
      selectedVarietyId = '';
      standardsLoaded = false;
      syncCropSelectors();
    };
    $('#cycleVariety').onchange = () => {
      selectedVarietyId = $('#cycleVariety').value;
      standardsLoaded = false;
      paintStandards();
    };
    if ($('#cycleLoadStdBtn')) {
      $('#cycleLoadStdBtn').onclick = () => {
        standardsLoaded = true;
        paintStandards();
        toast('선택한 품목·품종의 생육단계별 환경기준을 불러왔습니다.');
      };
    }

    syncCropSelectors();
    bindModuleBack();
    $('#cycleCancel').onclick = () => go(isEdit ? 'cycle-detail' : 'cycle-list');

    $('#cycleForm').onsubmit = event => {
      event.preventDefault();
      const name = $('#cycleName').value.trim();
      const greenhouseId = $('#cycleGreenhouse').value;
      const startDate = $('#cyclePlanStart').value;
      const endDate = $('#cycleExpectedEnd').value;
      const standard = findStandardSet(selectedVarietyId);

      const errors = [];
      if (!name) errors.push('작기계획명을 입력하세요.');
      if (!greenhouseId) errors.push('온실을 선택하세요.');
      if (!selectedVarietyId || !standard) errors.push('재배 품목과 품종을 선택하세요.');
      if (!standardsLoaded) errors.push('환경기준 불러오기를 먼저 진행하세요.');
      if (!startDate || !endDate || startDate > endDate)
        errors.push('계획 시작일과 예상 종료일을 확인하세요.');
      if (config.cycles.some(item => item.name === name && item.cycleId !== existing?.cycleId)) {
        errors.push('동일한 작기계획명이 존재합니다.');
      }

      if (errors.length) {
        $('#cycleFormError').textContent = errors.join(' ');
        $('#cycleFormError').classList.remove('hidden');
        return;
      }

      const plannedStartAt = `${dateFrom(startDate)}T00:00:00`;
      const expectedEndAt = `${dateFrom(endDate)}T23:59:59`;

      if (isEdit) {
        if (
          cycleStatus(existing) !== '미진행' ||
          (existing.memberId && existing.memberId !== config.header.currentUser.id)
        ) {
          toast('미진행 상태의 본인 작기계획만 수정할 수 있습니다.');
          return;
        }
        Object.assign(existing, {
          name,
          greenhouseId,
          cropId: selectedCropId,
          varietyId: selectedVarietyId,
          environmentStandardSetId: standard.id,
          plannedStartAt,
          expectedEndAt,
          updatedAt: `${today()}T${new Date().toTimeString().slice(0, 8)}`
        });
        storeCycleExtras();
        toast('작기계획을 수정했습니다.');
        go('cycle-detail', existing.cycleId);
        return;
      }

      const newCycleId = `CY-NEW-${Date.now()}`;
      config.cycles.push({
        cycleId: newCycleId,
        name,
        greenhouseId,
        cropId: selectedCropId,
        varietyId: selectedVarietyId,
        plannedStartAt,
        expectedEndAt,
        actualStartAt: null,
        actualStartDate: null,
        actualEndAt: null,
        endReason: null,
        registeredAt: `${today()}T09:00:00`,
        memberId: config.header.currentUser.id,
        status: '미진행',
        environmentStandardSetId: standard.id,
        stageHistory: []
      });
      storeCycleExtras();
      toast('작기계획을 등록했습니다.');
      go('cycle-detail', newCycleId);
    };
  }

  pages.cycle = {
    renderCycleList,
    renderCycleDetail,
    renderCycleEditor,
    commitCycleStart,
    commitCycleEnd
  };
})();

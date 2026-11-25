(() => {
  'use strict';

  const {
    state,
    config,
    pages,
    $,
    $$,
    htmlText,
    toast,
    today,
    options,
    pageControls,
    bindPages,
    getCycle,
    gh,
    cropOf,
    varietyOf,
    statusBadge,
    formatAt,
    dateFrom,
    fmtVal,
    storeIssueExtras,
    go,
    moduleHeading,
    bindModuleBack,
    cycleStatus,
    unifiedListPanel,
    listFilterField,
    dateRangeControl,
    mountDateRangePicker
  } = window.ModooApp;

  const CYCLE_STATUS_TONE = {
    진행: 'bg-light-success',
    미진행: 'bg-light-information',
    종료: 'bg-light-gray'
  };

  const ISSUE_STATUS_TONE = {
    발생: 'bg-light-danger',
    조치중: 'bg-light-warning',
    '조치 완료': 'bg-light-success'
  };

  const AIR_METRIC_KEYS = ['insideTempC', 'humidityPct', 'co2Ppm', 'solarWm2', 'lightUmolM2S'];
  const SUBSTRATE_METRIC_KEYS = [
    'substrateTempC',
    'substrateMoisturePct',
    'substrateEcMsCm',
    'substratePh'
  ];

  const SENSOR_ICONS = {
    insideTempC: '<path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0Z"/>',
    humidityPct: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    co2Ppm: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    solarWm2:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    lightUmolM2S:
      '<path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M18 12h3M16.3 7.7l2.1-2.1M8 14a4 4 0 1 1 8 0c0 1.6-1 2.6-1.5 3.5H9.5C9 16.6 8 15.6 8 14Z"/><path d="M10 21h4"/>',
    substrateTempC: '<path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0Z"/>',
    substrateMoisturePct: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    substrateEcMsCm: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    substratePh: '<path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/>'
  };

  const GREENHOUSE_BG_SVG =
    '<svg class="env-gh-bg" viewBox="0 0 1200 220" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M80 185V92c0-42 64-72 160-72h720c96 0 160 30 160 72v93" stroke="#1f7a4c" stroke-opacity="0.14" stroke-width="2"/><path d="M80 96h1040M240 20v165M420 20v165M600 20v165M780 20v165M960 20v165" stroke="#1f7a4c" stroke-opacity="0.09" stroke-width="1.5"/><path d="M140 62c60-18 120 18 180 0s120 18 180 0 120 18 180 0 120 18 180 0 120 18 180 0" stroke="#2563eb" stroke-opacity="0.11" stroke-width="1.5" stroke-dasharray="6 6"/><circle cx="1040" cy="48" r="18" stroke="#d97706" stroke-opacity="0.18" stroke-width="1.5"/><path d="M60 190h1080M90 204h1020" stroke="#b46914" stroke-opacity="0.16" stroke-width="2" stroke-dasharray="10 6"/></svg>';

  let environmentPage = 1;
  let envFilters = { cycle: 'all', from: '', to: '' };
  let envChartKey = 'insideTempC';
  let envViewTab = 'chart';

  let issuePage = 1;
  let issueFilters = { cycle: 'all', type: 'all', status: 'all', from: '', to: '' };

  const shortMetricLabel = label => (label || '').replace('온실 내부 ', '').replace(' 측정값', '');

  function cyclePriority(cycle) {
    const status = cycleStatus(cycle);
    if (status === '진행') return 0;
    if (status === '종료') return 1;
    return 2;
  }

  function sortCyclesForGreenhouse(cycles, greenhouseId) {
    return cycles
      .filter(cycle => cycle.greenhouseId === greenhouseId)
      .sort(
        (a, b) =>
          cyclePriority(a) - cyclePriority(b) ||
          (b.actualStartAt || '').localeCompare(a.actualStartAt || '')
      );
  }

  function renderLatestSummary(cycleRows) {
    const latest = cycleRows.slice().sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
    if (!latest) return '';

    const fields = config.measurementFields || [];
    const renderMetricCard = (field, groupClass) => {
      if (!field) return '';
      const value = latest[field.key];
      const isEmpty = value === null || value === undefined;
      const iconSvg = `<svg class="env-kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SENSOR_ICONS[field.key] || ''}</svg>`;
      return `<div class="env-kpi-card ${groupClass}">
        <div class="env-kpi-top">${iconSvg}<span class="env-kpi-label">${htmlText(shortMetricLabel(field.label))}</span></div>
        <strong class="env-kpi-value${isEmpty ? ' is-empty' : ''}">${isEmpty ? '미측정' : `${htmlText(String(value))}<small>${htmlText(field.unit)}</small>`}</strong>
      </div>`;
    };

    const airCards = AIR_METRIC_KEYS.map(key =>
      renderMetricCard(
        fields.find(item => item.key === key),
        'is-air'
      )
    ).join('');
    const substrateCards = SUBSTRATE_METRIC_KEYS.map(key =>
      renderMetricCard(
        fields.find(item => item.key === key),
        'is-sub'
      )
    ).join('');

    return `<section class="panel env-latest-panel is-svg-iot" aria-label="최근 측정 현황">
      <div class="panel-head">
        <div class="panel-head-title">
          <h2>최근 측정 현황</h2>
          <span class="iot-live-pill"><span class="iot-live-dot" aria-hidden="true"></span>실시간 센서</span>
        </div>
        <span class="counter">기준 시각 ${htmlText(formatAt(latest.measuredAt))}</span>
      </div>
      <div class="panel-body env-kpi-groups">
        ${GREENHOUSE_BG_SVG}
        <div class="env-kpi-grid cols-5">${airCards}</div>
        <div class="env-kpi-grid cols-4">${substrateCards}</div>
      </div>
    </section>`;
  }

  function renderLineChart(rows) {
    const fields = config.measurementFields || [];
    const field = fields.find(item => item.key === envChartKey) ||
      fields[0] || {
        key: 'insideTempC',
        label: '온실 내부 온도 측정값',
        unit: '°C'
      };
    const hasRange = Boolean(envFilters.from || envFilters.to);
    const sortedRows = rows.slice().sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
    const targetDate = !hasRange
      ? sortedRows.some(row => dateFrom(row.measuredAt) === today())
        ? today()
        : dateFrom(sortedRows.at(-1)?.measuredAt || '')
      : '';
    const scopedRows = targetDate
      ? sortedRows.filter(row => dateFrom(row.measuredAt) === targetDate)
      : sortedRows;
    const points = scopedRows.filter(
      row => row[field.key] !== null && row[field.key] !== undefined
    );

    let chartBody = '<p class="empty" style="padding:20px">그래프에 표시할 측정값이 없습니다.</p>';
    if (points.length) {
      const values = points.map(row => Number(row[field.key]));
      let minVal = Math.min(...values);
      let maxVal = Math.max(...values);
      if (minVal === maxVal) {
        minVal -= 1;
        maxVal += 1;
      }

      const padLeft = 48;
      const padRight = 20;
      const padTop = 16;
      const padBottom = 28;
      const width = 1080;
      const height = 230;
      const plotWidth = width - padLeft - padRight;
      const plotHeight = height - padTop - padBottom;

      const xAt = index =>
        points.length === 1
          ? padLeft + plotWidth / 2
          : padLeft + (index / (points.length - 1)) * plotWidth;
      const yAt = value =>
        padTop + plotHeight - ((value - minVal) / (maxVal - minVal)) * plotHeight;
      const coords = points.map((row, index) => ({
        x: xAt(index),
        y: yAt(Number(row[field.key])),
        row
      }));
      const polylinePoints = coords
        .map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
        .join(' ');
      const areaPoints = `${coords[0].x.toFixed(1)},${(padTop + plotHeight).toFixed(1)} ${polylinePoints} ${coords.at(-1).x.toFixed(1)},${(padTop + plotHeight).toFixed(1)}`;
      const midVal = ((minVal + maxVal) / 2).toFixed(1);

      const gridSvg = [minVal, (minVal + maxVal) / 2, maxVal]
        .map(
          (value, index) =>
            `<line x1="${padLeft}" y1="${yAt(value).toFixed(1)}" x2="${width - padRight}" y2="${yAt(value).toFixed(1)}" stroke="#e1eae5" stroke-dasharray="${index === 0 ? 'none' : '3 3'}"/><text x="${padLeft - 8}" y="${(yAt(value) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#64748b">${index === 1 ? midVal : value.toFixed(1)}</text>`
        )
        .join('');

      const dotsSvg = coords
        .map((point, index) => {
          const isLast = index === coords.length - 1;
          const tooltip = `${formatAt(point.row.measuredAt)} : ${point.row[field.key]} ${htmlText(field.unit)}`;
          if (isLast) {
            return `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="7" fill="rgba(31,122,76,0.16)"/><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.2" fill="#1f7a4c" stroke="#ffffff" stroke-width="1.5"><title>${tooltip}</title></circle>`;
          }
          return `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.6" fill="#ffffff" stroke="#1f7a4c" stroke-width="2"><title>${tooltip}</title></circle>`;
        })
        .join('');

      const isSingleDay =
        Boolean(targetDate) ||
        dateFrom(points[0].measuredAt) === dateFrom(points.at(-1).measuredAt);
      const tickIndexes = [0, 0.25, 0.5, 0.75, 1]
        .map(ratio => Math.round((points.length - 1) * ratio))
        .filter((value, index, array) => array.indexOf(value) === index);
      const xLabelsSvg = tickIndexes
        .map(index => {
          const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
          const text = isSingleDay
            ? formatAt(points[index].measuredAt).slice(11, 16)
            : formatAt(points[index].measuredAt).slice(5);
          return `<text x="${xAt(index).toFixed(1)}" y="${height - 7}" text-anchor="${anchor}" font-size="11" fill="#64748b">${text}</text>`;
        })
        .join('');

      chartBody = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${htmlText(shortMetricLabel(field.label))} 추이 그래프">
        <defs>
          <linearGradient id="envAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1f7a4c" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#1f7a4c" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        ${gridSvg}
        <polygon fill="url(#envAreaGrad)" points="${areaPoints}"/>
        <polyline fill="none" stroke="#1f7a4c" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round" points="${polylinePoints}"/>
        ${dotsSvg}
        ${xLabelsSvg}
      </svg>`;
    }

    const scopeLabel = targetDate
      ? `${targetDate === today() ? `오늘 ${targetDate}` : targetDate} · 1시간 단위`
      : `${envFilters.from || '시작'} ~ ${envFilters.to || '종료'} · 1시간 단위`;
    const badgeLabel =
      field.unit === 'pH'
        ? shortMetricLabel(field.label)
        : `${shortMetricLabel(field.label)} (${field.unit})`;

    return `<div class="env-chart-toolbar">
      <div class="env-chart-meta">
        <span class="env-chart-badge">${htmlText(badgeLabel)}</span>
        <span class="counter">${htmlText(scopeLabel)} · 총 ${points.length}건</span>
      </div>
    </div>
    <div class="panel-body env-chart-body">${chartBody}</div>`;
  }

  function renderCycleContextBar(ghSelectId, cycleSelectId, cycles, selectedCycle) {
    const greenhouseMap = new Map();
    for (const cycle of cycles) {
      if (!greenhouseMap.has(cycle.greenhouseId)) {
        greenhouseMap.set(cycle.greenhouseId, {
          value: cycle.greenhouseId,
          label: gh(cycle.greenhouseId)?.name || '—'
        });
      }
    }
    const greenhouseOptions = [...greenhouseMap.values()];
    const cycleOptions = sortCyclesForGreenhouse(cycles, selectedCycle.greenhouseId).map(cycle => ({
      value: cycle.cycleId,
      label: `${cycle.name} (${cycleStatus(cycle)})`
    }));

    return `<section class="panel context-bar-panel" aria-label="조회 온실 및 작기 선택">
      <div class="panel-body context-bar">
        <div class="context-bar-fields">
          <div class="context-bar-select">
            <label for="${ghSelectId}">온실명</label>
            <select id="${ghSelectId}" class="ctrl">${options(greenhouseOptions, selectedCycle.greenhouseId)}</select>
          </div>
          <div class="context-bar-select">
            <label for="${cycleSelectId}">작기계획명</label>
            <select id="${cycleSelectId}" class="ctrl">${options(cycleOptions, selectedCycle.cycleId)}</select>
          </div>
        </div>
        <div class="context-bar-meta">
          ${statusBadge(cycleStatus(selectedCycle), CYCLE_STATUS_TONE)}
          <span>${htmlText(cropOf(selectedCycle)?.name || '—')} (${htmlText(varietyOf(selectedCycle)?.name || '—')})</span>
        </div>
      </div>
    </section>`;
  }

  function bindCycleContextBar(ghSelectId, cycleSelectId, cycles, onCycleChange) {
    $(`#${ghSelectId}`).onchange = () => {
      const nextCycleId =
        sortCyclesForGreenhouse(cycles, $(`#${ghSelectId}`).value)[0]?.cycleId || '';
      if (nextCycleId) onCycleChange(nextCycleId);
    };
    $(`#${cycleSelectId}`).onchange = () => onCycleChange($(`#${cycleSelectId}`).value);
  }

  function renderEnvList() {
    const main = $('#main');
    const activeCycles = config.cycles.filter(cycle => cycleStatus(cycle) === '진행');
    let selectedCycle = activeCycles.find(cycle => cycle.cycleId === envFilters.cycle);
    if (!selectedCycle) {
      selectedCycle =
        activeCycles.find(cycle =>
          config.environmentChanges.some(row => row.cycleId === cycle.cycleId)
        ) ||
        activeCycles[0] ||
        null;
      envFilters.cycle = selectedCycle?.cycleId || '';
    }

    if (!selectedCycle) {
      main.innerHTML =
        moduleHeading('온실 환경변화 목록') +
        '<section class="panel list-section"><div class="panel-body"><p class="empty">진행 중인 작기계획이 없습니다.</p></div></section>';
      return;
    }

    const cycleReadings = config.environmentChanges.filter(
      row => row.cycleId === selectedCycle.cycleId
    );
    const filteredRows = cycleReadings
      .filter(
        row =>
          (!envFilters.from || dateFrom(row.measuredAt) >= envFilters.from) &&
          (!envFilters.to || dateFrom(row.measuredAt) <= envFilters.to)
      )
      .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));

    const pageSize = 7;
    environmentPage = Math.min(
      Math.max(1, environmentPage),
      Math.max(1, Math.ceil(filteredRows.length / pageSize))
    );
    const startIndex = (environmentPage - 1) * pageSize;
    const pagedRows = filteredRows.slice(startIndex, startIndex + pageSize);

    const fields = config.measurementFields || [];
    const metricOptions = fields.map(field => ({
      value: field.key,
      label:
        field.unit === 'pH'
          ? shortMetricLabel(field.label)
          : `${shortMetricLabel(field.label)} (${field.unit})`
    }));
    const tableHeadersHtml = fields
      .map(
        field =>
          `<th class="tnum" scope="col">${htmlText(field.unit === 'pH' ? shortMetricLabel(field.label) : `${shortMetricLabel(field.label)}(${field.unit})`)}</th>`
      )
      .join('');

    const historyHeadHtml = `<div class="panel-head env-history-head">
      <div class="env-inline-tabs" role="tablist" aria-label="환경변화 보기 방식">
        <button type="button" class="env-inline-tab" role="tab" id="envTabChart" aria-selected="${envViewTab === 'chart'}">그래프로 보기</button>
        <button type="button" class="env-inline-tab" role="tab" id="envTabTable" aria-selected="${envViewTab === 'table'}">목록으로 보기</button>
      </div>
      <div class="env-history-controls">
        ${envViewTab === 'chart' ? `<label class="env-ctrl-field"><span>항목</span><select id="envChartMetric" class="ctrl">${options(metricOptions, envChartKey)}</select></label>` : ''}
        <div class="env-period-filter">
          <label class="env-ctrl-field" for="envTrigger"><span>측정 기간</span></label>
          ${dateRangeControl('env', envFilters.from, envFilters.to)}
          <button type="button" class="btn main env-search-btn" id="envDoFilter">검색</button>
        </div>
      </div>
    </div>`;

    const tableRowsHtml = pagedRows
      .map(
        (reading, index) => `<tr>
        <td class="row-index">${filteredRows.length - startIndex - index}</td>
        <td>${formatAt(reading.measuredAt)}</td>
        ${fields.map(field => `<td class="tnum">${fmtVal(reading[field.key])}</td>`).join('')}
      </tr>`
      )
      .join('');

    const historyBodyHtml =
      envViewTab === 'chart'
        ? renderLineChart(filteredRows)
        : `<div class="tablewrap">
          <table class="data-table module-table env-table">
            <caption class="sr-only">온실 환경변화 측정 목록</caption>
            <thead>
              <tr>
                <th class="row-index" scope="col">번호</th>
                <th scope="col">측정일시</th>
                ${tableHeadersHtml}
              </tr>
            </thead>
            <tbody>${tableRowsHtml || '<tr><td colspan="11" class="empty">해당 작기의 측정 기록이 없습니다.</td></tr>'}</tbody>
          </table>
        </div>${pageControls(filteredRows.length, environmentPage, pageSize, '온실 환경변화')}`;

    main.innerHTML =
      moduleHeading('온실 환경변화 목록') +
      renderCycleContextBar('envGh', 'envCycle', activeCycles, selectedCycle) +
      renderLatestSummary(cycleReadings) +
      `<section class="panel env-history-panel" aria-label="온실 환경변화 이력 조회">${historyHeadHtml}${historyBodyHtml}</section>`;

    mountDateRangePicker('env');
    bindCycleContextBar('envGh', 'envCycle', activeCycles, nextCycleId => {
      envFilters.cycle = nextCycleId;
      environmentPage = 1;
      renderEnvList();
    });

    $('#envDoFilter').onclick = () => {
      const from = $('#envFrom').value;
      const to = $('#envTo').value;
      if (from && to && from > to) {
        toast('측정 시작일과 종료일을 확인하세요.');
        return;
      }
      envFilters = { cycle: selectedCycle.cycleId, from, to };
      environmentPage = 1;
      renderEnvList();
    };
    $('#envTabChart').onclick = () => {
      envViewTab = 'chart';
      renderEnvList();
    };
    $('#envTabTable').onclick = () => {
      envViewTab = 'table';
      renderEnvList();
    };
    if ($('#envChartMetric')) {
      $('#envChartMetric').onchange = event => {
        envChartKey = event.target.value;
        renderEnvList();
      };
    }
    bindPages(
      () => environmentPage,
      value => {
        environmentPage = value;
      },
      filteredRows.length,
      pageSize,
      renderEnvList
    );
  }

  function renderIssueDetail(issues) {
    const main = $('#main');
    const issue = issues.find(item => item.issueId === state.selectedIssueId) || issues[0];
    if (!issue) {
      go('issue-list');
      return;
    }

    state.selectedIssueId = issue.issueId;
    const cycle = getCycle(issue.cycleId);
    const facts = [
      ['온실명', gh(cycle?.greenhouseId)?.name || '—'],
      ['작기계획명', cycle?.name || '—'],
      ['이슈 유형', issue.issueType || '—'],
      ['발생 측정값', issue.issueValue ?? '—'],
      ['발생일시', formatAt(issue.occurredAt)],
      ['조치 완료일시', formatAt(issue.actionCompletedAt)]
    ];

    main.innerHTML =
      moduleHeading('온실 환경 이슈 상세', '') +
      `<div class="module-scroll">
      <section class="panel" aria-label="이슈 발생 정보">
        <div class="panel-head">
          <div class="panel-head-title">
            <h2>${htmlText(issue.message || '이슈 상세')}</h2>
            ${statusBadge(issue.status, ISSUE_STATUS_TONE)}
          </div>
          <span class="counter">${htmlText(issue.issueType)} · ${htmlText(String(issue.issueValue ?? '—'))}</span>
        </div>
        <div class="panel-body">
          <dl class="profile-facts facts-2col">${facts.map(([label, value]) => `<dt>${label}</dt><dd>${htmlText(value ?? '—')}</dd>`).join('')}</dl>
        </div>
      </section>
      <section class="panel" style="margin-top:12px" aria-label="조치 등록 및 상태 변경">
        <div class="panel-head"><h2>조치 등록 및 상태 변경</h2></div>
        <div class="panel-body">
          <form id="issueActionForm" class="issue-action-form">
            <div class="field">
              <label for="issueNextStatus">조치 상태 *</label>
              <select id="issueNextStatus" class="ctrl">${options(
                ['발생', '조치중', '조치 완료'].map(value => ({ value, label: value })),
                issue.status
              )}</select>
            </div>
            <div class="field">
              <label for="issueActionInput">조치 내용</label>
              <textarea id="issueActionInput" class="ctrl textarea" placeholder="조치 내용을 입력하세요 (조치 완료 시 필수)">${htmlText(issue.actionContent || '')}</textarea>
            </div>
            <div class="module-actions">
              <div class="module-actions-left"><button type="button" class="btn" id="issueToList">목록</button></div>
              <button type="submit" class="btn main">조치 저장</button>
            </div>
          </form>
        </div>
      </section>
    </div>`;

    bindModuleBack();
    $('#issueToList').onclick = () => go('issue-list');
    $('#issueActionForm').onsubmit = event => {
      event.preventDefault();
      const nextStatus = $('#issueNextStatus').value;
      const actionContent = $('#issueActionInput').value.trim();
      if (nextStatus === '조치 완료' && !actionContent) {
        toast('조치 완료 시 조치 내용을 입력하세요.');
        return;
      }
      issue.status = nextStatus;
      issue.actionContent = actionContent || null;
      issue.actionCompletedAt =
        nextStatus === '조치 완료'
          ? issue.actionCompletedAt || `${today()}T${new Date().toTimeString().slice(0, 8)}`
          : null;
      storeIssueExtras();
      toast('이슈 조치 내용을 저장했습니다.');
      renderIssues(true);
    };
  }

  function renderIssues(isDetail) {
    const issues = config.issueSamples;
    if (isDetail) {
      renderIssueDetail(issues);
      return;
    }

    const main = $('#main');
    const selectableCycles = config.cycles.filter(cycle =>
      ['진행', '종료'].includes(cycleStatus(cycle))
    );
    let selectedCycle = selectableCycles.find(cycle => cycle.cycleId === issueFilters.cycle);
    if (!selectedCycle) {
      selectedCycle =
        selectableCycles.find(cycle => issues.some(issue => issue.cycleId === cycle.cycleId)) ||
        selectableCycles[0];
      issueFilters.cycle = selectedCycle?.cycleId || '';
    }

    if (!selectedCycle) {
      main.innerHTML =
        moduleHeading('온실 환경 이슈 목록') +
        '<section class="panel list-section"><div class="panel-body"><p class="empty">조회할 작기계획이 없습니다.</p></div></section>';
      return;
    }

    const cycleIssues = issues.filter(item => item.cycleId === selectedCycle.cycleId);
    const issueStatusRank = status => (status === '발생' ? 0 : status === '조치중' ? 1 : 2);
    const filteredRows = cycleIssues
      .filter(
        item =>
          (issueFilters.type === 'all' || item.issueType === issueFilters.type) &&
          (issueFilters.status === 'all' || item.status === issueFilters.status) &&
          (!issueFilters.from || dateFrom(item.occurredAt) >= issueFilters.from) &&
          (!issueFilters.to || dateFrom(item.occurredAt) <= issueFilters.to)
      )
      .sort(
        (a, b) =>
          issueStatusRank(a.status) - issueStatusRank(b.status) ||
          b.occurredAt.localeCompare(a.occurredAt)
      );

    const pageSize = Number(config.pagination?.pageSize) || 5;
    issuePage = Math.min(
      Math.max(1, issuePage),
      Math.max(1, Math.ceil(filteredRows.length / pageSize))
    );
    const startIndex = (issuePage - 1) * pageSize;
    const pagedRows = filteredRows.slice(startIndex, startIndex + pageSize);

    const greenhouseMap = new Map();
    for (const cycle of selectableCycles) {
      if (!greenhouseMap.has(cycle.greenhouseId)) {
        greenhouseMap.set(cycle.greenhouseId, {
          value: cycle.greenhouseId,
          label: gh(cycle.greenhouseId)?.name || '—'
        });
      }
    }
    const greenhouseOptions = [...greenhouseMap.values()];
    const cycleOptions = sortCyclesForGreenhouse(selectableCycles, selectedCycle.greenhouseId).map(
      cycle => ({ value: cycle.cycleId, label: `${cycle.name} (${cycleStatus(cycle)})` })
    );

    const uniqueOptions = list => [...new Set(list)].map(value => ({ value, label: value }));
    const issueTypeOptions = uniqueOptions([
      '온도',
      '습도',
      '이산화탄소',
      '일사량',
      '광도',
      '배지온도',
      '배지수분량',
      '배지 EC',
      '배지 pH',
      ...cycleIssues.map(item => item.issueType)
    ]);

    const filterHtml = [
      listFilterField(
        'issueGh',
        '온실명',
        `<select id="issueGh" class="ctrl">${options(greenhouseOptions, selectedCycle.greenhouseId)}</select>`
      ),
      listFilterField(
        'issueCycle',
        '작기계획명',
        `<select id="issueCycle" class="ctrl">${options(cycleOptions, selectedCycle.cycleId)}</select>`
      ),
      listFilterField(
        'issueType',
        '이슈 유형',
        `<select id="issueType" class="ctrl">${options([{ value: 'all', label: '전체' }, ...issueTypeOptions], issueFilters.type)}</select>`
      ),
      listFilterField(
        'issueStatus',
        '조치 상태',
        `<select id="issueStatus" class="ctrl">${options([{ value: 'all', label: '전체' }, ...uniqueOptions(['발생', '조치중', '조치 완료'])], issueFilters.status)}</select>`
      ),
      listFilterField(
        'issueTrigger',
        '조회 기간',
        dateRangeControl('issue', issueFilters.from, issueFilters.to),
        'is-span-2'
      ),
      `<div class="list-filter-actions">
        <button class="btn list-reset-btn" type="button" id="issueResetFilter">초기화</button>
        <button class="btn main list-search-btn" type="submit">검색</button>
      </div>`
    ].join('');

    const tableRowsHtml = pagedRows
      .map(
        (item, index) => `<tr>
        <td class="row-index">${filteredRows.length - startIndex - index}</td>
        <td class="col-type">${htmlText(item.issueType)}</td>
        <td><button class="linkbtn" data-issue="${item.issueId}">${htmlText(item.message)}</button></td>
        <td class="tnum col-val">${htmlText(String(item.issueValue ?? '—'))}</td>
        <td class="col-date">${formatAt(item.occurredAt)}</td>
        <td class="col-status">${statusBadge(item.status, ISSUE_STATUS_TONE)}</td>
      </tr>`
      )
      .join('');

    main.innerHTML =
      moduleHeading('온실 환경 이슈 목록') +
      unifiedListPanel({
        title: '온실 환경 이슈 목록',
        count: filteredRows.length,
        filterTag: 'form',
        filterId: 'issueFilters',
        filterHtml,
        bodyHtml: `<div class="tablewrap">
        <table class="data-table module-table issue-table">
          <caption class="sr-only">온실 환경 이슈 목록</caption>
          <thead>
            <tr>
              <th class="row-index" scope="col">번호</th>
              <th class="col-type" scope="col">이슈 유형</th>
              <th scope="col">이슈 내용</th>
              <th class="tnum col-val" scope="col">발생 측정값</th>
              <th class="col-date" scope="col">발생일시</th>
              <th class="col-status" scope="col">조치 상태</th>
            </tr>
          </thead>
          <tbody>${tableRowsHtml || '<tr><td colspan="6" class="empty">조회된 이슈가 없습니다.</td></tr>'}</tbody>
        </table>
      </div>`,
        footHtml: pageControls(filteredRows.length, issuePage, pageSize, '온실 환경 이슈')
      });

    mountDateRangePicker('issue');
    bindCycleContextBar('issueGh', 'issueCycle', selectableCycles, nextCycleId => {
      issueFilters = { cycle: nextCycleId, type: 'all', status: 'all', from: '', to: '' };
      issuePage = 1;
      renderIssues(false);
    });
    $('#issueResetFilter').onclick = () => {
      issueFilters = { cycle: selectedCycle.cycleId, type: 'all', status: 'all', from: '', to: '' };
      issuePage = 1;
      renderIssues(false);
    };
    $('#issueFilters').onsubmit = event => {
      event.preventDefault();
      const from = $('#issueFrom').value;
      const to = $('#issueTo').value;
      if (from && to && from > to) {
        toast('시작일과 종료일을 확인하세요.');
        return;
      }
      issueFilters = {
        cycle: $('#issueCycle').value,
        type: $('#issueType').value,
        status: $('#issueStatus').value,
        from,
        to
      };
      issuePage = 1;
      renderIssues(false);
    };
    $$('[data-issue]').forEach(button => {
      button.onclick = () => go('issue-detail', button.dataset.issue);
    });
    bindPages(
      () => issuePage,
      value => {
        issuePage = value;
      },
      filteredRows.length,
      pageSize,
      () => renderIssues(false)
    );
  }

  pages.environment = { renderEnvList, renderIssues };
})();

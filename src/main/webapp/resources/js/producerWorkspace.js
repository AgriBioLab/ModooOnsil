/* 손그림 기반 재배 운영 메인. 모든 데이터는 UI 검토용이며 브라우저에만 저장합니다. */
'use strict';

(() => {
  const DEMO_DATE = '2026-11-01';
  const STORAGE_KEY = 'agribiolab-workspace-demo-v2';
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const formatDate = value => value ? value.replaceAll('-', '.') + '.' : '미등록';
  const formatMoney = amount => new Intl.NumberFormat('ko-KR').format(amount);
  const daysBetween = (start, end) => Math.round((Date.parse(end + 'T00:00:00+09:00') - Date.parse(start + 'T00:00:00+09:00')) / 86400000);
  const makeId = prefix => prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

  // 선택 구역의 측정 시각과 추가 환경 항목. 실제 센서 응답이 아닌 시안용 표본입니다.
  const indoorSamples = {
    'A-1': { co2: 610, light: 12400, measured: '11.01. 08:30' },
    'A-2': { co2: 625, light: 12800, measured: '11.01. 08:30' },
    'B-1': { co2: 560, light: 13800, measured: '11.01. 08:30' },
    'B-2': { co2: 575, light: 13100, measured: '11.01. 08:30' },
    'C-1': { co2: 650, light: 8600, measured: '11.01. 08:30' },
    'C-2': { co2: 640, light: 8900, measured: '11.01. 08:30' }
  };

  // 온실별 비교는 명시적으로 지정한 대표 센서를 사용합니다. 베드 평균이 아닙니다.
  const representativeSensors = {
    A: { bedId: 'A-1', sensorId: 'A-ENV-01' },
    B: { bedId: 'B-1', sensorId: 'B-ENV-01' },
    C: { bedId: 'C-1', sensorId: 'C-ENV-01' }
  };

  const seed = {
    selectedHouse: 'A', selectedBed: 'A-1', month: '2026-11',
    houses: [
      { id: 'A', name: 'A동', crop: '장미', variety: '쥬피터', stages: ['정식·활착', '생육관리', '수확 준비', '반복 수확'], beds: [
        { id: 'A-1', name: '1번 베드', phase: 2, start: '2026-01-23', shipment: '2026-11-23', observed: '2026-10-31', temp: 23.2, humidity: 65, note: '다음 출하 계획 기준입니다. 기존 식재는 계속 유지됩니다.' },
        { id: 'A-2', name: '2번 베드', phase: 3, start: '2026-02-15', shipment: '2026-11-05', observed: '2026-10-31', temp: 23.6, humidity: 66, note: '반복 수확 중입니다. 다음 출하 일정과 작업 기록을 확인하세요.' }
      ]},
      { id: 'B', name: 'B동', crop: '국화', variety: '백마', stages: ['정식', '생육관리', '개화관리', '수확·출하'], beds: [
        { id: 'B-1', name: '1번 베드', phase: 2, start: '2026-09-01', shipment: '2026-11-18', observed: '2026-10-30', temp: 22.8, humidity: 68, note: '생육 단계는 농가가 관찰·기록한 상태를 표시합니다.' },
        { id: 'B-2', name: '2번 베드', phase: 1, start: '2026-10-05', shipment: '2026-12-10', observed: '2026-10-30', temp: 22.3, humidity: 67, note: '출하예정일은 농가의 계획값이며 자동 예측값이 아닙니다.' }
      ]},
      { id: 'C', name: 'C동', crop: '호접란', variety: '만천홍', stages: ['정식', '영양생장', '개화관리', '출하 준비'], beds: [
        { id: 'C-1', name: '1번 베드', phase: 1, start: '2026-09-14', shipment: '2027-02-15', observed: '2026-10-31', temp: 24.5, humidity: 72, note: '품목마다 단계가 다릅니다. 예시 단계는 실제 재배 기준으로 확정해야 합니다.' },
        { id: 'C-2', name: '2번 베드', phase: 2, start: '2026-06-15', shipment: '2026-12-12', observed: '2026-10-31', temp: 24.1, humidity: 73, note: '관찰 기록과 다음 출하 계획을 함께 확인하세요.' }
      ]}
    ],
    tasks: [
      { id: 'task-1', title: '관수', house: 'A', bed: '1·2번 베드', time: '09:00', type: '관수', done: false, recordId: null },
      { id: 'task-2', title: '응애 방제', house: 'B', bed: '1번 베드', time: '10:30', type: '방제', done: false, recordId: null },
      { id: 'task-3', title: '만천홍 분갈이', house: 'C', bed: '1번 베드', time: '13:00', type: '분갈이', done: false, recordId: null }
    ],
    records: [
      { id: 'record-example', date: '2026-10-31', time: '16:00', house: 'A', bed: '1번 베드', type: '관찰', text: '출하 준비 상태를 확인하고 생육 사진을 기록함.', cancelled: false, source: '예시 기록' }
    ],
    ledger: [
      { id: 'ledger-1', date: '2026-11-01', type: 'income', amount: 4000000, text: '장미 출하대금 입금' },
      { id: 'ledger-2', date: '2026-11-01', type: 'expense', amount: 850000, text: '종묘 구입' },
      { id: 'ledger-3', date: '2026-11-01', type: 'expense', amount: 350000, text: '비료·배지 구입' },
      { id: 'ledger-4', date: '2026-11-01', type: 'expense', amount: 300000, text: '난방·전기료' },
      { id: 'ledger-5', date: '2026-10-15', type: 'income', amount: 3200000, text: '10월 출하대금 입금' },
      { id: 'ledger-6', date: '2026-10-10', type: 'expense', amount: 1200000, text: '10월 농자재·운영비' }
    ]
  };

  let state = JSON.parse(JSON.stringify(seed));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const valid = saved && Array.isArray(saved.houses) && saved.houses.length > 0 &&
      saved.houses.every(house => typeof house.id === 'string' && typeof house.name === 'string' && typeof house.crop === 'string' && typeof house.variety === 'string' && Array.isArray(house.stages) && house.stages.every(stage => typeof stage === 'string') && Array.isArray(house.beds) && house.beds.length > 0 && house.beds.every(bed => typeof bed.id === 'string' && typeof bed.name === 'string' && Number.isInteger(bed.phase) && bed.phase >= 0 && bed.phase < house.stages.length)) &&
      Array.isArray(saved.tasks) && saved.tasks.every(task => typeof task.id === 'string' && typeof task.title === 'string' && typeof task.bed === 'string' && typeof task.time === 'string' && typeof task.done === 'boolean' && saved.houses.some(house => house.id === task.house)) &&
      Array.isArray(saved.records) && saved.records.every(record => typeof record.id === 'string' && typeof record.date === 'string' && typeof record.text === 'string') &&
      Array.isArray(saved.ledger) && saved.ledger.every(entry => typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && ['income', 'expense'].includes(entry.type) && Number.isSafeInteger(entry.amount) && entry.amount > 0 && typeof entry.text === 'string');
    if (valid) state = saved;
  } catch (_) { /* 저장 불가 또는 손상된 데모 데이터는 초기 예시로 복구합니다. */ }

  const pageBody = $('#workspacePageBody');
  let toastTimer;

  function toast(message) {
    const element = $('#workspaceToast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 4200);
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { toast('브라우저에 저장할 수 없어 변경 내용은 현재 화면에서만 유지됩니다.'); }
  }

  function getHouse() {
    return state.houses.find(house => house.id === state.selectedHouse) || state.houses[0];
  }

  function getBed() {
    const house = getHouse();
    return house.beds.find(bed => bed.id === state.selectedBed) || house.beds[0];
  }

  function closeMenu() {
    const menu = $('#workspaceMobileMenu');
    if (menu) menu.open = false;
  }

  function openPage(title, content) {
    $('#workspaceDashboard').hidden = true;
    $('#workspacePage').hidden = false;
    $('#workspacePageTitle').textContent = title;
    $('#workspacePageLocation').textContent = title;
    pageBody.innerHTML = content;
    document.title = '모두의온실 - ' + title;
    closeMenu();
  }

  const primaryViews = {
    home: '온실별 현재 재배·환경 상태', journal: '날짜별 재배일지',
    profile: '농장·온실·재배 정보', statistics: '기간별 생육·작업·출하 결과 비교',
    ledger: '농장 입금·출금 내역'
  };
  const parentViews = {
    'journal-add': 'journal', 'ledger-add': 'ledger', 'greenhouse-add': 'profile',
    'all-houses': 'profile', 'task-add': 'tasks', 'complete-task': 'tasks'
  };
  const informationViews = new Set(['profile', 'session', 'advisory', 'weather', 'assumptions', 'compensation']);
  const isMonth = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '');

  function route() {
    const params = new URLSearchParams(location.search);
    return { view: params.get('view') || 'home', params };
  }

  function syncNavigation() {
    const view = route().view;
    const parent = parentViews[view];
    const family = primaryViews[view] ? view : primaryViews[parent] ? parent : 'home';
    document.querySelectorAll('.html-menu [data-workspace-view], .all-menu-list [data-workspace-view]').forEach(link => {
      if (link.dataset.workspaceView === family) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function navigate(view, parameters = {}, replace = false) {
    const current = route();
    const url = new URL(location.href);
    ['view', 'task', 'filter', 'month', 'firstMonth', 'secondMonth', 'from'].forEach(key => url.searchParams.delete(key));
    if (view !== 'home') url.searchParams.set('view', view);
    if (parentViews[view]) parameters = { from: current.view, ...parameters };
    Object.entries(parameters).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
    const depth = Number(history.state?.workspaceDepth || 0);
    history[replace ? 'replaceState' : 'pushState']({ workspaceDepth: replace ? depth : depth + 1 }, '', url);
    renderRoute();
  }

  function finishPage(fallback) {
    const previous = route().params.get('from');
    const destination = previous && (primaryViews[previous] || previous === 'tasks') ? previous : fallback;
    navigate(destination, {}, true);
  }

  function goBack() {
    if (Number(history.state?.workspaceDepth || 0) > 0) history.back();
    else navigate(parentViews[route().view] || 'home', {}, true);
  }

  function renderRoute({ focus = true } = {}) {
    const current = route();
    closeMenu();
    if (current.view === 'ledger' && isMonth(current.params.get('month'))) {
      state.month = current.params.get('month');
      persist();
    }
    renderCultivation();
    renderTasks();
    renderLedger();
    $('#ledgerMonth').value = state.month;
    if (current.view === 'home') {
      $('#workspaceDashboard').hidden = false;
      $('#workspacePage').hidden = true;
      pageBody.replaceChildren();
      document.title = '모두의온실 - ' + primaryViews.home;
    } else if (current.view === 'ledger') {
      showLedger(['income', 'expense'].includes(current.params.get('filter')) ? current.params.get('filter') : 'all');
    } else if (current.view === 'statistics') {
      showStatistics(isMonth(current.params.get('firstMonth')) ? current.params.get('firstMonth') : undefined,
        isMonth(current.params.get('secondMonth')) ? current.params.get('secondMonth') : undefined);
    } else if (current.view === 'complete-task') {
      const taskId = current.params.get('task');
      if (state.tasks.some(task => task.id === taskId)) showTaskComplete(taskId);
      else openPage('작업을 찾을 수 없습니다', '<p class="empty-panel">선택한 작업이 없습니다. 작업 목록에서 다시 선택해주세요.</p><button class="btn" data-action="tasks">작업 목록</button>');
    } else if (actions[current.view]) actions[current.view]();
    else if (informationViews.has(current.view)) showInformation(current.view);
    else openPage('화면을 찾을 수 없습니다', '<p class="empty-panel">메뉴에서 이동할 화면을 선택해주세요.</p>');
    syncNavigation();
    if (focus) {
      const heading = current.view === 'home' ? $('#workspaceDashboard h1') : $('#workspacePageTitle');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function houseOptions(selected = getHouse().id) {
    return state.houses.map(house => `<option value="${escapeHtml(house.id)}" ${house.id === selected ? 'selected' : ''}>${escapeHtml(house.name)} · ${escapeHtml(house.crop)}</option>`).join('');
  }

  function bedOptions(houseId, all = true) {
    const house = state.houses.find(item => item.id === houseId) || getHouse();
    return (all ? '<option value="전체 구역">전체 구역</option>' : '') + house.beds.map(bed => `<option value="${escapeHtml(bed.name)}">${escapeHtml(bed.name)}</option>`).join('');
  }

  function renderCultivation() {
    const house = getHouse();
    const bed = getBed();
    state.selectedHouse = house.id;
    state.selectedBed = bed.id;
    $('#houseTabs').innerHTML = state.houses.map(item => `<button type="button" id="house-tab-${escapeHtml(item.id)}" role="tab" aria-selected="${item.id === house.id}" aria-controls="selectedHousePanel" tabindex="${item.id === house.id ? 0 : -1}" data-house="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`).join('');
    $('#bedSelect').innerHTML = house.beds.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === bed.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
    $('#selectedHousePanel').setAttribute('aria-labelledby', 'house-tab-' + house.id);
    const elapsed = bed.start ? daysBetween(bed.start, DEMO_DATE) : null;
    const remaining = bed.shipment ? daysBetween(DEMO_DATE, bed.shipment) : null;
    const dday = remaining === null ? '' : remaining === 0 ? 'D-day' : remaining > 0 ? 'D-' + remaining : '예정일 경과 ' + Math.abs(remaining) + '일';
    $('#cultivationContent').innerHTML = `
      <div class="crop-overview"><div><div class="crop-name"><h3>${escapeHtml(house.crop)}</h3><span class="variety">${escapeHtml(house.variety)}</span></div><p class="crop-location">${escapeHtml(house.name)} · ${escapeHtml(bed.name)} · 선택한 재배 현황</p></div><span class="phase-status">${escapeHtml(house.stages[bed.phase])}</span></div>
      <ol class="crop-stage-list" aria-label="농가 기록 기준 재배 단계">${house.stages.map((stage, index) => `<li class="${index < bed.phase ? 'past' : index === bed.phase ? 'current' : ''}" ${index === bed.phase ? 'aria-current="step"' : ''}><span class="stage-dot" aria-hidden="true"></span>${escapeHtml(stage)}</li>`).join('')}</ol>
      <p class="crop-stage-note">예시 단계 · 농가가 기록한 상태이며 생육률을 자동 산정하지 않습니다.</p>
      <dl class="crop-dates"><div><dt>정식일</dt><dd>${formatDate(bed.start)}${elapsed !== null ? `<span class="day-count">${elapsed >= 0 ? 'D+' + elapsed : '정식 예정'}</span>` : ''}</dd></div><div><dt>다음 출하 예정</dt><dd>${formatDate(bed.shipment)}${dday ? `<span class="day-count upcoming">${dday}</span>` : ''}</dd></div></dl>`;
    $('#lastObservation').textContent = '최근 상태 확인 ' + formatDate(bed.observed) + ' · 예시';
    renderIndoorEnvironment();
  }

  function renderTasks() {
    const done = state.tasks.filter(task => task.done).length;
    $('#taskProgress').textContent = `${done} / ${state.tasks.length} 완료`;
    const tasks = state.tasks.slice(0, 3);
    $('#taskList').innerHTML = tasks.length ? tasks.map(task => {
      const house = state.houses.find(item => item.id === task.house);
      return `<li class="workspace-task${task.done ? ' done' : ''}"><input type="checkbox" id="task-${escapeHtml(task.id)}" data-task="${escapeHtml(task.id)}" ${task.done ? 'checked' : ''} aria-label="${escapeHtml(house.name + ' ' + task.title)} 완료 기록"><label for="task-${escapeHtml(task.id)}"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(house.name)} · ${escapeHtml(task.bed)}</small></label><time>${escapeHtml(task.time)}</time></li>`;
    }).join('') : '<li class="task-empty">등록된 할 일이 없습니다.</li>';
    if (state.tasks.length > 3) $('#taskList').insertAdjacentHTML('beforeend', `<li class="task-overflow">그 외 ${state.tasks.length - 3}건은 ‘더 보기’에서 확인하세요.</li>`);
  }

  function weatherIcon(kind) {
    if (kind === 'sun') return '<svg class="forecast-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" fill="#f4c866"/><g stroke="#d7a43b" stroke-width="1.5" stroke-linecap="round"><path d="M16 3v3m0 20v3M3 16h3m20 0h3M6.8 6.8l2.1 2.1m14.2 14.2 2.1 2.1M6.8 25.2l2.1-2.1M23.1 8.9l2.1-2.1"/></g></svg>';
    return `<svg class="forecast-icon" viewBox="0 0 32 32" aria-hidden="true">${kind === 'cloud-sun' ? '<circle cx="21" cy="10" r="6" fill="#f3d180"/>' : ''}<path d="M7 24a6 6 0 0 1 0-12c1-7 12-8 15-1 8-1 11 13 2 13Z" fill="#b9cbda" stroke="#91aabd" stroke-width="1.1"/>${kind === 'rain' ? '<path d="m11 27-1 3m8-3-1 3m8-3-1 3" stroke="#5b8cba" stroke-width="1.8" stroke-linecap="round"/>' : ''}</svg>`;
  }

  function getIndoorReadings(bed = getBed()) {
    const sample = indoorSamples[bed.id];
    return [
      { key: 'temperature', label: '내부 온도', value: bed.temp, unit: '°C', primary: true },
      { key: 'humidity', label: '내부 습도', value: bed.humidity, unit: '%', primary: true },
      { key: 'co2', label: 'CO₂', value: sample?.co2 ?? null, unit: 'ppm', primary: false },
      { key: 'light', label: '광도', value: sample?.light ?? null, unit: 'lx', primary: false }
    ];
  }

  function indoorValue(reading) {
    if (!Number.isFinite(reading.value)) return '—';
    return reading.key === 'temperature' ? reading.value.toFixed(1) : formatMoney(reading.value);
  }

  function getHouseEnvironment(house) {
    const sensor = representativeSensors[house.id];
    const bed = house.beds.find(plot => plot.id === sensor?.bedId);
    const sample = bed && indoorSamples[bed.id];
    const readings = bed ? getIndoorReadings(bed) : [
      { key: 'temperature', label: '내부 온도', value: null, unit: '°C', primary: true },
      { key: 'humidity', label: '내부 습도', value: null, unit: '%', primary: true },
      { key: 'co2', label: 'CO₂', value: null, unit: 'ppm', primary: false },
      { key: 'light', label: '광도', value: null, unit: 'lx', primary: false }
    ];
    return { sensor, sample, readings, available: readings.some(reading => Number.isFinite(reading.value)) };
  }

  function renderIndoorEnvironment() {
    const house = getHouse();
    const environment = getHouseEnvironment(house);
    $('#indoorTitle').textContent = house.name + ' 내부 환경';
    $('#indoorSensor').textContent = environment.sensor ? '온실 대표 센서 ' + environment.sensor.sensorId : '대표 센서 미등록';
    $('#indoorScope').textContent = house.name + ' · ' + getBed().name;
    $('#indoorReadings').innerHTML = environment.readings.map(reading => `<div class="indoor-metric${reading.primary ? ' primary-reading' : ''}" data-reading="${reading.key}"><span class="indoor-label">${reading.label}</span><strong><span class="indoor-value">${indoorValue(reading)}</span><small>${reading.unit}</small></strong><span class="indoor-state">${Number.isFinite(reading.value) ? '측정 예시' : '미수신'}</span></div>`).join('');
    $('#indoorReadings').dataset.state = environment.available ? 'sample' : 'missing';
    $('#indoorTimestamp').textContent = environment.sample ? environment.sample.measured + ' 측정 · 예시' : '측정 데이터 미수신';
    $('#indoorNote').textContent = '온실 대표 센서 기준 · 베드별 값은 상세에서 확인 · 센서 연계 전 예시입니다.';
  }

  function showEnvironmentComparison() {
    const house = getHouse();
    const cards = state.houses.map(item => {
      const environment = getHouseEnvironment(item);
      return `<button type="button" class="environment-house-card" data-environment-house="${escapeHtml(item.id)}" data-state="${environment.available ? 'sample' : 'missing'}" aria-pressed="${item.id === house.id}" aria-label="${escapeHtml(item.name)} 환경 비교, 이 온실 선택">
        <span class="environment-house-heading"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.crop)}</small></span><span class="environment-house-badge">${item.id === house.id ? '선택' : environment.available ? '측정 예시' : '미연계'}</span></span>
        <span class="environment-house-values">${environment.readings.slice(0, 2).map(reading => `<span data-reading="${reading.key}"><span class="environment-reading-label">${reading.label}</span><strong><span class="indoor-value">${indoorValue(reading)}</span><small>${reading.unit}</small></strong></span>`).join('')}</span>
        <span class="environment-house-secondary">${environment.readings.slice(2).map(reading => `<span data-reading="${reading.key}">${reading.label} <span class="indoor-value">${indoorValue(reading)}</span> ${reading.unit}</span>`).join('')}</span>
        <span class="environment-house-time">${environment.sample ? `${escapeHtml(environment.sensor.sensorId)} · ${environment.sample.measured} 측정` : '대표 센서 미등록 · 데이터 미수신'}</span>
      </button>`;
    }).join('');
    openPage('온실 내부 환경 전체 비교', '<p>각 동의 대표 센서값을 비교하고, 확인할 온실을 선택하세요. 값은 예시이며 온실 평균과 구분합니다.</p><div class="house-environments">' + cards + '</div>');
  }

  function showIndoorEnvironment() {
    const house = getHouse();
    const bed = getBed();
    const sample = indoorSamples[bed.id];
    openPage(`${house.name} · ${bed.name} 내부 환경`, `<p class="dialog-intro">${escapeHtml(house.crop)} · ${escapeHtml(house.variety)}<br>${sample ? sample.measured + ' 측정 예시 · 수집 간격 10분' : '센서 연계 전 · 측정 데이터 미수신'}</p><div class="dialog-grid">${getIndoorReadings().map(reading => `<div class="detail-cell"><small>${reading.label}</small><strong>${indoorValue(reading)} ${reading.unit}</strong>${Number.isFinite(reading.value) ? '' : '<p class="field-help">측정 데이터 미수신</p>'}</div>`).join('')}</div><p class="modal-note">메인은 공통 온실 탭 아래 재배정보와 해당 온실의 대표 센서 환경을 함께 표시합니다. 전체 비교는 별도로 열어봅니다. 이 상세 화면은 선택한 베드의 센서값이며, 온실 대표값이나 전체 평균과 구분합니다. 값과 측정 시각은 시연용이며, 정상 여부나 적정 범위를 자동 판정하지 않습니다. 실제 연계 시 마지막 수신 시각과 데이터 지연 상태를 함께 표시합니다.</p>`);
  }

  function renderWeather() {
    const forecast = [
      { day: '11.01.', week: '오늘', kind: 'sun', low: 8, high: 18, rain: 0, label: '맑음' },
      { day: '11.02.', week: '월', kind: 'cloud-sun', low: 9, high: 19, rain: 20, label: '구름 조금' },
      { day: '11.03.', week: '화', kind: 'cloud', low: 10, high: 17, rain: 30, label: '흐림' },
      { day: '11.04.', week: '수', kind: 'rain', low: 9, high: 15, rain: 60, label: '비' },
      { day: '11.05.', week: '목', kind: 'sun', low: 7, high: 16, rain: 10, label: '맑음' }
    ];
    return `<div class="forecast-days external-forecast">${forecast.map(day => `<div class="forecast-day" aria-label="${day.day} ${day.label}, 최저 ${day.low}도 최고 ${day.high}도, 강수확률 ${day.rain}퍼센트, 예시"><div class="forecast-date">${day.day}<strong>${day.week}</strong></div>${weatherIcon(day.kind)}<div class="forecast-temperature"><span class="low">${day.low}°</span><span class="separator">/</span>${day.high}°</div><div class="forecast-rain">강수 ${day.rain}%</div></div>`).join('')}</div>`;
  }

  function monthEntries() {
    return state.ledger.filter(entry => entry.date.slice(0, 7) === state.month);
  }

  function ledgerTotals() {
    const entries = monthEntries();
    return { entries, income: entries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0), expense: entries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0) };
  }

  function renderLedger() {
    $('#ledgerMonth').value = state.month;
    const { entries, income, expense } = ledgerTotals();
    const month = Number(state.month.slice(5));
    const cards = [
      { key: 'income', label: `${month}월 입금`, amount: income, symbol: '↓', note: '입력된 입금 기록 기준', className: '' },
      { key: 'expense', label: `${month}월 출금`, amount: expense, symbol: '↑', note: '입력된 출금 기록 기준', className: 'outgoing' },
      { key: 'all', label: `${month}월 입출금 차액`, amount: income - expense, symbol: '=', note: '입금 − 출금 · 순이익과 구분', className: 'balance' }
    ];
    $('#ledgerSummary').innerHTML = cards.map(card => `<button type="button" class="ledger-card ${card.className}" data-ledger="${card.key}" aria-label="${escapeHtml(card.label)} 상세 보기"><span class="ledger-symbol" aria-hidden="true">${card.symbol}</span><div><span class="ledger-card-label">${card.label}</span>${entries.length ? `<strong class="ledger-card-value">${card.key === 'all' && card.amount > 0 ? '+' : card.amount < 0 ? '−' : ''}${formatMoney(Math.abs(card.amount))}<small>원</small></strong>` : '<strong class="ledger-missing">기록 없음</strong>'}<span class="ledger-card-note">${entries.length ? card.note : '입출금 내역을 먼저 등록하세요'}</span></div></button>`).join('');
  }

  function showTaskComplete(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;
    const house = state.houses.find(item => item.id === task.house);
    if (task.done) {
      const record = state.records.find(item => item.id === task.recordId);
      openPage('완료한 작업 확인', `<p class="dialog-intro">${escapeHtml(house.name)} · ${escapeHtml(task.bed)} · ${escapeHtml(task.title)}</p><p>${escapeHtml(record?.text || '완료 기록')}</p><p class="field-help">완료를 취소하면 작업은 미완료로 바뀌며, 기존 일지에는 ‘완료 취소’ 이력이 남습니다.</p><div class="dialog-actions"><button type="button" class="btn" data-page-back>이전 화면</button><button type="button" class="btn primary" data-undo-task="${escapeHtml(task.id)}">완료 표시 취소</button></div>`);
      return;
    }
    openPage('작업 완료 기록', `<p class="dialog-intro">${escapeHtml(house.name)} · ${escapeHtml(task.bed)} · ${escapeHtml(task.title)}<br><small>완료 내용은 재배일지에 함께 저장됩니다.</small></p><form id="completeTaskForm" data-task-id="${escapeHtml(task.id)}"><div class="form-row"><div><label for="completionDate">작업일</label><input id="completionDate" name="date" type="date" value="${DEMO_DATE}" required></div><div><label for="completionTime">완료시각</label><input id="completionTime" name="time" type="time" value="${escapeHtml(task.time)}" required></div></div><label for="completionText">실제 수행 내용</label><textarea id="completionText" name="text" maxlength="1000" required placeholder="실제 작업한 베드와 수행 내용, 사용량 등을 기록하세요."></textarea><p class="field-help">체크만으로 완료 처리하지 않습니다. 내용을 저장하면 할 일과 일지가 함께 갱신됩니다.</p><div class="dialog-actions"><button type="button" class="btn" data-page-back>취소</button><button type="submit" class="btn primary">완료하고 일지에 저장</button></div></form>`);
  }

  function showJournal() {
    const records = [...state.records].sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
    openPage('날짜별 재배일지', `<p>작업 완료 기록과 직접 작성한 일지를 함께 볼 수 있습니다. 전체 농장 기준입니다.</p>${records.map(record => {
      const house = state.houses.find(item => item.id === record.house);
      return `<article class="record-card${record.cancelled ? ' cancelled' : ''}"><p class="record-status">${record.cancelled ? '완료 취소' : escapeHtml(record.source || '직접 작성')}</p><h3>${escapeHtml(record.type)} · ${escapeHtml(house?.name || record.house)} · ${escapeHtml(record.bed)}</h3><p class="record-meta">${formatDate(record.date)} ${escapeHtml(record.time || '')}</p><div class="record-content">${escapeHtml(record.text)}</div></article>`;
    }).join('') || '<p class="empty-panel">작성한 일지가 없습니다.</p>'}<button type="button" class="btn primary" data-action="journal-add">재배일지 쓰기</button>`);
  }

  function showJournalForm() {
    openPage('날짜별 생육·작업 기록하기', `<p>선택한 온실을 기본값으로 가져옵니다. 다른 온실·베드의 작업도 기록할 수 있습니다.</p><form id="workspaceJournalForm"><div class="form-row"><div><label for="journalHouse">온실</label><select id="journalHouse" name="house" data-bed-target="journalBed">${houseOptions()}</select></div><div><label for="journalBed">재배구역</label><select id="journalBed" name="bed">${bedOptions(getHouse().id)}</select></div></div><div class="form-row"><div><label for="journalDate">기록일</label><input id="journalDate" name="date" type="date" value="${DEMO_DATE}" required></div><div><label for="journalType">기록 구분</label><select id="journalType" name="type"><option>관찰</option><option>관수</option><option>방제</option><option>분갈이</option><option>전정</option><option>수확·출하</option><option>기타</option></select></div></div><label for="journalText">기록 내용</label><textarea id="journalText" name="text" required maxlength="1000" placeholder="작업 내용과 관찰한 변화를 기록하세요."></textarea><div class="dialog-actions"><button type="button" class="btn" data-page-back>취소</button><button type="submit" class="btn primary">재배일지에 저장</button></div></form><button type="button" class="text-link" data-action="journal">저장한 재배일지 보기</button>`);
    const currentBed = getBed().name;
    $('#journalBed').value = currentBed;
  }

  function showTasks() {
    openPage('오늘 할 일 · 전체 농장', `<p>미완료 작업을 선택하면 실제 수행 내용을 기록할 수 있습니다.</p><ul class="detail-list">${state.tasks.map(task => {
      const house = state.houses.find(item => item.id === task.house);
      return `<li><span><strong>${escapeHtml(task.title)}</strong><br><small>${escapeHtml(house.name)} · ${escapeHtml(task.bed)} · ${escapeHtml(task.time)}</small></span><button type="button" class="text-link" data-complete-task="${escapeHtml(task.id)}">${task.done ? '완료 기록' : '완료 기록하기'}</button></li>`;
    }).join('')}</ul><button type="button" class="btn primary" data-action="task-add">할 일 추가</button>`);
  }

  function showTaskForm() {
    openPage('오늘 할 일 추가', `<p>선택한 온실을 기본값으로 사용합니다. 작업 목록은 전체 농장 기준으로 유지됩니다.</p><form id="workspaceTaskForm"><label for="taskTitle">작업명</label><input id="taskTitle" name="title" required maxlength="60" placeholder="예: 생육 상태 측정"><div class="form-row"><div><label for="taskHouse">온실</label><select id="taskHouse" name="house" data-bed-target="taskBed">${houseOptions()}</select></div><div><label for="taskBed">재배구역</label><select id="taskBed" name="bed">${bedOptions(getHouse().id)}</select></div></div><div class="form-row"><div><label for="taskType">작업 구분</label><select id="taskType" name="type"><option>관찰</option><option>관수</option><option>방제</option><option>분갈이</option><option>전정</option><option>수확·출하</option><option>기타</option></select></div><div><label for="taskTime">예정시각</label><input id="taskTime" name="time" type="time" value="15:00" required></div></div><div class="dialog-actions"><button type="button" class="btn" data-page-back>취소</button><button type="submit" class="btn primary">할 일 추가</button></div></form>`);
  }

  function showAllHouses() {
    openPage('시안에 구성된 온실 선택', `<p>온실을 선택하면 메인의 재배현황이 바뀝니다. 이 파일에는 A·B·C동의 재배 예시를 구성했습니다.</p><ul class="detail-list">${state.houses.map(house => `<li><span><strong>${escapeHtml(house.name)} · ${escapeHtml(house.crop)}</strong><br><small>${escapeHtml(house.variety)} · ${house.beds.length}개 구역</small></span><button type="button" class="text-link" data-select-house="${escapeHtml(house.id)}">선택</button></li>`).join('')}</ul>`);
  }

  function showCultivationDetail() {
    const house = getHouse();
    const bed = getBed();
    openPage(`${house.name} · ${bed.name} 재배 상세`, `<p class="dialog-intro">${escapeHtml(house.crop)} · ${escapeHtml(house.variety)} · ${escapeHtml(house.stages[bed.phase])}</p><ul class="detail-list"><li>정식일 <small>${formatDate(bed.start)}</small></li><li>다음 출하 예정 <small>${formatDate(bed.shipment)}</small></li><li>최근 상태 확인 <small>${formatDate(bed.observed)}</small></li><li>온실 내부 온도 <small>${bed.temp === null ? '미수신' : escapeHtml(bed.temp) + ' °C · 측정 예시'}</small></li><li>온실 내부 습도 <small>${bed.humidity === null ? '미수신' : escapeHtml(bed.humidity) + ' % · 측정 예시'}</small></li></ul><p class="modal-note">${escapeHtml(bed.note)}<br>재배 단계는 관찰·기록 기준입니다. 날짜나 온도만으로 생육률을 자동 판정하지 않습니다.</p><div class="dialog-actions"><button type="button" class="btn" data-action="journal-add">이 구역 생육·작업 기록하기</button><button type="button" class="btn primary" data-action="all-houses">다른 온실 선택</button></div>`);
  }

  function showLedger(filter = 'all') {
    const { entries, income, expense } = ledgerTotals();
    const filtered = entries.filter(entry => filter === 'all' || entry.type === filter);
    const label = filter === 'income' ? '입금' : filter === 'expense' ? '출금' : '입출금';
    openPage('농장 입금·출금 내역', `<p>전체 농장 · 실제 입출금일 기준으로 내역을 확인하세요.</p><div class="workspace-filters"><div><label for="pageLedgerMonth">조회 월</label><input type="month" id="pageLedgerMonth" value="${escapeHtml(state.month)}"></div><div><label for="pageLedgerType">입출금 구분</label><select id="pageLedgerType"><option value="all" ${filter === 'all' ? 'selected' : ''}>전체</option><option value="income" ${filter === 'income' ? 'selected' : ''}>입금</option><option value="expense" ${filter === 'expense' ? 'selected' : ''}>출금</option></select></div><button type="button" class="btn primary" data-action="ledger-add">입출금 기록 추가</button></div>${filtered.length ? `<div class="modal-table-wrap"><table class="modal-table"><caption class="sr-only">${escapeHtml(label)} 날짜, 내역, 구분, 금액</caption><thead><tr><th scope="col">날짜</th><th scope="col">내역</th><th scope="col">구분</th><th scope="col">금액</th></tr></thead><tbody>${filtered.map(entry => `<tr><td>${escapeHtml(entry.date.slice(5).replace('-', '.'))}</td><td>${escapeHtml(entry.text)}</td><td>${entry.type === 'income' ? '입금' : '출금'}</td><td class="number">${formatMoney(entry.amount)}원</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-panel">이 조건에 등록된 기록이 없습니다.</p>'}<p class="modal-note">${entries.length ? `입금 ${formatMoney(income)}원 − 출금 ${formatMoney(expense)}원 = 차액 ${formatMoney(income - expense)}원<br>` : ''}입출금 차액은 장부에 입력한 현금 흐름의 차이이며, 순이익이나 예상 매출이 아닙니다.</p><button type="button" class="btn primary" data-action="ledger-add">입출금 기록 추가</button>`);
  }

  function showLedgerForm() {
    openPage('입금·출금 내역 기록하기', `<form id="workspaceLedgerForm"><div class="form-row"><div><label for="entryType">구분</label><select id="entryType" name="type"><option value="income">입금</option><option value="expense">출금</option></select></div><div><label for="entryDate">입출금일</label><input id="entryDate" name="date" type="date" value="${state.month}-01" required></div></div><label for="entryAmount">금액 (원)</label><input id="entryAmount" name="amount" type="number" min="1" max="1000000000000" step="1" required placeholder="예: 150000"><label for="entryText">내역</label><input id="entryText" name="text" maxlength="120" required placeholder="예: 장미 출하대금 입금"><p class="field-help">입력한 날짜의 월 장부로 이동합니다. 실제 입출금과 아직 정산되지 않은 예상 매출은 구분해 기록하세요.</p><div class="dialog-actions"><button type="button" class="btn" data-page-back>취소</button><button type="submit" class="btn primary">장부에 저장</button></div></form><button type="button" class="text-link" data-action="ledger">저장한 입출금 내역 보기</button>`);
  }

  function showGreenhouseForm() {
    openPage('온실 등록 · 시안 내 추가', `<p>등록한 온실은 메인 탭에 추가됩니다. 상세 재배 기준은 실제 농가의 관리 방식으로 정합니다.</p><form id="workspaceHouseForm"><label for="houseName">온실명</label><input id="houseName" name="name" required maxlength="12" placeholder="예: D동"><div class="form-row"><div><label for="houseCrop">품목</label><input id="houseCrop" name="crop" required maxlength="30" placeholder="예: 장미"></div><div><label for="houseVariety">품종</label><input id="houseVariety" name="variety" required maxlength="40" placeholder="예: 쥬피터"></div></div><label for="houseBed">재배구역</label><input id="houseBed" name="bed" required maxlength="30" value="1번 베드"><p class="field-help">초기 단계는 ‘재배정보 등록’, 날짜·센서값은 미등록 상태로 추가됩니다.</p><p class="validation-error" id="houseFormError" role="alert"></p><div class="dialog-actions"><button type="button" class="btn" data-page-back>취소</button><button type="submit" class="btn primary">온실 추가</button></div></form>`);
  }

  function showStatistics(firstMonth, secondMonth) {
    const month = Number(state.month.slice(5));
    const previousMonth = month === 1 ? `${Number(state.month.slice(0, 4)) - 1}-12` : `${state.month.slice(0, 4)}-${String(month - 1).padStart(2, '0')}`;
    const first = firstMonth || previousMonth;
    const second = secondMonth || state.month;
    const records = state.records.filter(record => !record.cancelled && typeof record.type === 'string');
    const groups = [first, second].map(value => records.filter(record => record.date.startsWith(value + '-')));
    const types = [...new Set(groups.flat().map(record => record.type))].sort((a, b) => a.localeCompare(b, 'ko'));
    const displayCount = (group, type) => group.length ? `${group.filter(record => !type || record.type === type).length}건` : '기록 없음';
    openPage('기간별 생육·작업·출하 결과 비교', `<p>두 달에 저장한 재배일지의 유형별 건수를 비교합니다. 전체 농장 기준이며 완료 취소 기록은 제외합니다.</p><form id="workspaceStatisticsForm"><div class="form-row"><div><label for="compareFirstMonth">첫 번째 조회 월</label><input id="compareFirstMonth" name="firstMonth" type="month" value="${escapeHtml(first)}" required></div><div><label for="compareSecondMonth">두 번째 조회 월</label><input id="compareSecondMonth" name="secondMonth" type="month" value="${escapeHtml(second)}" required></div></div><button type="submit" class="btn primary">선택한 두 달 비교하기</button></form><div class="modal-table-wrap"><table class="modal-table"><caption>월별 재배일지 기록 건수</caption><thead><tr><th scope="col">기록 구분</th><th scope="col">${escapeHtml(first)}</th><th scope="col">${escapeHtml(second)}</th></tr></thead><tbody>${types.map(type => `<tr><th scope="row">${escapeHtml(type)}</th>${groups.map(group => `<td class="number">${displayCount(group, type)}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">전체 기록</th>${groups.map(group => `<td class="number">${displayCount(group)}</td>`).join('')}</tr></tbody></table></div><p class="modal-note">기록 건수는 생육량이나 작업 효과를 뜻하지 않습니다. 기록이 없는 달은 실제 작업을 하지 않았다는 의미가 아닙니다.</p><button type="button" class="text-link" data-action="journal">집계한 재배일지 보기</button>`);
  }

  function showInformation(kind) {
    const content = {
      profile: ['농장·온실·재배 정보', '<p class="dialog-intro">나의 화훼농장 · 경기도 수원시</p><ul class="detail-list"><li>생산자 <small>김*수 · 가상 계정</small></li><li>메인에 구성된 온실 <small>' + state.houses.length + '개 동 · 시안 데이터</small></li><li>관리 단위 <small>농장 → 온실 → 베드·구역 → 재배 건</small></li><li>데이터 저장 <small>현재 브라우저의 데모 저장소</small></li></ul><p class="modal-note">원본 자료의 전체 온실 수와 구분해, 이 메인에는 A·B·C동의 재배 예시를 구성했습니다.</p><div class="dialog-actions"><button type="button" class="btn" data-action="all-houses">등록한 온실 확인</button><button type="button" class="btn primary" data-action="greenhouse-add">온실 기본정보 추가</button></div>'],
      session: ['로그아웃 · 시안 안내', '<p>실제 생산자 인증이 연결되지 않은 프로토타입입니다. 이 화면은 로그인 세션을 사용하지 않습니다.</p>'],
      advisory: ['지역 주의정보 · 제공 기준', '<p>공식 정보 연계 전 상태입니다. ‘정보 없음’이나 ‘안전’을 의미하지 않습니다.</p><ul class="modal-notes"><li>농장 위치에 맞는 지역과 대상 작목을 확인합니다.</li><li>제공기관·발표일·유효기간·원문을 함께 표시합니다.</li><li>기상특보와 병해충 예찰정보, 지원사업 공고는 구분합니다.</li><li>조회 실패·지난 정보·유효한 주의정보를 다른 상태로 표시합니다.</li></ul>'],
      weather: ['농장 외부 예보 · 보조 정보', '<p>수원시 농장의 외부 예보 표시 예시입니다. 온실 내부 환경을 메인에 우선 표시하고, 외부 예보는 필요할 때 열어보는 보조 정보로 제공합니다.</p>' + renderWeather() + '<p class="modal-note">가상 데이터이며 실제 기상청 응답이 아닙니다. 실제 연계 시 발표시각·대상 날짜·위치를 표시하고, 제공되지 않는 날짜는 임의로 채우지 않습니다.</p>'],
      assumptions: ['이번 시안의 적용 기준', '<ul class="modal-notes"><li>사진 아래쪽 스케치의 배치를 유지하고, 사용자 설명에 따라 온실 내부 환경을 메인의 중심에 배치합니다. 외부 날씨는 별도 전체 페이지에서 확인합니다.</li><li>재배 진행률 % 대신 농가가 기록한 현재 단계와 다음 출하 계획을 표시합니다.</li><li>공통 온실 탭을 선택하면 재배현황과 그 온실의 내부 환경이 한 영역에서 함께 바뀝니다. 다른 동은 전체 비교로 확인합니다. 베드를 바꿔도 온실 대표 센서는 바뀌지 않습니다. 할 일과 장부는 전체 농장 기준입니다.</li><li>완료 기록을 저장한 작업만 완료로 표시합니다.</li><li>차광 일정은 설비 연계 전인 예시 일정입니다.</li><li>월 입출금 차액은 순이익과 구분합니다.</li><li>데이터는 2026.11.01. 기준 시연 예시이며 현재 브라우저에만 저장합니다.</li></ul>'],
      compensation: ['기존 기록으로 피해보상 신청 준비', '<p>등록한 농장·재배·출하 기록을 선택하고 피해 내용을 추가하는 신청 흐름입니다.</p><div class="progress-steps"><span>1. 기존 기록 선택</span><span>2. 피해내용·증빙 추가</span><span>3. 제출·접수 확인</span></div><p class="modal-note">현재는 안내 시안입니다. 실제 제출·심사·금액 산정·지급은 연결되지 않았습니다.</p>']
    };
    const item = content[kind] || content.assumptions;
    openPage(item[0], item[1]);
  }

  function showProfile() {
    openPage('농장·온실·재배 정보', `<p>등록한 농장과 온실·재배구역 정보를 확인하세요.</p><div class="dialog-grid"><div class="detail-cell"><small>농장</small><strong>나의 화훼농장</strong><p>경기도 수원시 · 시안 정보</p></div><div class="detail-cell"><small>등록 온실</small><strong>${state.houses.length}개 동</strong><p>생산자 김*수 · 가상 계정</p></div></div><h2>온실·재배구역</h2><div class="modal-table-wrap"><table class="modal-table"><caption class="sr-only">등록 온실별 품목·품종·재배구역·단계</caption><thead><tr><th scope="col">온실</th><th scope="col">품목·품종</th><th scope="col">재배구역</th><th scope="col">현재 단계</th><th scope="col">상세</th></tr></thead><tbody>${state.houses.flatMap(house => house.beds.map(bed => `<tr><td>${escapeHtml(house.name)}</td><td>${escapeHtml(house.crop)} · ${escapeHtml(house.variety)}</td><td>${escapeHtml(bed.name)}</td><td>${escapeHtml(house.stages[bed.phase])}</td><td><button type="button" class="text-link" data-select-house="${escapeHtml(house.id)}" data-select-bed="${escapeHtml(bed.id)}">현재 상태</button></td></tr>`)).join('')}</tbody></table></div><div class="dialog-actions"><button type="button" class="btn primary" data-action="greenhouse-add">온실 기본정보 추가</button></div>`);
  }

  const actions = {
    profile: showProfile,
    tasks: showTasks, 'task-add': showTaskForm, journal: showJournal,
    statistics: () => showStatistics(),
    'journal-add': showJournalForm, 'cultivation-detail': showCultivationDetail,
    ledger: () => showLedger(), 'ledger-add': showLedgerForm,
    'greenhouse-add': showGreenhouseForm, 'all-houses': showAllHouses,
    'indoor-environment': showIndoorEnvironment, 'environment-compare': showEnvironmentComparison
  };

  document.addEventListener('click', event => {
    const pageLink = event.target.closest('a[data-workspace-view]');
    if (pageLink) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(pageLink.dataset.workspaceView);
      return;
    }
    const environmentHouse = event.target.closest('[data-environment-house]');
    if (environmentHouse) {
      const house = state.houses.find(item => item.id === environmentHouse.dataset.environmentHouse);
      if (!house) return;
      state.selectedHouse = house.id;
      state.selectedBed = house.beds.find(plot => plot.id === representativeSensors[house.id]?.bedId)?.id || house.beds[0].id;
      persist(); navigate('home');
      return;
    }
    // 온실 전체 조회도 같은 전체 페이지 탐색을 사용합니다.
    const farmLink = event.target.closest('a[href*="producerFarm.html"]');
    if (farmLink) {
      event.preventDefault();
      navigate('all-houses');
      return;
    }
    const selectedHouse = event.target.closest('[data-select-house]');
    if (selectedHouse) {
      const house = state.houses.find(item => item.id === selectedHouse.dataset.selectHouse);
      if (!house) return;
      state.selectedHouse = house.id;
      state.selectedBed = house.beds.find(bed => bed.id === selectedHouse.dataset.selectBed)?.id || house.beds[0].id;
      persist(); navigate('home');
      return;
    }
    const trigger = event.target.closest('[data-action]');
    if (trigger) {
      const action = trigger.dataset.action;
      event.preventDefault();
      navigate(action);
      return;
    }
    const ledger = event.target.closest('[data-ledger]');
    if (ledger) navigate('ledger', { filter: ledger.dataset.ledger, month: state.month });
    const task = event.target.closest('[data-complete-task]');
    if (task) navigate('complete-task', { task: task.dataset.completeTask });
    const undo = event.target.closest('[data-undo-task]');
    if (undo) {
      const item = state.tasks.find(taskItem => taskItem.id === undo.dataset.undoTask);
      if (!item) return;
      item.done = false;
      const record = state.records.find(recordItem => recordItem.id === item.recordId);
      if (record) record.cancelled = true;
      item.recordId = null;
      persist(); finishPage('tasks');
      toast('완료 표시를 취소했습니다. 기존 일지에는 취소 이력이 남습니다.');
    }
    if (event.target.closest('[data-page-back]')) goBack();
  });

  $('#taskList').addEventListener('change', event => {
    const input = event.target.closest('[data-task]');
    if (!input) return;
    const task = state.tasks.find(item => item.id === input.dataset.task);
    input.checked = task.done;
    navigate('complete-task', { task: task.id });
  });

  $('#houseTabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-house]');
    if (!tab) return;
    const house = state.houses.find(item => item.id === tab.dataset.house);
    state.selectedHouse = house.id;
    state.selectedBed = house.beds[0].id;
    renderCultivation(); persist();
    document.getElementById('house-tab-' + house.id).focus();
  });

  $('#houseTabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tab = event.target.closest('[data-house]');
    if (!tab) return;
    event.preventDefault();
    const index = state.houses.findIndex(house => house.id === tab.dataset.house);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? state.houses.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + state.houses.length) % state.houses.length;
    document.getElementById('house-tab-' + state.houses[next].id).click();
  });

  $('#bedSelect').addEventListener('change', event => {
    state.selectedBed = event.target.value;
    renderCultivation(); persist();
  });

  $('#ledgerMonth').addEventListener('change', event => {
    if (!/^\d{4}-\d{2}$/.test(event.target.value)) {
      event.target.value = state.month;
      return;
    }
    state.month = event.target.value;
    renderLedger(); persist();
  });

  pageBody.addEventListener('change', event => {
    if (['pageLedgerMonth', 'pageLedgerType'].includes(event.target.id)) {
      const month = $('#pageLedgerMonth').value;
      if (!isMonth(month)) return;
      const filter = $('#pageLedgerType').value;
      state.month = month;
      persist();
      navigate('ledger', { month, filter });
      return;
    }
    const select = event.target.closest('[data-bed-target]');
    if (select) document.getElementById(select.dataset.bedTarget).innerHTML = bedOptions(select.value);
  });

  pageBody.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    const values = new FormData(form);
    const text = String(values.get('text') || '').trim();
    if (['completeTaskForm', 'workspaceJournalForm', 'workspaceLedgerForm'].includes(form.id) && !text) {
      toast('내용을 입력해 주세요.');
      return;
    }
    if (form.id === 'workspaceStatisticsForm') {
      const firstMonth = String(values.get('firstMonth') || '');
      const secondMonth = String(values.get('secondMonth') || '');
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(firstMonth) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(secondMonth)) return;
      navigate('statistics', { firstMonth, secondMonth }, true);
    } else if (form.id === 'completeTaskForm') {
      const task = state.tasks.find(item => item.id === form.dataset.taskId);
      if (!task || task.done) return;
      const record = { id: makeId('record'), date: values.get('date'), time: values.get('time'), house: task.house, bed: task.bed, type: task.type, text, cancelled: false, source: '할 일 완료 기록' };
      task.done = true;
      task.recordId = record.id;
      state.records.unshift(record);
      persist(); finishPage('tasks');
      toast('작업을 완료하고 재배일지에 함께 저장했습니다.');
    } else if (form.id === 'workspaceJournalForm') {
      state.records.unshift({ id: makeId('record'), date: values.get('date'), time: '', house: values.get('house'), bed: values.get('bed'), type: values.get('type'), text, cancelled: false, source: '직접 작성' });
      persist(); finishPage('journal'); toast('재배일지를 저장했습니다.');
    } else if (form.id === 'workspaceTaskForm') {
      const title = String(values.get('title') || '').trim();
      if (!title) { toast('작업명을 입력해 주세요.'); return; }
      state.tasks.push({ id: makeId('task'), title, house: values.get('house'), bed: values.get('bed'), time: values.get('time'), type: values.get('type'), done: false, recordId: null });
      persist(); finishPage('tasks'); toast('전체 농장 할 일에 추가했습니다.');
    } else if (form.id === 'workspaceLedgerForm') {
      const amount = Number(values.get('amount'));
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000000000) { toast('금액은 1원 이상의 정수로 입력해 주세요.'); return; }
      state.ledger.push({ id: makeId('ledger'), date: values.get('date'), type: values.get('type'), amount, text });
      state.month = String(values.get('date')).slice(0, 7);
      persist(); finishPage('ledger'); toast('입출금 기록을 저장하고 해당 월 장부를 갱신했습니다.');
    } else if (form.id === 'workspaceHouseForm') {
      const name = String(values.get('name') || '').trim();
      const crop = String(values.get('crop') || '').trim();
      const variety = String(values.get('variety') || '').trim();
      const bedName = String(values.get('bed') || '').trim();
      if (!name || !crop || !variety || !bedName) { $('#houseFormError').textContent = '각 항목을 입력해 주세요.'; return; }
      if (state.houses.some(house => house.name === name)) { $('#houseFormError').textContent = '이미 등록한 온실명입니다. 다른 이름을 입력해 주세요.'; return; }
      const id = makeId('house');
      const bedId = id + '-1';
      state.houses.push({ id, name, crop, variety, stages: ['재배정보 등록', '생육관리', '수확 준비', '출하'], beds: [{ id: bedId, name: bedName, phase: 0, start: null, shipment: null, observed: null, temp: null, humidity: null, note: '신규 등록한 온실입니다. 재배 단계와 날짜를 등록해야 합니다.' }] });
      state.selectedHouse = id; state.selectedBed = bedId;
      persist(); finishPage('profile'); toast('온실을 추가했습니다. 날짜와 센서값은 미등록 상태입니다.');
    }
  });

  document.addEventListener('keydown', event => {
    const menu = $('#workspaceMobileMenu');
    if (event.key === 'Escape' && menu && menu.open) { closeMenu(); menu.querySelector('summary').focus(); }
  });

  document.addEventListener('common-layout-loaded', syncNavigation);
  window.addEventListener('popstate', () => renderRoute());
  if (!history.state?.workspaceDepth) history.replaceState({ workspaceDepth: 0 }, '', location.href);
  renderRoute({ focus: false });
})();

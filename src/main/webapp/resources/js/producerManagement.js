/* 화훼농민용 2차 UI: 전체 페이지 탐색 + 브라우저 저장 CRUD. */
'use strict';
(() => {
  let store = ProducerManagementStore.create(window.localStorage);
  const terms = ProducerTerminology;
  let state = store.get();
  let dirty = false; let pending = null; let message = ''; let lastLocation = location.href;
  const $ = selector => document.querySelector(selector);
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = value => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(value);
  const date = value => value ? e(value.replaceAll('-', '.')) : '미등록';
  const groups = { home: ['홈·영농현황', ['home']], cycles: ['재배관리', ['journal', 'journal-day', 'cycles', 'shipments']], houses: ['온실관리', ['houses','sensor-data']], comparison: ['기간별 비교·통계', ['decision-stats', 'comparison', 'shipping-stats']], account: ['마이페이지', ['account', 'farms', 'password']] };
  const titles = { home: '홈·영농현황', cycles: '작기 관리', journal: '재배일지', shipments: '출하관리', farms: '농장정보', houses: '온실관리', comparison: '생육·환경 비교', 'shipping-stats': '출하 비교', account: '내 정보/농장정보', password: '비밀번호 변경', terminology: '용어 안내', sitemap: '전체 메뉴', privacy: '개인정보 처리방침', 'journal-day':'일지·센서 통합조회', 'sensor-data':'센서 관측 조회', 'plan-task':'일일 작업계획', 'plan-stage':'단계별 계획', 'plan-guide':'데일리 가이드 기준', 'decision-stats':'영농 의사결정' };
  const aliases = { statistics: 'comparison', profile: 'farms', 'all-houses': 'houses', 'cultivation-detail': 'cycles', 'environment-compare': 'comparison', 'indoor-environment': 'comparison', 'session': 'account' };
  const route = () => { const q = new URLSearchParams(location.search); const raw = q.get('view') || 'home'; return { q, view: aliases[raw] || raw }; };
  const href = (view, params = {}) => '?' + new URLSearchParams({ view, ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null)) });
  const link = (view, text, params = {}, cls = '') => `<a class="${cls}" data-management-link href="${e(href(view, params))}">${e(text)}</a>`;
  const button = (view, text, params = {}, primary = false) => link(view, text, params, 'btn' + (primary ? ' primary' : ''));
  const find = (type, id) => state[type].find(item => item.id === id);
  const houseName = id => { const h = find('houses', id); return h ? (find('farms', h.farmId)?.name || '') + ' · ' + h.name : '미등록'; };
  const cycleName = id => find('cycles', id)?.name || '연결 작기 미지정';
  const activeCycles = houseId => state.cycles.filter(c => c.houseId === houseId && c.status !== 'ended').sort((a,b) => b.start.localeCompare(a.start) || a.id.localeCompare(b.id));
  const availableHouse = h => h.active && find('farms', h.farmId)?.active;
  const mappedHouse = q => q.get('id') || q.get('houseId') ? find('houses', q.get('id') || q.get('houseId')) : state.houses.find(h => h.id === q.get('sampleHouse') || h.name === q.get('sampleHouse') + '동' || h.name === q.get('sampleHouse') + '동 온실');
  const lastEnvironment = houseId => state.environment.filter(r => r.houseId === houseId).sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).at(-1);

  const stockText = c => c.quantityPending ? '수량·단위 미등록' : n(store.balance(c.id)) + ' ' + c.unit;
  const migrationNotePattern = /^이전 시안에서 가져옴\. 시작 재배수량·단위를 확인해 주세요\.(?: 실제 시작일이 없어 최초 기록일 또는 오늘을 임시 표시합니다\. 실제 날짜로 수정해 주세요\.)?\s*/;
  function cycleData(c) {
    if (!c) return null;
    const day = value => value ? String(value).replaceAll('-','.') : '미등록';
    const optional = value => value == null || value === '' ? null : Number(value);
    const ended = c.status === 'ended';
    const context = ProducerManagementStore.context(state,{cycleId:c.id});
    const rawNote = String(c.note || '');
    return {
      ...c, ended, stageText:c.stage || '미등록', cropText:c.crop || '미등록', varietyText:c.variety || '미등록',
      memberText:context?.profile?.name || '미등록', farmText:context?.farm?.name || '미등록', houseText:context?.house?.name || '미등록',
      cropVarietyText:(c.crop || '미등록') + ' · ' + (c.variety || '미등록'), locationText:houseName(c.houseId),
      currentQuantityText:stockText(c), initialQuantityText:c.quantityPending ? '미등록' : n(c.initial) + ' ' + c.unit,
      targetQuantityText:c.targetQty == null || c.targetQty === '' ? '미등록' : n(c.targetQty) + ' ' + c.unit,
      periodText:day(c.start) + ' ~ ' + (ended ? day(c.endDate) : '진행 중'), targetPeriodText:day(c.targetStart) + ' ~ ' + day(c.targetEnd),
      noteText:rawNote.replace(migrationNotePattern,'').trim(), notePrefix:rawNote.match(migrationNotePattern)?.[0] || '',
      displayProgress:optional(c.displayProgress), flowerStalks:optional(c.flowerStalks), flowering:optional(c.flowering), color:c.color || ''
    };
  }
  function cycleReference(c) {
    const v = cycleData(c); if (!v) return '';
    return details([['작기명',link('cycles-detail',v.name,{id:v.id})],['회원',link('account',v.memberText)],['농장',link('farms-detail',v.farmText,{id:find('houses',v.houseId).farmId})],['재배 온실',link('houses-detail',v.houseText,{id:v.houseId,cycleId:v.id})],['품목명',e(v.cropText)],['품종명',e(v.varietyText)],['생육단계',e(v.stageText)],['재배기간',e(v.periodText)]]);
  }

  const shipmentSpec = s => s.specification ?? s.grade ?? '';
  const shipmentGrade = s => s.specification == null ? '' : s.grade || '';
  const gradeRows = entry => [...ProducerManagementStore.GRADES.map(grade => ({ grade, quantity: entry.gradeBreakdown?.find(row => row.grade === grade)?.quantity ?? '' })), ...(entry.gradeBreakdown || []).filter(row => !ProducerManagementStore.GRADES.includes(row.grade))];
  const gradeNumber = value => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 6 }).format(value);
  const shipmentGradeMode = entry => entry.gradeBreakdown?.length ? 'multiple' : shipmentGrade(entry) ? 'single' : 'none';
  const shipmentGradeText = entry => entry.gradeBreakdown?.length
    ? '등급별: ' + entry.gradeBreakdown.map(row => row.grade + ' ' + gradeNumber(row.quantity) + ' ' + entry.unit).join(' / ')
    : shipmentGrade(entry) ? '단일 등급: ' + shipmentGrade(entry) : '등급 미지정';
  function shipmentContext(cycle,editingId='') {
    return shipping().context(cycle,editingId);
  }
  function shipmentGradeFields(entry) {
    const choices = [['', '미지정'], ...ProducerManagementStore.GRADES.map(grade => [grade, grade]), ...(shipmentGrade(entry) && !ProducerManagementStore.GRADES.includes(shipmentGrade(entry)) ? [[shipmentGrade(entry), shipmentGrade(entry) + ' (기존 기록)']] : [])];
    return '<fieldset class="pm-shipment-grades pm-wide"><legend>출하 등급·등급별 수량</legend><div class="pm-form-grid">'
      + select('gradeMode', '등급 입력 방식', [['none', '등급 미지정'], ['single', '단일 등급'], ['multiple', '여러 등급별 수량']], shipmentGradeMode(entry))
      + '<div class="pm-wide" id="shipmentSingleGrade">' + select('grade', '전체 출하 등급', choices, shipmentGrade(entry)) + '</div>'
      + '<div class="pm-form-grid pm-wide" id="shipmentGradeBreakdown"><p class="pm-muted pm-wide">특상·상·중 수량을 출하 단위로 입력합니다. 합계는 총출하량과 같아야 합니다.</p>'
      + gradeRows(entry).map((row, i) => '<input type="hidden" name="gradeName' + i + '" value="' + e(row.grade) + '">' + field('gradeQuantity' + i, row.grade + (ProducerManagementStore.GRADES.includes(row.grade) ? '' : ' (기존 기록)') + ' 등급 출하 수량', row.quantity, 'number', false, 'min="0" step="any"')).join('')
      + '<p class="pm-grade-total pm-wide" id="shipmentGradeTotal" role="status" aria-live="polite" aria-atomic="true"></p></div>'
      + (entry.gradeBreakdown?.length && shipmentGrade(entry) ? '<p class="pm-muted pm-wide" id="shipmentLegacyGrade">기존 단일 등급 ' + e(shipmentGrade(entry)) + '은 보존합니다. 이 출하는 등급별 수량으로 표시합니다.</p>' : '')
      + '</div></fieldset>';
  }

  const measurementKey = r => JSON.stringify([terms.canonicalMetric(r.metric), r.measureUnit, r.sample, r.method, ...(r.stemNumber ? [r.stemNumber] : [])]);
  const select = (name, label, items, value = '', all = false, required = false) => `<label class="pm-field search-row"><span class="search-label">${e(label)}${required ? ' *' : ''}</span><select class="search-select" name="${name}" ${required ? 'required' : ''}>${all ? '<option value="">전체</option>' : ''}${items.map(item => `<option value="${e(item[0])}" ${String(item[0]) === String(value) ? 'selected' : ''}>${e(item[1])}</option>`).join('')}</select></label>`;
  const field = (name, label, value = '', type = 'text', required = false, extra = '') => `<label class="pm-field search-row"><span class="search-label">${e(label)}${required ? ' *' : ''}</span><input class="search-input ${type === 'date' ? 'date' : 'normal'}" name="${name}" type="${type}" value="${e(value)}" ${required ? 'required' : ''} ${extra}></label>`;
  const textarea = (name, label, value = '', required = false) => `<label class="pm-field search-row pm-wide"><span class="search-label">${e(label)}${required ? ' *' : ''}</span><textarea class="search-input" name="${name}" ${required ? 'required' : ''}>${e(value)}</textarea></label>`;
  const withHint = (control, text) => control.replace('</label>', '<small>' + e(text) + '</small></label>');
  const options = type => state[type].map(item => [item.id, type === 'houses' ? houseName(item.id) + (!item.active ? ' (사용 종료)' : '') : item.name + (item.active === false || item.status === 'ended' ? ' (종료)' : '')]);
  const badge = (active, yes = '사용 중', no = '사용 종료') => `<span class="pm-badge ${active ? '' : 'closed'}">${active ? yes : no}</span>`;
  function table(labels, rows, caption, config = {}) {
    if (!rows.length) return '<p class="pm-empty">조건에 맞는 기록이 없습니다.</p>';
    const indexed = config.indexed || false;
    const key = 'page-' + [...caption].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
    const sizeKey = key.replace('page-','size-');
    const requestedSize = Number(route().q.get(sizeKey));
    const size = indexed ? ([10,20,50].includes(requestedSize) ? requestedSize : 10) : innerHeight < 850 ? 3 : 5;
    const pages = Math.ceil(rows.length / size);
    const page = Math.min(pages, Math.max(1, parseInt(route().q.get(key), 10) || 1));
    const pageLink = (number, label) => link(route().view, label, { ...Object.fromEntries(route().q), [key]: number }, 'pm-page-link');
    const control = (number,label,enabled) => enabled ? pageLink(number,label) : '<span class="pm-page-link" aria-disabled="true">' + label + '</span>';
    const first = Math.max(1,Math.min(page - 2,pages - 4));
    const numbers = Array.from({length:Math.min(pages,5)},(_,i) => first + i).map(number => number === page ? '<span class="pm-page-link" aria-current="page" aria-label="' + number + '페이지, 현재 페이지">' + number + '</span>' : pageLink(number,String(number))).join('');
    const navigation = '<nav class="pm-pagination" aria-label="' + e(caption) + ' 페이지">' + (indexed ? control(1,'처음',page > 1) : '') + control(page - 1,'이전',page > 1) + (indexed ? numbers : '') + '<span class="pm-page-status" aria-live="polite">' + page + ' / ' + pages + ' 페이지</span>' + control(page + 1,'다음',page < pages) + (indexed ? control(pages,'마지막',page < pages) : '') + '</nav>';
    const columns = indexed ? ['번호',...labels] : labels;
    const visibleRows = rows.slice((page - 1) * size, page * size).map((row,i) => indexed ? [String((page - 1) * size + i + 1),...row] : row);
    const sizeControl = indexed ? '<label class="pm-page-size">표시 개수 <select data-page-size="' + key + '" data-size-key="' + sizeKey + '" aria-label="' + e(caption) + ' 페이지당 표시 개수">' + [10,20,50].map(number => '<option value="' + number + '" ' + (size === number ? 'selected' : '') + '>' + number + '개</option>').join('') + '</select></label>' : '';
    return `<div class="result-info"><span class="result-count">조회 결과 <strong>${rows.length}</strong>건 <span class="pm-muted">· ${(page - 1) * size + 1}–${Math.min(page * size, rows.length)}건 표시</span></span>${sizeControl}</div><div class="table-wrap pm-table-wrap" tabindex="0" role="region" aria-label="${e(caption)} 표. 좁은 화면에서는 가로로 이동할 수 있습니다."><table class="list-table pm-table ${labels.length <= 4 ? 'pm-table-compact' : ''} ${indexed ? 'pm-indexed-table' : ''}"><caption class="sr-only">${e(caption)}</caption><thead><tr>${columns.map(l => `<th scope="col">${e(l)}</th>`).join('')}</tr></thead><tbody>${visibleRows.map(row => `<tr>${row.map((cell, i) => `<td data-label="${e(columns[i])}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${indexed || pages > 1 ? navigation : ''}`;
  }
  const details = items => `<table class="detail-table pm-details"><caption class="sr-only">상세 등록 정보</caption><tbody>${items.reduce((rows, item, index) => { if (index % 2 === 0) rows.push(items.slice(index, index + 2)); return rows; }, []).map(row => `<tr>${row.map(([label, value]) => `<th scope="row">${e(label)}</th><td>${value}</td>`).join('')}${row.length === 1 ? '<td colspan="2" class="pm-detail-blank"></td>' : ''}</tr>`).join('')}</tbody></table>`;
  const kpis = items => `<div class="detail-summary-wrap pm-kpis"><table class="detail-summary pm-summary"><caption class="sr-only">현재 조회 대상 요약</caption><thead><tr>${items.map(([label]) => `<th scope="col">${e(label)}</th>`).join('')}</tr></thead><tbody><tr>${items.map(([, value]) => `<td>${e(value)}</td>`).join('')}</tr></tbody></table></div>`;
  const panel = (title, body) => {
    const view = route().view;
    const singleForm = view.endsWith('-add') || ['account', 'password', 'quantity', 'confirm'].includes(view);
    const repeatsTitle = title === titles[view] || (view === 'cycles' && title === '작기 목록') || (view === 'shipments' && title === '실제 출하 내역');
    return `<section class="detail-section pm-panel" aria-label="${e(title)}">${singleForm || repeatsTitle ? '' : `<h2 class="detail-section-title">${e(title)}</h2>`}${body}</section>`;
  };
  function form(kind, body, entryId = '', label = '저장') {
    return `<form data-kind="${kind}" id="managementForm" novalidate><input type="hidden" name="id" value="${e(entryId)}"><p class="pm-muted">* 필수 입력</p><div class="pm-form-grid">${body}</div><div class="pm-error" id="formError" role="alert" hidden></div><div class="pm-actions"><button class="btn primary" type="submit">${e(label)}</button><button class="btn" type="button" data-back>취소</button></div></form>`;
  }
  const filterForm = (view, body) => `<form class="search-box pm-filters" data-query="${view}">${body}<div class="search-row full search-actions"><button class="search-btn" type="submit">조회</button><button class="reset-btn" type="button" data-reset-query="${view}">초기화</button></div></form>`;
  const planner = () => ProducerPlanningUI.create({e,n,date,link,button,panel,field,select,textarea,form,table,getState:()=>state,today:()=>store.today(),stockText,missing});
  const insights = () => ProducerInsights.createUI({e,n,date,link,button,panel,table,kpis,filterForm,select,field,getState:()=>state,today:()=>store.today()});
  const scopedCycles = q => state.cycles.filter(c=>!q.get('houseId')||c.houseId===q.get('houseId')).map(c=>[c.id,c.name+(c.status==='ended'?' (종료)':'')]);
  const shipping = () => ProducerShipment.createUI({e,n,date,link,button,getState:()=>state});
  function currentTitle() { const v = route().view; if (v === 'sitemap' && route().q.get('task')) return ProducerSiteMap.task(route().q.get('task'))?.label || '전체 메뉴'; if (v === 'shipments-add') return route().q.get('id') ? '출하 정정' : '출하 등록'; if (v === 'journal-add') return route().q.get('id') ? '재배일지 수정' : '재배일지 작성'; if (v.endsWith('-add')) return (titles[v.slice(0, -4)] || '') + (route().q.get('id') ? ' 수정' : ' 등록'); if (v.endsWith('-detail')) return (titles[v.slice(0, -7)] || '') + ' 상세'; return titles[v] || ({ confirm: '기록 삭제·취소 확인', quantity: '수량 변경' }[v]) || '화면 안내'; }
  function go(view, params = {}, replace = false) {
    const next = href(view, params);
    if (dirty) { pending = () => go(view, params, replace); $('#leaveNotice').hidden = false; $('#leaveNotice').scrollIntoView({ block: 'nearest' }); return; }
    history[replace ? 'replaceState' : 'pushState']({}, '', next); render();
  }
  function back() {
    const {view:v,q} = route();
    if(['plan-task','plan-stage','plan-guide'].includes(v)) { const item=(state[v==='plan-task'?'planTasks':'planStages']||[]).find(p=>p.id===q.get('id'));go('cycles-detail',{id:q.get('cycleId')||item?.cycleId,tab:'plan'});return; }
    if (v === 'cycles-add' && q.get('from') === 'house' && find('houses',q.get('houseId'))) { go('houses-detail',{id:q.get('houseId')}); return; }
    go(v.replace(/-(add|detail)$/, '') in titles ? v.replace(/-(add|detail)$/, '') : 'home');
  }
  function fail(text) { const box = $('#formError'); if (box) { box.hidden = false; box.textContent = text; box.scrollIntoView({ block: 'nearest' }); } else { message = text; render(); } }
  function nav() {
    const base = ['plan-task','plan-stage','plan-guide'].includes(route().view) ? 'cycles' : route().view.replace(/-(add|detail)$/, '');
    $('#managementSubnav').classList.toggle('pm-sitemap-sidebar',base === 'sitemap');
    const family = ['sitemap','privacy'].includes(base) ? null : Object.keys(groups).find(key => groups[key][1].includes(base)) || 'home';
    if (base === 'sitemap') {
      const q=route().q; const task=ProducerSiteMap.task(q.get('task')); const selected=q.get('domain') || task?.domainId || '';
      const entry=(id,label) => '<li class="' + (selected === id ? 'active' : '') + '">' + link('sitemap',label,{domain:id,search:q.get('search')},'pm-sitemap-domain-link') + '</li>';
      $('#managementSubnav').innerHTML='<div class="side-title">업무별 메뉴</div><div class="side-section"><ul class="side-menu-list">' + entry('','전체 메뉴') + ProducerSiteMap.domains.map(d => entry(d.id,d.label)).join('') + '</ul></div>';
      $('#managementSubnav .active a')?.setAttribute('aria-current','page');
    } else if (base !== 'privacy') $('#managementSubnav').innerHTML = `<div class="side-title">${e(groups[family][0])}</div><div class="side-section"><ul class="side-menu-list">${groups[family][1].filter(v => v !== 'farms').map(v => `<li class="${(v === base || (v === 'account' && base === 'farms')) ? 'active' : ''}"><a data-management-link href="${e(href(v))}" ${(v === base || (v === 'account' && base === 'farms')) ? 'aria-current="page"' : ''}>${e(titles[v])}</a></li>`).join('')}</ul></div>`;
    if (base === 'privacy') $('#managementSubnav').innerHTML='<div class="side-title">서비스 안내</div><div class="side-section"><ul class="side-menu-list"><li class="active">' + link('privacy','개인정보 처리방침',{},'pm-current-policy') + '</li></ul></div>';
    document.querySelectorAll('[data-service-field]').forEach(el => { el.textContent=ProducerServiceInfo[el.dataset.serviceField] || ''; });
    if (base === 'terminology') $('#managementSubnav').innerHTML = '<div class="side-title">이용안내</div><div class="side-section"><ul class="side-menu-list"><li class="active">' + link('terminology', '용어 안내') + '</li></ul></div>';
    document.querySelectorAll('[data-workspace-view]').forEach(el => { if (base !== 'terminology' && el.dataset.workspaceView === family) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
    document.querySelectorAll('.pm-nav-dropdown a').forEach(el => { const view = new URL(el.href).searchParams.get('view'); if (view === base || (view === 'account' && base === 'farms')) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-profile-name]').forEach(el => { el.textContent = state.profile.name + ' 님'; });
  }
  function privacy() {
    const info=ProducerServiceInfo;
    const sections=info.privacySections.map(([title,text]) => '<section><h2>' + e(title) + '</h2><p>' + e(text) + '</p></section>').join('');
    return '<article class="pm-privacy-document"><p class="pm-notice">가상 기관 정보로 구성한 UI 확인용 문서입니다. 실제 서비스에 적용되는 개인정보 처리방침은 아닙니다.</p><p class="pm-muted">문서 기준일 ' + e(info.privacyDate) + '</p>' + sections + '<dl class="pm-privacy-contact"><div><dt>운영기관</dt><dd>' + e(info.organization) + ' (' + e(info.organizationNote) + ')</dd></div><div><dt>대표전화</dt><dd>' + e(info.phone) + '</dd></div><div><dt>대표이메일</dt><dd>' + e(info.email) + '</dd></div></dl></article>';
  }
  function sitemapLink(item) {
    return item.scope ? link('sitemap',item.label,{task:item.id}) : link(item.view,item.label,item.params);
  }
  function sitemap(q) {
    const registry=ProducerSiteMap;
    if (q.get('task')) {
      const item=registry.task(q.get('task')); if (!item || !item.scope) return missing();
      const entries=registry.eligible(state,item);
      const nouns={farms:'농장',houses:'온실',cycles:'작기',records:'재배일지',shipments:'출하 기록'};
      const noun=nouns[item.scope];
      const object=noun + (['cycles','records'].includes(item.scope) ? '를' : '을');
      const label=entry => item.scope === 'houses' ? houseName(entry.id) : item.scope === 'cycles' ? entry.name + ' · ' + houseName(entry.houseId) + (entry.status === 'ended' ? ' (종료)' : '') : item.scope === 'records' ? entry.date + ' · ' + cycleName(entry.cycleId) + ' · ' + entry.text.slice(0,35) : item.scope === 'shipments' ? entry.date + ' · ' + cycleName(entry.cycleId) + ' · ' + entry.recipient : entry.name;
      const emptyView=item.policy === 'stock' ? 'cycles' : {farms:'farms-add',houses:'houses-add',cycles:'cycles-add',records:'journal-add',shipments:'shipments'}[item.scope];
      const emptyLabel=item.policy === 'stock' ? '작기 목록' : {farms:'농장 등록',houses:'온실 등록',cycles:'작기 등록',records:'재배일지 작성',shipments:'출하 목록'}[item.scope];
      const emptyHelp=item.policy === 'stock' ? '수량이 등록된 진행 중 작기가 없습니다. 작기 정보를 먼저 확인해 주세요.' : '선택할 ' + noun + '이 없습니다.';
      return '<div class="pm-sitemap-target"><p class="pm-muted">' + e(item.domainLabel) + ' &gt; ' + e(item.groupLabel) + '</p><p>' + e(object) + ' 선택하면 ' + e(item.label) + ' 화면으로 이동합니다.</p>' + (entries.length ? '<form id="sitemapTargetForm" data-kind="sitemap-target" novalidate><input type="hidden" name="task" value="' + e(item.id) + '"><div class="pm-form-grid">' + select('targetId',noun,[['',object + ' 선택해 주세요'],...entries.map(entry => [entry.id,label(entry)])],'',false,true) + '</div><p id="sitemapTargetError" class="pm-error" role="alert" hidden></p><div class="pm-actions"><button class="btn primary" type="submit">선택한 ' + e(noun) + '으로 이동</button></div></form>' : '<p class="pm-empty">' + e(emptyHelp) + '</p>' + button(emptyView,emptyLabel)) + '<div class="pm-actions">' + button('sitemap','전체 메뉴로 돌아가기',{domain:item.domainId}) + '</div></div>';
    }
    if (q.get('domain') && !registry.domains.some(d => d.id === q.get('domain'))) return missing();
    const domains=registry.domains.filter(d => !q.get('domain') || d.id === q.get('domain'));
    const section=domain => '<section class="pm-sitemap-section" data-sitemap-section aria-labelledby="site-' + e(domain.id) + '"><h2 id="site-' + e(domain.id) + '"><svg class="icon" aria-hidden="true"><use href="#' + e(domain.icon) + '"/></svg>' + link(domain.view,domain.label) + '<span aria-hidden="true">→</span></h2><div class="pm-sitemap-groups">' + domain.groups.map(group => '<section class="pm-sitemap-group" data-sitemap-group><h3>' + e(group.label) + '</h3><ul>' + group.items.map(item => '<li data-sitemap-entry data-search="' + e([domain.label,group.label,item.label,item.keywords || ''].join(' ')) + '">' + sitemapLink(item) + '</li>').join('') + '</ul></section>').join('') + '</div></section>';
    return '<div class="pm-sitemap"><form class="pm-sitemap-search" data-query="sitemap" role="search"><input type="hidden" name="domain" value="' + e(q.get('domain')) + '"><label class="sr-only" for="siteMenuSearch">메뉴 검색</label><input id="siteMenuSearch" type="search" name="search" data-sitemap-search value="' + e(q.get('search')) + '" placeholder="찾으시는 메뉴명을 검색해 보세요." autocomplete="off"><button type="submit" class="btn">검색</button><button type="button" class="btn" data-sitemap-clear>초기화</button></form><p class="pm-sitemap-result pm-muted" role="status" aria-live="polite"></p><p class="pm-empty" id="sitemapEmpty" hidden>검색 조건에 맞는 메뉴가 없습니다.</p>' + domains.map(section).join('') + '</div>';
  }
  function filterSitemap(value,update=false) {
    const normalize=text => String(text || '').replace(/\s/g,'').toLocaleLowerCase('ko-KR');
    const query=normalize(value); const entries=[...document.querySelectorAll('[data-sitemap-entry]')];
    if (!entries.length) return;
    entries.forEach(entry => { entry.hidden=!normalize(entry.dataset.search).includes(query); });
    document.querySelectorAll('[data-sitemap-group]').forEach(group => { group.hidden=![...group.querySelectorAll('[data-sitemap-entry]')].some(entry => !entry.hidden); });
    document.querySelectorAll('[data-sitemap-section]').forEach(section => { section.hidden=![...section.querySelectorAll('[data-sitemap-group]')].some(group => !group.hidden); });
    const count=entries.filter(entry => !entry.hidden).length;
    $('.pm-sitemap-result').textContent=query ? '검색 결과 ' + count + '개 메뉴' : '전체 ' + count + '개 메뉴';
    $('#sitemapEmpty').hidden=count !== 0;
    if (update) {
      const q=route().q; if (value) q.set('search',value); else q.delete('search');
      history.replaceState({},'', '?' + q); lastLocation=location.href;
      document.querySelectorAll('.pm-sitemap-domain-link').forEach(anchor => {const url=new URL(anchor.href);if(value)url.searchParams.set('search',value);else url.searchParams.delete('search');anchor.href=url.href;});
    }
  }
  function home(q) {
    if (q.get('source') === 'records' || q.has('farmId')) return '<div class="pm-home-source"><span>전체 재배현황</span>' + button('home','영농현황 보기') + '</div>' + homeRecords(q);
    return homeDashboard(q);
  }
  function homeDashboard(q) {
    const houses = state.houses.filter(availableHouse).sort((a,b) => a.name.localeCompare(b.name));
    const requestedCycle = q.get('cycleId') ? find('cycles',q.get('cycleId')) : null;
    if (q.get('cycleId') && !requestedCycle) return missing();
    const requestedHouse = mappedHouse(q);
    if ((q.get('houseId') || q.get('id') || q.get('sampleHouse')) && !requestedHouse) return missing();
    const requested = requestedHouse || (requestedCycle ? find('houses',requestedCycle.houseId) : null);
    if (requestedCycle && requested?.id !== requestedCycle.houseId) return missing();
    if (requested && !houses.some(h => h.id === requested.id)) houses.push(requested);
    if (!houses.length) return panel('등록된 온실이 없습니다', '<p class="pm-empty">온실을 등록하면 재배현황을 확인할 수 있습니다.</p>' + button('houses-add','온실 등록',{},true));
    const house = houses.find(h => h.id === requested?.id) || (requestedCycle ? requested : houses[0]);
    const cycles = activeCycles(house.id);
    if (requestedCycle?.status === 'ended') cycles.push(requestedCycle);
    const cycle = cycleData(requestedCycle || cycles[0]);
    const allCycles = state.cycles.filter(c => c.status !== 'ended' && houses.some(h => h.id === c.houseId));
    const sample = window.ProducerHomeSample;
    const summary = sample?.summary || {};
    const currentDate = store.today();
    const monthly = state.shipments.filter(s => !s.cancelled && s.date.slice(0,7) === currentDate.slice(0,7));
    const card = (label,value,note='') => '<div class="pm-home-card"><span>' + e(label) + '</span><strong>' + e(value) + '</strong>' + (note ? '<small>' + e(note) + '</small>' : '') + '</div>';
    const metric = (label,value,unit='') => '<div><dt>' + e(label) + '</dt><dd>' + e(value == null || value === '' ? '미등록' : typeof value === 'number' ? n(value) : value) + (value == null || value === '' ? '' : '<small>' + e(unit) + '</small>') + '</dd></div>';
    const tabs = '<div class="pm-home-house-tabs" role="tablist" aria-label="온실 선택">' + houses.map(h => '<button type="button" id="homeHouse-' + e(h.id) + '" data-home-house="' + e(h.id) + '" role="tab" aria-controls="homeSelectedHouse" aria-selected="' + (h.id === house.id) + '" tabindex="' + (h.id === house.id ? '0' : '-1') + '">' + e(h.name) + '</button>').join('') + '</div>';
    const checks = planner().home(cycle,house.id);
    const selector = cycles.length > 1 ? select('homeCycleId','재배 작기',cycles.map(c => [c.id,c.name + (c.status === 'ended' ? ' (종료)' : '')]),cycle.id) : '';
    const elapsed = cycle ? Math.floor((Date.parse(cycle.ended ? cycle.endDate : currentDate) - Date.parse(cycle.start)) / 86400000) : 0;
    const growth = '<section class="pm-home-card pm-home-growth" aria-label="선택 온실 재배현황">' + selector + (cycle
      ? '<div class="pm-row"><h2>' + e(cycle.cropText) + ' <span>' + e(cycle.varietyText) + '</span></h2><span class="pm-badge">' + e(cycle.stageText) + (cycle.ended ? ' · 종료' : '') + '</span></div><p class="pm-home-cycle-name">' + link('cycles-detail',cycle.name,{id:cycle.id}) + '</p>'
        + (cycle.displayProgress == null ? '' : '<div class="pm-home-progress"><span>재배 진행률 <strong>' + n(cycle.displayProgress) + '%</strong></span><progress max="100" value="' + e(cycle.displayProgress) + '" aria-label="재배 진행률"></progress></div>')
        + '<p class="pm-muted">재배기간 ' + e(cycle.periodText) + ' · D+' + elapsed + '</p><dl class="pm-home-growth-metrics">' + metric('평균 꽃대 수',cycle.flowerStalks,'개/주') + metric('평균 개화율',cycle.flowering,'%') + metric('화색',cycle.color) + '</dl><dl class="pm-home-dates"><div><dt>현재 재배수량</dt><dd>' + e(cycle.currentQuantityText) + '</dd></div><div><dt>출하 예정기간</dt><dd>' + e(cycle.targetPeriodText) + '</dd></div></dl>'
      : '<h2>진행 중인 작기 없음</h2><p class="pm-muted">등록된 작기가 없습니다.</p>' + button('cycles-add','작기 등록',{houseId:house.id})) + '<div class="pm-actions">' + button('houses-detail','온실 상세보기',{id:house.id,...(cycle ? {cycleId:cycle.id} : {})}) + '</div></section>';
    const observed = lastEnvironment(house.id);
    const value = key => observed?.[key] == null || observed[key] === '' ? null : observed[key];
    const environment = '<section class="pm-home-card pm-home-environment" aria-label="선택 온실 내부환경"><div class="pm-row"><h2>온실 내부환경</h2><time>' + (observed ? date(observed.date) + ' ' + e(observed.time) : '미수신') + '</time></div><dl class="pm-home-sensors">' + metric('온도',value('temp'),'°C') + metric('습도',value('humidity'),'%') + metric('CO₂',value('co2'),observed?.units?.co2 || 'ppm') + metric(observed?.units?.light === 'W/m²' ? '일사강도' : '광도',value('light'),observed?.units?.light || '단위 미등록') + '</dl>' + (!observed ? '<p class="pm-muted">관측 기록이 없습니다.</p>' : '') + '</section>';
    return '<div class="pm-home-sample"><div class="pm-home-source"><p>' + date(currentDate) + ' 기준</p>' + button('home','전체 재배현황 보기',{source:'records'}) + '</div><div class="pm-home-overview">' + card('재배 중인 품종',new Set(allCycles.map(c => c.crop + '/' + c.variety)).size + '종') + card('출하 예정',allCycles.filter(c => (c.targetEnd || c.targetStart) >= currentDate).length + '건') + card('알림·주의',(summary.alerts || 0) + '건',summary.alertNote || '') + card('오늘 등록 일지',state.records.filter(r => !r.cancelled && r.date === currentDate).length + '건') + '</div><div class="pm-home-middle"><div class="pm-home-monthly">' + card('이번 달 출하 등록금액',n(monthly.reduce((sum,v)=>sum+(v.totalAmount==null||v.totalAmount===''?0:Number(v.totalAmount)),0))+'원','등록된 금액 기준') + card('이번 달 출하 건수',monthly.length + '건') + '</div>' + checks + '</div>' + tabs + '<div id="homeSelectedHouse" role="tabpanel" aria-labelledby="homeHouse-' + e(house.id) + '" class="pm-home-house-grid">' + growth + environment + '</div></div>';
  }
  function homeRecords(q) {
    const houseId = q.get('houseId') || ''; const farmId = q.get('farmId') || '';
    const houses = state.houses.filter(h => (!farmId || h.farmId === farmId) && (!houseId || h.id === houseId));
    const cycles = state.cycles.filter(c => c.status !== 'ended' && houses.some(h => h.id === c.houseId)).map(cycleData);
    const sums = {}; cycles.filter(c => !c.quantityPending).forEach(c => { sums[c.unit] = (sums[c.unit] || 0) + store.balance(c.id); });
    const env = houses.map(h => { const rows = state.environment.filter(v => v.houseId === h.id).sort((a, b) => b.date.localeCompare(a.date)); const r = rows[0]; return [e(h.name), r ? '내부온도 ' + e(r.temp) + ' °C / 내부습도 ' + e(r.humidity) + ' %' : '센서 미연결', r ? date(r.date) + ' ' + e(r.time) + '<small>' + e(r.sensorId) + '</small>' : '측정값 없음']; });
    const recent = state.records.filter(r => !r.cancelled && (!r.cycleId || cycles.some(c => c.id === r.cycleId))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return filterForm('home', select('farmId', '농장', options('farms'), farmId, true) + select('houseId', '온실명', options('houses'), houseId, true)) + kpis([['진행 작기', cycles.length + '개'], ['현재 재배수량', Object.entries(sums).map(([unit, qty]) => n(qty) + ' ' + unit).join(' / ') || '기록 없음'], ['등록 온실', houses.length + '개']]) + panel('현재 재배', table(['작기명', '품종명·생육단계', '현재 재배수량', '목표 출하', '기록'], cycles.map(c => [link('cycles-detail', c.name, { id: c.id }), e(c.varietyText) + '<small>' + e(c.stageText) + '</small>', e(c.currentQuantityText), e(c.targetPeriodText), link('journal-add', '일지 작성', { cycleId: c.id }) + ' · ' + link('shipments-add', '출하 등록', { cycleId: c.id })]), '현재 재배 작기')) + panel('온실 내부환경', table(['온실', '내부온도·내부습도', '측정 시각·출처'], env, '최근 환경') + button('comparison', '생육·환경 비교')) + panel('최근 재배일지', table(['측정일', '작기명', '내용'], recent.map(r => [date(r.date), e(cycleName(r.cycleId)), link('journal-detail', r.text.slice(0, 60), { id: r.id })]), '최근 일지'));
  }
  function masterList(type, q) {
    const rows = ProducerInsights.sort(state[type].filter(v => (!q.get('search') || v.name.includes(q.get('search'))) && (!q.get('status') || String(v.active) === q.get('status')) && (type !== 'houses' || !q.get('farmId') || v.farmId === q.get('farmId'))),q.get('sort'),type,state);
    const examples = type === 'houses' && rows.length ? '<div class="pm-greenhouse-examples"><strong>온실 바로가기</strong>' + rows.map(h => button('houses-detail',h.name + ' 보기',{id:h.id})).join('') + '</div>' : '';
    return examples + filterForm(type, field('search', '이름 검색', q.get('search')) + select('status', '사용 상태', [['true', '사용 중'], ['false', '사용 종료']], q.get('status'), true) + (type === 'houses' ? select('farmId', '소속 농장', options('farms'), q.get('farmId'), true) : '')) + panel(titles[type], table(type === 'farms' ? ['농장명', '위치', '상태', '관리'] : ['온실명', '소속 농장·구역', '상태', '관리'], rows.map(v => [link(type + '-detail', v.name, { id: v.id }), type === 'farms' ? e(v.address || '미등록') : e(find('farms', v.farmId)?.name) + '<small>' + e(v.zone) + '</small>', badge(v.active), link(type + '-add', '수정', { id: v.id })]), titles[type],{indexed:true}));
  }
  function greenhouseDetail(q) {
    const house = mappedHouse(q);
    if (!house) return missing() + button('houses','온실 목록');
    const requestedCycle = q.get('cycleId') ? find('cycles',q.get('cycleId')) : null;
    if (q.get('cycleId') && (!requestedCycle || requestedCycle.houseId !== house.id)) return missing() + button('houses-detail','온실 상세보기',{id:house.id});
    const cycles = activeCycles(house.id);
    if (requestedCycle?.status === 'ended') cycles.push(requestedCycle);
    const cycle = cycleData(requestedCycle || cycles[0]);
    const ended = state.cycles.filter(c => c.houseId === house.id && c.status === 'ended').sort((a,b) => (b.endDate || b.start).localeCompare(a.endDate || a.start));
    const observations = state.environment.filter(r => r.houseId === house.id).sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
    const metrics = window.ProducerGreenhouseSample?.metrics || [['temp','내부온도','°C'],['humidity','내부습도','%']];
    const values = metrics.map(([key,label,defaultUnit]) => {
      const recorded = observations.filter(r => r[key] != null && r[key] !== '' && Number.isFinite(Number(r[key])) && !['invalid','error','rejected'].includes(r.quality?.[key] || r.quality));
      if (!recorded.length) return {key,label,unit:defaultUnit,value:null,date:'',time:'',points:[]};
      const last = recorded.at(-1); const unit = last.units?.[key] || (key === 'light' ? '단위 미등록' : defaultUnit);
      return {key,label:key === 'light' && unit !== 'W/m²' ? '내부광도' : label,unit,value:Number(last[key]),date:last.date,time:last.time || '',points:recorded.filter(r => (r.units?.[key] || (key === 'light' ? '단위 미등록' : defaultUnit)) === unit).map(r => ({date:r.date,time:r.time || '',value:Number(r[key])}))};
    });
    const metric = values.find(v => v.key === q.get('metric')) || values[0];
    const scope = {id:house.id,...(cycle ? {cycleId:cycle.id} : {})};
    const hidden = Object.entries(scope).map(([key,value]) => '<input type="hidden" name="' + key + '" value="' + e(value) + '">').join('');
    const registration = availableHouse(house) ? button('cycles-add','작기 등록',{houseId:house.id,from:'house'}) : '';
    const selector = cycles.length > 1 ? filterForm('houses-detail','<input type="hidden" name="id" value="' + e(house.id) + '">' + select('cycleId','재배 작기',cycles.map(c => [c.id,c.name + (c.status === 'ended' ? ' (종료)' : '')]),cycle.id)) : '';
    const summaryTitle = cycle?.ended ? '종료된 작기' : '진행 중인 작기' + (cycles.length ? ' <small>' + cycles.length + '건</small>' : ' 없음');
    const summary = '<section class="pm-house-cycle-summary" aria-label="연결된 작기"><div class="pm-row"><h2>' + summaryTitle + '</h2>' + registration + '</div>' + (cycle ? '<dl><div><dt>작기명</dt><dd>' + link('cycles-detail',cycle.name,{id:cycle.id}) + '</dd></div><div><dt>품목·품종</dt><dd>' + e(cycle.cropVarietyText) + '</dd></div><div><dt>생육단계</dt><dd>' + e(cycle.stageText) + '</dd></div><div><dt>재배기간</dt><dd>' + e(cycle.periodText) + '</dd></div></dl>' + planner().houseSummary(cycle) + '<div class="pm-actions">' + button('cycles-detail','작기 상세보기',{id:cycle.id}) + button('cycles-detail','오늘의 계획',{id:cycle.id,tab:'plan'}) + '</div>' : '<p class="pm-muted">등록된 작기가 없습니다.</p>') + '</section>';
    const sensors = '<dl class="pm-greenhouse-sensors">' + values.map(v => '<div><dt>' + e(v.label) + '</dt><dd>' + (v.value == null ? '미수신' : n(v.value) + ' <small>' + e(v.unit) + '</small>') + '</dd><time>' + (v.date ? date(v.date) + ' ' + e(v.time) : '') + '</time></div>').join('') + '</dl>';
    const infoFields = [['houseType','온실 유형',''],['covering','온실 형태',''],['sideHeight','측고','m'],['width','폭','m'],['length','길이','m'],['area','면적','m²'],['substrate','배지형태',''],['buildingCount','동수','동']];
    const infoRows = infoFields.map(([key,label,unit]) => '<tr><th scope="row">' + e(label) + '</th><td>' + (house[key] == null || house[key] === '' ? '미등록' : e(house[key]) + ' ' + e(unit)) + '</td></tr>').join('');
    const history = ended.length ? '<details class="pm-disclosure pm-house-cycle-history"><summary>종료된 작기 ' + ended.length + '건</summary>' + table(['작기명','품목·품종','재배기간'],ended.map(cycleData).map(c => [link('cycles-detail',c.name,{id:c.id}),e(c.cropVarietyText),e(c.periodText)]),'종료 작기 이력') + '</details>' : '';
    const info = '<table class="detail-table pm-greenhouse-info-table"><caption class="sr-only">온실 시설정보</caption><colgroup><col><col></colgroup><thead><tr><th scope="col">항목</th><th scope="col">내용</th></tr></thead><tbody>' + infoRows + '</tbody></table><div class="pm-actions">' + button('houses-add','정보 수정',{id:house.id}) + button('cycles','해당 작기',{houseId:house.id}) + button('confirm','삭제',{entity:'houses',id:house.id}) + '</div>' + history;
    const environment = '<div class="pm-actions">' + button('sensor-data','센서 관측 원자료',{houseId:house.id,date:lastEnvironment(house.id)?.date || store.today()}) + '</div>' + filterForm('houses-detail',hidden + '<input type="hidden" name="tab" value="environment">' + select('metric','환경 항목',values.map(v => [v.key,v.label + ' (' + v.unit + ')']),metric.key)) + greenhouseGraph(metric) + table(['관측일','시각',metric.label + ' (' + metric.unit + ')'],metric.points.map(p => [date(p.date),e(p.time),n(p.value)]),'온실 환경 관측기록');
    return '<div class="pm-greenhouse-detail"><div class="pm-greenhouse-heading"><div><h2>' + e(house.name) + '</h2><p class="pm-muted">' + link('farms-detail',find('farms',house.farmId)?.name || '미등록',{id:house.farmId}) + (house.zone ? ' · ' + e(house.zone) : '') + '</p></div><div>' + badge(house.active,'사용 중','사용 종료') + ' ' + button('houses','목록으로 돌아가기') + '</div></div>' + selector + summary + sensors + '<section class="pm-greenhouse-info" aria-label="온실 정보"><h2 class="sr-only">온실 정보</h2>' + info + '</section><section class="pm-greenhouse-environment" aria-label="환경 데이터"><h2 class="sr-only">환경 데이터</h2>' + environment + '</section></div>';
  }
  function greenhouseGraph(metric) {
    if (!metric.points.length) return '<p class="pm-empty">관측 기록이 없습니다.</p>';
    const min = Math.min(...metric.points.map(p => p.value)); const max = Math.max(...metric.points.map(p => p.value)); const range = max - min || 1;
    const timestamps = metric.points.map(p => Date.parse(p.date + 'T' + (/^\d{2}:\d{2}/.test(p.time) ? p.time : '00:00')));
    const timeRange = Math.max(...timestamps) - Math.min(...timestamps) || 1;
    const points = metric.points.map((p,i) => ({...p,x:60 + (timestamps[i] - Math.min(...timestamps)) * 500 / timeRange,y:150 - (p.value - min) * 110 / range}));
    return '<svg class="pm-chart" viewBox="0 0 640 210" role="img" aria-label="' + e(metric.label + ' ' + metric.unit + ' 관측 추이') + '"><line class="axis" x1="60" y1="170" x2="560" y2="170"/><text x="5" y="40">' + e(n(max)) + '</text><text x="5" y="150">' + e(n(min)) + '</text><text x="60" y="198">' + e(points[0].date + ' ' + points[0].time) + '</text><text x="410" y="198">' + e(points.at(-1).date + ' ' + points.at(-1).time) + '</text>' + points.map(p => '<circle class="point" cx="' + p.x + '" cy="' + p.y + '" r="4"><title>' + e(p.date + ' ' + p.time + ': ' + p.value + ' ' + metric.unit) + '</title></circle>').join('') + '</svg>';
  }
  function masterDetail(type, q) {
    if (type === 'houses') return greenhouseDetail(q);
    const v = find(type, q.get('id')); if (!v) return missing();
    const rows = type === 'farms' ? [['농장명', e(v.name)], ['연결 회원',link('account',state.profile.name)], ['주소·위치', e(v.address || '미등록')], ['메모', e(v.note)], ['상태', badge(v.active)]] : [['온실명', e(v.name)], ['소속 농장', e(find('farms', v.farmId)?.name)], ['구역·베드', e(v.zone || '미등록')], ['면적', e(v.area ? v.area + ' m²' : '미등록')], ['상태', badge(v.active)]];
    const connectedHouses = state.houses.filter(h => h.farmId === v.id);
    const childList = type === 'farms' ? panel('연결된 온실',table(['온실명','구역·베드','사용 상태'],connectedHouses.map(h => [link('houses-detail',h.name,{id:h.id}),e(h.zone || '미등록'),badge(h.active)]),'농장 연결 온실',{indexed:true})) : '';
    return panel(v.name, details(rows) + `<div class="pm-actions">${button(type + '-add', '정보 수정', { id: v.id })}${button('confirm', '삭제', { entity: type, id: v.id })}${type === 'farms' ? button('houses', '소속 온실', { farmId: v.id }) : button('cycles', '해당 작기', { houseId: v.id })}</div>`) + childList;
  }
  function masterForm(type, q) {
    const v = find(type, q.get('id')) || { active: true, farmId: q.get('farmId') || state.farms.find(f => f.active)?.id };
    if (q.get('id') && !v.id) return missing();
    if (type === 'houses' && !state.farms.length) return panel('농장 등록이 먼저 필요합니다', button('farms-add', '농장 등록', {}, true));
    return panel(currentTitle(), form(type, (type === 'houses' ? select('farmId', '소속 농장', options('farms'), v.farmId, false, true) : '') + field('name', type === 'farms' ? '농장명' : '온실명', v.name, 'text', true, 'maxlength="100"') + (type === 'farms' ? field('address', '주소·위치 (선택)', v.address) + textarea('note', '메모', v.note) : field('zone', '구역·베드 (선택)', v.zone) + field('area', '온실면적 m² (선택)', v.area, 'number', false, 'min="0" step="any"')) + select('active', '사용 상태', [['true', '사용 중'], ['false', '사용 종료']], String(v.active)), v.id));
  }
  function cycleList(q) {
    const matches = (value,query) => !query || String(value || '').toLocaleLowerCase('ko-KR').includes(query.trim().toLocaleLowerCase('ko-KR'));
    const rows = ProducerInsights.sort(state.cycles.filter(c => (!q.get('houseId') || c.houseId === q.get('houseId')) && (!q.get('status') || c.status === q.get('status')) && matches(c.name,q.get('search')) && matches(c.variety,q.get('variety'))),q.get('sort'),'cycles',state).map(cycleData);
    const filters = select('houseId', '온실명', options('houses'), q.get('houseId'), true) + select('status', '작기 상태', [['active', '진행 중'], ['ended', '종료']], q.get('status'), true) + field('search', '작기명', q.get('search')) + field('variety','품종',q.get('variety'));
    return filterForm('cycles',filters) + panel('작기 목록', table(['작기명', '재배 온실', '품목', '품종', '생육단계', '재배기간', '현재 재배수량', '상태'], rows.map(c => [link('cycles-detail',c.name,{id:c.id}),e(c.houseText) + '<small>' + e(c.farmText) + '</small>',e(c.cropText),e(c.varietyText),e(c.stageText),e(c.periodText),e(c.currentQuantityText),badge(!c.ended,'진행 중','종료')]), '작기 목록',{indexed:true}));
  }
  function cycleDetail(q) {
    const c = cycleData(find('cycles',q.get('id'))); if (!c) return missing();
    const ended = c.status === 'ended';
    const records = state.records.filter(r => r.cycleId === c.id && !r.cancelled).sort((a,b) => b.date.localeCompare(a.date));
    const shipments = state.shipments.filter(r => r.cycleId === c.id).sort((a,b) => b.date.localeCompare(a.date));
    const adjustments = state.adjustments.filter(a => a.cycleId === c.id).sort((a,b) => b.date.localeCompare(a.date));
    const note = c.noteText;
    const needsStart = String(c.note || '').includes('실제 시작일이 없어 최초 기록일 또는 오늘을 임시 표시합니다.');
    const list = (labels,rows,caption,empty) => rows.length ? table(labels,rows,caption,{indexed:caption === '수량 변경 이력'}) : '<p class="pm-cycle-empty">' + e(empty) + '</p>';
    const fields = items => '<dl class="pm-cycle-fields">' + items.map(([label,value]) => '<div><dt>' + e(label) + '</dt><dd>' + value + '</dd></div>').join('') + '</dl>';
    const section = (title,body) => '<section class="pm-cycle-section"><h2>' + e(title) + '</h2>' + body + '</section>';
    const period = e(c.periodText);
    const context = '<div class="pm-cycle-context"><div class="pm-cycle-status">' + badge(!ended,'진행 중','종료') + '<span class="pm-cycle-stage">생육단계 <strong>' + e(c.stageText) + '</strong></span></div><p>' + link('houses-detail',houseName(c.houseId),{id:c.houseId,cycleId:c.id}) + '<span>' + e(c.cropVarietyText) + '</span></p><p class="pm-muted">재배기간 ' + period + '</p></div>';
    const overview = planner().goal(c);
    const attention = c.quantityPending ? '<div class="pm-cycle-attention"><span>시작 재배수량과 단위를 등록해 주세요.</span>' + button('cycles-add','수량 등록',{id:c.id}) + '</div>' : '';
    const toolbar = '<div class="pm-cycle-toolbar"><div class="pm-actions">' + button('journal-add','일지 작성',{cycleId:c.id},true) + (!ended ? button('shipments-add','출하 등록',{cycleId:c.id}) : '') + '</div>' + link('comparison','생육·환경 비교',{cycleId:c.id},'pm-cycle-text-link') + '</div>';
    const basic = section('재배 기본정보',fields([
      ['재배 시작일',date(c.start) + (needsStart ? ' <span class="pm-badge">확인 필요</span>' : '')],['정식일',date(c.plantingDate)],
      ['시작 재배수량',e(c.initialQuantityText)],['재배면적',c.cultivationArea == null || c.cultivationArea === '' ? '미등록' : e(c.cultivationArea) + ' m²'],
      ['묘 구입처',e(c.supplier || '미등록')],['실제 수확일',c.harvestDate ? date(c.harvestDate) : c.ended ? '수확 이력 없음' : '수확 전']
    ])) + section('생육 현황',fields([
      ['재배 진행률',c.displayProgress == null ? '미등록' : n(c.displayProgress) + '%'],['평균 꽃대 수',c.flowerStalks == null ? '미등록' : n(c.flowerStalks) + ' 개/주'],
      ['평균 개화율',c.flowering == null ? '미등록' : n(c.flowering) + '%'],['화색 메모',e(c.color || '미등록')]
    ])) + section('재배 메모',note ? '<p class="pm-cycle-note">' + e(note) + '</p>' : '<p class="pm-cycle-empty">등록된 메모가 없습니다.</p>')
      + (ended || c.endNote ? section('종료 결과',fields([['재배 종료일',date(c.endDate)]]) + '<p class="pm-cycle-note">' + e(c.endNote || '등록된 종료 결과가 없습니다.') + '</p>') : '');
    const panes = '<section data-cycle-pane="basic" aria-label="기본정보">' + basic + '</section>'
      + '<section data-cycle-pane="plan" aria-label="계획">' + planner().plan(c,q) + '</section>'
      + '<section data-cycle-pane="journal" aria-label="재배일지"><h2 class="sr-only">재배일지</h2>' + list(['일자','유형','기록'],records.map(r => [date(r.date),e(r.type),link('journal-detail',r.text.slice(0,70),{id:r.id})]),'해당 작기 일지','등록된 재배일지가 없습니다.') + '</section>'
      + '<section data-cycle-pane="shipments" aria-label="출하 이력"><h2 class="sr-only">출하 이력</h2>' + list(['출하일','출하처','수량','상태'],shipments.map(s => [link('shipments-detail',s.date,{id:s.id}),e(s.recipient),n(s.quantity) + ' ' + e(s.unit),badge(!s.cancelled,'유효','취소')]),'해당 작기 출하','등록된 출하 기록이 없습니다.') + '</section>'
      + '<section data-cycle-pane="quantity" aria-label="수량 변경"><h2 class="sr-only">수량 변경</h2>' + list(['발생일','구분','수량','사유'],adjustments.map(a => [date(a.date),e(a.type),n(a.quantity) + ' ' + e(c.unit),e(a.note)]),'수량 변경 이력','등록된 수량 변경 기록이 없습니다.') + '</section>';
    const management = '<details class="pm-disclosure pm-cycle-management"><summary>작기 관리</summary><div class="pm-actions">' + button('cycles-add','기본정보 수정',{id:c.id}) + (!ended ? button('quantity','수량 변경',{id:c.id}) + button('cycles-add','작기 종료',{id:c.id,end:'1'}) : '') + link('confirm','삭제',{entity:'cycles',id:c.id},'btn pm-danger') + '</div></details>';
    return '<div class="pm-cycle-detail">' + context + overview + attention + toolbar + planner().daily(c,store.today(),true) + panes + management + '</div>';
  }
  function cycleForm(q) {
    const existing = find('cycles', q.get('id'));
    if (q.get('id') && !existing) return missing();
    const houses = state.houses.filter(h => availableHouse(h) || existing?.houseId === h.id);
    if (!existing && !houses.length) return panel('온실 등록이 먼저 필요합니다', '<p class="pm-empty">작기를 연결할 온실을 먼저 등록해 주세요.</p>' + button('houses-add', '온실 등록', {}, true));
    if (!existing && q.get('houseId') && !houses.some(h => h.id === q.get('houseId'))) return panel('사용 가능한 온실을 선택해 주세요', button('houses','온실 목록'));
    const returnContext = !existing && q.get('from') === 'house' && q.get('houseId') ? '<input type="hidden" name="returnTo" value="house"><input type="hidden" name="returnHouseId" value="' + e(q.get('houseId')) + '">' : '';
    const houseOptions = [...(!existing ? [['','온실을 선택해 주세요']] : []),...houses.map(h => [h.id,houseName(h.id) + (!h.active ? ' (사용 종료)' : '')])];
    const c = existing || { start: store.today(), unit: '화분', stage: '입고·순화/활착', status: 'active', initial: '' };
    return panel('작기 기본정보', '<p class="pm-muted">품종·단계는 농가가 확인한 기준으로 기록합니다. 이력이 있는 작기의 온실·단위 직접 변경은 제한됩니다.</p>' + form('cycles', returnContext + withHint(field('name', '작기명', c.name, 'text', true), '출하 시기·품종·차수 등을 조합해 구분하기 쉬운 이름을 입력합니다. 예: 2027 설 출하 만천홍 1차') + select('houseId', '재배 온실', houseOptions, c.houseId || q.get('houseId') || '', false, true) + field('crop', '품목명', c.crop || '호접란', 'text', true) + field('variety', '품종명', c.variety) + withHint(field('start', '재배 시작일', c.start, 'date', true), '이 작기의 관리 시작일입니다. 정식일과 자동으로 같게 처리하지 않습니다.') + withHint(field('plantingDate', '정식일 (선택)', c.plantingDate, 'date'), '정식 작업을 실제 수행한 날짜입니다. 입고·이식·분갈이와 구분합니다.') + field('stage', '생육단계', c.stage, 'text', true) + field('initial', '시작 재배수량', c.quantityPending ? '' : c.initial, 'number', true, 'min="0" step="1"') + field('unit', '수량 단위', c.quantityPending ? '' : c.unit, 'text', true) + field('targetStart', '출하 예정 시작일', c.targetStart, 'date') + field('targetEnd', '출하 예정 종료일', c.targetEnd, 'date') + field('targetQty', '목표 출하량 (미정이면 비움)', c.targetQty, 'number', false, 'min="1" step="1"') + select('targetGrade','목표 출하 등급',[['','미정'],...ProducerManagementStore.GRADES.map(v=>[v,v])],c.targetGrade) + field('targetSpecification','목표 출하 규격',c.targetSpecification) + field('targetRecipient','예정 거래처',c.targetRecipient) + select('status', '작기 상태', [['active', '진행 중'], ['ended', '종료']], q.get('end') ? 'ended' : c.status) + field('endDate', '재배 종료일 (종료 시 입력)', c.endDate || (q.get('end') ? store.today() : ''), 'date') + textarea('endNote', '종료 결과·남은 수량 처리 내용', c.endNote) + textarea('note', '재배 메모', cycleData(c).noteText), c.id));
  }
  function sensorSummary(model) {
    const summaries=model.summaries;
    return '<section class="pm-sensor-section"><h2>환경 관측 요약</h2><p class="pm-muted">선택한 날짜의 저장 관측값입니다. 동일한 출처·항목·단위끼리 집계하며 평균은 관측점의 산술평균입니다.</p>' + (summaries.length ? table(['관측 항목','단위','출처 ID','유효 관측','최솟값','관측점 평균','최댓값','집계 제외'],summaries.map(g=>[e(g.label),e(g.unit || '미등록'),e(g.sensorId),String(g.count),g.min==null?'—':n(g.min),g.mean==null?'—':n(g.mean),g.max==null?'—':n(g.max),String(g.excluded)]),'일별 환경 관측 요약',{indexed:true}) : '<p class="pm-empty">선택한 날짜의 환경 관측 기록이 없습니다.</p>') + (model.missingMetrics.length ? '<details class="pm-disclosure"><summary>관측이 없는 항목 ' + model.missingMetrics.length + '개</summary><p class="pm-muted">' + e(model.missingMetrics.join(' · ')) + '</p></details>' : '') + '</section>';
  }
  function journalDay(q) {
    const id=q.get('cycleId');const day=q.get('date') || store.today();const c=find('cycles',id);
    if(id&&!c)return missing();
    const houseId=q.get('houseId');
    if(houseId&&(!find('houses',houseId)||(c&&c.houseId!==houseId)))return missing();
    const choices=options('cycles').filter(([key])=>!houseId || find('cycles',key).houseId===houseId);
    const filters=filterForm('journal-day',select('houseId','온실명',options('houses'),houseId,true)+select('cycleId','작기명',[['','작기를 선택해 주세요'],...choices],id,false,true)+field('date','관찰·작업일',day,'date',true));
    if(!c)return filters+'<p class="pm-empty">작기와 날짜를 선택하면 재배일지와 같은 온실의 센서 관측을 함께 확인할 수 있습니다.</p>';
    const model=ProducerSensorData.daily(state,c.id,day,terms.environment);
    const records=model.records;
    const automatic=(state.automationEvents || []).filter(a=>a.cycleId===c.id&&a.date===day);
    const automation='<section class="pm-sensor-section" id="automationEvents"><h2>자동화 장치 실행 이력</h2>' + table(['작업','실행 장치','시작 시각','완료 시각','결과','공급량·상태'],automatic.map(a=>[e(a.operation),e(a.deviceId),e(a.startedAt),e(a.finishedAt),badge(a.status==='completed','완료','실패'),e(a.quantity === '' ? a.result : a.quantity + ' ' + a.unit + ' · ' + a.result)]),'자동화 장치 실행 이력',{indexed:true}) + '</section>';
    const work='<section class="pm-sensor-section"><div class="pm-row"><h2>재배일지·작업 기록</h2>' + button('journal-add','이 날짜에 일지 작성',{cycleId:c.id,date:day},true) + '</div>' + (records.length ? records.map(r=>'<article class="pm-daily-record"><div class="pm-row"><h3>' + e((r.time ? r.time + ' · ' : '') + r.type) + '</h3><span class="pm-badge">' + (r.inputSource === 'automatic' ? '자동 실행 결과' : '직접 기록') + '</span></div><p>' + e(r.text) + '</p>' + (r.metric?'<p class="pm-muted">생육조사 · ' + e(terms.metricLabel(r.metric)) + ' ' + e(r.value) + ' ' + e(r.measureUnit) + ' · 개체 ' + e(r.sample || '미등록') + '</p>':'') + '<div class="pm-daily-work">' + terms.workFields.filter(([key])=>r[key]!=null&&r[key]!==''&&!/^(.* 작업 없음|사용 없음)$/.test(String(r[key]))).map(([key,label])=>'<p><strong>' + e(label) + '</strong> ' + e(r[key]) + '</p>').join('') + '</div>' + link('journal-detail','일지 상세보기',{id:r.id}) + '</article>').join('') : '<p class="pm-empty">이 날짜에 작성된 재배일지가 없습니다.</p>') + '</section>';
    return filters + '<div class="pm-daily-header">' + cycleReference(c) + '<p class="pm-notice">' + e(day) + ' · 작업 기록과 온실 관측을 함께 조회합니다. 환경 관측값은 같은 온실에서 공유하며 작기 전용 측정값으로 복사하지 않습니다.</p></div>' + (model.outOfPeriod?'<p class="pm-error">선택한 날짜가 작기의 재배기간 밖입니다.</p>':'') + planner().daily(c,day,true) + '<div class="pm-daily-grid">' + work + sensorSummary(model.environment) + automation + '</div><div class="pm-actions">' + button('sensor-data','센서 관측 원자료',{houseId:c.houseId,date:day}) + button('comparison','생육·환경 비교',{cycleId:c.id,startDate:day,endDate:day}) + '</div>';
  }
  function sensorData(q) {
    const id=q.get('houseId');const day=q.get('date') || store.today();const house=find('houses',id);
    if(id&&!house)return missing();
    const filters=filterForm('sensor-data',select('houseId','온실명',[['','온실을 선택해 주세요'],...options('houses')],id,false,true)+field('date','관측일',day,'date',true)+select('metric','관측 항목',terms.environment.map(([key,label])=>[key,label]),q.get('metric'),true)+select('quality','원자료 품질',[['valid','유효 관측'],['excluded','집계 제외']],q.get('quality'),true));
    if(!house)return filters+'<p class="pm-empty">온실과 날짜를 선택해 센서 관측값을 조회해 주세요.</p>';
    const model=ProducerSensorData.snapshot(state,id,day,terms.environment);
    const rows=ProducerInsights.sort(model.points.filter(r=>(!q.get('metric')||r.metric===q.get('metric'))&&(!q.get('quality')||(q.get('quality')==='valid'?r.eligible:!r.eligible))),q.get('sort'),'sensor-data',state);
    const sourceIds=[...new Set(rows.map(r=>r.sensorId))];
    const devices=(state.devices || []).filter(d=>d.houseId===id);
    const equipment=panel('온실 장비',table(['장비 ID','장비명','구분','위치','상태','수집주기'],devices.map(d=>[e(d.id),e(d.name),d.kind==='environment'?'환경센서':'자동제어기',e(d.zone),e(d.status),d.intervalMinutes?d.intervalMinutes+'분':'실행 결과 수신']),'온실 장비',{indexed:true}));
    return filters + '<div class="pm-sensor-heading"><h2>' + e(houseName(id)) + '</h2><p>온실 환경 자동수집</p><p class="pm-muted">관측 항목·장비·수집 상태를 확인합니다. 관측 시각과 수신 시각을 구분하며, 수신 시각이 없는 기록은 임의로 채우지 않습니다.</p></div>' + kpis([['관측 묶음',model.observations.length+'건'],['조회 원자료',rows.length+'개'],['출처 ID',sourceIds.length+'개'],['최근 관측 시각',model.lastObservation ? (model.lastObservation.observedAt || [model.lastObservation.date,model.lastObservation.time].filter(Boolean).join(' ')) : '기록 없음']]) + equipment + sensorSummary({...model,summaries:model.summaries.filter(r=>!q.get('metric')||r.metric===q.get('metric'))}) + panel('관측 원자료',table(['관측 시각','수신 시각','관측 항목','값','단위','출처 ID','출처','검증 상태'],rows.map(r=>[e(r.observedAt),e(r.receivedAt || '미등록'),e(r.label),e(r.value),e(r.unit || '미등록'),e(r.sensorId),e(r.source),e(r.quality)]),'센서 관측 원자료',{indexed:true})) + '<div class="pm-actions">' + button('houses-detail','온실 상세보기',{id,tab:'environment'}) + button('journal-day','일지·센서 통합조회',{houseId:id,date:day}) + '</div>';
  }
  function journalList(q) {
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const rows = ProducerInsights.sort(state.records.filter(r => !r.cancelled && (!q.get('cycleId') || r.cycleId === q.get('cycleId')) && (!q.get('houseId') || find('cycles',r.cycleId)?.houseId===q.get('houseId')) && (!q.get('type') || r.type===q.get('type')) && (!q.get('inputSource') || (r.inputSource || 'manual') === q.get('inputSource')) && (!q.get('startDate') || r.date >= q.get('startDate')) && (!q.get('endDate') || r.date <= q.get('endDate'))),q.get('sort'),'journal',state);
    const filters = select('houseId','온실명',options('houses'),q.get('houseId'),true) + select('cycleId', '작기명', scopedCycles(q), q.get('cycleId'), true) + select('type','작업 유형',[...new Set(state.records.map(r=>r.type))].map(v=>[v,v]),q.get('type'),true) + select('inputSource','기록 구분',[['manual','직접 기록'],['automatic','자동 실행 결과']],q.get('inputSource'),true) + field('startDate', '시작일', q.get('startDate'), 'date') + field('endDate', '종료일', q.get('endDate'), 'date') + select('mode', '보기 방식', [['list', '목록'], ['calendar', '달력']], q.get('mode')) + field('month', '달력 조회 월', q.get('month') || store.today().slice(0, 7), 'month');
    let body = table(['관찰·작업일', '작기명', '유형', '기록 구분', '작업일 환경', '내용'], rows.map(r => [date(r.date) + '<small>' + e(r.time) + '</small>', e(cycleName(r.cycleId)), e(r.type),e(r.inputSource === 'automatic' ? '자동 실행 결과' : '직접 기록'), insights().journalEnvironment(r,true), link('journal-detail', r.text.slice(0, 70), { id: r.id })]), '재배일지',{indexed:true});
    if (q.get('mode') === 'calendar') {
      const month = q.get('month') || store.today().slice(0, 7);
      const first = new Date(month + '-01T00:00:00Z'); const days = new Date(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate();
      body = `<div class="pm-calendar">${['일', '월', '화', '수', '목', '금', '토'].map(v => '<strong>' + v + '</strong>').join('')}${'<div aria-hidden="true"></div>'.repeat(first.getUTCDay())}${Array.from({ length: days }, (_, i) => { const d = month + '-' + String(i + 1).padStart(2, '0'); return `<div>${i + 1}${rows.filter(r => r.date === d).map(r => link('journal-detail', r.type, { id: r.id })).join('')}</div>`; }).join('')}</div>`;
    }
    const shipmentRows = state.shipments.filter(s => !s.cancelled && (!q.get('cycleId') || s.cycleId === q.get('cycleId')) && (!q.get('houseId') || find('cycles',s.cycleId)?.houseId===q.get('houseId')) && (!q.get('startDate') || s.date >= q.get('startDate')) && (!q.get('endDate') || s.date <= q.get('endDate')));
    return filterForm('journal', filters) + '<div class="pm-actions pm-journal-day-entry">' + button('journal-day','일지·센서 통합조회',{cycleId:q.get('cycleId')}) + '</div>' + panel('재배일지', body) + panel('연결된 출하 기록', '<p class="pm-muted">출하 원기록을 조회합니다. 정정·취소는 출하관리에서 합니다.</p>' + table(['출하일', '작기명', '수량'], shipmentRows.map(s => [link('shipments-detail', s.date, { id: s.id }), e(cycleName(s.cycleId)), n(s.quantity) + ' ' + e(s.unit)]), '연결 출하 기록'));
  }
  function journalForm(q) {
    const task=(state.planTasks||[]).find(t=>t.id===q.get('planTaskId'));
    if(q.get('planTaskId')&&(!task||task.automationEventId||(q.get('cycleId')&&q.get('cycleId')!==task.cycleId)))return missing();
    const r = find('records', q.get('id')) || { date: q.get('date') || store.today(), cycleId: task?.cycleId || q.get('cycleId'), planTaskId:task?.id || '', type: task ? (task.type==='출하 준비'?'재배작업':task.type) : q.get('type') === '재배작업' ? '재배작업' : '생육·관찰' };
    if (q.get('id') && !r.id) return missing();
    if (r.inputSource === 'automatic') return panel('자동 실행 결과', '<p>자동화 장치에서 생성된 기록입니다.</p>' + button('journal-detail','원본 결과 보기',{id:r.id}));
    if (!state.cycles.length) return panel('작기 등록이 먼저 필요합니다', button('cycles-add', '작기 등록', {}, true));
    const recordTypes = [...new Set(['생육·관찰', '관수·시비', '재배작업', '병해충·이상', '시설·환경', '기타', r.type].filter(Boolean))];
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const selectedCycle = find('cycles',r.cycleId) || (!r.id ? state.cycles[0] : null);
    const cycleOptions = r.id && !r.cycleId ? [['', '연결할 작기를 선택해 주세요'], ...options('cycles')] : options('cycles');
    return panel(r.id ? '일지 수정' : '일지 작성', form('records', select('cycleId', '작기명', cycleOptions, r.cycleId, false, true) + '<div class="pm-wide" id="journalCycleContext" aria-label="선택한 작기 정보">' + cycleReference(selectedCycle) + '</div>' + '<fieldset class="pm-plan-record-fields pm-wide"><legend>계획 작업 연결</legend><div class="pm-form-grid" id="journalPlanFields">' + planner().recordFields(selectedCycle,r) + '</div></fieldset>' + field('date', '실제 관찰·작업일', r.date, 'date', true) + field('time','작업 시각 (선택)',r.time,'time') + select('type', '기록 유형', recordTypes.map(v => [v, v]), r.type) + textarea('text', '관찰·실제 작업 내용', r.text, true) + `<details class="pm-measurement pm-wide" ${r.metric || q.get('measurement') === '1' ? 'open' : ''}><summary>생육조사 (필요한 날만 입력)</summary><div class="pm-form-grid">` + field('metric', '생육조사 항목', terms.canonicalMetric(r.metric), 'text', false, 'list="growthMetricOptions"') + '<datalist id="growthMetricOptions">' + terms.growth.map(item => '<option value="' + e(item.name) + '">' + e(item.label + ' · ' + item.unit) + '</option>').join('') + '</datalist>' + field('value', '측정값', r.value, 'number', false, 'min="0" step="any"') + field('measureUnit', '측정 단위', r.measureUnit) + field('sample', '조사 개체번호', r.sample) + field('method', '조사 방법', r.method) + '</div><p class="pm-muted">측정일은 위 관찰·작업일을 사용합니다. 개체·단위·조사 방법이 같은 기록끼리 비교하며 평균엽장·평균엽폭은 단일 잎 측정과 구분합니다.</p></details>' + field('followup', '다음 확인 메모', r.followup) + '<label class="pm-field search-row pm-wide"><span class="search-label">사진 (선택)</span><input type="file" name="photoFile" accept="image/png,image/jpeg,image/webp"><small>PNG/JPEG/WebP, 600KB 이하</small></label>' + (r.photo ? '<label class="pm-field search-row"><span class="search-label">기존 사진 삭제</span><select class="search-select" name="removePhoto"><option value="">유지</option><option value="yes">삭제</option></select></label>' : ''), r.id, '일지 저장'));
  }
  function journalDetail(q) {
    const r = find('records', q.get('id')); if (!r) return missing();
    return (r.cycleId ? panel('연결 작기', cycleReference(find('cycles',r.cycleId))) : '') + insights().journalEnvironment(r) + panel('관찰·작업 기록', planner().recordLinks(r) + details([['관찰·작업일', date(r.date)], ['유형', e(r.type)], ['기록 구분',e(r.inputSource === 'automatic' ? '자동 실행 결과' : '직접 기록')], ['작업 시각',e(r.time || '미등록')], ['입력·수신 장치',e(r.sourceDeviceId || r.authorName || state.profile.name)], ['내용', e(r.text)], ['생육조사', r.metric ? e(terms.metricLabel(r.metric)) + ': ' + n(Number(r.value)) + ' ' + e(r.measureUnit) + '<small> · ' + e(r.sample) + ' / ' + e(r.method) + '</small>' : '정밀 측정 없음'], ['다음 확인', e(r.followup || '미등록')]]) + (r.photo ? `<figure class="pm-journal-photo"><img class="pm-photo" src="${e(r.photo)}" alt="${e(r.photoCaption || '재배일지에 첨부한 현장 사진')}">${r.photoCaption ? '<figcaption class="pm-muted">' + e(r.photoCaption) + '</figcaption>' : ''}</figure>` : '') + (r.inputSource === 'automatic' ? '<div class="pm-actions">' + button('journal-day','자동 실행 이력 보기',{cycleId:r.cycleId,date:r.date,section:'automation'}) + '</div>' : `<div class="pm-actions">${button('journal-add', '수정', { id: r.id })}${button('confirm', '삭제', { entity: 'records', id: r.id })}</div>`));
  }
  function shipmentList(q) {
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const rows = ProducerInsights.sort(state.shipments.filter(s => ProducerInsights.matchesCycle(state,find('cycles',s.cycleId),q) && (!q.get('unit')||s.unit===q.get('unit')) && (!q.get('grade') || (s.gradeBreakdown?.length?s.gradeBreakdown.some(r=>r.grade===q.get('grade')):shipmentGrade(s)===q.get('grade'))) && (!q.get('startDate') || s.date >= q.get('startDate')) && (!q.get('endDate') || s.date <= q.get('endDate')) && (!q.get('status') || String(s.cancelled) === q.get('status')) && (!q.get('recipient') || s.recipient.includes(q.get('recipient')))),q.get('sort'),'shipments',state);
    return filterForm('shipments', select('houseId','온실명',options('houses'),q.get('houseId'),true) + select('cycleId', '작기명', scopedCycles(q), q.get('cycleId'), true) + field('startDate', '시작일', q.get('startDate'), 'date') + field('endDate', '종료일', q.get('endDate'), 'date') + field('recipient', '출하처 검색', q.get('recipient')) + select('status', '출하 상태', [['false', '유효'], ['true', '취소']], q.get('status'), true) + select('grade','출하 등급', [...new Set([...ProducerManagementStore.GRADES,...state.shipments.flatMap(v=>v.gradeBreakdown?.map(r=>r.grade)||[shipmentGrade(v)])])].filter(Boolean).map(v=>[v,v]),q.get('grade'),true) + select('unit','출하 단위',[...new Set(state.shipments.map(v=>v.unit))].map(v=>[v,v]),q.get('unit'),true)+field('variety','품종',q.get('variety'))) + panel('실제 출하 내역', table(['실제 출하일', '작기명', '출하처·규격·등급', '수량', '상태'], rows.map(s => [link('shipments-detail', s.date, { id: s.id }), shipping().listSource(find('cycles',s.cycleId)), e(s.recipient) + '<small>' + e([shipmentSpec(s), shipmentGradeText(s)].filter(Boolean).join(' / ')) + '</small>', n(s.quantity) + ' ' + e(s.unit), badge(!s.cancelled, '유효', '취소')]), '실제 출하 내역',{indexed:true}));
  }
  function shipmentForm(q) {
    const s = find('shipments', q.get('id')) || { date: store.today(), cycleId: q.get('cycleId') };
    if (q.get('id') && !s.id) return missing();
    if (!state.cycles.length) return panel('작기 등록이 먼저 필요합니다', button('cycles-add', '작기 등록', {}, true));
    if (s.cancelled) return panel('취소된 출하는 정정할 수 없습니다', button('shipments', '출하 내역'));
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const c = find('cycles', s.cycleId) || state.cycles[0];
    return panel(s.id ? '출하 정정' : '실제 출하 등록', form('shipments', select('cycleId', '1. 생산 작기 프로젝트', options('cycles'), c.id, false, true) + '<div class="pm-wide" id="shipmentContext" aria-label="선택한 작기 생산정보">' + shipmentContext(c,s.id) + '</div>' + `<p class="pm-notice pm-wide" id="shipmentBalance">현재 재배수량 ${e(stockText(c))} · 단위는 작기 정보를 따릅니다.</p>` + '<div class="pm-wide pm-shipment-prefill"><p id="shipmentDraftSource" class="pm-muted"></p><button type="button" class="btn" data-shipment-defaults>목표 거래처·규격 적용</button></div>' + field('date', '실제 출하일', s.date, 'date', true) + field('recipient', '출하처', s.recipient, 'text', true) + withHint(field('specification', '출하 규격', shipmentSpec(s)), '상품 구성·크기 등 출하 명세입니다.') + field('quantity', '실제 출하량', s.quantity, 'number', true, 'min="1" step="1"') + shipmentGradeFields(s) + textarea('note', s.id ? '정정 사유·메모' : '메모', s.note, Boolean(s.id)), s.id, s.id ? '정정 저장' : '출하 저장'));
  }
  function shipmentDetail(q) {
    const s = find('shipments', q.get('id')); if (!s) return missing();
    return shipmentContext(find('cycles',s.cycleId)) + panel('실제 출하 기록', details([['출하일', date(s.date)], ['수확일', date(s.harvestDate)], ['출하처', e(s.recipient)], ['출하 규격', e(shipmentSpec(s) || '미등록')], ['출하 등급', e(shipmentGradeText(s))], ['출하량', n(s.quantity) + ' ' + e(s.unit)], ['재배 차감 수량', n(ProducerManagementStore.stockQuantity(s)) + ' ' + e(find('cycles',s.cycleId).unit)], ['총금액', s.totalAmount == null || s.totalAmount === '' ? '미등록' : n(s.totalAmount) + ' 원'], ['상태', badge(!s.cancelled, '유효', '취소')], ['메모·취소 사유', e([s.note, s.cancelReason].filter(Boolean).join('\n'))]]) + (!s.cancelled ? `<div class="pm-actions">${button('shipments-add', '정정', { id: s.id })}${button('confirm', '출하 취소', { entity: 'shipments', id: s.id })}</div>` : '') + '<h3>등록·변경 이력</h3>' + table(['처리', '시각', '수량·사유'], (s.history || []).map(h => [e(h.action), e(h.at), e(h.reason || h.quantity)]), '출하 변경 이력'));
  }
  function quantity(q) {
    const c = find('cycles', q.get('id')); if (!c) return missing();
    return panel('연결 작기',cycleReference(c)) + panel('수량 변경', `<p>현재 재배수량: <strong>${e(stockText(c))}</strong></p><p class="pm-muted">출하로 감소한 수량은 이 화면에 다시 입력하지 않습니다. 정정은 기존 변경을 상쇄하는 이력을 남겨 처리합니다.</p>` + form('quantity', `<input type="hidden" name="cycleId" value="${e(c.id)}">` + field('date', '실제 발생일', store.today(), 'date', true) + select('type', '변경 구분', [['추가 입고', '추가 입고 (+)'], ['폐기', '폐기 (-)'], ['정정 증가', '정정 증가 (+)'], ['정정 감소', '정정 감소 (-)']]) + field('quantity', '변경 수량 (' + c.unit + ')', '', 'number', true, 'min="1" step="1"') + textarea('note', '발생·정정 사유', '', true)));
  }
  function graph(points, label, unit, connect) {
    if (!points.length) return '<p class="pm-empty">선택 조건의 측정 기록이 없습니다. 기록 없음은 정상이나 0을 뜻하지 않습니다.</p>';
    const values = points.map(p => Number(p.value)); const low = Math.min(...values); const high = Math.max(...values); const spread = high - low || 1;
    const times = points.map(p => Date.parse(p.date)); const first = Math.min(...times); const span = Math.max(...times) - first || 86400000;
    const xy = points.map(p => [60 + (Date.parse(p.date) - first) / span * 510, 175 - (Number(p.value) - low) / spread * 130]);
    return `<svg class="pm-chart" viewBox="0 0 640 230" role="img" aria-label="${e(label + ', ' + points.length + '개 실제 측정점, 단위 ' + unit)}"><line class="axis" x1="60" y1="190" x2="580" y2="190"/><line class="axis" x1="60" y1="25" x2="60" y2="190"/><text x="8" y="44">${e(n(high))}</text><text x="8" y="180">${e(n(low))}</text><text x="60" y="216">${date(points[0].date)}</text><text x="480" y="216">${date(points[points.length - 1].date)}</text>${connect && points.length > 1 ? `<polyline class="series" points="${xy.map(p => p.join(',')).join(' ')}"/>` : ''}${xy.map(([x, y], i) => `<circle class="point" cx="${x}" cy="${y}" r="4"><title>${date(points[i].date)}: ${e(points[i].value)} ${e(unit)}</title></circle>`).join('')}</svg><details class="pm-disclosure pm-raw"><summary>측정 원자료 보기 (${points.length}건)</summary>` + table(['측정일', label + ' (' + unit + ')', '원기록'], points.map(p => [date(p.date), e(p.value), p.recordId ? link('journal-detail', '일지 보기', { id: p.recordId }) : e(p.source || '환경 표본')]), label + ' 원자료') + '</details>';
  }
  function comparison(q) {
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const c = find('cycles', q.get('cycleId')) || state.cycles.find(c=>!q.get('houseId')||c.houseId===q.get('houseId'));
    if(c&&q.get('houseId')&&c.houseId!==q.get('houseId'))return '<p class="pm-empty">선택한 온실과 작기가 일치하지 않습니다.</p>'+button('comparison','비교 조건 다시 선택');
    if (!c) return panel('재배 기록을 먼저 등록해 주세요', button('cycles-add', '작기 등록', {}, true));
    const start = q.get('startDate') || c.start; const end = q.get('endDate') || store.today();
    const records = state.records.filter(r => r.cycleId === c.id && r.metric && !r.cancelled && r.date >= start && r.date <= end);
    const keys = [...new Set(records.map(measurementKey))];
    let requestedSeries = q.get('series');
    try { const parts = JSON.parse(requestedSeries); if (Array.isArray(parts)) { parts[0] = terms.canonicalMetric(parts[0]); requestedSeries = JSON.stringify(parts); } } catch (_) { /* 이전 조회조건은 원자료 항목으로 다시 선택할 수 있습니다. */ }
    const key = keys.includes(requestedSeries) ? requestedSeries : keys[0];
    const measurements = records.filter(r => measurementKey(r) === key).sort((a, b) => a.date.localeCompare(b.date));
    const metric = terms.metricLabel(measurements[0]?.metric) || '생육조사'; const unit = measurements[0]?.measureUnit || '';
    const envConfig = terms.environment.find(item => item[0] === q.get('envMetric')) || terms.environment[0];
    const [envMetric, envLabel, defaultUnit] = envConfig;
    const env = state.environment.filter(r => r.houseId === c.houseId && r.date >= start && r.date <= end && Number.isFinite(r[envMetric]) && !['invalid','error','rejected'].includes(r.quality?.[envMetric] || r.quality)).sort((a, b) => a.date.localeCompare(b.date));
    return filterForm('comparison', select('houseId','온실명',options('houses'),q.get('houseId'),true) + select('cycleId', '작기명', scopedCycles(q), c.id,false,true) + field('startDate', '시작일', start, 'date') + field('endDate', '종료일', end, 'date') + select('series', '생육조사 항목·개체·방법', keys.map(k => { const parts = JSON.parse(k); parts[0] = terms.metricLabel(parts[0]); return [k, parts.join(' / ')]; }), key) + select('envMetric', '환경 항목', terms.environment.map(([key, label, unit]) => [key, label + (unit ? ' (' + unit + ')' : '')]), envMetric)) + panel('생육 변화 추이 · ' + metric, `<p class="pm-muted">${e(c.name)} · 같은 표본·단위·측정법끼리 비교합니다.</p>` + (measurements.length > 1 ? `<p>첫 측정 ${e(measurements[0].value)} → 최근 ${e(measurements[measurements.length - 1].value)} ${e(unit)}</p>` : measurements.length === 1 ? '<p>측정 1건 · 변화량 판단을 위한 자료가 부족합니다.</p>' : '') + graph(measurements.map(r => ({ date: r.date, value: r.value, recordId: r.id })), metric, unit, true)) + panel('같은 기간의 ' + envLabel + ' 추이', `<p class="pm-muted">${e(houseName(c.houseId))} · 관측 시각 기준</p>` + graph(env.map(r => ({ date: r.date, value: r[envMetric], source: r.source + ' · ' + r.sensorId + ' · ' + r.time })), envLabel, env[0]?.units?.[envMetric] || defaultUnit || '단위 확인 전', false)) + '<p class="pm-notice">동시에 변한 기록만으로 생육 변화의 원인을 확정하지 않습니다.</p>';
  }
  function shippingStats(q) {
    if (q.get('cycleId') && !find('cycles',q.get('cycleId'))) return missing();
    const mode = q.get('mode') || 'period'; const c = find('cycles', q.get('cycleId')) || state.cycles.find(c=>!q.get('houseId')||c.houseId===q.get('houseId'));
    const units = [...new Set([...state.cycles.map(cycle => cycle.unit), ...state.shipments.map(shipment => shipment.unit)])]; const unit = q.get('unit') || c?.unit || '화분';
    const start = q.get('startDate') || store.today().slice(0, 4) + '-01-01'; const end = q.get('endDate') || store.today(); const cutoff = q.get('cutoff') || store.today();
    const filters = select('mode', '비교 방식', [['period', '기간별 실적'], ['target', '목표 대비 누적 실적']], mode) + select('houseId','온실명',options('houses'),q.get('houseId'),true) + select('cycleId', '작기명', scopedCycles(q), q.get('cycleId'), mode !== 'target') + (mode === 'target' ? field('cutoff', '실적 기준일', cutoff, 'date') : field('startDate', '출하 시작일', start, 'date') + field('endDate', '출하 종료일', end, 'date') + select('unit', '수량 단위', units.map(u => [u, u]), unit)) + field('variety','품종',q.get('variety'));
    if (mode === 'target') {
      if (!c || !ProducerInsights.matchesCycle(state,c,q)) return filterForm('shipping-stats', filters) + missing();
      const rows = state.shipments.filter(s => !s.cancelled && s.cycleId === c.id && s.date >= c.start && s.date <= cutoff);
      const total = rows.reduce((v, s) => v + ProducerManagementStore.stockQuantity(s), 0); const qty = c.targetQty;
      return filterForm('shipping-stats', filters) + '<p class="pm-notice">재배 단위로 확인한 차감 수량과 현재 출하 목표를 비교합니다. 출하 단위가 다른 기록은 입력한 차감 재배수량을 사용합니다. 한 달 실적을 전체 목표 달성률로 표시하지 않습니다.</p>' + kpis([['현재 목표', qty ? n(qty) + ' ' + c.unit : '목표 미등록'], ['누적 출하량', n(total) + ' ' + c.unit], ['현재 목표 대비', qty > 0 ? n(total / qty * 100) + '%' : '계산 불가']]) + panel('출하 목표와 실제 시기', details([['작기명', e(c.name)], ['출하 예정기간', date(c.targetStart) + ' ~ ' + date(c.targetEnd)], ['실적 집계 범위', date(c.start) + ' ~ ' + date(cutoff)], ['목표와 수량 차이', qty ? n(total - qty) + ' ' + e(c.unit) + ' (실제 − 목표)' : '계산 불가'], ['실제 첫 출하일', date(rows.map(r => r.date).sort()[0])], ['최근 출하일', date(rows.map(r => r.date).sort().at(-1))]]) + '<p class="pm-muted">진행 중 작기의 결과는 현재 기준입니다. 출하 기록만으로 전체 출하 완료·작기 종료를 확정하지 않습니다.</p>');
    }
    const rows = state.shipments.filter(s => !s.cancelled && s.unit === unit && ProducerInsights.matchesCycle(state,find('cycles',s.cycleId),q) && s.date >= start && s.date <= end);
    const months = {}; rows.forEach(s => { const month = s.date.slice(0, 7); months[month] = (months[month] || 0) + s.quantity; });
    const max = Math.max(1, ...Object.values(months));
    return filterForm('shipping-stats', filters) + kpis([['기간 출하량', n(rows.reduce((sum, s) => sum + s.quantity, 0)) + ' ' + unit], ['작기명', new Set(rows.map(s => s.cycleId)).size + '개'], ['실적 기간', start + ' ~ ' + end]]) + panel('월별 실제 출하량', Object.keys(months).length ? Object.entries(months).sort(([a],[b])=>a.localeCompare(b)*(q.get('sort')==='dateDesc'?-1:1)).map(([month, qty]) => `<div class="pm-bar"><span>${e(month)}</span><meter min="0" max="${max}" value="${qty}" aria-label="${e(month + ' 출하량 ' + qty + unit)}"></meter><strong>${n(qty)} ${e(unit)}</strong></div>`).join('') : '<p class="pm-empty">해당 기간에 등록된 실제 출하 기록이 없습니다.</p>') + panel('작기별 출하량', table(['작기명', '실제 출하량', '원자료'], [...new Set(rows.map(s => s.cycleId))].map(id => [e(cycleName(id)), n(rows.filter(s => s.cycleId === id).reduce((sum, s) => sum + s.quantity, 0)) + ' ' + e(unit), link('shipments', '출하 내역', { cycleId: id, startDate: start, endDate: end })]), '작기별 출하량'));
  }
  function account() {
    return panel('계정 정보', form('profile', field('loginId', '아이디', state.profile.loginId, 'text', false, 'readonly') + field('name', '이름', state.profile.name, 'text', true) + field('phone', '연락처 (선택)', state.profile.phone, 'tel')) + '<div class="pm-actions">' + button('password', '비밀번호 변경') + '</div>')
      + panel('연결된 농장','<h2 class="detail-section-title">연결된 농장</h2>' + table(['농장명','주소·위치','등록 온실','진행 작기'],state.farms.map(f => { const houses=state.houses.filter(h => h.farmId === f.id); return [link('farms-detail',f.name,{id:f.id}),e(f.address || '미등록'),link('houses',houses.length + '개',{farmId:f.id}),String(state.cycles.filter(c => c.status !== 'ended' && houses.some(h => h.id === c.houseId)).length) + '개']; }),'회원 연결 농장',{indexed:true}) + '<div class="pm-actions">' + button('farms-add','농장 등록') + '</div>')
      + panel('농업경영체 인증', '<h2 class="detail-section-title">농업경영체 인증</h2><p>인증 상태 <span class="pm-badge closed">미인증</span></p><details class="pm-disclosure" ' + (route().q.get('section') === 'verification' ? 'open' : '') + '><summary>인증 정보 입력</summary><form data-kind="entity-verification" id="entityVerificationForm" novalidate><div class="pm-form-grid">' + field('entityNumber','농업경영체 등록번호',state.profile.entityNumber,'text',true,'maxlength="50" autocomplete="off"') + field('entityRepresentative','경영주명',state.profile.entityRepresentative,'text',true,'maxlength="50" autocomplete="off"') + '</div><p id="entityVerificationStatus" class="pm-notice" role="status" hidden></p><div class="pm-actions"><button class="btn primary" type="submit">인증 요청</button></div></form></details>');
  }
  function password() {
    const pass = (name, label, autocomplete) => `<label class="pm-field search-row pm-wide"><span class="search-label">${label}</span><div class="pm-password-field"><input type="password" name="${name}" id="${name}" autocomplete="${autocomplete}" required><button type="button" class="btn" data-password="${name}" aria-pressed="false">보기</button></div></label>`;
    return panel('비밀번호 변경', form('password', pass('currentPassword', '현재 비밀번호', 'current-password') + pass('newPassword', '새 비밀번호', 'new-password') + pass('confirmPassword', '새 비밀번호 확인', 'new-password'), '', '확인'));
  }
  function terminology(q) {
    const category = q.get('category') || '';
    const search = (q.get('search') || '').trim();
    const categories = [...new Set(terms.definitions.map(row => row[0]))];
    const rows = terms.definitions.filter(row => (!category || row[0] === category) && (!search || row.slice(1, 3).join(' ').includes(search)));
    return '<p class="pm-notice">자료의 표기를 화훼 재배 기록에 맞게 구분했습니다. 생육조사 항목·단위·조사 방법은 실제 품종과 농가 기준을 따릅니다.</p>' + filterForm('terminology', select('category', '구분', categories.map(v => [v, v]), category, true) + field('search', '용어·설명 검색', search)) + panel('용어와 입력 기준', table(['구분', '표준 용어', '뜻·입력 기준', '참고'], rows.map(row => row.map(e)), '표준 용어'));
  }
  function confirmPage(q) {
    const type = q.get('entity'); const item = ['farms', 'houses', 'cycles', 'records', 'shipments'].includes(type) && find(type, q.get('id'));
    if (!item) return missing();
    return panel(type === 'shipments' ? '출하 취소 확인' : '삭제 확인', `<p>${e(item.name || item.text || item.recipient)} 기록을 ${type === 'shipments' ? '취소' : '삭제'}합니다.</p><p class="pm-muted">연결 이력이 있는 농장·온실·작기는 삭제할 수 없습니다. 출하는 취소 이력을 보존하고 잔량에 반영합니다.</p>` + form('remove', `<input type="hidden" name="entity" value="${e(type)}"><input type="hidden" name="entryId" value="${e(item.id)}">` + textarea('reason', type === 'shipments' ? '취소 사유' : '확인 메모', '', type === 'shipments'), '', type === 'shipments' ? '출하 취소 확정' : '삭제 확정'));
  }
  const missing = () => '<p class="pm-empty">기록을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.</p>';
  function render() {
    store = ProducerManagementStore.create(window.localStorage);
    try { store.preparePrototype(); store.preparePlanning(); store.prepareJournalEnvironment(); } catch (_) { message='공통 예시 데이터를 추가하지 못했습니다. 기존 기록은 유지됩니다. 브라우저 저장 공간을 확인해 주세요.'; }
    state = store.get(); dirty = false; lastLocation = location.href;
    const { view, q } = route(); let body;
    const base = view.replace(/-(add|detail)$/, '');
    if (view === 'home') body = home(q);
    else if (['farms', 'houses'].includes(base)) body = view.endsWith('-add') ? masterForm(base, q) : view.endsWith('-detail') ? masterDetail(base, q) : masterList(base, q);
    else if (base === 'cycles') body = view.endsWith('-add') ? cycleForm(q) : view.endsWith('-detail') ? cycleDetail(q) : cycleList(q);
    else if (base === 'journal') body = view.endsWith('-add') ? journalForm(q) : view.endsWith('-detail') ? journalDetail(q) : journalList(q);
    else if (base === 'shipments') body = view.endsWith('-add') ? shipmentForm(q) : view.endsWith('-detail') ? shipmentDetail(q) : shipmentList(q);
    else if (view === 'decision-stats') body = insights().render(q);
    else if (view === 'plan-task') body = planner().taskForm(q);
    else if (view === 'plan-stage') body = planner().stageForm(q);
    else if (view === 'plan-guide') body = planner().guideForm(q);
    else body = ({ privacy, 'journal-day':()=>journalDay(q), 'sensor-data':()=>sensorData(q), sitemap: () => sitemap(q), comparison: () => comparison(q), 'shipping-stats': () => shippingStats(q), account, password, terminology: () => terminology(q), quantity: () => quantity(q), confirm: () => confirmPage(q) }[view] || (() => '<p class="pm-empty">이 화면은 현재 사이트맵에 포함되지 않습니다.</p>'))();
    const additions = { cycles: '작기 등록', journal: '일지 작성', shipments: '출하 등록', farms: '농장 등록', houses: '온실 등록' };
    const detailCycle = view === 'cycles-detail' ? find('cycles',q.get('id')) : null;
    const heading = detailCycle ? '<div class="pm-cycle-title"><p>작기 상세</p><h1 class="page-title" tabindex="-1">' + e(detailCycle.name) + '</h1></div>' : '<h1 class="page-title" tabindex="-1">' + e(currentTitle()) + '</h1>';
    $('#managementContent').innerHTML = `<nav class="breadcrumb pm-path" aria-label="현재 위치">${link('home', '홈')}<span aria-hidden="true">&gt;</span><span>${e(base === 'farms' ? '내 정보/농장정보' : titles[base] || currentTitle())}</span></nav><div class="pm-heading">${heading}${detailCycle ? button('cycles','목록으로 돌아가기') : ''}${additions[view] ? button(view + '-add', additions[view], view === 'cycles' && find('houses',q.get('houseId')) ? {houseId:q.get('houseId')} : {}, true) : ''}</div>${store.notice ? '<p class="pm-error">' + e(store.notice) + '</p>' : ''}${message ? '<p class="pm-success" role="status">' + e(message) + '</p>' : ''}<div id="leaveNotice" class="pm-leave" role="alert" hidden>저장하지 않은 입력이 있습니다.<div class="pm-actions"><button type="button" class="btn" data-stay>계속 작성</button><button type="button" class="btn" data-discard>저장하지 않고 이동</button></div></div>${body}`;
    message = ''; compactLayout(view); finalDataLayout(view); nav(); if (view === 'sitemap' && !q.get('task')) filterSitemap(q.get('search')); document.title = (detailCycle ? detailCycle.name + ' · 작기 상세' : currentTitle()) + ' | 모두의온실';
    $('#managementContent h1').focus({ preventScroll: true }); window.scrollTo(0, 0);
    if (view === 'journal-day' && q.get('section') === 'automation') $('#automationEvents')?.scrollIntoView({block:'start'});
  }
  // Keep all fields and records available; only the initial reading order is compacted.
  function tabPanels(items, label, initial = 0) {
    const wrap = document.createElement('div'); wrap.className = 'pm-tabset';
    const bar = document.createElement('div'); bar.className = 'pm-local-tabs'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', label);
    wrap.append(bar);
    const prefix = 'tabs-' + label.replace(/[^a-z가-힣]/gi, '');
    items.forEach(([title, pane], i) => {
      const id = prefix + '-' + i;
      const tab = document.createElement('button'); tab.type = 'button'; tab.id = id; tab.textContent = title;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', id + '-pane');
      pane.id = id + '-pane'; pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', id); pane.tabIndex = 0;
      const activate = () => { [...bar.children].forEach((button, j) => { button.setAttribute('aria-selected', String(i === j)); button.tabIndex = i === j ? 0 : -1; items[j][1].hidden = i !== j; }); };
      tab.addEventListener('click', activate);
      tab.addEventListener('keydown', event => {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!offset && !['Home', 'End'].includes(event.key)) return;
        event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (i + offset + items.length) % items.length;
        bar.children[next].click(); bar.children[next].focus();
      });
      bar.append(tab); wrap.append(pane);
    });
    bar.children[initial].click(); return wrap;
  }
  function fold(element, title) {
    const disclosure = document.createElement('details'); disclosure.className = 'pm-disclosure';
    const summary = document.createElement('summary'); summary.textContent = title; disclosure.append(summary);
    element.before(disclosure); disclosure.append(element); return disclosure;
  }
  function compactLayout(view) {
    const content = $('#managementContent'); content.dataset.screen = view;
    if (view.endsWith('-add') && !content.querySelector('#managementForm')) return;
    ProducerInsights.enhanceFilters(content,route().q,{select});
    if (/^farms(?:-|$)/.test(view) || view === 'account') {
      const tabs = document.createElement('nav'); tabs.className = 'pm-tabs'; tabs.setAttribute('aria-label', '내 정보와 농장정보');
      tabs.innerHTML = link('account', '내 정보') + link('farms', '농장정보');
      tabs.children[view === 'account' ? 0 : 1].setAttribute('aria-current', 'page');
      content.querySelector('.pm-heading').after(tabs);
    }
    const panels = [...content.querySelectorAll(':scope > .pm-panel')];
    if (view === 'home' && !content.querySelector('.pm-home-sample')) {
      panels.forEach((panel, i) => {
        if (i === 0) panel.querySelectorAll('tr').forEach(row => { [...row.children].filter((cell, index) => index === 1 || index === 3).forEach(cell => cell.remove()); });
        // The home screen is a preview. Full lists retain all records and pagination.
        const rows = [...panel.querySelectorAll('tbody tr')]; rows.slice(2).forEach(row => row.remove());
        panel.querySelector('.pm-pagination')?.remove();
        const result = panel.querySelector('.result-info'); if (result) result.innerHTML = '<span>최근·현재 기록 최대 2건 미리보기</span>';
        if (i === 1) panel.querySelector('.btn')?.remove();
        const more = document.createElement('div'); more.className = 'pm-preview-more';
        more.innerHTML = link(['cycles', 'houses', 'journal'][i], ['작기 전체보기', '온실 전체보기', '일지 전체보기'][i]); panel.append(more);
      });
      if (panels.length === 3) {
        const layout = document.createElement('div'); layout.className = 'pm-dashboard-grid'; panels[0].before(layout);
        layout.append(panels[0], tabPanels([['온실 내부환경', panels[1]], ['최근 재배일지', panels[2]]], '영농요약'));
      }
    }
    if (view === 'comparison' && panels.length === 2) {
      panels.forEach(panel => { const intro = document.createElement('div'); intro.className = 'pm-chart-intro'; panel.querySelector('h2').after(intro); [...panel.children].filter(el => el.tagName === 'P').forEach(p => intro.append(p)); });
      const grid = document.createElement('div'); grid.className = 'pm-chart-grid'; panels[0].before(grid); grid.append(...panels);
    }
    if (view === 'journal' && panels[1]) fold(panels[1], '연결된 출하 기록 보기');
    if (view === 'cycles-detail') {
      const panes = [...content.querySelectorAll('.pm-cycle-detail > [data-cycle-pane]')];
      if (panes.length) {
        const position = document.createElement('div'); panes[0].before(position);
        const initial = Math.max(0,panes.findIndex(pane => pane.dataset.cyclePane === route().q.get('tab')));
        position.replaceWith(tabPanels(panes.map(pane => [pane.getAttribute('aria-label'),pane]),'작기상세',initial));
      }
    }
    if (view === 'cycles-add' && content.querySelector('#managementForm')) {
      const grid = content.querySelector('#managementForm > .pm-form-grid');
      const primary = document.createElement('div'); primary.className = 'pm-form-grid';
      const secondary = document.createElement('div'); secondary.className = 'pm-form-grid';
      [...grid.children].forEach(field => { const name = field.querySelector('[name]')?.name; (['plantingDate', 'targetStart', 'targetEnd', 'targetQty', 'targetGrade', 'targetSpecification', 'targetRecipient', 'status', 'endDate', 'endNote', 'note'].includes(name) ? secondary : primary).append(field); });
      grid.replaceWith(tabPanels([['재배 기본정보', primary], ['정식·출하 목표·작기 종료', secondary]], '작기입력', route().q.get('end') || route().q.get('section') === 'target' ? 1 : 0));
    }
    if (view === 'journal-add') {
      const grid = content.querySelector('#managementForm > .pm-form-grid');
      const optional = document.createElement('div'); optional.className = 'pm-form-grid';
      [...grid.children].filter(field => field.querySelector('[name=followup],[name=photoFile],[name=removePhoto]')).forEach(field => optional.append(field));
      grid.append(optional); const disclosure = fold(optional, '사진·다음 확인 메모 (선택)'); disclosure.classList.add('pm-wide');
      if (route().q.get('id') && (content.querySelector('[name=followup]').value || content.querySelector('[name=removePhoto]'))) disclosure.open = true;
    }
    if (view === 'shipments-add') {
      const grid = content.querySelector('#managementForm > .pm-form-grid');
      const optional = document.createElement('div'); optional.className = 'pm-form-grid'; optional.id='shipmentOptionalFields';
      grid.append(optional); const disclosure = fold(optional, '수확일·금액 (선택)'); disclosure.classList.add('pm-wide');
      if (route().q.get('id')) disclosure.open = true;
      const cycleField=grid.querySelector('[name=cycleId]').closest('label');cycleField.classList.add('pm-wide','pm-shipment-project');
    }
  }
  function finalExtraFields(config, entry) {
    return config.map(([key, label, type = 'text']) => field(key, label + ' (선택)', entry[key], type, false, type === 'number' ? 'min="0" step="any"' : '')).join('');
  }
  function finalDisclosure(title, html, open = false) {
    return `<details class="pm-disclosure pm-wide" ${open ? 'open' : ''}><summary>${e(title)}</summary><div class="pm-form-grid">${html}</div></details>`;
  }
  function syncShipmentDraft(force=false){
    const form=$('#managementForm[data-kind=shipments]');if(!form)return;
    const c=find('cycles',form.elements.cycleId.value);if(!c)return;
    const next=ProducerShipment.defaults(c);const prior=form.dataset.shipmentDraftDefaults?JSON.parse(form.dataset.shipmentDraftDefaults):{};
    const current=Object.fromEntries(['recipient','specification'].map(key=>[key,form.elements[key].value]));
    const touched=Object.fromEntries(['recipient','specification'].map(key=>[key,form.elements[key].dataset.userEdited==='true']));
    const values=force?next:!form.elements.id.value?ProducerShipment.draftValues(current,prior,next,touched):current;
    for(const key of ['recipient','specification']){form.elements[key].value=values[key];if(force)form.elements[key].dataset.userEdited='false';}
    form.dataset.shipmentDraftDefaults=JSON.stringify(next);
    $('#shipmentDraftSource').textContent=form.elements.id.value?'저장된 거래처·규격을 확인하고 정정합니다.':'거래처·규격은 작기 목표에서 초안으로 불러오며 수정할 수 있습니다.';
  }
  function syncShipmentProjection(){
    const form=$('#managementForm[data-kind=shipments]');const output=$('#shipmentProjection');if(!form||!output)return;
    const c=find('cycles',form.elements.cycleId.value);if(!c)return;
    output.innerHTML=shipping().preview(c,form.elements.id.value,{quantity:form.elements.quantity.value,unit:form.elements.shippingUnit.value,stockQuantity:form.elements.stockQuantity.value});
  }
  function syncShippingUnit(changedCycle = false) {
    const form = $('#managementForm[data-kind=shipments]'); if (!form) return;
    const c = find('cycles', form.elements.cycleId.value); if (!c) return;
    const unit = form.elements.shippingUnit;
    if (![...unit.options].some(option => option.value === c.unit)) unit.add(new Option(c.unit, c.unit));
    if (changedCycle && unit.value === form.dataset.stockUnit) unit.value = c.unit;
    form.dataset.stockUnit = c.unit;
    const stock = form.elements.stockQuantity; const different = unit.value !== c.unit;
    stock.closest('label').hidden = !different; stock.required = different;
    stock.closest('label').querySelector('.search-label').textContent = '차감 재배수량 (' + c.unit + ') *';
    const model=ProducerShipment.production(state,c.id,form.elements.id.value);
    $('#shipmentBalance').textContent='현재 재배수량 '+stockText(c)+(model.replacing?' · 이번 정정 가능 수량 '+n(model.available)+' '+c.unit:'')+' · 출하 단위가 다르면 차감 재배수량을 입력합니다.';
    const opened=$('#shipmentContext details')?.open;$('#shipmentContext').innerHTML=shipmentContext(c,form.elements.id.value);if(opened)$('#shipmentContext details').open=true;
    syncShipmentDraft();
    syncShipmentGrades();
  }
  function syncShipmentGrades() {
    const form = $('#managementForm[data-kind=shipments]'); if (!form?.elements.gradeMode) return;
    syncShipmentProjection();
    const mode = form.elements.gradeMode.value;
    for (const [id, active] of [['shipmentSingleGrade', mode === 'single'], ['shipmentGradeBreakdown', mode === 'multiple']]) {
      const group = document.getElementById(id); group.hidden = !active;
      group.querySelectorAll('input,select').forEach(control => { control.disabled = !active; });
    }
    form.elements.grade.required = mode === 'single';
    const legacy = $('#shipmentLegacyGrade'); if (legacy) legacy.hidden = mode !== 'multiple';
    if (mode !== 'multiple') return;
    const controls = [...form.querySelectorAll('[name^=gradeQuantity]')];
    const valid = controls.every(control => !control.validity.badInput && (control.value === '' || (Number.isFinite(Number(control.value)) && Number(control.value) >= 0)));
    const sum = controls.reduce((total, control) => total + Number(control.value), 0);
    const total = form.elements.quantity.value; const unit = form.elements.shippingUnit.value;
    const difference = Number(total) - sum;
    const status = $('#shipmentGradeTotal');
    status.textContent = valid ? '등급 합계 ' + gradeNumber(sum) + ' ' + unit + ' / 총출하량 ' + (total === '' ? '미입력' : gradeNumber(Number(total)) + ' ' + unit) + ' / 차이 ' + (total === '' ? '계산 대기' : gradeNumber(Math.abs(difference) < 0.000001 ? 0 : difference) + ' ' + unit) : '등급별 수량은 0 이상의 수로 입력해 주세요.';
    status.dataset.match = valid && total !== '' && Math.abs(difference) <= 0.000001 ? 'true' : 'false';
  }
  function finalDataLayout(view) {
    const content = $('#managementContent'); const q = route().q;
    if (view.endsWith('-add') && !content.querySelector('#managementForm')) return;
    if (view === 'houses-add') {
      const entry = find('houses', q.get('id')) || {};
      content.querySelector('#managementForm > .pm-form-grid').insertAdjacentHTML('beforeend', finalDisclosure('온실 구조·치수·배지 (선택)', finalExtraFields(terms.houseFields, entry)));
    }
    if (view === 'houses-detail') {
      const detail = content.querySelector('.pm-greenhouse-detail');
      if (detail) {
        const slot = document.createElement('div'); detail.append(slot);
        slot.replaceWith(tabPanels([['온실 정보',detail.querySelector('.pm-greenhouse-info')],['환경 데이터',detail.querySelector('.pm-greenhouse-environment')]], '온실상세', q.get('tab') === 'environment' ? 1 : 0));
      }
    }
    if (view === 'cycles-add') {
      const entry = find('cycles', q.get('id')) || {};
      content.querySelector('#managementForm [role=tabpanel]:last-child').insertAdjacentHTML('beforeend', finalDisclosure('묘 구입처·재배면적·수확일 (선택)', finalExtraFields(terms.cycleFields, entry)));
      content.querySelector('#managementForm [role=tabpanel]').insertAdjacentHTML('beforeend', finalDisclosure('생육 현황 (선택)', field('displayProgress','재배 진행률 (%)',entry.displayProgress,'number',false,'min="0" max="100" step="any"') + field('flowerStalks','평균 꽃대 수 (개/주)',entry.flowerStalks,'number',false,'min="0" step="any"') + field('flowering','평균 개화율 (%)',entry.flowering,'number',false,'min="0" max="100" step="any"') + field('color','화색 메모',entry.color)));
    }
    if (view === 'journal-add') {
      const entry = find('records', q.get('id')) || {};
      content.querySelector('.pm-measurement > .pm-form-grid').insertAdjacentHTML('beforeend', field('growthWeek', '생육주차 (기준 확인 후 입력)', entry.growthWeek, 'number', false, 'min="0" step="1"') + field('stemNumber', '꽃대 번호 (꽃대별 측정 시)', entry.stemNumber));
      content.querySelector('#managementForm > .pm-form-grid').insertAdjacentHTML('beforeend', finalDisclosure('재배작업 상세 기록 (선택)', select('shading', '차광 여부', [['', '기록 없음'], ['1', '차광막 닫기 (1)'], ['0', '차광막 걷기 (0)']], entry.shading) + finalExtraFields(terms.workFields, entry)));
    }
    if (view === 'journal-detail') {
      const entry = find('records', q.get('id')); if (entry) content.insertAdjacentHTML('beforeend', '<details class="pm-disclosure" open><summary>생육주차·꽃대·재배작업 상세 보기</summary>' + details([['생육주차', e(entry.growthWeek ?? '미등록')], ['꽃대 번호', e(entry.stemNumber ?? '미등록')], ['차광 여부', String(entry.shading) === '1' ? '닫기 (1)' : String(entry.shading) === '0' ? '걷기 (0)' : '기록 없음'], ...terms.workFields.map(([key, label]) => [label, e(entry[key] ?? '미등록')])]) + '</details>');
    }
    if (view === 'shipments-add') {
      const entry = find('shipments', q.get('id')) || {};
      const form = $('#managementForm'); const cycle = find('cycles', form.elements.cycleId.value);
      const units = [...new Set([entry.unit || cycle.unit, cycle.unit, '본', '화분', '주', '단', '속', 'kg', '박스'])];
      form.elements.quantity.closest('label').insertAdjacentHTML('afterend', select('shippingUnit', '출하 단위', units.map(unit => [unit, unit]), entry.unit || cycle.unit, false, true) + field('stockQuantity', '차감 재배수량', entry.stockQuantity ?? '', 'number', false, 'min="1" step="1"'));
      form.elements.quantity.min = '0.000001'; form.elements.quantity.step = 'any';
      const optional = $('#shipmentOptionalFields');
      optional.insertAdjacentHTML('beforeend', field('harvestDate', '실제 수확일', entry.harvestDate, 'date') + field('totalAmount', '총금액 (원)', entry.totalAmount, 'number', false, 'min="0" step="any"'));
      const grid=form.querySelector(':scope > .pm-form-grid');
      const actual=document.createElement('fieldset');actual.className='pm-shipment-entry pm-wide';
      const legend=document.createElement('legend');legend.textContent='2. 이번 출하 정보';actual.append(legend);
      const fields=document.createElement('div');fields.className='pm-form-grid';actual.append(fields);
      [...grid.children].filter(child=>!child.classList.contains('pm-shipment-project')&&!['shipmentContext','shipmentBalance'].includes(child.id)).forEach(child=>fields.append(child));
      fields.insertAdjacentHTML('beforeend','<div class="pm-shipment-projection pm-wide" id="shipmentProjection" role="status" aria-live="polite" aria-atomic="true"></div>');grid.append(actual);
      syncShippingUnit();
    }

    if (view === 'terminology') content.querySelector('.pm-notice').insertAdjacentHTML('beforeend', '<br>최종 항목 기준: <a class="pm-source-link" target="_blank" rel="noopener noreferrer" href="' + e(terms.finalSource.url) + '">데이터 정리본 · 261102 (79개 항목)</a>. 아래 이전 문헌과 구분해 적용합니다.');
  }
  async function photoData(file) {
    if (!file?.size) return null;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 600 * 1024) throw new Error('사진은 PNG/JPEG/WebP 600KB 이하만 첨부할 수 있습니다.');
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('사진을 읽을 수 없습니다.')); reader.readAsDataURL(file); });
  }
  document.addEventListener('click', event => {
    const preset=event.target.closest('[data-filter-range]');
    if(preset){const filter=preset.closest('form');const end=store.today();filter.elements.endDate.value=end;filter.elements.startDate.value=preset.dataset.filterRange==='today'?end:preset.dataset.filterRange==='week'?ProducerPlanning.shift(end,-6):end.slice(0,7)+'-01';filter.requestSubmit();return;}
    if(event.target.closest('[data-shipment-defaults]')){syncShipmentDraft(true);dirty=true;return;}
    const guide=event.target.closest('[data-plan-guide]');
    if(guide){
      try{store.acceptGuide(guide.dataset.planCycle,guide.dataset.planGuide);message='가이드를 작업계획에 추가했습니다.';}catch(error){message=error.message;}
      go('cycles-detail',{id:guide.dataset.planCycle,tab:'plan'});return;
    }
    if (event.target.closest('[data-sitemap-clear]')) { const input=$('[data-sitemap-search]');input.value='';filterSitemap('',true);input.focus();return; }
    const logout = event.target.closest('[data-logout]');
    if (logout) {
      event.preventDefault(); const leave = () => { dirty=false; window.location.assign(logout.href); };
      if (dirty) { pending=leave; $('#leaveNotice').hidden=false; $('#leaveNotice').scrollIntoView({block:'nearest'}); } else leave();
      return;
    }
    const houseTab = event.target.closest('[data-home-house]');
    if (houseTab) { go('home', {houseId: houseTab.dataset.homeHouse}); document.getElementById('homeHouse-' + houseTab.dataset.homeHouse)?.focus(); return; }
    if (!event.target.closest('.pm-nav-item')) document.querySelectorAll('.pm-nav-item details[open]').forEach(menu => { menu.open = false; });
    const anchor = event.target.closest('a[data-management-link],a[data-workspace-view]');
    if (anchor && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); const url = new URL(anchor.href); const params = Object.fromEntries(url.searchParams); const view = params.view || 'home'; delete params.view; go(view, params);
      document.querySelectorAll('#header details[open]').forEach(menu => { menu.open = false; }); return;
    }
    if (event.target.closest('[data-back]')) back();
    const reset = event.target.closest('[data-reset-query]');
    if (reset) {
      const q = route().q;
      const params = reset.dataset.resetQuery === 'home' ? {source:'records'} : reset.dataset.resetQuery === 'houses-detail' ? {...Object.fromEntries(['id','sampleHouse','cycleId'].filter(key => q.has(key)).map(key => [key,q.get(key)])),tab:'environment'} : {};
      go(reset.dataset.resetQuery,params);
    }
    if (event.target.closest('[data-stay]')) { pending = null; $('#leaveNotice').hidden = true; }
    if (event.target.closest('[data-discard]')) { dirty = false; const next = pending; pending = null; if (next) next(); }
    const pass = event.target.closest('[data-password]');
    if (pass) { const input = document.getElementById(pass.dataset.password); input.type = input.type === 'password' ? 'text' : 'password'; pass.textContent = input.type === 'password' ? '보기' : '숨기기'; pass.setAttribute('aria-pressed', String(input.type === 'text')); }
  });
  document.addEventListener('input', event => {
    if (event.target.matches('[data-sitemap-search]')) filterSitemap(event.target.value,true);
    if (event.target.closest('#managementForm')) dirty = true;
    if (event.target.closest('#managementForm[data-kind=shipments]')) { if(['recipient','specification'].includes(event.target.name))event.target.dataset.userEdited='true'; if (['quantity','stockQuantity'].includes(event.target.name) || event.target.name.startsWith('gradeQuantity')) syncShipmentGrades(); }
  });
  document.addEventListener('change', event => {
    const queryForm=event.target.closest('.pm-filters');
    if(queryForm&&event.target.name==='houseId'&&queryForm.elements.cycleId){const selectCycle=queryForm.elements.cycleId;const previous=selectCycle.value;const choices=state.cycles.filter(c=>!event.target.value||c.houseId===event.target.value);selectCycle.innerHTML='<option value="">'+(selectCycle.required?'작기를 선택해 주세요':'전체')+'</option>'+choices.map(c=>'<option value="'+e(c.id)+'">'+e(c.name)+'</option>').join('');selectCycle.value=choices.some(c=>c.id===previous)?previous:'';}
    if(queryForm&&event.target.name==='sort'){queryForm.requestSubmit();return;}
    if (event.target.matches('[data-page-size]')) { const q=route().q; const params=Object.fromEntries(q); params[event.target.dataset.sizeKey]=event.target.value; delete params[event.target.dataset.pageSize]; go(route().view,params); return; }
    if (event.target.closest('#managementForm')) dirty = true;
    if (event.target.closest('#managementForm[data-kind=shipments]') && ['cycleId', 'shippingUnit'].includes(event.target.name)) syncShippingUnit(event.target.name === 'cycleId');
    if (event.target.name === 'homeCycleId') { const c = find('cycles',event.target.value); if (c) go('home',{houseId:c.houseId,cycleId:c.id}); }
    if (event.target.name === 'cycleId' && $('#journalCycleContext')) { const c=find('cycles',event.target.value); $('#journalCycleContext').innerHTML=cycleReference(c); $('#journalPlanFields').innerHTML=planner().recordFields(c); }
    if (event.target.name === 'gradeMode') syncShipmentGrades();

  });
  document.addEventListener('submit', async event => {
    const formEl = event.target;
    if (!formEl.matches('[data-kind],[data-query]')) return;
    event.preventDefault();
    if (!formEl.checkValidity()) {
      const invalid = formEl.querySelector(':invalid');
      const pane = invalid?.closest('[role=tabpanel]');
      if (pane?.hidden) document.getElementById(pane.getAttribute('aria-labelledby')).click();
      let ancestor = invalid?.parentElement;
      while (ancestor && ancestor !== formEl) { if (ancestor.tagName === 'DETAILS') ancestor.open = true; ancestor = ancestor.parentElement; }
      invalid?.reportValidity(); return;
    }
    const values = Object.fromEntries(new FormData(formEl));
    if (formEl.dataset.kind === 'sitemap-target') {
      const current=ProducerManagementStore.create(window.localStorage).get();
      const destination=ProducerSiteMap.destination(current,values.task,values.targetId);
      if (!destination) { const box=$('#sitemapTargetError');box.hidden=false;box.textContent='선택한 기록이 변경되었습니다. 전체 메뉴에서 다시 선택해 주세요.';return; }
      go(destination.view,destination.params);return;
    }
    if (formEl.dataset.kind === 'entity-verification') {
      const status = $('#entityVerificationStatus'); status.hidden = false;
      status.textContent = '현재 인증을 진행할 수 없습니다.';
      return;
    }
    if (formEl.dataset.query) {
      if (formEl.dataset.query === 'home') values.source = 'records';
      if (values.startDate && values.endDate && values.startDate > values.endDate) { message = '시작일은 종료일보다 늦을 수 없습니다.'; render(); return; }
      go(formEl.dataset.query, values); return;
    }
    const submit = formEl.querySelector('[type=submit]'); submit.disabled = true;
    try {
      const type = formEl.dataset.kind; let destination = ''; let entryId;
      if (type === 'password') {
        if (values.newPassword !== values.confirmPassword) throw new Error('새 비밀번호와 확인 값이 일치하지 않습니다.');
        formEl.reset(); dirty = false; $('#formError').hidden = true;
        const note = document.createElement('p'); note.className = 'pm-notice'; note.setAttribute('role', 'status'); note.textContent = '입력 내용을 확인했습니다.'; formEl.prepend(note); return;
      }
      if (['farms', 'houses'].includes(type)) {
        entryId = store.save(type, { id: values.id, name: values.name.trim(), active: values.active === 'true', ...(type === 'farms' ? { address: values.address.trim(), note: values.note.trim() } : { farmId: values.farmId, zone: values.zone.trim(), area: values.area, ...Object.fromEntries(terms.houseFields.map(([key]) => [key, values[key] || ''])) }) }); destination = type + '-detail';
      } else if (type === 'cycles') {
        const {returnTo,returnHouseId,...cycleValues} = values;
        const existingCycle = find('cycles',values.id); const previous = cycleData(existingCycle);
        cycleValues.note = previous && values.note.trim() === previous.noteText ? existingCycle.note : (previous?.notePrefix || '') + values.note.trim();
        for (const key of ['displayProgress','flowerStalks','flowering']) cycleValues[key] = values[key] === '' ? '' : Number(values[key]);
        entryId = store.save('cycles', { ...cycleValues, initial: Number(values.initial), targetQty: values.targetQty === '' ? '' : Number(values.targetQty), ...(values.status === 'active' ? { endDate: '', endNote: '' } : {}) }); destination = 'cycles-detail';
        if(route().q.get('section')==='target'){dirty=false;message='출하 목표를 저장했습니다.';go('cycles-detail',{id:entryId,tab:'plan'});return;}
        if (returnTo === 'house') { dirty = false; message = '작기를 등록했습니다.'; go('houses-detail',{id:values.houseId,cycleId:entryId}); return; }
      } else if (type === 'records') {
        const existing = find('records', values.id); const photo = await photoData(values.photoFile);
        entryId = store.save('records', { ...Object.fromEntries([...terms.workFields.map(([key]) => key), 'shading', 'growthWeek', 'stemNumber'].map(key => [key, values[key] || ''])), id: values.id, cycleId: values.cycleId, planTaskId:values.planTaskId || '', planOutcome:values.planTaskId ? values.planOutcome : '', date: values.date, time:values.time || '', inputSource:'manual', authorName:existing?.authorName || state.profile.name, authorId:existing?.authorId || state.profile.loginId, type: values.type, text: values.text.trim(), metric: terms.canonicalMetric(values.metric), sourceMetric: existing?.sourceMetric || existing?.metric || values.metric.trim(), value: values.value === '' ? '' : Number(values.value), measureUnit: values.measureUnit.trim(), sample: values.sample.trim(), method: values.method.trim(), followup: values.followup.trim(), photo: photo || (values.removePhoto === 'yes' ? '' : existing?.photo || ''), cancelled: false }); destination = 'journal-detail';
      } else if (type === 'shipments') {
        const c = find('cycles', values.cycleId);
        const existing = find('shipments', values.id);
        const breakdown = values.gradeMode === 'multiple' ? Object.keys(values).filter(key => /^gradeName\d+$/.test(key)).map(key => key.slice(9)).filter(i => values['gradeQuantity' + i] !== '').map(i => ({ grade: values['gradeName' + i].trim(), quantity: Number(values['gradeQuantity' + i]) })) : [];
        if (values.gradeMode === 'multiple' && !breakdown.length) throw new Error('여러 등급별 수량을 선택했다면 등급별 출하 수량을 입력해 주세요.');
        // 기존에 단일 등급과 수량 내역이 함께 저장된 기록은 정정 시에도 보존합니다.
        const grade = values.gradeMode === 'single' ? values.grade.trim() : values.gradeMode === 'multiple' && existing?.gradeBreakdown?.length ? shipmentGrade(existing) : '';
        entryId = store.save('shipments', { id: values.id, cycleId: values.cycleId, date: values.date, recipient: values.recipient.trim(), specification: values.specification.trim(), grade, quantity: Number(values.quantity), unit: values.shippingUnit || c?.unit, stockQuantity: (values.shippingUnit || c?.unit) === c?.unit ? Number(values.quantity) : (values.stockQuantity === '' ? '' : Number(values.stockQuantity)), totalAmount: values.totalAmount === '' ? '' : Number(values.totalAmount), harvestDate: values.harvestDate || '', gradeBreakdown: breakdown, note: values.note.trim(), cancelled: false }); destination = 'shipments-detail';
      } else if (type==='planGuide') {
        store.saveGuideRules(values.cycleId,values);dirty=false;message='가이드 기준을 저장했습니다.';go('cycles-detail',{id:values.cycleId,tab:'plan'});return;
      } else if (['planTasks','planStages'].includes(type)) {
        entryId=store.save(type,{...values,...(type==='planTasks'?{quantity:values.quantity===''?'':Number(values.quantity)}:{})});
        dirty=false;message='계획을 저장했습니다.';go('cycles-detail',{id:values.cycleId,tab:'plan'});return;
      } else if (type === 'quantity') {
        store.adjust({ cycleId: values.cycleId, date: values.date, type: values.type, quantity: Number(values.quantity) * (['폐기', '정정 감소'].includes(values.type) ? -1 : 1), note: values.note.trim() }); entryId = values.cycleId; destination = 'cycles-detail';
      } else if (type === 'remove') {
        store.remove(values.entity, values.entryId, values.reason); destination = ({ records: 'journal', shipments: 'shipments' }[values.entity]) || values.entity;
      } else if (type === 'profile') { store.profile(values); destination = 'account'; }
      dirty = false; message = type === 'remove' ? '삭제·취소 처리했습니다.' : '변경 내용을 저장했습니다.';
      go(destination, entryId ? { id: entryId } : {});
    } catch (error) { fail(error.name === 'QuotaExceededError' ? '브라우저 저장 공간이 부족합니다. 사진 용량을 줄여 다시 저장해 주세요. 기존 기록은 유지됩니다.' : error.message); }
    finally { if (submit.isConnected) submit.disabled = false; }
  });
  window.addEventListener('storage', event => { if (event.key === ProducerManagementStore.KEY && !dirty) render(); });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('popstate', () => {
    if (dirty) {
      const target = location.href;
      history.pushState({}, '', lastLocation);
      pending = () => { history.replaceState({}, '', target); render(); };
      $('#leaveNotice').hidden = false;
      $('#leaveNotice').scrollIntoView({ block: 'nearest' });
      return;
    }
    render();
  });
  document.addEventListener('keydown', event => {
    const houseTab = event.target.closest('[data-home-house]');
    if (houseTab && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); const tabs = [...document.querySelectorAll('[data-home-house]')]; const index = tabs.indexOf(houseTab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
    }
    if (event.key === 'Escape') document.querySelectorAll('#header details[open]').forEach(menu => { menu.open = false; menu.querySelector('summary')?.focus(); });
  });
  document.addEventListener('common-layout-loaded', nav);
  render();
})();


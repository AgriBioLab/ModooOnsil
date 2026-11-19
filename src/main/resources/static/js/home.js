(() => {
'use strict';
const app = window.ModooApp;
const {
  config, diaryRows, pages, $, $$, htmlText, today,
  getCycle, gh, cropOf, varietyOf, getStage, stageByDate,
  statusBadge, dateFrom, getReading, cycleStatus, go
} = app;

function calcElapsedDays(cycle) {
  const start = dateFrom(cycle.actualStartAt || cycle.plannedStartAt);
  if (!start) return null;
  const diff = Math.floor((new Date(today()) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : null;
}

function fmtMeasuredAt(value) {
  if (!value) return '측정 이력 없음';
  return String(value).slice(0, 16).replace('T', ' ');
}

function renderHome() {
  const main = $('#main');
  if (!main) return;

  const member = config.header?.currentUser || {};
  const isCertified = member.certification === '인증';
  const greenhouses = config.greenhouses || [];
  const totalArea = greenhouses.reduce((sum, g) => sum + (Number(g.registeredArea) || 0), 0);
  const activeCycles = (config.cycles || []).filter(c => cycleStatus(c) === '진행');
  const pendingCycles = (config.cycles || []).filter(c => cycleStatus(c) === '미진행');

  const issues = [...(config.issueSamples || [])].sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || ''));
  const openIssues = issues.filter(i => i.status !== '조치 완료' && i.status !== '조치완료');

  const pendingDiaries = [...diaryRows]
    .map(d => ({
      diary: d,
      pendingTasks: d.tasks.filter(t => t.status !== '완료')
    }))
    .filter(item => item.pendingTasks.length > 0)
    .sort((a, b) => b.diary.workDate.localeCompare(a.diary.workDate));

  const openTaskCount = pendingDiaries.reduce((sum, item) => sum + item.pendingTasks.length, 0);
  const recentDiaries = [...diaryRows].sort((a, b) => b.workDate.localeCompare(a.workDate)).slice(0, 4);

  const issueTone = {
    '발생': 'bg-light-danger',
    '미조치': 'bg-light-danger',
    '조치중': 'bg-light-warning',
    '조치 완료': 'bg-light-success',
    '조치완료': 'bg-light-success'
  };

  const certBannerHtml = !isCertified
    ? `<section class="home-cert-banner" aria-label="농업경영체 인증 안내">
        <span>현재 <strong>농업경영체 미인증</strong> 상태입니다. 인증 완료 시 농장 맞춤형 영농 관리를 이용할 수 있습니다.</span>
        <button type="button" class="btn xs" data-home-go="cert">농업경영체 인증하기</button>
      </section>`
    : '';

  const kpiHtml = `
    <section class="home-kpis" aria-label="농장 주요 현황">
      <button type="button" class="home-kpi-card ${openIssues.length ? 'is-alert' : ''}" data-home-go="issue-list">
        <span class="home-kpi-label">미해결 환경 이슈</span>
        <strong class="home-kpi-value">${openIssues.length}건</strong>
        <span class="home-kpi-sub">전체 이력 ${issues.length}건</span>
      </button>
      <button type="button" class="home-kpi-card" data-home-go="list">
        <span class="home-kpi-label">미완료 작업</span>
        <strong class="home-kpi-value">${openTaskCount}건</strong>
        <span class="home-kpi-sub">최근 일지 ${htmlText(recentDiaries[0]?.workDate || '—')}</span>
      </button>
      <button type="button" class="home-kpi-card" data-home-go="cycle-list">
        <span class="home-kpi-label">진행 중 작기</span>
        <strong class="home-kpi-value">${activeCycles.length}건</strong>
        <span class="home-kpi-sub">예정 ${pendingCycles.length}건 · 전체 ${(config.cycles || []).length}건</span>
      </button>
      <button type="button" class="home-kpi-card" data-home-go="gh-list">
        <span class="home-kpi-label">운영 온실</span>
        <strong class="home-kpi-value">${greenhouses.length}개소</strong>
        <span class="home-kpi-sub">총 등록 면적 ${totalArea.toLocaleString()} ㎡</span>
      </button>
    </section>`;

  const activeCycleHtml = activeCycles.length
    ? activeCycles.map(c => {
        const g = gh(c.greenhouseId);
        const crop = `${cropOf(c)?.name || '—'} · ${varietyOf(c)?.name || '—'}`;
        const stage = getStage(stageByDate(c, today()));
        const days = calcElapsedDays(c);
        const reading = typeof getReading === 'function' ? getReading(c.cycleId) : null;
        return `
          <article class="home-cycle-card">
            <div class="home-cycle-head">
              <div>
                <div class="home-cycle-title">
                  <button type="button" class="linkbtn home-cycle-link" data-home-cycle="${c.cycleId}">${htmlText(g?.name || '—')} · ${htmlText(c.name)}</button>
                  ${statusBadge(stage.name, { [stage.name]: 'bg-light-success' })}
                </div>
                <div class="home-cycle-meta">
                  ${htmlText(crop)}${days ? ` · 재배 ${days}일차` : ''} · 최근 측정 ${htmlText(fmtMeasuredAt(reading?.measuredAt))}
                </div>
              </div>
              <button type="button" class="btn main xs" data-home-diary-create="${c.cycleId}">일지 작성</button>
            </div>
            <div class="home-sensor-strip">
              <div class="home-sensor-item"><span>내부 온도</span><strong>${reading?.insideTempC != null ? `${reading.insideTempC} °C` : '—'}</strong></div>
              <div class="home-sensor-item"><span>내부 습도</span><strong>${reading?.humidityPct != null ? `${reading.humidityPct} %` : '—'}</strong></div>
              <div class="home-sensor-item"><span>이산화탄소(CO₂)</span><strong>${reading?.co2Ppm != null ? `${reading.co2Ppm} ppm` : '—'}</strong></div>
              <div class="home-sensor-item"><span>배지 수분</span><strong>${reading?.substrateMoisturePct != null ? `${reading.substrateMoisturePct} %` : '—'}</strong></div>
            </div>
          </article>`;
      }).join('')
    : '<p class="empty" style="padding:28px 16px;margin:0">현재 진행 중인 작기계획이 없습니다.</p>';

  const openIssueHtml = openIssues.length
    ? openIssues.map(issue => {
        const c = getCycle(issue.cycleId);
        const g = c ? gh(c.greenhouseId) : null;
        return `
          <button type="button" class="home-feed-item" data-home-issue="${issue.issueId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(issue.title || issue.issueType || '환경 이슈')}</span>
              <span class="home-feed-sub">${htmlText(g?.name || '—')} · ${htmlText((issue.occurredAt || '').slice(0, 16).replace('T', ' '))}</span>
            </div>
            <div class="home-feed-right">
              ${statusBadge(issue.status || '발생', issueTone)}
            </div>
          </button>`;
      }).join('')
    : '<p class="empty" style="padding:22px 16px;margin:0">현재 조치가 필요한 환경 이슈가 없습니다.</p>';

  const hasPendingTasks = pendingDiaries.length > 0;
  const rightSecondTitle = hasPendingTasks ? '미완료 재배 작업' : '최근 재배일지';
  const rightSecondBody = hasPendingTasks
    ? pendingDiaries.slice(0, 4).map(({ diary: d, pendingTasks }) => {
        const c = getCycle(d.cycleId);
        const firstNames = pendingTasks.slice(0, 2).map(t => t.name).join(', ');
        const extra = pendingTasks.length > 2 ? ` 외 ${pendingTasks.length - 2}건` : '';
        return `
          <button type="button" class="home-feed-item" data-home-diary="${d.diaryId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(firstNames + extra)}</span>
              <span class="home-feed-sub">${htmlText(d.workDate)} · ${htmlText(gh(c?.greenhouseId)?.name || '—')}</span>
            </div>
            <div class="home-feed-right">
              <span class="krds-badge bg-light-warning">미완료 ${pendingTasks.length}건</span>
            </div>
          </button>`;
      }).join('')
    : (recentDiaries.map(d => {
        const c = getCycle(d.cycleId);
        const done = d.tasks.filter(t => t.status === '완료').length;
        return `
          <button type="button" class="home-feed-item" data-home-diary="${d.diaryId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(c?.name || '작기 미지정')} (${htmlText(getStage(d.stageId).name)})</span>
              <span class="home-feed-sub">${htmlText(d.workDate)} · ${htmlText(gh(c?.greenhouseId)?.name || '—')}</span>
            </div>
            <div class="home-feed-right">
              <span class="krds-badge bg-light-success">${done}/${d.tasks.length} 완료</span>
            </div>
          </button>`;
      }).join('') || '<p class="empty" style="padding:22px 16px;margin:0">등록된 재배일지가 없습니다.</p>');

  main.innerHTML = `
    <div class="pagehead">
      <div>
        <h1>${htmlText(member.farmName || '모두의온실')} 현황</h1>
      </div>
      <div class="home-quick-actions">
        <button type="button" class="btn xs" id="homeGoEnv">온실 환경변화</button>
        <button type="button" class="btn main xs" id="homeGoDiaryCreate">+ 재배일지작업 등록</button>
      </div>
    </div>
    <div class="home-scroll">
      ${certBannerHtml}
      ${kpiHtml}
      <div class="home-grid">
        <div class="home-col">
          <section class="panel" aria-label="진행 중인 온실 현황">
            <div class="panel-head">
              <h2>진행 중인 온실 현황</h2>
              <button type="button" class="btn xs" data-home-go="cycle-list">전체 보기</button>
            </div>
            <div class="home-cycle-list">${activeCycleHtml}</div>
          </section>
        </div>
        <div class="home-col">
          <section class="panel" aria-label="온실 환경 이슈">
            <div class="panel-head">
              <h2>온실 환경 이슈</h2>
              <button type="button" class="btn xs" data-home-go="issue-list">전체 보기</button>
            </div>
            <div class="home-feed-list">${openIssueHtml}</div>
          </section>
          <section class="panel" aria-label="${rightSecondTitle}">
            <div class="panel-head">
              <h2>${rightSecondTitle}</h2>
              <button type="button" class="btn xs" data-home-go="list">전체 보기</button>
            </div>
            <div class="home-feed-list">${rightSecondBody}</div>
          </section>
        </div>
      </div>
    </div>`;

  $('#homeGoEnv').onclick = () => go('env-list');
  $('#homeGoDiaryCreate').onclick = () => go('create');
  $$('[data-home-go]').forEach(el => el.onclick = () => go(el.dataset.homeGo));
  $$('[data-home-cycle]').forEach(el => el.onclick = () => go('cycle-detail', el.dataset.homeCycle));
  $$('[data-home-diary-create]').forEach(el => el.onclick = () => go('create', el.dataset.homeDiaryCreate));
  $$('[data-home-issue]').forEach(el => el.onclick = () => go('issue-detail', el.dataset.homeIssue));
  $$('[data-home-diary]').forEach(el => el.onclick = () => go('detail', el.dataset.homeDiary));
}

pages.home = { renderHome };
})();

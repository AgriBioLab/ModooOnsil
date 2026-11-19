(() => {
'use strict';
const app = window.ModooApp;
const {
  config, diaryRows, pages, $, $$, htmlText, today,
  getCycle, gh, cropOf, varietyOf, getStage,
  statusBadge, dateFrom, cycleStatus, go
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

function latestReadingForCycle(cycleId) {
  const rows = (config.environmentChanges || []).filter(
    r => r && r.cycleId === cycleId && !r.deletedAt && !r.deleted_at
  );
  if (!rows.length) return null;
  return rows.sort((a, b) =>
    String(b.measuredAt || '').localeCompare(String(a.measuredAt || '')) ||
    String(b.environmentChangeId || '').localeCompare(String(a.environmentChangeId || ''), undefined, { numeric: true })
  )[0];
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
        const days = calcElapsedDays(c);
        const reading = latestReadingForCycle(c.cycleId);
        return `
          <article class="home-cycle-card">
            <div class="home-cycle-head">
              <div>
                <div class="home-cycle-title">
                  <button type="button" class="linkbtn home-cycle-link" data-home-cycle="${c.cycleId}">${htmlText(g?.name || '—')} · ${htmlText(c.name)}</button>
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

function renderLanding() {
  document.body.className = 'landing-shell';
  document.title = '모두의온실 | 온실 재배관리 서비스';
  document.body.innerHTML = `
    <a class="skip-link" href="#landingMain">본문 바로가기</a>
    <header class="landing-topbar">
      <div class="landing-topbar-inner">
        <a class="landing-brand" href="index.html">
          <strong>모두의온실</strong>
          <span>재배 관리</span>
        </a>
        <div class="landing-top-actions">
          <a class="btn xs header-btn" href="login.html">로그인</a>
          <a class="btn main xs" href="signup.html">농민 회원가입</a>
        </div>
      </div>
    </header>
    <main id="landingMain" class="landing-main" tabindex="-1">
      <section class="landing-hero" aria-label="서비스 소개">
        <div class="landing-hero-copy">
          <span class="krds-badge bg-light-success">시설원예 · 화훼농가 온실 관리</span>
          <h1>온실 환경부터 작기계획,<br>재배일지까지 한곳에서</h1>
          <p>농민 누구나 쉽고 간편하게 온실별 환경 변화와 이상 이슈를 확인하고, 작기 일정과 매일의 재배작업을 기록할 수 있습니다.</p>
          <div class="landing-hero-actions">
            <a class="btn main" href="login.html">로그인하기</a>
            <a class="btn" href="signup.html">농민 회원가입</a>
          </div>
        </div>
        <div class="landing-hero-visual" aria-hidden="true">
          <img class="landing-hero-photo" src="img/gh-a.jpg" alt="">
        </div>
      </section>
      <section class="landing-section" aria-label="주요 기능 안내">
        <div class="landing-section-head">
          <h2>모두의온실 주요 서비스</h2>
        </div>
        <div class="landing-features">
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg></div>
            <h3>재배일지작업</h3>
            <p>작기별 실제 작업일과 작업 내용을 시간순으로 기록하고 미완료 작업을 빠짐없이 관리합니다.</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
            <h3>작기계획</h3>
            <p>온실과 품목·품종별 재배 기간을 계획하고 진행·종료 상태를 체계적으로 관리합니다.</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/></svg></div>
            <h3>온실 · 환경관리</h3>
            <p>온실 시설 정보와 시간별 환경 변화 추이, 확인이 필요한 환경 이슈를 한눈에 파악합니다.</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg></div>
            <h3>농업경영체 인증</h3>
            <p>농장 기본 정보와 농업경영체 인증 상태를 내정보에서 간편하게 등록하고 확인합니다.</p>
          </article>
        </div>
      </section>
      <section class="landing-steps-box" aria-label="이용 순서">
        <h2>이용 안내</h2>
        <ol class="landing-steps">
          <li><strong>1. 회원가입 및 인증</strong><span>농장 기본 정보 입력 후 농업경영체 인증을 진행합니다.</span></li>
          <li><strong>2. 온실 · 작기 등록</strong><span>운영 중인 온실과 재배할 작기계획을 등록합니다.</span></li>
          <li><strong>3. 현황 확인 · 일지 작성</strong><span>농장 현황에서 이상 이슈를 확인하고 재배일지를 기록합니다.</span></li>
        </ol>
      </section>
    </main>
    <footer class="landing-footer">
      <div class="landing-footer-inner">
        <strong>모두의온실</strong>
        <span>농민 누구나 쉽고 간편하게 쓰는 온실 재배관리</span>
      </div>
    </footer>
    <div class="notice-toast hidden" id="toast" role="status" aria-live="polite"></div>`;
}

pages.home = { renderHome, renderLanding };
})();

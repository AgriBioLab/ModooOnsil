(() => {
  'use strict';
  const {
    config,
    diaryRows,
    pages,
    $,
    $$,
    htmlText,
    today,
    getCycle,
    gh,
    cropOf,
    varietyOf,
    getStage,
    statusBadge,
    dateFrom,
    cycleStatus,
    go
  } = window.ModooApp;

  function calculateElapsedDays(cycle) {
    const start = dateFrom(cycle.actualStartAt || cycle.plannedStartAt);
    if (!start) return null;
    const elapsedDays =
      Math.floor((new Date(today()) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return elapsedDays > 0 ? elapsedDays : null;
  }

  function formatMeasuredAt(value) {
    if (!value) return '측정 이력 없음';
    return String(value).slice(0, 16).replace('T', ' ');
  }

  function latestReadingForCycle(cycleId) {
    const rows = (config.environmentChanges || []).filter(
      reading => reading && reading.cycleId === cycleId && !reading.deletedAt && !reading.deleted_at
    );
    if (!rows.length) return null;
    return rows.sort(
      (a, b) =>
        String(b.measuredAt || '').localeCompare(String(a.measuredAt || '')) ||
        String(b.environmentChangeId || '').localeCompare(
          String(a.environmentChangeId || ''),
          undefined,
          { numeric: true }
        )
    )[0];
  }

  function renderHome() {
    const main = $('#main');
    if (!main) return;

    const member = config.header?.currentUser || {};
    const isCertified = member.certification === '인증';
    const greenhouses = config.greenhouses || [];
    const totalArea = greenhouses.reduce(
      (sum, greenhouse) => sum + (Number(greenhouse.registeredArea) || 0),
      0
    );
    const activeCycles = (config.cycles || []).filter(cycle => cycleStatus(cycle) === '진행');
    const pendingCycles = (config.cycles || []).filter(cycle => cycleStatus(cycle) === '미진행');

    const issues = [...(config.issueSamples || [])].sort((a, b) =>
      (b.occurredAt || '').localeCompare(a.occurredAt || '')
    );
    const openIssues = issues.filter(
      issue => issue.status !== '조치 완료' && issue.status !== '조치완료'
    );

    const pendingDiaries = [...diaryRows]
      .map(diary => ({
        diary,
        pendingTasks: diary.tasks.filter(task => task.status !== '완료')
      }))
      .filter(item => item.pendingTasks.length > 0)
      .sort((a, b) => b.diary.workDate.localeCompare(a.diary.workDate));

    const openTaskCount = pendingDiaries.reduce((sum, item) => sum + item.pendingTasks.length, 0);
    const recentDiaries = [...diaryRows]
      .sort((a, b) => b.workDate.localeCompare(a.workDate))
      .slice(0, 4);

    const issueTone = {
      발생: 'bg-light-danger',
      미조치: 'bg-light-danger',
      조치중: 'bg-light-warning',
      '조치 완료': 'bg-light-success',
      조치완료: 'bg-light-success'
    };

    const isPending = member.certification === '인증 대기중';
    const certBannerHtml = !isCertified
      ? `<section class="home-cert-banner" aria-label="농업경영체 인증 안내">
        <span>${
          isPending
            ? '현재 <strong>농업경영체 인증 심사 대기중</strong>입니다. 심사 완료 후 농장 맞춤형 영농 관리를 이용할 수 있습니다.'
            : '현재 <strong>농업경영체 미인증</strong> 상태입니다. 인증 완료 시 농장 맞춤형 영농 관리를 이용할 수 있습니다.'
        }</span>
        <button type="button" class="btn xs" data-home-go="cert">${isPending ? '인증 현황 확인' : '농업경영체 인증하기'}</button>
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
      ? activeCycles
          .map(cycle => {
            const greenhouse = gh(cycle.greenhouseId);
            const crop = `${cropOf(cycle)?.name || '—'} · ${varietyOf(cycle)?.name || '—'}`;
            const days = calculateElapsedDays(cycle);
            const reading = latestReadingForCycle(cycle.cycleId);
            return `
          <article class="home-cycle-card">
            <div class="home-cycle-head">
              <div>
                <div class="home-cycle-title">
                  <button type="button" class="linkbtn home-cycle-link" data-home-cycle="${cycle.cycleId}">${htmlText(greenhouse?.name || '—')} · ${htmlText(cycle.name)}</button>
                </div>
                <div class="home-cycle-meta">
                  ${htmlText(crop)}${days ? ` · 재배 ${days}일차` : ''} · 최근 측정 ${htmlText(formatMeasuredAt(reading?.measuredAt))}
                </div>
              </div>
              <button type="button" class="btn main xs" data-home-diary-create="${cycle.cycleId}">일지 작성</button>
            </div>
            <div class="home-sensor-strip">
              <div class="home-sensor-item"><span>내부 온도</span><strong>${reading?.insideTempC != null ? `${reading.insideTempC} °C` : '—'}</strong></div>
              <div class="home-sensor-item"><span>내부 습도</span><strong>${reading?.humidityPct != null ? `${reading.humidityPct} %` : '—'}</strong></div>
              <div class="home-sensor-item"><span>이산화탄소(CO₂)</span><strong>${reading?.co2Ppm != null ? `${reading.co2Ppm} ppm` : '—'}</strong></div>
              <div class="home-sensor-item"><span>배지 수분</span><strong>${reading?.substrateMoisturePct != null ? `${reading.substrateMoisturePct} %` : '—'}</strong></div>
            </div>
          </article>`;
          })
          .join('')
      : '<p class="empty" style="padding:28px 16px;margin:0">현재 진행 중인 작기계획이 없습니다.</p>';

    const openIssueHtml = openIssues.length
      ? openIssues
          .map(issue => {
            const cycle = getCycle(issue.cycleId);
            const greenhouse = cycle ? gh(cycle.greenhouseId) : null;
            return `
          <button type="button" class="home-feed-item" data-home-issue="${issue.issueId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(issue.message || issue.title || issue.issueType || '환경 이슈')}${issue.issueValue ? ` (${htmlText(issue.issueValue)})` : ''}</span>
              <span class="home-feed-sub">${htmlText(greenhouse?.name || '—')} · ${htmlText((issue.occurredAt || '').slice(0, 16).replace('T', ' '))}</span>
            </div>
            <div class="home-feed-right">
              ${statusBadge(issue.status || '발생', issueTone)}
            </div>
          </button>`;
          })
          .join('')
      : '<p class="empty" style="padding:22px 16px;margin:0">현재 조치가 필요한 환경 이슈가 없습니다.</p>';

    const hasPendingTasks = pendingDiaries.length > 0;
    const rightSecondTitle = hasPendingTasks ? '미완료 재배 작업' : '최근 재배일지';
    const rightSecondBody = hasPendingTasks
      ? pendingDiaries
          .slice(0, 4)
          .map(({ diary, pendingTasks }) => {
            const cycle = getCycle(diary.cycleId);
            const firstNames = pendingTasks
              .slice(0, 2)
              .map(task => task.name)
              .join(', ');
            const extra = pendingTasks.length > 2 ? ` 외 ${pendingTasks.length - 2}건` : '';
            return `
          <button type="button" class="home-feed-item" data-home-diary="${diary.diaryId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(firstNames + extra)}</span>
              <span class="home-feed-sub">${htmlText(diary.workDate)} · ${htmlText(gh(cycle?.greenhouseId)?.name || '—')}</span>
            </div>
            <div class="home-feed-right">
              <span class="krds-badge bg-light-warning">미완료 ${pendingTasks.length}건</span>
            </div>
          </button>`;
          })
          .join('')
      : recentDiaries
          .map(diary => {
            const cycle = getCycle(diary.cycleId);
            const done = diary.tasks.filter(task => task.status === '완료').length;
            return `
          <button type="button" class="home-feed-item" data-home-diary="${diary.diaryId}">
            <div class="home-feed-main">
              <span class="home-feed-title">${htmlText(cycle?.name || '작기 미지정')} (${htmlText(getStage(diary.stageId).name)})</span>
              <span class="home-feed-sub">${htmlText(diary.workDate)} · ${htmlText(gh(cycle?.greenhouseId)?.name || '—')}</span>
            </div>
            <div class="home-feed-right">
              <span class="krds-badge bg-light-success">${done}/${diary.tasks.length} 완료</span>
            </div>
          </button>`;
          })
          .join('') ||
        '<p class="empty" style="padding:22px 16px;margin:0">등록된 재배일지가 없습니다.</p>';

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
    $$('[data-home-go]').forEach(button => (button.onclick = () => go(button.dataset.homeGo)));
    $$('[data-home-cycle]').forEach(
      button => (button.onclick = () => go('cycle-detail', button.dataset.homeCycle))
    );
    $$('[data-home-diary-create]').forEach(
      button => (button.onclick = () => go('create', button.dataset.homeDiaryCreate))
    );
    $$('[data-home-issue]').forEach(
      button => (button.onclick = () => go('issue-detail', button.dataset.homeIssue))
    );
    $$('[data-home-diary]').forEach(
      button => (button.onclick = () => go('detail', button.dataset.homeDiary))
    );
  }

  function renderLanding() {
    document.body.className = 'landing-shell';
    document.title = '모두의온실 | 온실 재배관리 서비스';
    document.body.innerHTML = `
    <a class="skip-link" href="#landingMain">본문 바로가기</a>
    <header class="landing-topbar">
      <div class="landing-topbar-inner">
        <a class="landing-brand" href="index.html" aria-label="모두의 온실">
          <svg class="landing-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 228 48" aria-hidden="true"><g transform="translate(4,6)"><path d="M13 0C5.8 0 0 5.8 0 13v23h24V13C24 5.8 18.2 0 13 0z" fill="#176B3A"/><path d="M33 6c-6.6 0-12 5.4-12 12v18h24V18c0-6.6-5.4-12-12-12z" fill="#176B3A" fill-opacity="0.45"/><path d="M21 18v18h4V15.5c-2.2.6-4 1.4-4 2.5z" fill="#FFFFFF"/></g><text x="60" y="33" fill="#13261B" font-family="'GmarketSansBold','Pretendard GOV','Malgun Gothic',sans-serif" font-size="25" font-weight="700" letter-spacing="-1">모두의 온실</text></svg>
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
          <span class="krds-badge bg-light-success">데이터 기반 디지털 스마트농업</span>
          <h1>농민 누구나 쉽고 간편하게 쓰는<br>온실 재배관리</h1>
          <p>환경 데이터와 작기·재배일지를 한곳에 모아 현장 체감형 디지털 영농을 지원합니다.</p>
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
          <h2>주요 서비스</h2>
        </div>
        <div class="landing-features">
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg></div>
            <h3>재배일지작업</h3>
            <p>작업일·작업 내용 간편 기록</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
            <h3>작기계획</h3>
            <p>온실·품목별 재배 일정 관리</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/></svg></div>
            <h3>온실 · 환경관리</h3>
            <p>온실 현황과 환경 이상 즉시 확인</p>
          </article>
          <article class="landing-feature-card">
            <div class="landing-feature-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg></div>
            <h3>농업경영체 인증</h3>
            <p>농장 정보·인증 상태 통합 관리</p>
          </article>
        </div>
      </section>
      <section class="landing-steps-box" aria-label="이용 순서">
        <h2>이용 안내</h2>
        <ol class="landing-steps">
          <li><strong>1. 회원가입 · 인증</strong><span>농장 정보 및 경영체 등록</span></li>
          <li><strong>2. 온실 · 작기 등록</strong><span>운영 온실과 작기 설정</span></li>
          <li><strong>3. 현황 · 일지 관리</strong><span>환경 확인 및 작업 기록</span></li>
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

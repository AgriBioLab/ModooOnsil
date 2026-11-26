// 홈 대시보드 데이터 조회(Promise.allSettled) 및 이벤트 바인딩.
(() => {
  'use strict';

  const {
    ready,
    escapeHtml,
    fetchJson,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu
  } = window.ModooCommon;

  const PAGE_ROUTES = {
    'issue-list': '/environmentIssueList.html',
    'cycle-list': '/cultivation-plans',
    'gh-list': '/greenhouseList.html',
    'env-list': '/environmentChangeList.html',
    list: '/cultivation-diaries',
    create: '/cultivation-diaries/new'
  };

  // === 1. 내비게이션 ===

  function navigateTo(target, id) {
    if (target === 'cycle-detail' && id) {
      location.href = `/cultivation-plans/${encodeURIComponent(id)}`;
      return;
    }
    if (target === 'issue-detail' && id) {
      location.href = `/environmentIssueList.html?view=issue-detail&id=${encodeURIComponent(id)}`;
      return;
    }
    if (target === 'detail' && id) {
      location.href = `/cultivation-diaries/${encodeURIComponent(id)}`;
      return;
    }
    if (target === 'create' && id) {
      location.href = `/cultivation-diaries/new?cycleId=${encodeURIComponent(id)}`;
      return;
    }
    location.href = PAGE_ROUTES[target] || '/cultivation-diaries';
  }

  function bindHomeEvents(root = document) {
    if (root === document) {
      document.getElementById('homeGoEnv')?.addEventListener('click', () => navigateTo('env-list'));
      document.getElementById('homeGoDiaryCreate')?.addEventListener('click', () => navigateTo('create'));
    }

    root.querySelectorAll('[data-home-go]').forEach(button => {
      button.addEventListener('click', () => navigateTo(button.dataset.homeGo));
    });
    root.querySelectorAll('[data-home-cycle]').forEach(button => {
      button.addEventListener('click', () => navigateTo('cycle-detail', button.dataset.homeCycle));
    });
    root.querySelectorAll('[data-home-diary-create]').forEach(button => {
      button.addEventListener('click', () => navigateTo('create', button.dataset.homeDiaryCreate));
    });
    root.querySelectorAll('[data-home-issue]').forEach(button => {
      button.addEventListener('click', () => navigateTo('issue-detail', button.dataset.homeIssue));
    });
    root.querySelectorAll('[data-home-diary]').forEach(button => {
      button.addEventListener('click', () => navigateTo('detail', button.dataset.homeDiary));
    });
  }

  // === 2. KPI · 패널 렌더링 ===

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderGreenhousesSummary(houses) {
    const totalArea = houses.reduce((sum, house) => sum + Number(house.registeredArea || 0), 0);
    setText('homeGreenhouseCount', `${houses.length}개소`);
    setText('homeGreenhouseAreaSub', `총 등록 면적 ${totalArea.toLocaleString('ko-KR')} ㎡`);
  }

  function renderPlansSummary(plans) {
    const running = plans.filter(plan => plan.planStatus === '진행');
    const waiting = plans.filter(plan => plan.planStatus === '미진행');

    setText('homeRunningPlanCount', `${running.length}건`);
    setText('homePlanSub', `예정 ${waiting.length}건 · 전체 ${plans.length}건`);

    const listEl = document.getElementById('homeCycleList');
    if (!listEl) return;

    if (!running.length) {
      listEl.innerHTML = '<p class="empty home-empty-cycle">현재 진행 중인 작기계획이 없습니다.</p>';
      return;
    }

    listEl.innerHTML = running
      .slice(0, 4)
      .map(plan => {
        const start = String(plan.plannedStartDate || '').slice(0, 10) || '—';
        const end = String(plan.plannedEndDate || '').slice(0, 10) || '—';
        return `
          <article class="home-cycle-card">
            <div class="home-cycle-head">
              <div class="home-cycle-title">
                <button type="button" class="home-cycle-link" data-home-cycle="${escapeHtml(String(plan.planId))}">
                  ${escapeHtml(plan.planName || '이름 없음')}
                </button>
                <span class="krds-badge bg-light-success">진행</span>
              </div>
              <button type="button" class="btn xs" data-home-diary-create="${escapeHtml(String(plan.planId))}">
                + 일지 등록
              </button>
            </div>
            <p class="home-cycle-meta">
              ${escapeHtml(plan.greenhouseName || '—')} · ${escapeHtml(plan.cropName || '—')} (${escapeHtml(plan.varietyName || '—')}) · ${escapeHtml(start)} ~ ${escapeHtml(end)}
            </p>
          </article>
        `;
      })
      .join('');

    bindHomeEvents(listEl);
  }

  function renderDiariesSummary(diaries) {
    const incompleteTotal = diaries.reduce((sum, diary) => sum + Number(diary.incompleteTaskCount || 0), 0);
    const sorted = [...diaries].sort((a, b) => String(b.workedAt || '').localeCompare(String(a.workedAt || '')));
    const latestDate = sorted.length ? String(sorted[0].workedAt || '').slice(0, 10) : '';

    setText('homeIncompleteCount', `${incompleteTotal}건`);
    setText('homeLatestDiarySub', `최근 일지 ${latestDate || '—'}`);

    const listEl = document.getElementById('homeDiaryList');
    if (!listEl) return;

    if (!sorted.length) {
      listEl.innerHTML = '<p class="empty home-empty-feed">등록된 재배일지가 없습니다.</p>';
      return;
    }

    listEl.innerHTML = sorted
      .slice(0, 5)
      .map(diary => {
        const workedDate = String(diary.workedAt || '').slice(0, 10) || '—';
        const incomplete = Number(diary.incompleteTaskCount || 0);
        const badgeClass = incomplete > 0 ? 'bg-light-warning' : 'bg-light-success';
        const badgeText = incomplete > 0 ? `미완료 ${incomplete}` : '완료';
        return `
          <button type="button" class="home-feed-item" data-home-diary="${escapeHtml(String(diary.diaryId))}">
            <div class="home-feed-main">
              <span class="home-feed-title">
                ${escapeHtml(workedDate)} · ${escapeHtml(diary.planName || '작기계획')}
              </span>
              <span class="home-feed-sub">
                ${escapeHtml(diary.greenhouseName || '—')} · ${escapeHtml(diary.cropName || '—')} · ${escapeHtml(diary.growthStage || '-')}
              </span>
            </div>
            <div class="home-feed-right">
              <span class="krds-badge ${badgeClass}">${escapeHtml(badgeText)}</span>
            </div>
          </button>
        `;
      })
      .join('');

    bindHomeEvents(listEl);
  }

  async function loadDashboardData() {
    const [housesRes, plansRes, diariesRes] = await Promise.allSettled([
      fetchJson('/api/greenhouses'),
      fetchJson('/api/cultivation-plans'),
      fetchJson('/api/cultivation-diaries')
    ]);

    if (housesRes.status === 'fulfilled' && Array.isArray(housesRes.value)) {
      renderGreenhousesSummary(housesRes.value);
    }
    if (plansRes.status === 'fulfilled' && Array.isArray(plansRes.value)) {
      renderPlansSummary(plansRes.value);
    }
    if (diariesRes.status === 'fulfilled' && Array.isArray(diariesRes.value)) {
      renderDiariesSummary(diariesRes.value);
    }
  }

  // === 3. 페이지 초기화 ===

  document.addEventListener('DOMContentLoaded', async () => {
    const member = await currentMember();
    if (!member) {
      location.replace('/landing.html');
      return;
    }

    await ready;
    showAccount(member);
    bindAccount(() => {
      location.href = '/mypage';
    });
    setCurrentMenu('home');

    if (member.farmName) {
      setText('homeFarmTitle', `${member.farmName} 현황`);
    }

    bindHomeEvents(document);
    await loadDashboardData();
  });
})();

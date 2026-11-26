// 홈 대시보드 이벤트 바인딩 및 비로그인 랜딩 이동.
// TODO: HomeController / Thymeleaf 연결 시 서버 모델 데이터를 직접 렌더링하도록 전환.
(() => {
  'use strict';

  const { ready, currentMember, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;

  const PAGE_ROUTES = {
    'issue-list': '/environmentIssueList.html',
    'cycle-list': '/cultivation-plans',
    'gh-list': '/greenhouseList.html',
    'env-list': '/environmentChangeList.html',
    list: '/cultivation-diaries',
    create: '/cultivation-diaries/new'
  };

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

  function bindHomeEvents() {
    const envBtn = document.getElementById('homeGoEnv');
    if (envBtn) {
      envBtn.addEventListener('click', () => navigateTo('env-list'));
    }

    const createBtn = document.getElementById('homeGoDiaryCreate');
    if (createBtn) {
      createBtn.addEventListener('click', () => navigateTo('create'));
    }

    document.querySelectorAll('[data-home-go]').forEach(button => {
      button.addEventListener('click', () => navigateTo(button.dataset.homeGo));
    });
    document.querySelectorAll('[data-home-cycle]').forEach(button => {
      button.addEventListener('click', () => navigateTo('cycle-detail', button.dataset.homeCycle));
    });
    document.querySelectorAll('[data-home-diary-create]').forEach(button => {
      button.addEventListener('click', () => navigateTo('create', button.dataset.homeDiaryCreate));
    });
    document.querySelectorAll('[data-home-issue]').forEach(button => {
      button.addEventListener('click', () => navigateTo('issue-detail', button.dataset.homeIssue));
    });
    document.querySelectorAll('[data-home-diary]').forEach(button => {
      button.addEventListener('click', () => navigateTo('detail', button.dataset.homeDiary));
    });
  }

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
    bindHomeEvents();
  });
})();

// 온실 환경변화 · 환경이슈 화면 이벤트 바인딩.
// TODO: 환경변화/환경이슈 Controller(Thymeleaf) 및 RestController(/api/...) 연동 필요.
(() => {
  'use strict';

  const { ready, notify, currentMember, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;

  function bindEnvEvents() {
    const form = document.getElementById('envFilters');
    const resetBtn = document.getElementById('efReset');

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        notify('환경변화 조회는 서버 연동 후 동작합니다.');
      });
    }

    if (resetBtn && form) {
      resetBtn.addEventListener('click', () => form.reset());
    }
  }

  function bindIssueEvents() {
    const form = document.getElementById('issueFilters');
    const resetBtn = document.getElementById('ifReset');

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        notify('환경 이슈 조회는 서버 연동 후 동작합니다.');
      });
    }

    if (resetBtn && form) {
      resetBtn.addEventListener('click', () => form.reset());
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const member = await currentMember();
    if (!member) {
      location.replace('/login');
      return;
    }

    await ready;
    showAccount(member);
    bindAccount(() => {
      location.href = '/mypage';
    });

    const page = document.body?.dataset?.page;
    if (page === 'issue-list') {
      setCurrentMenu('issue-list');
      bindIssueEvents();
      return;
    }

    setCurrentMenu('env-list');
    bindEnvEvents();
  });
})();

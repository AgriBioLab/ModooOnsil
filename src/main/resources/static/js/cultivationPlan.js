// 작기계획 화면 이벤트 바인딩.
// TODO: CultivationPlanController(Thymeleaf) 및 CultivationPlanRestController(/api/cultivation-plans),
//       CropStandardRestController(/api/crop-standards) 연동 필요.
(() => {
  'use strict';

  const { ready, notify, currentMember, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;

  function bindPlanEvents() {
    const form = document.getElementById('planFilters');
    const resetBtn = document.getElementById('cfReset');
    const createBtn = document.getElementById('cycleCreateBtn');

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        notify('작기계획 조회는 서버 연동 후 동작합니다.');
      });
    }

    if (resetBtn && form) {
      resetBtn.addEventListener('click', () => form.reset());
    }

    if (createBtn) {
      createBtn.addEventListener('click', () => {
        notify('작기계획 등록은 서버 API 연동 후 동작합니다.');
      });
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
    setCurrentMenu('cycle-list');
    bindPlanEvents();
  });
})();

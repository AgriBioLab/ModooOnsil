// 온실 환경변화 · 환경이슈 화면 이벤트 바인딩.
// TODO: 환경변화/환경이슈 Controller(Thymeleaf) 및 RestController(/api/...) 연동 필요.
(() => {
  'use strict';

  const { ready, notify, escapeHtml, currentMember, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;

  async function populateFilterOptions(houseSelectId, cycleSelectId) {
    const houseSelect = document.getElementById(houseSelectId);
    const cycleSelect = document.getElementById(cycleSelectId);
    if (!houseSelect && !cycleSelect) return;

    try {
      const [housesRes, plansRes] = await Promise.all([
        houseSelect ? fetch('/api/greenhouses', { headers: { Accept: 'application/json' } }) : null,
        cycleSelect ? fetch('/api/cultivation-plans', { headers: { Accept: 'application/json' } }) : null
      ]);

      if (housesRes?.ok && houseSelect) {
        const houses = await housesRes.json();
        houseSelect.innerHTML = [
          '<option value="">전체 온실</option>',
          ...houses.map(h => `<option value="${escapeHtml(String(h.greenhouseId))}">${escapeHtml(h.greenhouseName)}</option>`)
        ].join('');
      }

      if (plansRes?.ok && cycleSelect) {
        const plans = await plansRes.json();
        cycleSelect.innerHTML = [
          '<option value="">전체 작기계획</option>',
          ...plans.map(p => `<option value="${escapeHtml(String(p.planId))}">${escapeHtml(p.planName)}</option>`)
        ].join('');
      }
    } catch {
      // 환경변화·이슈 API 미연동 상태에서는 기본 옵션만 유지
    }
  }

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
      await populateFilterOptions('ifHouse', 'ifCycle');
      return;
    }

    setCurrentMenu('env-list');
    bindEnvEvents();
    await populateFilterOptions('efHouse', 'efCycle');
  });
})();

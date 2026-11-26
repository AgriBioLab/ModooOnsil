// 재배일지 공용 유틸 · API 요청 · 페이지 셸 초기화 (window.ModooDiaryCommon).
(() => {
  'use strict';

  const {
    ready,
    notify,
    escapeHtml,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu
  } = window.ModooCommon;

  const API_BASE = '/api/cultivation-diaries';

  const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  const timeOf = task => String(task.startedAt || '').slice(11, 16) || '09:00';
  const timeSort = (a, b) =>
    timeOf(a).localeCompare(timeOf(b)) || (a.taskId || '').localeCompare(b.taskId || '');
  const makeStarted = (date, time) => `${date}T${time}:00`;

  function toReason(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
      return Object.values(value).filter(Boolean).map(v => String(v).trim()).join(' / ');
    }
    return '';
  }

  function renderSelectOptions(select, items, selectedValue) {
    select.innerHTML = items
      .map(
        item =>
          `<option value="${escapeHtml(item.value)}" ${String(item.value) === String(selectedValue ?? '') ? 'selected' : ''}>${escapeHtml(item.label)}</option>`
      )
      .join('');
  }

  async function requestJson(url, method = 'GET', body) {
    const fetchOptions = body === undefined
      ? { method }
      : {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

    const response = await fetch(url, fetchOptions);
    if (response.status === 401) {
      location.replace('/login');
      throw new Error('로그인이 필요합니다.');
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.detail || '재배일지 요청을 처리할 수 없습니다.');
    }
    return response.status === 204 ? null : response.json();
  }

  function request(path = '', method = 'GET', body) {
    return requestJson(API_BASE + path, method, body);
  }

  function setSummaryFacts(planOrDiary, workDate, stageName) {
    const values = {
      summaryCycle: planOrDiary.planName || '—',
      summaryCrop: `${planOrDiary.cropName || '-'} · ${planOrDiary.varietyName || '-'}`,
      summaryHouse: planOrDiary.greenhouseName || '—',
      summaryDate: workDate || '—',
      summaryStage: stageName || '-'
    };

    for (const [id, text] of Object.entries(values)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.textContent = text;
      el.title = text;
    }
  }

  async function initDiaryShell(menuKey) {
    const member = await currentMember();
    if (!member) {
      location.replace('/login');
      return null;
    }

    await ready;
    showAccount(member);
    bindAccount(() => {
      location.href = '/mypage';
    });
    setCurrentMenu(menuKey);
    return member;
  }

  window.ModooDiaryCommon = {
    today,
    timeOf,
    timeSort,
    makeStarted,
    toReason,
    renderSelectOptions,
    requestJson,
    request,
    setSummaryFacts,
    initDiaryShell,
    notify,
    escapeHtml
  };
})();

(() => {
  'use strict';

  const { ready, currentMember, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;
  const page = '/cultivation-plans';
  const api = '/api/cultivation-plans';
  const { planView, planId } = document.body.dataset;
  const detailUrl = planId && `${page}/${planId}`;
  const planApi = planId && `${api}/${planId}`;
  const byId = id => document.getElementById(id);

  function showError(message = '') {
    const error = byId('planError');
    error.textContent = message;
    error.hidden = !message;
  }

  async function request(url, method = 'GET', data) {
    const options = { method, headers: { Accept: 'application/json' } };
    if (data !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    if (response.status === 401) {
      location.replace('/login');
      throw new Error('로그인이 필요합니다.');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const messages = {
        400: '입력값을 확인해 주세요.',
        404: '작기계획을 찾을 수 없습니다.',
        409: '현재 상태에서 요청을 처리할 수 없습니다.'
      };
      throw new Error(error.detail || messages[response.status] || '요청을 처리하지 못했습니다.');
    }
    return response.status === 204 ? undefined : response.json();
  }

  function cropLabel(crop) {
    return [crop.cropName, crop.varietyName].filter(Boolean).join(' · ');
  }

  function formatDateOnly(value) {
    return value ? String(value).slice(0, 10) : '—';
  }

  function period(start, end) {
    if (!start && !end) return '—';
    return `${formatDateOnly(start)} ~ ${formatDateOnly(end)}`;
  }

  function renderRows(plans, emptyMessage = '조건에 맞는 작기계획이 없습니다.') {
    const rows = byId('planRows');
    rows.replaceChildren();
    document.querySelector('.list-count-value').textContent = plans.length;
    if (!plans.length) {
      const cell = rows.insertRow().insertCell();
      cell.colSpan = 6;
      cell.className = 'empty';
      cell.textContent = emptyMessage;
      return;
    }
    for (const plan of plans) {
      const row = rows.insertRow();
      const link = document.createElement('a');
      link.href = `${page}/${plan.planId}`;
      link.textContent = plan.planName;
      row.insertCell().append(link);
      const values = [
        plan.greenhouseName,
        cropLabel(plan),
        period(plan.plannedStartDate, plan.plannedEndDate),
        period(plan.actualStartDate, plan.actualEndDate),
        plan.planStatus
      ];
      for (const value of values) row.insertCell().textContent = value || '—';
    }
  }

  function bindList() {
    const form = byId('planFilters');
    let latestSearch = 0;

    async function search() {
      const searchId = ++latestSearch;
      const params = new URLSearchParams();
      for (const [name, value] of new FormData(form)) {
        if (value) params.set(name, value);
      }
      showError();
      try {
        const plans = await request(params.size ? `${api}?${params}` : api);
        if (searchId !== latestSearch) return;
        if (!params.size) {
          for (const name of ['planName', 'greenhouseName', 'cropName', 'varietyName']) {
            const select = form.elements.namedItem(name);
            const values = [...new Set(plans.map(plan => plan[name]).filter(Boolean))].sort();
            select.replaceChildren(select.options[0], ...values.map(value => new Option(value, value)));
          }
        }
        const status = params.get('planStatus');
        renderRows(status ? plans.filter(plan => plan.planStatus === status) : plans);
      } catch (error) {
        if (searchId !== latestSearch) return;
        renderRows([], '작기계획을 불러오지 못했습니다.');
        showError(error.message);
      }
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      search();
    });
    byId('cfReset').addEventListener('click', () => {
      form.reset();
      search();
    });
    return search();
  }

  function renderDetail(plan) {
    const detail = byId('planDetail');
    detail.replaceChildren();
    const fields = {
      '작기계획명': plan.planName,
      '온실': plan.greenhouseName,
      '품목 · 품종': cropLabel(plan),
      '계획 기간': period(plan.plannedStartDate, plan.plannedEndDate),
      '실제 기간': period(plan.actualStartDate, plan.actualEndDate),
      '상태': plan.planStatus,
      '종료 사유': plan.endReason
    };
    for (const [name, value] of Object.entries(fields)) {
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = name;
      description.textContent = value || '—';
      detail.append(term, description);
    }
    const pending = plan.planStatus === '미진행';
    for (const id of ['editPlan', 'startPlan', 'deletePlan']) byId(id).hidden = !pending;
    byId('endPlanForm').hidden = plan.planStatus !== '진행';
  }

  async function bindDetail() {
    const endForm = byId('endPlanForm');
    const buttons = [byId('startPlan'), byId('deletePlan'), endForm.querySelector('button')];
    async function change(url, method, data) {
      buttons.forEach(button => { button.disabled = true; });
      showError();
      try {
        const plan = await request(url, method, data);
        if (method === 'DELETE') {
          location.assign(page);
          return;
        }
        renderDetail(plan);
        endForm.reset();
      } catch (error) {
        showError(error.message);
      } finally {
        buttons.forEach(button => { button.disabled = false; });
      }
    }

    renderDetail(await request(planApi));
    byId('startPlan').addEventListener('click', () => {
      if (window.confirm('이 작기계획을 시작하시겠습니까?')) change(`${planApi}/start`, 'POST');
    });
    byId('deletePlan').addEventListener('click', () => {
      if (window.confirm('이 작기계획을 삭제하시겠습니까?')) change(planApi, 'DELETE');
    });
    endForm.addEventListener('submit', event => {
      event.preventDefault();
      const endReason = endForm.elements.endReason.value.trim();
      if (endReason) change(`${planApi}/end`, 'POST', { endReason });
      else showError('종료 사유를 입력해 주세요.');
    });
  }

  async function bindForm() {
    const form = byId('planForm');
    const fields = form.elements;
    const fieldset = byId('planFields');
    const save = byId('savePlan');
    const editing = planView === 'edit';
    const [greenhouses, crops, plan] = await Promise.all([
      request('/api/greenhouses'),
      request('/api/crops'),
      editing ? request(planApi) : null
    ]);
    if (plan && plan.planStatus !== '미진행') {
      throw new Error('미진행 상태의 작기만 수정할 수 있습니다.');
    }

    fields.greenhouseId.replaceChildren(new Option('온실 선택', ''),
      ...greenhouses.map(item => new Option(item.greenhouseName, item.greenhouseId)));
    fields.cropId.replaceChildren(new Option('품목 · 품종 선택', ''),
      ...crops.map(item => new Option(cropLabel(item), item.cropId)));

    let latestSelection = 0;
    let selectedStandardId = null;

    async function loadStandards(preferredStandardId) {
      const selection = ++latestSelection;
      const cropId = fields.cropId.value;
      selectedStandardId = null;
      save.disabled = true;
      showError();
      if (!cropId) return;
      try {
        const standards = await request(`/api/crops/${cropId}/standards`);
        if (selection !== latestSelection) return;
        const matched = preferredStandardId != null
          ? standards.find(item => Number(item.standardId) === Number(preferredStandardId))
          : null;
        selectedStandardId = matched ? matched.standardId : (standards[0]?.standardId ?? null);
        save.disabled = !selectedStandardId;
        if (!selectedStandardId) showError('선택한 품목에 등록된 재배 기준이 없습니다.');
      } catch (error) {
        if (selection === latestSelection) showError(error.message);
      }
    }

    if (plan) {
      for (const name of ['planName', 'greenhouseId', 'cropId', 'plannedStartDate', 'plannedEndDate']) {
        fields.namedItem(name).value = plan[name] ?? '';
      }
    }
    fieldset.disabled = false;
    fields.cropId.addEventListener('change', () => loadStandards());
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const { planName, greenhouseId, plannedStartDate, plannedEndDate } =
        Object.fromEntries(new FormData(form));
      if (!planName.trim()) {
        showError('작기계획명을 입력해 주세요.');
        return;
      }
      if (!selectedStandardId) {
        showError('선택한 품목에 등록된 재배 기준이 없습니다.');
        return;
      }
      if (plannedStartDate >= plannedEndDate) {
        showError('예정 종료는 예정 시작보다 늦어야 합니다.');
        return;
      }
      showError();
      fieldset.disabled = true;
      try {
        const saved = await request(editing ? planApi : api, editing ? 'PATCH' : 'POST', {
          planName: planName.trim(),
          greenhouseId: Number(greenhouseId),
          standardId: Number(selectedStandardId),
          plannedStartDate,
          plannedEndDate
        });
        location.assign(`${page}/${saved.planId}`);
      } catch (error) {
        showError(error.message);
        fieldset.disabled = false;
      }
    });
    await loadStandards(plan?.standardId);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const member = await currentMember();
      if (!member) {
        location.replace('/login');
        return;
      }
      await ready;
      showAccount(member);
      bindAccount(() => location.assign('/mypage'));
      setCurrentMenu(document.body.dataset.page);
      if (planView === 'list') await bindList();
      else if (planView === 'detail') await bindDetail();
      else await bindForm();
    } catch (error) {
      showError(error.message);
    }
  });
})();

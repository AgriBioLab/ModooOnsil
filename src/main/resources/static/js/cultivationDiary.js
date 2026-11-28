// 재배일지 목록 · 상세 · 등록 · 수정 화면 제어 (표준 DOM + fetch + window.ModooCommon).
(() => {
  'use strict';

  const {
    ready,
    notify,
    escapeHtml,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu,
    renderPagination
  } = window.ModooCommon;

  const datePicker = window.ModooDatePicker || {};
  const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  const API_BASE = '/api/cultivation-diaries';

  let workingTasks = [];
  let editDiary = null;
  let activePlans = [];
  let stageOptions = null;
  let listRequestSeq = 0;
  let stageRequestSeq = 0;

  // === 1. 공통 유틸 · API 요청 ===

  const timeOf = task => String(task.startedAt || '').slice(11, 16) || '09:00';
  const timeSort = (a, b) =>
    timeOf(a).localeCompare(timeOf(b)) || (a.taskId || '').localeCompare(b.taskId || '');
  const makeStarted = (date, time) => `${date}T${time}:00`;
  const taskTone = status => (status === '완료' ? 'bg-light-success' : 'bg-light-gray');

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

  // === 2. 목록 화면 (/cultivation-diaries) ===

  function buildFilterQuery(form) {
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (value) query.set(name, value);
    }
    const dateInput = document.getElementById('workDateFilter');
    if (dateInput?.value) {
      query.set('workedDate', dateInput.value);
    }
    return query;
  }

  function renderListRows({ items: rows, total, page, size }) {
    const totalEl = document.getElementById('diaryTotal');
    const tbody = document.getElementById('diaryRows');
    if (!totalEl || !tbody) return;

    totalEl.textContent = String(total);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map((diary, index) => {
        const detailHref = `/cultivation-diaries/${encodeURIComponent(diary.diaryId)}`;
        return `
          <tr>
            <td class="row-index">${total - (page - 1) * size - index}</td>
            <td><a class="linkbtn" href="${escapeHtml(detailHref)}">${escapeHtml(diary.workedAt?.slice(0, 10))}</a></td>
            <td>${escapeHtml(diary.greenhouseName)}</td>
            <td>${escapeHtml(diary.cropName)}</td>
            <td>${escapeHtml(diary.varietyName)}</td>
            <td>${escapeHtml(diary.planName)}</td>
            <td>${escapeHtml(diary.growthStage || '-')}</td>
            <td class="tnum">${escapeHtml(diary.taskCount)} / ${escapeHtml(diary.incompleteTaskCount)}</td>
          </tr>
        `;
      })
      .join('');
  }

  async function loadList(filters, page = 1) {
    const sequence = ++listRequestSeq;
    const pagination = document.getElementById('diaryPagination');
    const query = new URLSearchParams(filters);
    query.set('page', page);
    try {
      const result = await request('/page?' + query);
      if (sequence !== listRequestSeq) return;
      if (result.totalPages && page > result.totalPages) {
        return loadList(filters, result.totalPages);
      }
      renderListRows(result);
      renderPagination(pagination, result.page, result.totalPages, next => loadList(filters, next));
    } catch (failure) {
      if (sequence !== listRequestSeq) return;
      renderPagination(pagination, 1, 0);
      const totalEl = document.getElementById('diaryTotal');
      const tbody = document.getElementById('diaryRows');
      if (totalEl) totalEl.textContent = '0';
      if (tbody) {
        tbody.innerHTML = `<tr><td class="empty" colspan="8" role="alert">${escapeHtml(failure.message)}</td></tr>`;
      }
    }
  }

  function setFilterOptions(select, names, selected) {
    if (!select) return;
    const firstLabel = select.options[0]?.textContent || '전체';
    const sorted = [...new Set(names.filter(name => name?.trim()))]
      .sort((a, b) => a.localeCompare(b, 'ko'));

    renderSelectOptions(
      select,
      [{ value: '', label: firstLabel }, ...sorted.map(name => ({ value: name, label: name }))],
      selected || ''
    );
  }

  function initListPage() {
    const form = document.getElementById('diaryFilters');
    const cropSelect = document.getElementById('filterCrop');
    const varietySelect = document.getElementById('filterVariety');
    const dateBox = document.getElementById('diaryDateControl');
    const resetBtn = document.getElementById('filterReset');
    if (!form) return;

    const initial = new URLSearchParams(location.search);
    let crops = [];

    function updateVarieties(selected) {
      const choices = crops.filter(item => !cropSelect.value || item.cropName === cropSelect.value);
      setFilterOptions(varietySelect, choices.map(item => item.varietyName), selected);
    }

    const controls = [...form.querySelectorAll('select, button')];
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');

    Promise.allSettled([
      requestJson('/api/cultivation-plans').then(plans => {
        setFilterOptions(
          document.getElementById('filterCycle'),
          plans.map(plan => plan.planName),
          initial.get('planName')
        );
      }),
      requestJson('/api/greenhouses').then(greenhouses => {
        setFilterOptions(
          document.getElementById('filterGreenhouse'),
          greenhouses.map(item => item.greenhouseName),
          initial.get('greenhouseName')
        );
      }),
      requestJson('/api/crops').then(items => {
        crops = items;
        setFilterOptions(cropSelect, crops.map(item => item.cropName), initial.get('cropName'));
        updateVarieties(initial.get('varietyName'));
      })
    ]).then(results => {
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute('aria-busy');
      if (results.some(result => result.status === 'rejected')) {
        notify('일부 검색 선택지를 불러오지 못했습니다. 새로고침해서 다시 시도하세요.');
      }
    });

    if (cropSelect) {
      cropSelect.addEventListener('change', () => updateVarieties(varietySelect.value));
    }

    if (dateBox && datePicker.singleDateControl) {
      dateBox.innerHTML = datePicker.singleDateControl('workDateFilter', initial.get('workedDate') || '');
      datePicker.mountSingleDatePicker('workDateFilter');
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      loadList(buildFilterQuery(form));
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.querySelectorAll('select').forEach(select => { select.value = ''; });
        updateVarieties('');
        if (datePicker.setSingleDateValue) {
          datePicker.setSingleDateValue('workDateFilter', '');
        }
        loadList(buildFilterQuery(form));
      });
    }

    const initialQuery = new URLSearchParams();
    for (const key of ['planName', 'greenhouseName', 'cropName', 'varietyName', 'workedDate']) {
      const value = initial.get(key);
      if (value) initialQuery.set(key, value);
    }
    loadList(initialQuery);
  }

  // === 3. 상세 화면 (/cultivation-diaries/{id}) ===

  async function fetchDetail(id) {
    const { diary, tasks } = await request('/' + encodeURIComponent(id));
    return {
      ...diary,
      workDate: diary.workedAt.slice(0, 10),
      stageId: diary.growthStage || '',
      tasks: tasks.map(task => ({
        taskId: String(task.taskId),
        name: task.taskName,
        type: task.taskType,
        startedAt: task.taskTime,
        status: task.taskStatus,
        content: task.taskContent || ''
      }))
    };
  }

  function showDetailError(message) {
    const errorEl = document.getElementById('detailErrorMsg');
    const returnLink = document.getElementById('returnList');
    const shell = document.getElementById('detailShell');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    if (returnLink) returnLink.classList.remove('hidden');
    if (shell) shell.classList.add('hidden');
  }

  async function initDetailPage(diaryId) {
    if (!diaryId) {
      showDetailError('잘못된 재배일지 요청입니다.');
      return;
    }

    let diary;
    try {
      diary = await fetchDetail(diaryId);
    } catch (failure) {
      showDetailError(failure.message);
      return;
    }

    setSummaryFacts(diary, diary.workDate, diary.stageId);

    const reason = toReason(diary.stageChangeReason);
    if (reason) {
      const reasonBar = document.getElementById('detailReasonBar');
      const reasonText = document.getElementById('detailReasonText');
      if (reasonText) reasonText.textContent = reason;
      if (reasonBar) reasonBar.classList.remove('hidden');
    }

    const doneCount = diary.tasks.filter(task => task.status === '완료').length;
    const dateMeta = [
      diary.createdAt ? `등록일 ${diary.createdAt.slice(0, 10)}` : '',
      diary.updatedAt ? `수정일 ${diary.updatedAt.slice(0, 10)}` : ''
    ].filter(Boolean).join(' · ');

    const counterEl = document.getElementById('detailTaskCounter');
    if (counterEl) {
      counterEl.textContent =
        `${diary.tasks.length}건 · 완료 ${doneCount} / 미완료 ${diary.tasks.length - doneCount}${dateMeta ? ` · ${dateMeta}` : ''}`;
    }

    const taskListEl = document.getElementById('detailTaskList');
    if (taskListEl) {
      taskListEl.innerHTML = diary.tasks.length
        ? [...diary.tasks]
            .sort(timeSort)
            .map(
              task => `
                <article class="detail-task">
                  <div class="t-row">
                    <strong>${escapeHtml(task.name)}</strong>
                    <span>${escapeHtml(timeOf(task))}</span>
                    <span>${escapeHtml(task.type)}</span>
                    <span>${escapeHtml(task.status)}</span>
                  </div>
                  <div class="details-content">${escapeHtml(task.content || '—')}</div>
                </article>
              `
            )
            .join('')
        : '<p class="empty">등록된 작업내용이 없습니다.</p>';
    }

    const deleteBox = document.getElementById('detailDeleteConfirm');
    const deleteBtn = document.getElementById('detailDelete');
    const cancelBtn = document.getElementById('detailDeleteCancel');
    const confirmBtn = document.getElementById('detailDeleteOk');

    if (deleteBtn && deleteBox) {
      deleteBtn.addEventListener('click', () => deleteBox.classList.remove('hidden'));
    }
    if (cancelBtn && deleteBox) {
      cancelBtn.addEventListener('click', () => deleteBox.classList.add('hidden'));
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        try {
          await request('/' + diary.diaryId, 'DELETE');
          notify('재배일지작업을 삭제했습니다.');
          location.href = '/cultivation-diaries';
        } catch (failure) {
          notify(failure.message);
        } finally {
          confirmBtn.disabled = false;
        }
      });
    }
  }

  // === 4. 등록 · 수정 화면 (/cultivation-diaries/new, /cultivation-diaries/{id}/edit) ===

  function freshTask(date) {
    return {
      taskId: 'NEW-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: '',
      type: '관수',
      startedAt: makeStarted(date, '09:00'),
      status: '미완료',
      content: ''
    };
  }

  function showFormError(message) {
    const box = document.getElementById('formError');
    if (!box) return;
    box.textContent = message;
    box.classList.remove('hidden');
  }

  function showFormLoadError(message) {
    const errorEl = document.getElementById('formLoadErrorMsg');
    const returnLink = document.getElementById('returnList');
    const form = document.getElementById('diaryForm');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    if (returnLink) returnLink.classList.remove('hidden');
    if (form) form.classList.add('hidden');
  }

  function selectedPlan() {
    const cycleId = document.getElementById('cycleId')?.value;
    return editDiary || activePlans.find(plan => String(plan.planId) === cycleId);
  }

  function refreshFormSummary() {
    const plan = selectedPlan();
    if (!plan) return;
    const workDate = document.getElementById('workDate')?.value || '';
    const stage = document.getElementById('stageId')?.value || '-';
    setSummaryFacts(plan, workDate, stage);
  }

  function updateReasonVisibility() {
    const box = document.getElementById('reasonBox');
    const stageSelect = document.getElementById('stageId');
    if (!box || !stageSelect) return;
    const changed = Boolean(stageOptions?.nextStage) && stageSelect.value !== stageOptions.currentStage;
    box.classList.toggle('hidden', !changed);
  }

  async function updateStageOptions() {
    const sequence = ++stageRequestSeq;
    const plan = selectedPlan();
    const dateInput = document.getElementById('workDate');
    const stageSelect = document.getElementById('stageId');
    const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
    if (!plan || !dateInput || !stageSelect || !submitBtn) return;

    const previousOption = stageSelect.value;
    stageOptions = null;
    submitBtn.disabled = true;
    stageSelect.disabled = true;

    try {
      const result = editDiary
        ? { currentStage: editDiary.stageId }
        : await request('/plans/' + plan.planId + '/stages?' + new URLSearchParams({ workedDate: dateInput.value }));

      if (sequence !== stageRequestSeq) return;

      stageOptions = result;
      const stages = [result.currentStage, result.nextStage].filter(stage => stage != null);
      const selected = stages.includes(previousOption) ? previousOption : result.currentStage;
      renderSelectOptions(
        stageSelect,
        stages.map(stage => ({ value: stage, label: stage || '-' })),
        selected
      );
      stageSelect.disabled = !result.nextStage;
      submitBtn.disabled = Boolean(result.duplicate);

      document.getElementById('duplicateNotice')?.classList.toggle('hidden', !result.duplicate);
      document.getElementById('formError')?.classList.add('hidden');
      updateReasonVisibility();
      refreshFormSummary();
    } catch (failure) {
      if (sequence === stageRequestSeq) {
        showFormError(failure.message);
      }
    }
  }

  function gatherTasks() {
    const cards = [...document.querySelectorAll('#taskList [data-taskid]')];
    if (!cards.length) return;

    const workDate = document.getElementById('workDate')?.value || today();
    workingTasks = cards.map(card => {
      const previous = workingTasks.find(item => item.taskId === card.dataset.taskid) || freshTask(workDate);
      const timeValue = card.querySelector('.t-time')?.value || '';
      return {
        ...previous,
        name: card.querySelector('.t-name')?.value ?? previous.name,
        type: card.querySelector('.t-type')?.value ?? previous.type,
        status: card.querySelector('.t-status')?.value ?? previous.status,
        content: card.querySelector('.t-content')?.value ?? previous.content,
        startedAt: timeValue ? makeStarted(workDate, timeValue) : ''
      };
    });
  }

  function createTaskCard(task, template) {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('.task-card');
    const titleEl = card.querySelector('.title-text');
    const summaryTimeEl = card.querySelector('.summary-time');
    const summaryTypeEl = card.querySelector('.summary-type');
    const summaryStatusEl = card.querySelector('.summary-status');
    const removeBtn = card.querySelector('[data-remove]');
    const nameInput = card.querySelector('.t-name');
    const typeSelect = card.querySelector('.t-type');
    const timeInput = card.querySelector('.t-time');
    const statusSelect = card.querySelector('.t-status');
    const contentInput = card.querySelector('.t-content');

    const title = task.name || '새 작업';
    const timeText = timeOf(task);

    card.dataset.taskid = task.taskId;
    titleEl.textContent = title;
    summaryTimeEl.textContent = timeText;
    summaryTypeEl.textContent = task.type;
    summaryStatusEl.textContent = task.status;
    summaryStatusEl.className = `krds-badge ${taskTone(task.status)} summary-status`;

    removeBtn.dataset.remove = task.taskId;
    removeBtn.setAttribute('aria-label', `${title} 삭제`);

    nameInput.value = task.name;
    if (task.type && ![...typeSelect.options].some(opt => opt.value === task.type)) {
      typeSelect.add(new Option(task.type, task.type));
    }
    typeSelect.value = task.type;
    timeInput.value = timeText;
    statusSelect.value = task.status;
    contentInput.value = task.content;

    removeBtn.addEventListener('click', () => {
      gatherTasks();
      workingTasks = workingTasks.filter(item => item.taskId !== task.taskId);
      paintTasks();
    });

    nameInput.addEventListener('input', () => {
      titleEl.textContent = nameInput.value.trim() || '새 작업';
    });
    timeInput.addEventListener('input', () => {
      summaryTimeEl.textContent = timeInput.value || '--:--';
    });
    typeSelect.addEventListener('change', () => {
      summaryTypeEl.textContent = typeSelect.value;
    });
    statusSelect.addEventListener('change', () => {
      summaryStatusEl.textContent = statusSelect.value;
      summaryStatusEl.className = `krds-badge ${taskTone(statusSelect.value)} summary-status`;
    });
    timeInput.addEventListener('change', () => {
      const focusedId = card.dataset.taskid;
      gatherTasks();
      paintTasks();
      const moved = document.querySelector(`#taskList [data-taskid="${CSS.escape(focusedId)}"]`);
      moved?.scrollIntoView({ block: 'nearest' });
    });

    return card;
  }

  function paintTasks() {
    const list = document.getElementById('taskList');
    const totalEl = document.getElementById('taskTotal');
    const template = document.getElementById('diaryTaskCardTemplate');
    if (!list || !template) return;

    workingTasks.sort(timeSort);
    if (totalEl) totalEl.textContent = `${workingTasks.length}건`;
    list.replaceChildren(...workingTasks.map(task => createTaskCard(task, template)));
  }

  function nextTaskStartTime(date) {
    const lastTask = [...workingTasks].sort(timeSort).at(-1);
    if (!lastTask) return null;

    const [hours, minutes] = timeOf(lastTask).split(':').map(Number);
    const nextMinutes = hours * 60 + minutes + 30;
    if (nextMinutes >= 24 * 60) return null;

    const hh = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
    const mm = String(nextMinutes % 60).padStart(2, '0');
    return makeStarted(date, `${hh}:${mm}`);
  }

  async function saveEditor() {
    const form = document.getElementById('diaryForm');
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (!form || !submitBtn || submitBtn.disabled || !stageOptions) return;

    const workDate = document.getElementById('workDate').value;
    gatherTasks();

    if (workingTasks.some(task => !task.name.trim() || !task.startedAt)) {
      showFormError('모든 작업의 작업명과 작업시간을 입력하세요.');
      return;
    }

    const tasks = workingTasks.map(task => ({
      taskId: task.taskId.startsWith('NEW-') ? null : task.taskId,
      taskName: task.name,
      taskType: task.type,
      taskTime: task.startedAt,
      taskStatus: task.status,
      taskContent: task.content
    }));

    submitBtn.disabled = true;
    try {
      let diaryId = editDiary?.diaryId;
      if (editDiary) {
        await request('/' + diaryId + '/tasks', 'PUT', { tasks });
      } else {
        const result = await request('', 'POST', {
          planId: document.getElementById('cycleId').value,
          workedDate: workDate,
          growthStage: document.getElementById('stageId').value,
          stageChangeReason: (document.getElementById('stageChangeReason')?.value || '').trim(),
          tasks
        });
        diaryId = result.diaryId;
      }

      notify(editDiary ? '재배일지작업을 수정했습니다.' : '재배일지작업을 등록했습니다.');
      location.href = `/cultivation-diaries/${encodeURIComponent(diaryId)}`;
    } catch (failure) {
      showFormError(failure.message);
    } finally {
      submitBtn.disabled = false;
    }
  }

  async function initFormPage(isEdit, diaryId) {
    try {
      editDiary = isEdit ? await fetchDetail(diaryId) : null;
      activePlans = isEdit ? [] : await request('/plans');
    } catch (failure) {
      showFormLoadError(failure.message);
      return;
    }

    if (!editDiary && !activePlans.length) {
      showFormLoadError('진행 중인 작기가 없습니다.');
      return;
    }

    const currentPlan = editDiary || activePlans[0];
    const date = editDiary?.workDate || today();
    const minDate = editDiary ? date : currentPlan.actualStartDate.slice(0, 10);
    workingTasks = editDiary ? JSON.parse(JSON.stringify(editDiary.tasks)) : [];

    const cycleSelect = document.getElementById('cycleId');
    if (cycleSelect) {
      renderSelectOptions(
        cycleSelect,
        (isEdit ? [currentPlan] : activePlans).map(plan => ({
          value: plan.planId,
          label: plan.planName
        })),
        currentPlan.planId
      );
      cycleSelect.addEventListener('change', () => {
        const plan = selectedPlan();
        const currentDate = document.getElementById('workDate').value;
        const planMin = plan.actualStartDate.slice(0, 10);
        datePicker.setSingleDateValue(
          'workDate',
          currentDate && currentDate >= planMin ? currentDate : planMin,
          { min: planMin, max: today() }
        );
        updateStageOptions();
      });
    }

    const workDateBox = document.getElementById('workDateControl');
    if (workDateBox && datePicker.singleDateControl) {
      workDateBox.innerHTML = datePicker.singleDateControl('workDate', date, {
        min: minDate,
        max: today(),
        disabled: isEdit,
        clearable: false
      });
      datePicker.mountSingleDatePicker('workDate');
      document.getElementById('workDate')?.addEventListener('change', updateStageOptions);
    }

    if (isEdit) {
      const confirmedReason = toReason(editDiary.stageChangeReason);
      if (confirmedReason) {
        const textEl = document.getElementById('confirmedReasonText');
        const boxEl = document.getElementById('confirmedReasonBox');
        if (textEl) textEl.textContent = confirmedReason;
        if (boxEl) boxEl.classList.remove('hidden');
      }
    }

    document.getElementById('stageId')?.addEventListener('change', () => {
      updateReasonVisibility();
      refreshFormSummary();
    });

    document.getElementById('addTask')?.addEventListener('click', () => {
      gatherTasks();
      const workDate = document.getElementById('workDate').value;
      const newTask = freshTask(workDate);
      const nextStartedAt = nextTaskStartTime(workDate);
      if (nextStartedAt) {
        newTask.startedAt = nextStartedAt;
      }
      workingTasks.push(newTask);
      paintTasks();

      const target = document.querySelector(`#taskList [data-taskid="${CSS.escape(newTask.taskId)}"]`);
      target?.scrollIntoView({ block: 'nearest' });
      target?.querySelector('.t-name')?.focus();
    });

    document.getElementById('diaryForm')?.addEventListener('submit', event => {
      event.preventDefault();
      saveEditor();
    });

    paintTasks();
    updateStageOptions();
    refreshFormSummary();
  }

  // === 5. 페이지 진입점 ===

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

    const view = document.body.dataset.diaryView || document.body.dataset.page || 'list';
    const diaryId = document.body.dataset.diaryId || '';

    setCurrentMenu(view === 'create' ? 'create' : 'list');

    if (view === 'detail') {
      await initDetailPage(diaryId);
      return;
    }
    if (view === 'create' || view === 'edit') {
      await initFormPage(view === 'edit', diaryId);
      return;
    }
    initListPage();
  });
})();

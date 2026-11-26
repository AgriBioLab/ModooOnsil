// 재배일지 등록 · 수정 화면 (/cultivation-diaries/new, /cultivation-diaries/{id}/edit).
(() => {
  'use strict';

  const {
    today,
    notify,
    timeOf,
    timeSort,
    makeStarted,
    toReason,
    renderSelectOptions,
    requestJson,
    request,
    setSummaryFacts,
    initDiaryShell
  } = window.ModooDiaryCommon;
  const datePicker = window.ModooDatePicker || {};

  let workingTasks = [];
  let editDiary = null;
  let activePlans = [];
  let stageOptions = null;
  let stageRequestSeq = 0;

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


  document.addEventListener('DOMContentLoaded', async () => {
    const view = document.body.dataset.diaryView || document.body.dataset.page || 'create';
    const diaryId = document.body.dataset.diaryId || '';
    if (await initDiaryShell(view === 'create' ? 'create' : 'list')) {
      await initFormPage(view === 'edit', diaryId);
    }
  });
})();

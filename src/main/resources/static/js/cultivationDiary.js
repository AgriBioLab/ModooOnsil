// TODO (SCRUM-180): 상세·등록·수정 HTML 문자열 조립을 별도 Thymeleaf 페이지·Controller로 분리하고,
//                    ui-utils.js(window.ModooApp) 의존 제거 및 표준 DOM·직접 fetch 구조로 정리 예정.
(() => {
  'use strict';

  const app = window.ModooApp;
  const {
    state, config, pages, $, $$, escapeHtml, htmlText, clone, toast, options,
    timeOf, timeSort, makeStarted, taskTone, trashSvg, toReason, getReasons,
    error, go, heading, bindBack, singleDateControl, setSingleDateValue,
    mountSingleDatePicker
  } = app;

  const main = $('#main');
  const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  const endpoint = '/api/cultivation-diaries';

  let working = [];
  let editRow = null;
  let plans = [];
  let stageOptions = null;
  let listRequest = 0;
  let stageRequest = 0;
  let filterOptionsReady;

  // === 1. 공통 API 요청 · 오류 처리 ===

  function request(path = '', method = 'GET', body) {
    return requestJson(endpoint + path, method, body);
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
      location.replace(new URL('login', document.baseURI));
      throw new Error('로그인이 필요합니다.');
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.detail || '재배일지 요청을 처리할 수 없습니다.');
    }
    return response.status === 204 ? null : response.json();
  }

  function showLoadError(message) {
    main.innerHTML = heading('재배일지작업', message, true);
    bindBack();
  }

  // === 2. 목록 조회 · 검색 필터 ===

  function filterQuery(form) {
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (value) query.set(name, value);
    }
    const date = $('#workDateFilter', form).value;
    if (date) query.set('workedDate', date);
    return query;
  }

  function renderRows(rows) {
    $('#diaryTotal', main).textContent = rows.length;
    $('#diaryRows', main).innerHTML = rows.length
      ? rows.map((diary, index) => {
          const detailUrl = new URL('cultivation-diaries/' + encodeURIComponent(diary.diaryId), document.baseURI);
          return `
            <tr>
              <td class="row-index">${rows.length - index}</td>
              <td><a class="linkbtn" href="${escapeHtml(detailUrl.href)}">${htmlText(diary.workedAt?.slice(0, 10))}</a></td>
              <td>${htmlText(diary.greenhouseName)}</td>
              <td>${htmlText(diary.cropName)}</td>
              <td>${htmlText(diary.varietyName)}</td>
              <td>${htmlText(diary.planName)}</td>
              <td>${htmlText(diary.growthStage || '-')}</td>
              <td class="tnum">${htmlText(diary.taskCount)} / ${htmlText(diary.incompleteTaskCount)}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>';
  }

  async function loadList(query) {
    const sequence = ++listRequest;
    try {
      const rows = await request('?' + query);
      if (state.page === 'list' && sequence === listRequest) {
        renderRows(rows);
      }
    } catch (failure) {
      if (state.page === 'list' && sequence === listRequest) {
        $('#diaryTotal', main).textContent = '0';
        $('#diaryRows', main).innerHTML =
          `<tr><td class="empty" colspan="8" role="alert">${htmlText(failure.message)}</td></tr>`;
      }
    }
  }

  function setFilterOptions(select, names, selected) {
    const first = select.options[0];
    const sorted = [...new Set(names.filter(name => name?.trim()))]
      .sort((firstName, secondName) => firstName.localeCompare(secondName, 'ko'));

    select.innerHTML = options(
      [
        { value: '', label: first.textContent },
        ...sorted.map(name => ({ value: name, label: name }))
      ],
      selected
    );
  }

  function bindList(initial) {
    const list = $('#diaryList', main);
    const form = $('#diaryFilters', list);
    const crop = $('#filterCrop', list);
    const variety = $('#filterVariety', list);
    let crops = [];

    function updateVarieties(selected) {
      const choices = crops.filter(option => !crop.value || option.cropName === crop.value);
      setFilterOptions(variety, choices.map(option => option.varietyName), selected);
    }

    const controls = [...form.querySelectorAll('select, button')];
    for (const control of controls) control.disabled = true;
    form.setAttribute('aria-busy', 'true');

    filterOptionsReady = Promise.allSettled([
      requestJson('/api/cultivation-plans').then(planItems => {
        setFilterOptions($('#filterCycle', form), planItems.map(plan => plan.planName), initial.get('planName'));
      }),
      requestJson('/api/greenhouses').then(greenhouses => {
        setFilterOptions(
          $('#filterGreenhouse', form),
          greenhouses.map(item => item.greenhouseName),
          initial.get('greenhouseName')
        );
      }),
      requestJson('/api/crops').then(items => {
        crops = items;
        setFilterOptions(crop, crops.map(option => option.cropName), initial.get('cropName'));
        updateVarieties(initial.get('varietyName'));
      })
    ]).then(results => {
      for (const control of controls) control.disabled = false;
      form.removeAttribute('aria-busy');
      if (results.some(result => result.status === 'rejected')) {
        toast('일부 검색 선택지를 불러오지 못했습니다. 새로고침해서 다시 시도하세요.');
      }
    });

    crop.onchange = () => updateVarieties(variety.value);
    $('#diaryDateControl', list).innerHTML = singleDateControl('workDateFilter', initial.get('workedDate') || '');
    mountSingleDatePicker('workDateFilter');

    form.onsubmit = event => {
      event.preventDefault();
      loadList(filterQuery(form));
    };

    $('#filterReset', list).onclick = () => {
      for (const field of form.querySelectorAll('select')) field.value = '';
      updateVarieties('');
      setSingleDateValue('workDateFilter', '');
      loadList(filterQuery(form));
    };
  }

  // === 3. 상세 조회 · 삭제 ===

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

  function detailTaskItemHtml(task) {
    return `
      <article class="detail-task">
        <div class="t-row">
          <strong>${htmlText(task.name)}</strong>
          <span>${timeOf(task)}</span>
          <span>${htmlText(task.type)}</span>
          <span>${htmlText(task.status)}</span>
        </div>
        <div class="details-content">${htmlText(task.content || '—')}</div>
      </article>
    `;
  }

  async function renderDetail() {
    const id = state.selectedId;
    main.innerHTML = heading('재배일지작업 상세');

    let diary;
    try {
      diary = await fetchDetail(id);
    } catch (failure) {
      if (state.page === 'detail' && state.selectedId === id) {
        showLoadError(failure.message);
      }
      return;
    }

    if (state.page !== 'detail' || state.selectedId !== id) return;

    const doneCount = diary.tasks.filter(task => task.status === '완료').length;
    const reason = toReason(diary.stageChangeReason);
    const dateMeta = [
      diary.createdAt ? `등록일 ${diary.createdAt.slice(0, 10)}` : '',
      diary.updatedAt ? `수정일 ${diary.updatedAt.slice(0, 10)}` : ''
    ].filter(Boolean).join(' · ');

    const reasonHtml = reason
      ? `<div class="detail-meta-bar"><div class="detail-reason"><strong>생육단계 변경 사유</strong><span>${htmlText(reason)}</span></div></div>`
      : '';

    const taskListHtml = [...diary.tasks].sort(timeSort).map(detailTaskItemHtml).join('')
      || '<p class="empty" style="padding:24px">등록된 작업내용이 없습니다.</p>';

    main.innerHTML = heading('재배일지작업 상세', '') + `
      <div class="editor-shell">
        <section class="panel editor-summary detail-summary-card" aria-label="재배일지 요약">
          ${summaryHTML(diary, diary.workDate, diary.stageId)}
          ${reasonHtml}
        </section>
        <section class="panel editor-workpanel">
          <div class="panel-head">
            <h2>작업내용</h2>
            <span class="counter">${diary.tasks.length}건 · 완료 ${doneCount} / 미완료 ${diary.tasks.length - doneCount}${dateMeta ? ` · ${htmlText(dateMeta)}` : ''}</span>
          </div>
          <div class="task-body">
            <div class="task-list-header detail-task-header">
              <span>작업명</span>
              <span>작업시간</span>
              <span>작업유형</span>
              <span>상태</span>
            </div>
            <div class="task-scroll detail-list">${taskListHtml}</div>
            <div class="detail-delete-confirm hidden" id="detailDeleteConfirm">
              <span>이 재배일지작업을 삭제하시겠습니까?</span>
              <button type="button" class="btn" id="detailDeleteCancel">취소</button>
              <button type="button" class="btn main" id="detailDeleteOk">삭제 확인</button>
            </div>
            <div class="form-actions">
              <div class="module-actions-left">
                <button class="btn" id="detailBack">목록</button>
              </div>
              <button class="btn" id="detailDelete">삭제</button>
              <button class="btn main" id="detailEdit">수정</button>
            </div>
          </div>
        </section>
      </div>
    `;

    bindBack();
    $('#detailBack').onclick = () => go('list');
    $('#detailEdit').onclick = () => go('edit', diary.diaryId);
    $('#detailDelete').onclick = () => $('#detailDeleteConfirm').classList.remove('hidden');
    $('#detailDeleteCancel').onclick = () => $('#detailDeleteConfirm').classList.add('hidden');
    $('#detailDeleteOk').onclick = async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await request('/' + diary.diaryId, 'DELETE');
        toast('재배일지작업을 삭제했습니다.');
        if (state.page === 'detail' && state.selectedId === id) {
          go('list');
        }
      } catch (failure) {
        toast(failure.message);
      } finally {
        button.disabled = false;
      }
    };
  }

  // === 4. 작업 항목 카드 · 등록/수정 에디터 ===

  function freshTask(date) {
    return {
      taskId: 'NEW-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: '',
      type: config.workTypes[0].value,
      startedAt: makeStarted(date, '09:00'),
      status: '미완료',
      content: ''
    };
  }

  function taskPanel(task) {
    const title = htmlText(task.name || '새 작업');
    return `
      <article class="task-card" data-taskid="${escapeHtml(task.taskId)}">
        <div class="task-summary">
          <strong class="task-title title-text">${title}</strong>
          <span class="summary-time">${timeOf(task)}</span>
          <span class="summary-type">${htmlText(task.type)}</span>
          <span class="krds-badge ${taskTone(task.status)} summary-status">${htmlText(task.status)}</span>
          <button class="trash" type="button" data-remove="${escapeHtml(task.taskId)}" aria-label="${title} 삭제" title="삭제">${trashSvg}</button>
        </div>
        <div class="task-detail">
          <div class="field wide">
            <label>작업명 *</label>
            <input class="ctrl compact-input t-name" maxlength="100" value="${escapeHtml(task.name)}" placeholder="작업명">
          </div>
          <div class="field">
            <label>작업유형 *</label>
            <select class="ctrl t-type">${options(config.workTypes, task.type)}</select>
          </div>
          <div class="field">
            <label>작업시간 *</label>
            <input class="ctrl t-time" type="time" value="${timeOf(task)}">
          </div>
          <div class="field">
            <label>작업상태 *</label>
            <select class="ctrl t-status">${options(config.taskStatuses, task.status)}</select>
          </div>
          <div class="field wide">
            <label>작업내용</label>
            <textarea class="ctrl t-content" rows="2" placeholder="작업 내용을 입력하세요">${htmlText(task.content)}</textarea>
          </div>
        </div>
      </article>
    `;
  }

  function gatherTasks() {
    const cards = $$('[data-taskid]', main);
    if (!cards.length) return;

    const workDate = $('#workDate')?.value || today();
    working = cards.map(card => {
      const previous = working.find(item => item.taskId === card.dataset.taskid) || freshTask(workDate);
      const time = $('.t-time', card).value;
      return {
        ...previous,
        name: $('.t-name', card)?.value ?? previous.name,
        type: $('.t-type', card)?.value ?? previous.type,
        status: $('.t-status', card)?.value ?? previous.status,
        content: $('.t-content', card)?.value ?? previous.content,
        startedAt: time ? makeStarted($('#workDate').value, time) : ''
      };
    });
  }

  function paintTasks() {
    const list = $('#taskList');
    if (!list) return;

    working.sort(timeSort);
    $('#taskTotal').textContent = `${working.length}건`;
    list.innerHTML = working.map(taskPanel).join('');

    for (const button of $$('[data-remove]', list)) {
      button.onclick = () => {
        gatherTasks();
        working = working.filter(task => task.taskId !== button.dataset.remove);
        paintTasks();
      };
    }

    for (const card of $$('.task-card', list)) {
      const titleEl = $('.title-text', card);
      const nameInput = $('.t-name', card);
      const timeInput = $('.t-time', card);
      const typeSelect = $('.t-type', card);
      const statusSelect = $('.t-status', card);

      nameInput.addEventListener('input', () => {
        titleEl.textContent = nameInput.value.trim() || '새 작업';
      });
      timeInput.addEventListener('input', () => {
        $('.summary-time', card).textContent = timeInput.value || '--:--';
      });
      typeSelect.addEventListener('change', () => {
        $('.summary-type', card).textContent = typeSelect.value;
      });
      statusSelect.addEventListener('change', () => {
        const badge = $('.summary-status', card);
        badge.textContent = statusSelect.value;
        badge.className = `krds-badge ${taskTone(statusSelect.value)} summary-status`;
      });
      timeInput.addEventListener('change', () => {
        const focusedId = card.dataset.taskid;
        gatherTasks();
        paintTasks();
        const moved = $$('[data-taskid]', list).find(el => el.dataset.taskid === focusedId);
        moved?.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  function reasonInputHtml(value = '') {
    return `
      <div class="reason-box hidden" id="reasonBox">
        <label for="stageChangeReason" class="label">생육단계 변경 사유 *</label>
        <textarea class="ctrl textarea" id="stageChangeReason" rows="4" maxlength="500" placeholder="실제 생육단계를 변경한 근거와 관찰 내용을 입력하세요">${htmlText(toReason(value))}</textarea>
      </div>
    `;
  }

  function gatherReason() {
    return ($('#stageChangeReason')?.value || '').trim();
  }

  function selectedPlan() {
    return editRow || plans.find(plan => String(plan.planId) === $('#cycleId').value);
  }

  function updateCycleData() {
    const plan = selectedPlan();
    const date = $('#workDate').value;
    const min = plan.actualStartDate.slice(0, 10);
    setSingleDateValue('workDate', date && date >= min ? date : min, { min, max: today() });
    updateStageOptions();
  }

  async function updateStageOptions() {
    const sequence = ++stageRequest;
    const plan = selectedPlan();
    const date = $('#workDate').value;
    const select = $('#stageId');
    const submit = $('#diaryForm button[type="submit"]');
    const previousOption = select.value;

    stageOptions = null;
    submit.disabled = true;
    select.disabled = true;

    try {
      const result = editRow
        ? { currentStage: editRow.stageId }
        : await request('/plans/' + plan.planId + '/stages?' + new URLSearchParams({ workedDate: date }));

      if (sequence !== stageRequest || !select.isConnected) return;

      stageOptions = result;
      const stages = [result.currentStage, result.nextStage].filter(stage => stage != null);
      const selectedStage = stages.includes(previousOption) ? previousOption : result.currentStage;
      select.innerHTML = options(stages.map(stage => ({ value: stage, label: stage || '-' })), selectedStage);
      select.disabled = !result.nextStage;
      submit.disabled = Boolean(result.duplicate);

      $('#duplicateNotice').classList.toggle('hidden', !result.duplicate);
      $('#formError').classList.add('hidden');
      updateReasonVisibility();
      refreshSummary();
    } catch (failure) {
      if (sequence === stageRequest && select.isConnected) {
        error(failure.message);
      }
    }
  }

  function updateReasonVisibility() {
    const box = $('#reasonBox');
    if (box) {
      box.classList.toggle('hidden', !stageOptions?.nextStage || $('#stageId').value === stageOptions.currentStage);
    }
  }

  function summaryHTML(context, date, stage) {
    return `
      <div class="summary-strip">
        <div class="summary-fact">
          <span>작기계획명</span>
          <strong id="summaryCycle" title="${htmlText(context.planName)}">${htmlText(context.planName)}</strong>
        </div>
        <div class="summary-fact">
          <span>품목명 · 품종명</span>
          <strong id="summaryCrop">${htmlText(context.cropName || '-')} · ${htmlText(context.varietyName || '-')}</strong>
        </div>
        <div class="summary-fact">
          <span>온실명</span>
          <strong id="summaryHouse">${htmlText(context.greenhouseName || '-')}</strong>
        </div>
        <div class="summary-fact">
          <span>실제 작업일</span>
          <strong id="summaryDate">${htmlText(date)}</strong>
        </div>
        <div class="summary-fact">
          <span>실제 생육단계</span>
          <strong id="summaryStage">${htmlText(stage || '-')}</strong>
        </div>
      </div>
    `;
  }

  function refreshSummary() {
    const plan = selectedPlan();
    const values = {
      summaryCycle: plan.planName,
      summaryCrop: `${plan.cropName} · ${plan.varietyName}`,
      summaryHouse: plan.greenhouseName,
      summaryDate: $('#workDate').value,
      summaryStage: $('#stageId').value || '-'
    };

    for (const [id, value] of Object.entries(values)) {
      const element = $('#' + id);
      element.textContent = value;
      element.title = value;
    }
  }

  function nextTaskStartTime(date) {
    const lastTask = [...working].sort(timeSort).at(-1);
    if (!lastTask) return null;

    const [hours, minutes] = timeOf(lastTask).split(':').map(Number);
    const nextMinutes = hours * 60 + minutes + 30;
    if (nextMinutes >= 24 * 60) return null;

    const hh = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
    const mm = String(nextMinutes % 60).padStart(2, '0');
    return makeStarted(date, `${hh}:${mm}`);
  }

  async function renderEditor(isEdit) {
    const id = state.selectedId;
    const pageTitle = isEdit ? '재배일지작업 수정' : '재배일지작업 등록';
    main.innerHTML = heading(pageTitle);

    let diary;
    let activePlans;
    try {
      diary = isEdit ? await fetchDetail(id) : null;
      activePlans = isEdit ? [] : await request('/plans');
    } catch (failure) {
      if (state.page === (isEdit ? 'edit' : 'create') && (!isEdit || state.selectedId === id)) {
        showLoadError(failure.message);
      }
      return;
    }

    if (state.page !== (isEdit ? 'edit' : 'create') || (isEdit && state.selectedId !== id)) return;

    editRow = diary;
    plans = activePlans;
    if (!diary && !activePlans.length) {
      showLoadError('진행 중인 작기가 없습니다.');
      return;
    }

    const currentPlan = diary || activePlans[0];
    const date = diary?.workDate || today();
    const min = diary ? date : currentPlan.actualStartDate.slice(0, 10);
    working = diary ? clone(diary.tasks) : [];

    const planOptions = (isEdit ? [currentPlan] : activePlans).map(plan => ({
      value: plan.planId,
      label: plan.planName
    }));
    const confirmedReasonHtml = isEdit && toReason(diary.stageChangeReason)
      ? `<div class="reason-box"><strong>확정된 변경 사유</strong>${getReasons(diary.stageChangeReason)}</div>`
      : '';

    main.innerHTML = heading(pageTitle, '') + `
      <form class="editor-shell" id="diaryForm" novalidate>
        <section class="panel editor-summary" aria-label="재배일지작업 기본정보">
          ${summaryHTML(currentPlan, date, diary?.stageId)}
          <div class="summary-detail" id="baseFields">
            <div class="field">
              <label for="cycleId">작기계획명 <span class="required">*</span></label>
              <select class="ctrl" id="cycleId" ${isEdit ? 'disabled' : ''}>${options(planOptions, currentPlan.planId)}</select>
            </div>
            <div class="field">
              <label for="workDateTrigger">실제 작업일 <span class="required">*</span></label>
              ${singleDateControl('workDate', date, { min, max: today(), disabled: isEdit, clearable: false })}
            </div>
            <div class="stage-group" aria-label="실제 생육단계">
              <div class="field">
                <label for="stageId">해당 날짜의 실제 생육단계 <span class="required">*</span></label>
                <select class="ctrl" id="stageId"></select>
              </div>
            </div>
            ${confirmedReasonHtml}
            ${!isEdit ? reasonInputHtml() : ''}
            <div id="duplicateNotice" class="errorbox hidden" role="status">해당 날짜에 이미 재배일지가 등록되어 있습니다.</div>
            <div id="formError" class="errorbox hidden" role="alert"></div>
          </div>
        </section>
        <section class="panel editor-workpanel">
          <div class="panel-head">
            <h2>작업내용</h2>
            <span class="counter" id="taskTotal">0건</span>
          </div>
          <div class="task-body">
            <div class="task-tools">
              <span class="muted small">작업시간 오름차순</span>
            </div>
            <div class="task-scroll" id="tasksScroll">
              <div class="task-list-header">
                <span>작업명</span>
                <span>작업시간</span>
                <span>작업유형</span>
                <span>작업상태</span>
                <span></span>
              </div>
              <div id="taskList"></div>
            </div>
            <button class="add-btn" id="addTask" type="button">+ 작업내용 추가</button>
            <div class="form-actions">
              <button class="btn" type="button" id="cancel">취소</button>
              <button class="btn main" type="submit">${isEdit ? '수정 저장' : '등록'}</button>
            </div>
          </div>
        </section>
      </form>
    `;

    mountSingleDatePicker('workDate');
    bindBack();
    paintTasks();

    $('#cycleId').onchange = updateCycleData;
    $('#workDate').onchange = updateStageOptions;
    $('#stageId').onchange = () => {
      updateReasonVisibility();
      refreshSummary();
    };

    $('#addTask').onclick = () => {
      gatherTasks();
      const workDate = $('#workDate').value;
      const newTask = freshTask(workDate);
      const nextStartedAt = nextTaskStartTime(workDate);
      if (nextStartedAt) {
        newTask.startedAt = nextStartedAt;
      }
      working.push(newTask);
      paintTasks();

      const target = $$('[data-taskid]', $('#taskList')).find(el => el.dataset.taskid === newTask.taskId);
      target?.scrollIntoView({ block: 'nearest' });
      $('.t-name', target)?.focus();
    };

    $('#cancel').onclick = () => go(isEdit ? 'detail' : 'list', diary?.diaryId);
    $('#diaryForm').onsubmit = event => {
      event.preventDefault();
      saveEditor();
    };

    updateStageOptions();
    refreshSummary();
  }

  async function saveEditor() {
    const form = $('#diaryForm');
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled || !stageOptions) return;

    const editing = editRow;
    const date = $('#workDate').value;
    gatherTasks();

    if (working.some(task => !task.name.trim() || !task.startedAt)) {
      error('모든 작업의 작업명과 작업시간을 입력하세요.');
      return;
    }

    const tasks = working.map(task => ({
      taskId: task.taskId.startsWith('NEW-') ? null : task.taskId,
      taskName: task.name,
      taskType: task.type,
      taskTime: task.startedAt,
      taskStatus: task.status,
      taskContent: task.content
    }));

    button.disabled = true;
    try {
      let diaryId = editing?.diaryId;
      if (editing) {
        await request('/' + diaryId + '/tasks', 'PUT', { tasks });
      } else {
        const growthStage = $('#stageId').value;
        const result = await request('', 'POST', {
          planId: $('#cycleId').value,
          workedDate: date,
          growthStage,
          stageChangeReason: gatherReason(),
          tasks
        });
        diaryId = result.diaryId;
      }

      toast(editing ? '재배일지작업을 수정했습니다.' : '재배일지작업을 등록했습니다.');
      if (form.isConnected) {
        go('detail', String(diaryId));
      }
    } catch (failure) {
      if (form.isConnected) {
        error(failure.message);
      }
    } finally {
      button.disabled = false;
    }
  }

  // === 5. 페이지 모듈 등록 ===

  pages.diary = {
    renderList() {
      const form = $('#diaryFilters', main);
      if (!form.onsubmit) {
        const initial = new URLSearchParams(location.search);
        bindList(initial);
        const query = new URLSearchParams();
        for (const name of ['planName', 'greenhouseName', 'cropName', 'varietyName', 'workedDate']) {
          const value = initial.get(name);
          if (value) query.set(name, value);
        }
        loadList(query);
        return;
      }
      loadList(filterQuery(form));
    },
    renderDetail,
    renderEditor,
    async applyCycleFilter(planName) {
      await filterOptionsReady;
      const form = $('#diaryFilters', main);
      $('#filterCycle', form).value = planName;
      const query = filterQuery(form);
      query.set('planName', planName);
      loadList(query);
    }
  };
})();

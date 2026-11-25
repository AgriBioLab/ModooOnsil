(() => {
'use strict';
const app = window.ModooApp;
const { state, config, pages, $, $$, escapeHtml, htmlText, clone, toast, options,
 timeOf, timeSort, makeStarted, taskTone, trashSvg, toReason, getReasons, error, go, heading,
 bindBack, singleDateControl, setSingleDateValue,
 mountSingleDatePicker } = app;
const main = $('#main');
const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date());
const endpoint = '/api/cultivation-diaries';
let working = [], editRow = null, plans = [], stageOptions = null;
let listRequest = 0, stageRequest = 0;
let filterOptionsReady;

function request(path = '', method = 'GET', body) {
 return requestJson(endpoint + path, method, body);
}

async function requestJson(url, method = 'GET', body) {
 const response = await fetch(url, {
  method,
  ...(body === undefined ? {} : {headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)})
 });
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
 $('#diaryRows', main).innerHTML = rows.length ? rows.map((diary, index) => {
  const detailUrl = new URL('cultivation-diaries/' + encodeURIComponent(diary.diaryId), document.baseURI);
  return `<tr>
    <td class="row-index">${rows.length - index}</td>
    <td><a class="linkbtn" href="${escapeHtml(detailUrl.href)}">${htmlText(diary.workedAt?.slice(0, 10))}</a></td>
    <td>${htmlText(diary.greenhouseName)}</td>
    <td>${htmlText(diary.cropName)}</td>
    <td>${htmlText(diary.varietyName)}</td>
    <td>${htmlText(diary.planName)}</td>
    <td>${htmlText(diary.growthStage || '-')}</td>
    <td class="tnum">${htmlText(diary.taskCount)} / ${htmlText(diary.incompleteTaskCount)}</td>
  </tr>`;
 }).join('') : '<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>';
}

async function loadList(query) {
 const sequence = ++listRequest;
 try {
  const rows = await request('?' + query);
  if (state.page === 'list' && sequence === listRequest) renderRows(rows);
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
 select.innerHTML = options([
  {value: '', label: first.textContent},
  ...sorted.map(name => ({value: name, label: name}))
 ], selected);
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
  requestJson('/api/cultivation-plans').then(plans => {
   setFilterOptions($('#filterCycle', form), plans.map(plan => plan.planName), initial.get('planName'));
  }),
  requestJson('/api/greenhouses').then(greenhouses => {
   setFilterOptions($('#filterGreenhouse', form), greenhouses.map(item => item.greenhouseName),
    initial.get('greenhouseName'));
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

async function fetchDetail(id) {
 const {diary, tasks} = await request('/' + encodeURIComponent(id));
 return {...diary, workDate:diary.workedAt.slice(0,10), stageId:diary.growthStage || '',
  tasks:tasks.map(task => ({taskId:String(task.taskId), name:task.taskName, type:task.taskType,
   startedAt:task.taskTime, status:task.taskStatus, content:task.taskContent || ''}))};
}
async function renderDetail() {
 const id = state.selectedId;
 main.innerHTML = heading('재배일지작업 상세');
 let d;
 try {
  d = await fetchDetail(id);
 } catch (failure) {
  if (state.page === 'detail' && state.selectedId === id) showLoadError(failure.message);
  return;
 }
 if (state.page !== 'detail' || state.selectedId !== id) return;
 const c = d, done = d.tasks.filter(t => t.status === '완료').length, reason = toReason(d.stageChangeReason);
 const dateMeta=[d.createdAt?`등록일 ${d.createdAt.slice(0,10)}`:'',d.updatedAt?`수정일 ${d.updatedAt.slice(0,10)}`:''].filter(Boolean).join(' · ');
 main.innerHTML=heading('재배일지작업 상세','')+`<div class="editor-shell"><section class="panel editor-summary detail-summary-card" aria-label="재배일지 요약">${summaryHTML(c,d.workDate,d.stageId)}${reason?`<div class="detail-meta-bar"><div class="detail-reason"><strong>생육단계 변경 사유</strong><span>${htmlText(reason)}</span></div></div>`:''}</section>
 <section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter">${d.tasks.length}건 · 완료 ${done} / 미완료 ${d.tasks.length-done}${dateMeta?` · ${htmlText(dateMeta)}`:''}</span></div><div class="task-body"><div class="task-list-header detail-task-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>상태</span></div><div class="task-scroll detail-list">${[...d.tasks].sort(timeSort).map(t=>`<article class="detail-task"><div class="t-row"><strong>${htmlText(t.name)}</strong><span>${timeOf(t)}</span><span>${htmlText(t.type)}</span><span>${htmlText(t.status)}</span></div><div class="details-content">${htmlText(t.content||'—')}</div></article>`).join('')||'<p class="empty" style="padding:24px">등록된 작업내용이 없습니다.</p>'}</div><div class="detail-delete-confirm hidden" id="detailDeleteConfirm"><span>이 재배일지작업을 삭제하시겠습니까?</span><button type="button" class="btn" id="detailDeleteCancel">취소</button><button type="button" class="btn main" id="detailDeleteOk">삭제 확인</button></div><div class="form-actions"><div class="module-actions-left"><button class="btn" id="detailBack">목록</button></div><button class="btn" id="detailDelete">삭제</button><button class="btn main" id="detailEdit">수정</button></div></div></section></div>`;
 bindBack();$('#detailBack').onclick=()=>go('list');$('#detailEdit').onclick=()=>go('edit',d.diaryId);
 $('#detailDelete').onclick=()=>$('#detailDeleteConfirm').classList.remove('hidden');
 $('#detailDeleteCancel').onclick=()=>$('#detailDeleteConfirm').classList.add('hidden');
 $('#detailDeleteOk').onclick = async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
   await request('/' + d.diaryId, 'DELETE');
   toast('재배일지작업을 삭제했습니다.');
   if (state.page === 'detail' && state.selectedId === id) go('list');
  } catch (failure) {
   toast(failure.message);
  } finally {
   button.disabled = false;
  }
 };
}

function freshTask(date){return{taskId:'NEW-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:'',type:config.workTypes[0].value,startedAt:makeStarted(date,'09:00'),status:'미완료',content:''}}
function taskPanel(t){return `<article class="task-card" data-taskid="${escapeHtml(t.taskId)}"><div class="task-summary"><strong class="task-title title-text">${htmlText(t.name||'새 작업')}</strong><span class="summary-time">${timeOf(t)}</span><span class="summary-type">${htmlText(t.type)}</span><span class="krds-badge ${taskTone(t.status)} summary-status">${htmlText(t.status)}</span><button class="trash" type="button" data-remove="${escapeHtml(t.taskId)}" aria-label="${htmlText(t.name||'새 작업')} 삭제" title="삭제">${trashSvg}</button></div><div class="task-detail"><div class="field wide"><label>작업명 *</label><input class="ctrl compact-input t-name" maxlength="100" value="${escapeHtml(t.name)}" placeholder="작업명"></div><div class="field"><label>작업유형 *</label><select class="ctrl t-type">${options(config.workTypes,t.type)}</select></div><div class="field"><label>작업시간 *</label><input class="ctrl t-time" type="time" value="${timeOf(t)}"></div><div class="field"><label>작업상태 *</label><select class="ctrl t-status">${options(config.taskStatuses,t.status)}</select></div><div class="field wide"><label>작업내용</label><textarea class="ctrl t-content" rows="2" placeholder="작업 내용을 입력하세요">${htmlText(t.content)}</textarea></div></div></article>`}
function gatherTasks(){const current=$$('[data-taskid]',main);if(!current.length)return;
 working=current.map(el=>{const old=working.find(x=>x.taskId===el.dataset.taskid)||freshTask($('#workDate')?.value||today());const time=$('.t-time',el).value;return{...old,name:$('.t-name',el)?.value??old.name,type:$('.t-type',el)?.value??old.type,status:$('.t-status',el)?.value??old.status,content:$('.t-content',el)?.value??old.content,startedAt:time ? makeStarted($('#workDate').value,time) : ''}})}
function paintTasks(){const list=$('#taskList');if(!list)return;working.sort(timeSort);$('#taskTotal').textContent=`${working.length}건`;list.innerHTML=working.map(taskPanel).join('');
 $$('[data-remove]',list).forEach(btn=>btn.onclick=()=>{gatherTasks();working=working.filter(t=>t.taskId!==btn.dataset.remove);paintTasks()});
 $$('.task-card',list).forEach(card=>{
  const title=$('.title-text',card),tn=$('.t-name',card),tt=$('.t-time',card),ty=$('.t-type',card),ts=$('.t-status',card);
  tn.addEventListener('input',()=>{title.textContent=tn.value.trim()||'새 작업'});tt.addEventListener('input',()=>{$('.summary-time',card).textContent=tt.value||'--:--'});
  ty.addEventListener('change',()=>{$('.summary-type',card).textContent=ty.value});ts.addEventListener('change',()=>{const badge=$('.summary-status',card);badge.textContent=ts.value;badge.className=`krds-badge ${taskTone(ts.value)} summary-status`});
  tt.addEventListener('change',()=>{const focused=card.dataset.taskid;gatherTasks();paintTasks();const moved=$$('[data-taskid]',list).find(el=>el.dataset.taskid===focused);moved?.scrollIntoView({block:'nearest'})});
 });
}
function reasonInputHtml(value=''){return `<div class="reason-box hidden" id="reasonBox"><label for="stageChangeReason" class="label">생육단계 변경 사유 *</label><textarea class="ctrl textarea" id="stageChangeReason" rows="4" maxlength="500" placeholder="실제 생육단계를 변경한 근거와 관찰 내용을 입력하세요">${htmlText(toReason(value))}</textarea></div>`}
function gatherReason(){return ($('#stageChangeReason')?.value||'').trim()}
function selectedPlan() {
 return editRow || plans.find(plan => String(plan.planId) === $('#cycleId').value);
}
function updateCycleData() {
 const plan = selectedPlan();
 const date = $('#workDate').value;
 const min = plan.actualStartDate.slice(0,10);
 setSingleDateValue('workDate', date && date >= min ? date : min, {min, max:today()});
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
  const result = editRow ? {currentStage:editRow.stageId} :
   await request('/plans/' + plan.planId + '/stages?' + new URLSearchParams({workedDate:date}));
  if (sequence !== stageRequest || !select.isConnected) return;
  stageOptions = result;
  const stages = [result.currentStage, result.nextStage].filter(stage => stage != null);
  select.innerHTML = options(stages.map(stage => ({value:stage, label:stage || '-'})),
   stages.includes(previousOption) ? previousOption : result.currentStage);
  select.disabled = !result.nextStage;
  submit.disabled = Boolean(result.duplicate);
  $('#duplicateNotice').classList.toggle('hidden', !result.duplicate);
  $('#formError').classList.add('hidden');
  updateReasonVisibility();
  refreshSummary();
 } catch (failure) {
  if (sequence === stageRequest && select.isConnected) error(failure.message);
 }
}
function updateReasonVisibility() {
 const box = $('#reasonBox');
 if (box) box.classList.toggle('hidden', !stageOptions?.nextStage || $('#stageId').value === stageOptions.currentStage);
}
function summaryHTML(c,date,stage){return `<div class="summary-strip"><div class="summary-fact"><span>작기계획명</span><strong id="summaryCycle" title="${htmlText(c.planName)}">${htmlText(c.planName)}</strong></div><div class="summary-fact"><span>품목명 · 품종명</span><strong id="summaryCrop">${htmlText(c.cropName||'-')} · ${htmlText(c.varietyName||'-')}</strong></div><div class="summary-fact"><span>온실명</span><strong id="summaryHouse">${htmlText(c.greenhouseName||'-')}</strong></div><div class="summary-fact"><span>실제 작업일</span><strong id="summaryDate">${htmlText(date)}</strong></div><div class="summary-fact"><span>실제 생육단계</span><strong id="summaryStage">${htmlText(stage||'-')}</strong></div></div>`}
function refreshSummary() {
 const plan = selectedPlan();
 const values = {summaryCycle:plan.planName, summaryCrop:`${plan.cropName} · ${plan.varietyName}`,
  summaryHouse:plan.greenhouseName, summaryDate:$('#workDate').value, summaryStage:$('#stageId').value || '-'};
 for (const [id, value] of Object.entries(values)) {
  const element = $('#' + id);
  element.textContent = value;
  element.title = value;
 }
}
async function renderEditor(isEdit) {
 const id = state.selectedId;
 main.innerHTML = heading(isEdit ? '재배일지작업 수정' : '재배일지작업 등록');
 let d, active;
 try {
  d = isEdit ? await fetchDetail(id) : null;
  active = isEdit ? [] : await request('/plans');
 } catch (failure) {
  if (state.page === (isEdit ? 'edit' : 'create') && (!isEdit || state.selectedId === id)) showLoadError(failure.message);
  return;
 }
 if (state.page !== (isEdit ? 'edit' : 'create') || (isEdit && state.selectedId !== id)) return;
 editRow = d;
 plans = active;
 if (!d && !active.length) {
  showLoadError('진행 중인 작기가 없습니다.');
  return;
 }
 const c = d || active[0], date = d?.workDate || today();
 const min = d ? date : c.actualStartDate.slice(0,10);
 working = d ? clone(d.tasks) : [];
 main.innerHTML=heading(isEdit?'재배일지작업 수정':'재배일지작업 등록','')+`<form class="editor-shell" id="diaryForm" novalidate><section class="panel editor-summary" aria-label="재배일지작업 기본정보">${summaryHTML(c,date,d?.stageId)}<div class="summary-detail" id="baseFields"><div class="field"><label for="cycleId">작기계획명 <span class="required">*</span></label><select class="ctrl" id="cycleId" ${isEdit?'disabled':''}>${options((isEdit?[c]:active).map(c=>({value:c.planId,label:c.planName})),c.planId)}</select></div>
 <div class="field"><label for="workDateTrigger">실제 작업일 <span class="required">*</span></label>${singleDateControl('workDate',date,{min,max:today(),disabled:isEdit,clearable:false})}</div>
 <div class="stage-group" aria-label="실제 생육단계"><div class="field"><label for="stageId">해당 날짜의 실제 생육단계 <span class="required">*</span></label><select class="ctrl" id="stageId"></select></div></div>
 ${isEdit&&toReason(d.stageChangeReason)?`<div class="reason-box"><strong>확정된 변경 사유</strong>${getReasons(d.stageChangeReason)}</div>`:''}${!isEdit?reasonInputHtml():''}
 <div id="duplicateNotice" class="errorbox hidden" role="status">해당 날짜에 이미 재배일지가 등록되어 있습니다.</div><div id="formError" class="errorbox hidden" role="alert"></div>
 </div></section><section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter" id="taskTotal">0건</span></div><div class="task-body"><div class="task-tools"><span class="muted small">작업시간 오름차순</span></div><div class="task-scroll" id="tasksScroll"><div class="task-list-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>작업상태</span><span></span></div><div id="taskList"></div></div><button class="add-btn" id="addTask" type="button">+ 작업내용 추가</button><div class="form-actions"><button class="btn" type="button" id="cancel">취소</button><button class="btn main" type="submit">${isEdit?'수정 저장':'등록'}</button></div></div></section></form>`;
 mountSingleDatePicker('workDate');
 bindBack();paintTasks();$('#cycleId').onchange=updateCycleData;$('#workDate').onchange=updateStageOptions;$('#stageId').onchange=()=>{updateReasonVisibility();refreshSummary()};
 $('#addTask').onclick=()=>{gatherTasks();let newTask=freshTask($('#workDate').value);const last=[...working].sort(timeSort).at(-1);if(last){const [hours,minutes]=timeOf(last).split(':').map(Number);const next=hours*60+minutes+30;if(next<24*60)newTask.startedAt=makeStarted($('#workDate').value,`${String(Math.floor(next/60)).padStart(2,'0')}:${String(next%60).padStart(2,'0')}`)}working.push(newTask);paintTasks();const target=$$('[data-taskid]',$('#taskList')).find(el=>el.dataset.taskid===newTask.taskId);target?.scrollIntoView({block:'nearest'});$('.t-name',target)?.focus()};
 $('#cancel').onclick=()=>go(isEdit?'detail':'list',d?.diaryId);$('#diaryForm').onsubmit=e=>{e.preventDefault();saveEditor()};
 updateStageOptions();refreshSummary();
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
  taskId:task.taskId.startsWith('NEW-') ? null : task.taskId,
  taskName:task.name, taskType:task.type, taskTime:task.startedAt,
  taskStatus:task.status, taskContent:task.content
 }));
 button.disabled = true;
 try {
  let diaryId = editing?.diaryId;
  if (editing) {
   await request('/' + diaryId + '/tasks', 'PUT', {tasks});
  } else {
   const growthStage = $('#stageId').value;
   const result = await request('', 'POST', {planId:$('#cycleId').value, workedDate:date,
    growthStage, stageChangeReason:gatherReason(), tasks});
   diaryId = result.diaryId;
  }
  toast(editing ? '재배일지작업을 수정했습니다.' : '재배일지작업을 등록했습니다.');
  if (form.isConnected) go('detail', String(diaryId));
 } catch (failure) {
  if (form.isConnected) error(failure.message);
 } finally {
  button.disabled = false;
 }
}

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
 renderDetail, renderEditor,
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

(() => {
'use strict';
const app = window.ModooApp;
const { state, config, pages, $, $$, escapeHtml, htmlText, clone, toast, options, pageBtns,
 timeOf, timeSort, makeStarted, taskTone, trashSvg, toReason, getReasons, error, go, heading,
 bindBack, unifiedListPanel, listFilterField, singleDateControl, setSingleDateValue,
 mountSingleDatePicker } = app;
const main = $('#main');
const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date());
const endpoint = '/api/cultivation-diaries';
let working = [], editRow = null, plans = [], stageOptions = null;
let filterCycle = 'all', filterGreenhouse = 'all', filterCrop = 'all', filterVariety = 'all', filterDate = '';
let listPage = 1, listRows = [], filterRows = [], listRequest = 0, stageRequest = 0;

async function request(path = '', method = 'GET', body) {
 const response = await fetch(endpoint + path, {
  method,
  ...(body === undefined ? {} : {headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)})
 });
 if (response.status === 401) {
  location.replace('login.html');
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
function filterOptions(rows, field) {
 return [...new Set(rows.map(row => row[field]).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'ko')).map(value => ({value, label:value}));
}
async function loadList() {
 if (!window.__modooSignedIn) {
  filterRows = [];
  listRows = [];
  renderList();
  return;
 }
 const sequence = ++listRequest;
 const filters = new URLSearchParams();
 for (const [key, value] of Object.entries({planName:filterCycle, greenhouseName:filterGreenhouse,
  cropName:filterCrop, varietyName:filterVariety, workedDate:filterDate})) {
  if (value && value !== 'all') filters.set(key, value);
 }
 try {
  const allRows = await request();
  const rows = filters.size ? await request('?' + filters) : allRows;
  if (state.page !== 'list' || sequence !== listRequest) return;
  filterRows = allRows;
  listRows = rows;
  renderList();
 } catch (failure) {
  if (state.page === 'list' && sequence === listRequest) showLoadError(failure.message);
 }
}
function renderList() {
 const rows = listRows;
 const crops = filterOptions(filterRows, 'cropName');
 const varietiesFor = crop => filterOptions(filterRows.filter(row => crop === 'all' || row.cropName === crop), 'varietyName');
 const varieties = varietiesFor(filterCrop);
 const pageSize=Number(config.pagination?.pageSize)||5,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));listPage=Math.min(Math.max(1,listPage),totalPages);
 const first=(listPage-1)*pageSize,paged=rows.slice(first,first+pageSize),start=rows.length?first+1:0,end=Math.min(first+pageSize,rows.length);
 const pageButtons=pageBtns(listPage,totalPages,'data-list-page');
 main.innerHTML=heading('재배일지작업 목록')+unifiedListPanel({
  title:'재배일지작업 목록',
  count:rows.length,
  actionHtml:'<button class="btn main xs" type="button" id="createButton">+ 재배일지작업 등록</button>',
  filterHtml:`${listFilterField('filterCycle','작기계획명',`<select id="filterCycle" class="ctrl">${options([{value:'all',label:'전체 작기'},...filterOptions(filterRows, 'planName')],filterCycle)}</select>`)}${listFilterField('filterGreenhouse','온실명',`<select id="filterGreenhouse" class="ctrl">${options([{value:'all',label:'전체 온실'},...filterOptions(filterRows, 'greenhouseName')],filterGreenhouse)}</select>`)}${listFilterField('filterCrop','품목명',`<select id="filterCrop" class="ctrl">${options([{value:'all',label:'전체 품목'},...crops],filterCrop)}</select>`)}${listFilterField('filterVariety','품종명',`<select id="filterVariety" class="ctrl">${options([{value:'all',label:'전체 품종'},...varieties],filterVariety)}</select>`)}${listFilterField('workDateFilterTrigger','실제 작업일',singleDateControl('workDateFilter',filterDate))}<div class="list-filter-actions"><button class="btn list-reset-btn" type="button" id="filterReset">초기화</button><button class="btn main list-search-btn" type="button" id="filterButton">검색</button></div>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table diary-table"><caption class="sr-only">재배일지작업 목록</caption><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">실제 작업일</th><th scope="col">온실명</th><th scope="col">품목명</th><th scope="col">품종명</th><th scope="col">작기계획명</th><th scope="col">생육단계</th><th class="tnum" scope="col">작업 건수 (전체/미완료)</th></tr></thead><tbody>${paged.map((d,i)=>`<tr><td class="row-index">${rows.length-first-i}</td><td><button class="linkbtn" data-detail="${escapeHtml(d.diaryId)}">${htmlText(d.workedAt.slice(0,10))}</button></td><td>${htmlText(d.greenhouseName)}</td><td>${htmlText(d.cropName)}</td><td>${htmlText(d.varietyName)}</td><td>${htmlText(d.planName)}</td><td>${htmlText(d.growthStage||'-')}</td><td class="tnum">${d.taskCount} / ${d.incompleteTaskCount}</td></tr>`).join('')||'<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:`<div class="list-foot"><nav class="pagination" aria-label="재배일지작업 페이지 이동"><button class="page-button" type="button" data-page-direction="prev" ${listPage===1?'disabled':''}>이전</button>${pageButtons}<button class="page-button" type="button" data-page-direction="next" ${listPage===totalPages?'disabled':''}>다음</button></nav></div>`
 });
 mountSingleDatePicker('workDateFilter');
 $('#filterCrop').onchange=()=>{const selected=$('#filterCrop').value;const possible=varietiesFor(selected);const variety=$('#filterVariety');const old=variety.value;variety.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#filterReset').onclick=()=>{filterCycle=filterGreenhouse=filterCrop=filterVariety='all';filterDate='';listPage=1;loadList()};
 $('#filterButton').onclick=()=>{filterCycle=$('#filterCycle').value;filterGreenhouse=$('#filterGreenhouse').value;filterCrop=$('#filterCrop').value;filterVariety=$('#filterVariety').value;filterDate=$('#workDateFilter').value;listPage=1;loadList()};$('#createButton').onclick=()=>go('create');$$('[data-detail]').forEach(b=>b.onclick=()=>go('detail',b.dataset.detail));
 $$('[data-list-page]').forEach(b=>b.onclick=()=>{listPage=Number(b.dataset.listPage);renderList()});$$('[data-page-direction]').forEach(b=>b.onclick=()=>{listPage+=b.dataset.pageDirection==='next'?1:-1;renderList()});
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
 <section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter">${d.tasks.length}건 · 완료 ${done} / 미완료 ${d.tasks.length-done}${dateMeta?` · ${htmlText(dateMeta)}`:''}</span></div><div class="task-body"><div class="task-list-header detail-task-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>상태</span></div><div class="task-scroll detail-list">${[...d.tasks].sort(timeSort).map(t=>`<article class="detail-task"><div class="t-row"><strong>${htmlText(t.name)}</strong><span>${timeOf(t)}</span><span>${htmlText(t.type)}</span><span>${htmlText(t.status)}</span></div><div class="details-content">${htmlText(t.content||'—')}</div></article>`).join('')||'<p class="empty" style="padding:24px">등록된 작업내용이 없습니다.</p>'}</div><div class="hidden" id="detailDeleteConfirm" style="padding:10px 12px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>이 재배일지작업을 삭제하시겠습니까?</span><button type="button" class="btn" id="detailDeleteCancel">취소</button><button type="button" class="btn main" id="detailDeleteOk">삭제 확인</button></div><div class="form-actions"><div class="module-actions-left"><button class="btn" id="detailBack">목록</button></div><button class="btn" id="detailDelete">삭제</button><button class="btn main" id="detailEdit">수정</button></div></div></section></div>`;
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
 ${isEdit&&toReason(d.stageChangeReason||d.stageChangeReasons)?`<div class="reason-box"><strong>확정된 변경 사유</strong>${getReasons(d.stageChangeReason||d.stageChangeReasons)}</div>`:''}${!isEdit?reasonInputHtml():''}
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
  main.innerHTML = heading('재배일지작업 목록');
  loadList();
 },
 renderDetail, renderEditor,
 applyCycleFilter(planName) {
  filterCycle = planName;
  listPage = 1;
  loadList();
 }
};
})();

(()=>{'use strict';
const $=(s,base=document)=>base.querySelector(s), $$=(s,base=document)=>[...base.querySelectorAll(s)];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const htmlText=escapeHtml, clone=x=>JSON.parse(JSON.stringify(x));
const storeKey='modoo-mancheonhong-viewport-20261111-v1';
let config=clone(prototypeData), diaryRows=[], page='list',selectedId='D-A-1110',working=[],editRow=null,selectedStage='VEG',filterCycle='all',filterCrop='all',filterVariety='all',filterDate='',listPage=1,toastTimer;
const main=$('#main'), today=()=>config.meta.today;
const options=(values,sel)=>values.map(x=>`<option value="${escapeHtml(x.value)}" ${String(x.value)===String(sel)?'selected':''}>${escapeHtml(x.label)}</option>`).join('');
const getCycle=id=>config.cycles.find(c=>c.cycleId===id)||config.cycles[0];
const gh=id=>config.greenhouses.find(g=>g.greenhouseId===id);
const cropOf=c=>config.crops.find(x=>x.cropId===c.cropId);
const varietyOf=c=>(cropOf(c)?.varieties||[]).find(x=>x.varietyId===c.varietyId);
const getStage=id=>config.growthStages.find(s=>s.stageId===id)||config.growthStages[0];
const stageOrder=id=>getStage(id).order;
const stageByDate=(cycle,date)=>{let events=[...cycle.stageHistory].filter(e=>e.effectiveDate<=date).sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate));return events.at(-1)?.stageId||config.growthStages[0].stageId};
const lastEvent=cycle=>[...cycle.stageHistory].sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate)).at(-1);
const getDiary=id=>diaryRows.find(d=>d.diaryId===id)||diaryRows[0];
const timeOf=x=>String(x.startedAt||'').slice(11,16)||'09:00';
const timeSort=(a,b)=>timeOf(a).localeCompare(timeOf(b))||(a.taskId||'').localeCompare(b.taskId||'');
const makeStarted=(date,time)=>`${date}T${time}:00`;
function persist(){try{localStorage.setItem(storeKey,JSON.stringify({diaries:diaryRows,cycleStageHistories:Object.fromEntries(config.cycles.map(c=>[c.cycleId,c.stageHistory]))}))}catch{}}
function loadSaved(){let saved;try{saved=JSON.parse(localStorage.getItem(storeKey)||'null')}catch{}
 diaryRows=Array.isArray(saved?.diaries)?saved.diaries:clone(config.sampleDiaries);
 if(saved?.cycleStageHistories)for(const c of config.cycles){if(Array.isArray(saved.cycleStageHistories[c.cycleId]))c.stageHistory=saved.cycleStageHistories[c.cycleId].map(e=>{const {reasons,...rest}=e;return {...rest,reason:toReason(e.reason||reasons)}})}
 diaryRows.forEach(d=>{delete d.title;d.stageChangeReason=toReason(d.stageChangeReason||d.stageChangeReasons);delete d.stageChangeReasons;d.tasks=(d.tasks||[]).map(t=>({...t,startedAt:t.startedAt||makeStarted(d.workDate,t.time||'09:00'),name:t.name||t.type})).sort(timeSort)});
}
function toast(s){let el=$('#toast');el.textContent=s;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),3400)}
function error(s){const el=$('#formError');if(el){el.textContent=s;el.classList.remove('hidden')}toast(s)}
function nav(){let nodes=[];for(const item of config.navigation){
 const active=(item.key==='diaries'&&['list','create','detail','edit'].includes(page))||(item.key==='cycles'&&page.startsWith('cycle-'))||(item.key==='environment'&&page.startsWith('env-'));
 nodes.push(`<button class="navbtn ${active?'active':''}" type="button" data-go="${item.key}" ${item.enabled?'':'disabled aria-disabled="true"'}>${htmlText(item.label)}</button>`);
 for(const child of item.children||[])nodes.push(`<button class="navbtn sub ${page===child.key?'active':''}" type="button" data-go="${child.key}" ${child.enabled?'':'disabled aria-disabled="true"'}>${htmlText(child.label)}</button>`)}
 $('#navigation').innerHTML=nodes.join('');$$('[data-go]',$('#navigation')).forEach(b=>{if(!b.disabled)b.addEventListener('click',()=>go(b.dataset.go))});
 const cat=page.startsWith('cycle-')?'작기계획':page.startsWith('env-')?'작기 중 온실 환경변화':'재배일지';const state=page.startsWith('cycle-')?page.slice(6):page.startsWith('env-')?page.slice(4):page;
 $('#crumb').textContent=['재배관리',cat,({list:'목록',create:'등록',detail:'상세',edit:'수정'})[state]||'목록'].join(' / ');
 $('#sidebarFoot').textContent=`${cat} · ${config.meta.commonCrop} ${config.meta.commonVariety}`;
}
function go(target,id){if(target==='diaries')target='list';if(target==='cycles')target='cycle-list';if(target==='environment')target='env-list';
 if(target.startsWith('cycle-')&&id)selectedCycleId=id;
 else if(target.startsWith('env-')&&id)selectedMeasurementId=id;
 else if(id)selectedId=id;
 if((target==='detail'||target==='edit')&&!diaryRows.length){toast('등록된 재배일지가 없습니다.');return}
 page=target;render();}
function heading(title,description='',back=false){return `<div class="pagehead"><div><h1>${title}</h1>${description?`<p>${htmlText(description)}</p>`:''}</div>${back?'<button type="button" class="backlink" id="returnList">← 재배일지 목록으로</button>':''}</div>`}
function bindBack(){const el=$('#returnList');if(el)el.addEventListener('click',()=>go('list'))}
function render(){nav();if(page.startsWith('cycle-')){if(page==='cycle-list')renderCycleList();else if(page==='cycle-detail')renderCycleDetail();else renderCycleEditor(page==='cycle-edit')}
 else if(page.startsWith('env-')){if(page==='env-list')renderEnvList();else renderEnvDetail()}
 else if(page==='list')renderList();else if(page==='detail')renderDetail();else renderEditor(page==='edit')}
function renderList(){const rows=diaryRows.filter(d=>{
 const c=getCycle(d.cycleId);return(filterCycle==='all'||d.cycleId===filterCycle)&&(filterCrop==='all'||c.cropId===filterCrop)&&(filterVariety==='all'||c.varietyId===filterVariety)&&(!filterDate||d.workDate===filterDate)}).sort((a,b)=>b.workDate.localeCompare(a.workDate)||a.cycleId.localeCompare(b.cycleId));
 const crops=config.crops.map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.flatMap(c=>c.varieties.map(v=>({...v,cropId:c.cropId}))).filter(v=>filterCrop==='all'||v.cropId===filterCrop);
 const pageSize=Number(config.pagination?.pageSize)||5,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));listPage=Math.min(Math.max(1,listPage),totalPages);
 const first=(listPage-1)*pageSize,paged=rows.slice(first,first+pageSize),start=rows.length?first+1:0,end=Math.min(first+pageSize,rows.length);
 const pageButtons=Array.from({length:totalPages},(_,i)=>`<button type="button" class="page-button" data-list-page="${i+1}" ${i+1===listPage?'aria-current="page"':''} aria-label="${i+1}페이지">${i+1}</button>`).join('');
 main.innerHTML=heading('재배일지 목록','작기별 실제 작업일에 등록된 일지를 조회합니다.')+`<section class="panel list-panel"><div class="panel-body"><div class="filterbar"><div class="field"><label for="filterCycle">작기</label><select id="filterCycle" class="ctrl">${options([{value:'all',label:'전체 작기'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],filterCycle)}</select></div><div class="field crop-filter"><label for="filterCrop">품목</label><select id="filterCrop" class="ctrl">${options([{value:'all',label:'전체 품목'},...crops],filterCrop)}</select></div><div class="field variety-filter"><label for="filterVariety">품종</label><select id="filterVariety" class="ctrl">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],filterVariety)}</select></div><div class="field query"><label for="workDateFilter">작업일</label><input id="workDateFilter" type="date" class="ctrl" value="${escapeHtml(filterDate)}"></div><button class="btn" type="button" id="filterButton">조회</button><button class="btn main" type="button" id="createButton">+ 재배일지 등록</button></div></div>
 <div class="tablewrap"><table class="data-table"><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">실제 작업일</th><th scope="col">품목</th><th scope="col">품종</th><th scope="col">작기</th><th scope="col">생육단계</th><th scope="col">전체 작업 건수</th><th scope="col">미완료 작업 건수</th><th scope="col">관리</th></tr></thead><tbody>${paged.map((d,i)=>{const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;return `<tr><td class="row-index">${first+i+1}</td><td><button class="linkbtn" data-detail="${d.diaryId}">${escapeHtml(d.workDate)}</button></td><td>${htmlText(cropOf(c)?.name||'-')}</td><td>${htmlText(varietyOf(c)?.name||'-')}</td><td>${htmlText(c.name)}</td><td>${htmlText(getStage(d.stageId).name)}</td><td>${d.tasks.length}건</td><td>${d.tasks.length-done}건</td><td><button type="button" class="btn xs" data-edit="${d.diaryId}">수정</button></td></tr>`}).join('')||'<tr><td class="empty" colspan="9">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>
 <div class="list-foot"><span>총 ${rows.length}건 · ${start}–${end}건 표시</span><nav class="pagination" aria-label="재배일지 페이지 이동"><button class="page-button" type="button" data-page-direction="prev" ${listPage===1?'disabled':''}>이전</button>${pageButtons}<button class="page-button" type="button" data-page-direction="next" ${listPage===totalPages?'disabled':''}>다음</button></nav></div></section>`;
 $('#filterCrop').onchange=()=>{const selected=$('#filterCrop').value;const possible=config.crops.filter(c=>selected==='all'||c.cropId===selected).flatMap(c=>c.varieties.map(v=>({value:v.varietyId,label:v.name})));const variety=$('#filterVariety');const old=variety.value;variety.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#filterButton').onclick=()=>{filterCycle=$('#filterCycle').value;filterCrop=$('#filterCrop').value;filterVariety=$('#filterVariety').value;filterDate=$('#workDateFilter').value;listPage=1;renderList()};$('#workDateFilter').addEventListener('keydown',e=>{if(e.key==='Enter')$('#filterButton').click()});$('#createButton').onclick=()=>go('create');$$('[data-detail]').forEach(b=>b.onclick=()=>go('detail',b.dataset.detail));$$('[data-edit]').forEach(b=>b.onclick=()=>go('edit',b.dataset.edit));
 $$('[data-list-page]').forEach(b=>b.onclick=()=>{listPage=Number(b.dataset.listPage);renderList()});$$('[data-page-direction]').forEach(b=>b.onclick=()=>{listPage+=b.dataset.pageDirection==='next'?1:-1;renderList()});
}

function getContextHTML(c){return `<div class="cycle-meta"><div><span class="meta-label">품목</span><strong class="meta-value">${htmlText(cropOf(c)?.name||'-')}</strong></div><div><span class="meta-label">품종</span><strong class="meta-value">${htmlText(varietyOf(c)?.name||'-')}</strong></div><div><span class="meta-label">온실</span><strong class="meta-value">${htmlText(gh(c.greenhouseId)?.name||'-')}</strong></div></div>`}
function toReason(v){if(typeof v==='string')return v.trim();if(v&&typeof v==='object')return Object.values(v).filter(Boolean).map(x=>String(x).trim()).join(' / ');return ''}
function getReasons(reason){const text=toReason(reason);return text?`<p class="reason-text">${htmlText(text)}</p>`:''}
function renderDetail(){const d=getDiary(selectedId);if(!d){go('list');return}selectedId=d.diaryId;const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;
 main.innerHTML=heading('재배일지 조회','',true)+`<div class="editor-shell"><section class="panel editor-summary detail-info" aria-label="재배일지 기본정보"><div class="panel-head"><h2>기본정보</h2></div><div class="summary-detail" id="detailFacts"><dl class="details-kv"><dt>작기</dt><dd>${htmlText(c.name)}</dd><dt>품목 · 품종</dt><dd>${htmlText(cropOf(c)?.name||'-')} · ${htmlText(varietyOf(c)?.name||'-')}</dd><dt>온실</dt><dd>${htmlText(gh(c.greenhouseId)?.name||'-')}</dd><dt>실제 작업일</dt><dd>${htmlText(d.workDate)}</dd><dt>생육단계</dt><dd>${htmlText(getStage(d.stageId).name)}</dd><dt>등록일시</dt><dd>${htmlText(d.createdAt.replace('T',' '))}</dd><dt>수정일시</dt><dd>${htmlText(d.updatedAt.replace('T',' '))}</dd></dl>${toReason(d.stageChangeReason||d.stageChangeReasons)?`<div class="reason-box"><strong>생육단계 변경 사유</strong>${getReasons(d.stageChangeReason||d.stageChangeReasons)}</div>`:''}</div></section>
 <section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter">${d.tasks.length}건 · 완료 ${done} / 미완료 ${d.tasks.length-done}</span></div><div class="task-body"><div class="task-list-header detail-task-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>상태</span></div><div class="task-scroll detail-list">${[...d.tasks].sort(timeSort).map(t=>`<article class="detail-task"><div class="t-row"><strong>${htmlText(t.name)}</strong><span>${timeOf(t)}</span><span>${htmlText(t.type)}</span><span>${htmlText(t.status)}</span></div><div class="details-content">${htmlText(t.content||'—')}</div></article>`).join('')}</div><div class="form-actions"><button class="btn" id="detailBack">목록</button><button class="btn main" id="detailEdit">수정</button></div></div></section></div>`;
 bindBack();$('#detailBack').onclick=()=>go('list');$('#detailEdit').onclick=()=>go('edit',d.diaryId);
}

const trashSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';
function freshTask(date){return{taskId:'NEW-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:'',type:config.workTypes[0].value,startedAt:makeStarted(date,'09:00'),status:'미완료',content:''}}
function taskPanel(t){return `<article class="task-card" data-taskid="${escapeHtml(t.taskId)}"><div class="task-summary"><strong class="task-title title-text">${htmlText(t.name||'새 작업')}</strong><span class="summary-time">${timeOf(t)}</span><span class="summary-type">${htmlText(t.type)}</span><span class="summary-status">${htmlText(t.status)}</span><button class="trash" type="button" data-remove="${escapeHtml(t.taskId)}" aria-label="${htmlText(t.name||'새 작업')} 삭제" title="삭제">${trashSvg}</button></div><div class="task-detail"><div class="field wide"><label>작업명 *</label><input class="ctrl compact-input t-name" maxlength="80" value="${escapeHtml(t.name)}" placeholder="작업명"></div><div class="field"><label>작업유형 *</label><select class="ctrl t-type">${options(config.workTypes,t.type)}</select></div><div class="field"><label>작업시간 *</label><input class="ctrl t-time" type="time" value="${timeOf(t)}"></div><div class="field"><label>작업상태 *</label><select class="ctrl t-status">${options(config.taskStatuses,t.status)}</select></div><div class="field wide"><label>작업내용 *</label><textarea class="ctrl t-content" rows="2" placeholder="작업 내용을 입력하세요">${htmlText(t.content)}</textarea></div></div></article>`}
function gatherTasks(){const current=$$('[data-taskid]',main);if(!current.length)return;
 working=current.map(el=>{const old=working.find(x=>x.taskId===el.dataset.taskid)||freshTask($('#workDate')?.value||today());const time=$('.t-time',el)?.value||timeOf(old);return{...old,name:$('.t-name',el)?.value??old.name,type:$('.t-type',el)?.value??old.type,status:$('.t-status',el)?.value??old.status,content:$('.t-content',el)?.value??old.content,startedAt:makeStarted($('#workDate')?.value||today(),time)}})}
function paintTasks(){const list=$('#taskList');if(!list)return;working.sort(timeSort);$('#taskTotal').textContent=`${working.length}건`;list.innerHTML=working.map(taskPanel).join('');
 $$('[data-remove]',list).forEach(btn=>btn.onclick=()=>{gatherTasks();working=working.filter(t=>t.taskId!==btn.dataset.remove);paintTasks()});
 $$('.task-card',list).forEach(card=>{
  const title=$('.title-text',card),tn=$('.t-name',card),tt=$('.t-time',card),ty=$('.t-type',card),ts=$('.t-status',card);
  tn.addEventListener('input',()=>{title.textContent=tn.value.trim()||'새 작업'});tt.addEventListener('input',()=>{$('.summary-time',card).textContent=tt.value||'--:--'});
  ty.addEventListener('change',()=>{$('.summary-type',card).textContent=ty.value});ts.addEventListener('change',()=>{$('.summary-status',card).textContent=ts.value});
  tt.addEventListener('change',()=>{const focused=card.dataset.taskid;gatherTasks();paintTasks();const moved=$$('[data-taskid]',list).find(el=>el.dataset.taskid===focused);moved?.scrollIntoView({block:'nearest'})});
 });
}
function reasonInputHtml(value=''){return `<div class="reason-box hidden" id="reasonBox"><label for="stageChangeReason" class="label">생육단계 변경 사유 *</label><textarea class="ctrl textarea" id="stageChangeReason" rows="4" maxlength="500" placeholder="실제 생육단계를 변경한 근거와 관찰 내용을 입력하세요">${htmlText(toReason(value))}</textarea></div>`}
function gatherReason(){return ($('#stageChangeReason')?.value||'').trim()}
function stagePolicy(c,date,d){const last=lastEvent(c),pastStage=stageByDate(c,date),laterHistory=c.stageHistory.some(e=>e.effectiveDate>date),laterDiary=diaryRows.some(x=>x.cycleId===c.cycleId&&x.workDate>date&&x.diaryId!==d?.diaryId),isEdit=!!d;
 const canChange=!isEdit&&!laterHistory&&!laterDiary&&date>=last.effectiveDate&&date>=c.actualStartDate&&date<=today();
 return {stageId:isEdit?d.stageId:pastStage,canChange,laterDiary,laterHistory}}
function updateCycleData(){const sel=$('#cycleId');if(!sel)return;const c=getCycle(sel.value);const date=$('#workDate');date.min=c.actualStartDate;date.max=today();if(!date.value||date.value<c.actualStartDate)date.value=c.actualStartDate;updateStageOptions()}
function updateStageOptions(){const c=getCycle($('#cycleId').value),date=$('#workDate').value||today(),policy=stagePolicy(c,date,editRow),select=$('#stageId');
 const allowed=new Set([policy.stageId]);if(policy.canChange){let next=config.growthStages.find(s=>s.order===stageOrder(policy.stageId)+1);if(next)allowed.add(next.stageId)}
 const candidate=select.value;select.innerHTML=config.growthStages.map(s=>`<option value="${s.stageId}" ${!allowed.has(s.stageId)?'disabled':''}>${htmlText(s.name)}${stageOrder(s.stageId)<stageOrder(policy.stageId)?' (종료)':''}</option>`).join('');select.value=allowed.has(candidate)?candidate:policy.stageId;
 select.disabled=!policy.canChange;$('#stageHelp').textContent=editRow?'저장된 일지의 생육단계는 변경할 수 없습니다.':(policy.canChange?'현재 단계 유지 또는 다음 단계 선택 가능':'해당 작업일에 적용된 생육단계입니다.');
 updateReasonVisibility();refreshSummary();const duplicated=diaryRows.find(d=>d.cycleId===c.cycleId&&d.workDate===date&&d.diaryId!==editRow?.diaryId);const el=$('#duplicateNotice');el.classList.toggle('hidden',!duplicated);if(duplicated)el.textContent='해당 날짜에 이미 재배일지가 등록되어 있습니다.';
}
function updateReasonVisibility(){const box=$('#reasonBox');if(!box)return;const c=getCycle($('#cycleId').value),date=$('#workDate').value||today();const needs=!editRow&&$('#stageId').value!==stageByDate(c,date)&&!$('#stageId').disabled;box.classList.toggle('hidden',!needs)}
function summaryHTML(c,date,stage){return `<div class="summary-strip"><div class="summary-fact"><span>작기</span><strong id="summaryCycle" title="${htmlText(c.name)}">${htmlText(c.name)}</strong></div><div class="summary-fact"><span>품목 · 품종</span><strong id="summaryCrop">${htmlText(cropOf(c)?.name||'-')} · ${htmlText(varietyOf(c)?.name||'-')}</strong></div><div class="summary-fact"><span>온실</span><strong id="summaryHouse">${htmlText(gh(c.greenhouseId)?.name||'-')}</strong></div><div class="summary-fact"><span>실제 작업일</span><strong id="summaryDate">${htmlText(date)}</strong></div><div class="summary-fact"><span>실제 생육단계</span><strong id="summaryStage">${htmlText(getStage(stage).name)}</strong></div></div>`}
function refreshSummary(){const cycle=$('#cycleId'),date=$('#workDate'),stage=$('#stageId');if(!cycle||!date||!stage)return;const c=getCycle(cycle.value);const values={summaryCycle:c.name,summaryCrop:`${cropOf(c)?.name||'-'} · ${varietyOf(c)?.name||'-'}`,summaryHouse:gh(c.greenhouseId)?.name||'-',summaryDate:date.value||'미선택',summaryStage:getStage(stage.value).name};for(const [id,val] of Object.entries(values)){const el=$('#'+id);if(el){el.textContent=val;el.title=val}}}
function renderEditor(isEdit){const d=isEdit?getDiary(selectedId):null;if(isEdit&&!d){go('list');return}editRow=d;
 const c=getCycle(d?.cycleId||config.cycles[0].cycleId),date=d?.workDate||today();selectedStage=d?.stageId||stageByDate(c,date);working=d?clone(d.tasks): (config.formDefaults?.newDiaryTasks||[]).map((t,i)=>({...freshTask(date),taskId:`SAMPLE-${i+1}`,name:t.name,type:t.type,startedAt:makeStarted(date,t.time),status:t.status,content:t.content}));if(!working.length)working=[freshTask(date)];
 main.innerHTML=heading(isEdit?'재배일지 수정':'재배일지 등록','',true)+`<form class="editor-shell" id="diaryForm" novalidate><section class="panel editor-summary" aria-label="재배일지 기본정보">${summaryHTML(c,date,selectedStage)}<div class="summary-detail" id="baseFields"><div class="field"><label for="cycleId">작기 <span class="required">*</span></label><select class="ctrl" id="cycleId" ${isEdit?'disabled':''}>${options(config.cycles.map(c=>({value:c.cycleId,label:c.name})),c.cycleId)}</select></div>
 <div class="field"><label for="workDate">실제 작업일 <span class="required">*</span></label><input class="ctrl" type="date" id="workDate" min="${c.actualStartDate}" max="${today()}" value="${date}" ${isEdit?'readonly':''}></div>
 <div class="stage-group" aria-label="실제 생육단계 및 변경 사유"><div class="field"><label for="stageId">해당 날짜의 실제 생육단계 <span class="required">*</span></label><select class="ctrl" id="stageId"></select><div id="stageHelp" class="stage-meta"></div></div>
 ${isEdit&&toReason(d.stageChangeReason||d.stageChangeReasons)?`<div class="reason-box"><strong>확정된 변경 사유</strong>${getReasons(d.stageChangeReason||d.stageChangeReasons)}</div>`:''}${!isEdit?reasonInputHtml():''}</div>
 <div id="duplicateNotice" class="errorbox hidden" role="status"></div><div id="formError" class="errorbox hidden" role="alert"></div>
 </div></section><section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter" id="taskTotal">0건</span></div><div class="task-body"><div class="task-tools"><span class="muted small">작업시간 오름차순</span></div><div class="task-scroll" id="tasksScroll"><div class="task-list-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>작업상태</span><span></span></div><div id="taskList"></div></div><button class="add-btn" id="addTask" type="button">+ 작업내용 추가</button><div class="form-actions"><button class="btn" type="button" id="cancel">취소</button><button class="btn main" type="submit">${isEdit?'수정 저장':'등록'}</button></div></div></section></form>`;
 bindBack();paintTasks();$('#cycleId').onchange=()=>{updateCycleData();refreshSummary()};$('#workDate').onchange=()=>{gatherTasks();working.forEach(t=>t.startedAt=makeStarted($('#workDate').value,timeOf(t)));updateStageOptions();refreshSummary()};$('#stageId').onchange=()=>{updateReasonVisibility();refreshSummary()};
 $('#addTask').onclick=()=>{gatherTasks();let newTask=freshTask($('#workDate').value);const last=[...working].sort(timeSort).at(-1);if(last){const [hours,minutes]=timeOf(last).split(':').map(Number);const next=hours*60+minutes+30;if(next<24*60)newTask.startedAt=makeStarted($('#workDate').value,`${String(Math.floor(next/60)).padStart(2,'0')}:${String(next%60).padStart(2,'0')}`)}working.push(newTask);paintTasks();const target=$$('[data-taskid]',$('#taskList')).find(el=>el.dataset.taskid===newTask.taskId);target?.scrollIntoView({block:'nearest'});$('.t-name',target)?.focus()};
 $('#cancel').onclick=()=>go(isEdit?'detail':'list');$('#diaryForm').onsubmit=e=>{e.preventDefault();saveEditor()};
 updateStageOptions();refreshSummary();
}

function saveEditor(){const c=getCycle($('#cycleId').value),date=$('#workDate').value,policy=stagePolicy(c,date,editRow),stageId=$('#stageId').value,reason=editRow?toReason(editRow.stageChangeReason||editRow.stageChangeReasons):gatherReason();gatherTasks();
 let fail='';if(!date||date<c.actualStartDate||date>today())fail='실제 작업일을 확인하세요.';
 else if(diaryRows.some(d=>d.cycleId===c.cycleId&&d.workDate===date&&d.diaryId!==editRow?.diaryId))fail='같은 작기와 날짜에 일지가 이미 등록되어 있습니다.';
 else if(!working.length)fail='작업내용을 하나 이상 추가하세요.';
 else if(working.some(t=>!t.name.trim()||!t.type||!timeOf(t)||!t.content.trim()||!config.taskStatuses.some(s=>s.value===t.status)))fail='모든 작업의 작업명·유형·시간·상태·내용을 입력하세요.';
 else if(working.some(t=>t.startedAt.slice(0,10)!==date))fail='작업시간이 실제 작업일과 일치하지 않습니다.';
 else if(editRow&&stageId!==editRow.stageId)fail='저장된 일지의 생육단계는 변경할 수 없습니다.';
 else if(!editRow&&!policy.canChange&&stageId!==policy.stageId)fail='선택한 날짜의 생육단계는 변경할 수 없습니다.';
 else if(stageOrder(stageId)<stageOrder(policy.stageId)||stageOrder(stageId)>stageOrder(policy.stageId)+1)fail='생육단계 순서에 맞는 단계를 선택하세요.';
 else if(!editRow&&stageId!==policy.stageId&&!reason)fail='생육단계 변경 사유를 입력하세요.';
 if(fail){error(fail);return}
 const timestamp=`${today()}T${new Date().toTimeString().slice(0,8)}`;
 const diaryId=editRow?.diaryId||`D-NEW-${Date.now()}`;
 const payload={diaryId,cycleId:c.cycleId,workDate:date,stageId,stageChangeReason:stageId!==policy.stageId?reason:(editRow?toReason(editRow.stageChangeReason||editRow.stageChangeReasons):''),createdAt:editRow?.createdAt||timestamp,updatedAt:timestamp,tasks:working.map(t=>({...t,startedAt:makeStarted(date,timeOf(t))})).sort(timeSort)};
 if(editRow)diaryRows=diaryRows.map(d=>d.diaryId===diaryId?payload:d);else diaryRows.push(payload);
 if(!editRow&&stageId!==policy.stageId)c.stageHistory.push({eventId:`EV-NEW-${Date.now()}`,stageId,effectiveDate:date,sourceDiaryId:diaryId,reason});
 persist();selectedId=diaryId;toast(editRow?'재배일지를 수정했습니다.':'재배일지를 등록했습니다.');go('detail',diaryId);
}
function setupAccount(){const user=config.header?.currentUser||{displayName:'김철수',role:'화훼농민',certification:'농업경영체 인증회원'};
 $('#userName').textContent=user.displayName;$('#userCertification').textContent=` (${user.certification})`;
 $('#profileName').textContent=user.displayName;$('#profileRole').textContent=user.role;$('#profileCertification').textContent=user.certification;
 $('#myInfoButton').onclick=()=>$('#profileDialog').showModal();$('#profileClose').onclick=()=>$('#profileDialog').close();
 $('#logoutButton').onclick=()=>$('#logoutDialog').showModal();$('#logoutCancel').onclick=()=>$('#logoutDialog').close();
 $('#logoutConfirm').onclick=()=>{$('#logoutDialog').close();$('#signedOutOverlay').hidden=false;$('.app').inert=true;$('#demoLogin').focus()};
 $('#demoLogin').onclick=()=>{$('.app').inert=false;$('#signedOutOverlay').hidden=true;$('#myInfoButton').focus()};
}
// Additional modules: cycle plans and measured greenhouse environment.
const extraStoreKey='modoo-mancheonhong-cycle-env-v1';
let selectedCycleId='CY-MH-A1',selectedMeasurementId='ENVCH-001',cycleListPage=1,environmentListPage=1;
let cycleFilters={status:'all',greenhouse:'all',name:''},envFilters={cycle:'all',from:'',to:'',comparison:'all'};
const formatAt=x=>x?String(x).replace('T',' ').slice(0,16):'—';
const dateFrom=x=>String(x||'').slice(0,10);
const getSelectedCycle=()=>config.cycles.find(c=>c.cycleId===selectedCycleId)||config.cycles[0];
const getReading=id=>config.environmentChanges.find(s=>s.environmentChangeId===id)||config.environmentChanges[0];
const stdSet=id=>config.standardSets.find(x=>x.id===id)||config.standardSets[0];
const getCriteria=(cycle,stageId)=>config.stageEnvironmentalCriteria.find(x=>x.setId===cycle.environmentStandardSetId&&x.stageId===stageId)||config.stageEnvironmentalCriteria.find(x=>x.stageId===stageId);
const fmtVal=v=>v===null||v===undefined?'—':String(v);
function storeCycleExtras(){try{localStorage.setItem(extraStoreKey,JSON.stringify({cycles:config.cycles}))}catch{}}
function loadCycleExtras(){try{const saved=JSON.parse(localStorage.getItem(extraStoreKey)||'null');if(Array.isArray(saved?.cycles)){
  // Only replace records with compatible full objects. Avoid erasing seed data on older versions.
  config.cycles=saved.cycles.filter(c=>c&&c.cycleId&&c.greenhouseId&&c.environmentStandardSetId).map(c=>({...c,stageHistory:Array.isArray(c.stageHistory)?c.stageHistory:[]}));
  if(!config.cycles.length)throw Error('empty');
 }}catch{}}
function cycleStatus(c){return c.status||'미진행'}
function moduleHeading(title,caption='',backLabel='',onback=''){
 return `<div class="pagehead"><div><h1>${htmlText(title)}</h1>${caption?`<p>${htmlText(caption)}</p>`:''}</div>${backLabel?`<button type="button" class="backlink" id="moduleBack" data-goto="${onback}">← ${htmlText(backLabel)}</button>`:''}</div>`;
}
function bindModuleBack(){const b=$('#moduleBack');if(b)b.onclick=()=>go(b.dataset.goto)}
function pageControls(count,pageNum,size,kind){let pages=Math.max(1,Math.ceil(count/size)),start=count?(pageNum-1)*size+1:0,end=Math.min(pageNum*size,count);
 return `<div class="list-foot"><span>총 ${count}건 · ${start}–${end}건 표시</span><nav class="pagination" aria-label="${htmlText(kind)} 페이지 이동"><button class="page-button" data-modpage="prev" ${pageNum===1?'disabled':''}>이전</button>${Array.from({length:pages},(_,i)=>`<button class="page-button" data-modpage="${i+1}" ${pageNum===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')}<button class="page-button" data-modpage="next" ${pageNum===pages?'disabled':''}>다음</button></nav></div>`;
}
function bindPages(selector,get,set,total,size,draw){$$('[data-modpage]').forEach(b=>b.onclick=()=>{const v=b.dataset.modpage;set(v==='prev'?Math.max(1,get()-1):v==='next'?Math.min(Math.ceil(total/size),get()+1):Number(v));draw()})}
function renderCycleList(){let list=config.cycles.filter(c=>(cycleFilters.status==='all'||c.status===cycleFilters.status)&&(cycleFilters.greenhouse==='all'||c.greenhouseId===cycleFilters.greenhouse)&&(!cycleFilters.name||c.name.includes(cycleFilters.name))).sort((a,b)=>(b.plannedStartAt||'').localeCompare(a.plannedStartAt||''));
 const size=config.pagination.cyclePageSize||5;cycleListPage=Math.min(Math.max(1,cycleListPage),Math.max(1,Math.ceil(list.length/size)));let from=(cycleListPage-1)*size,rows=list.slice(from,from+size);
 main.innerHTML=moduleHeading('작기계획 목록','계획 일정과 실제 재배 진행 상태를 구분해 조회합니다.')+`<section class="panel list-panel"><div class="panel-body"><div class="filterbar module-filter"><div class="field"><label for="cycleFilterGH">온실</label><select class="ctrl" id="cycleFilterGH">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],cycleFilters.greenhouse)}</select></div><div class="field"><label for="cycleFilterState">작기 상태</label><select class="ctrl" id="cycleFilterState">${options(['all','미진행','진행','종료'].map(s=>({value:s,label:s==='all'?'전체 상태':s})),cycleFilters.status)}</select></div><div class="field query"><label for="cycleFilterName">작기계획명</label><input class="ctrl" id="cycleFilterName" value="${htmlText(cycleFilters.name)}" placeholder="작기계획명을 입력하세요"></div><button type="button" class="btn" id="cycleDoFilter">조회</button><button type="button" class="btn main" id="cycleCreate">+ 작기계획 등록</button></div></div>
 <div class="tablewrap"><table class="data-table module-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실</th><th>품목</th><th>품종</th><th>작기 상태</th><th>계획 시작일시</th><th>실제 시작일시</th><th>예상 종료일시</th><th>관리</th></tr></thead><tbody>${rows.map((c,i)=>`<tr><td class="row-index">${from+i+1}</td><td><button class="linkbtn" data-cycle-detail="${c.cycleId}">${htmlText(c.name)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'—')}</td><td>${htmlText(cropOf(c)?.name||'—')}</td><td>${htmlText(varietyOf(c)?.name||'—')}</td><td>${htmlText(cycleStatus(c))}</td><td class="tnum">${formatAt(c.plannedStartAt)}</td><td class="tnum">${formatAt(c.actualStartAt)}</td><td class="tnum">${formatAt(c.expectedEndAt)}</td><td><button class="btn xs" data-cycle-edit="${c.cycleId}">수정</button></td></tr>`).join('')||'<tr><td colspan="10" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>${pageControls(list.length,cycleListPage,size,'작기계획')}</section>`;
 $('#cycleDoFilter').onclick=()=>{cycleFilters={status:$('#cycleFilterState').value,greenhouse:$('#cycleFilterGH').value,name:$('#cycleFilterName').value.trim()};cycleListPage=1;renderCycleList()};$('#cycleFilterName').onkeydown=e=>{if(e.key==='Enter')$('#cycleDoFilter').click()};$('#cycleCreate').onclick=()=>go('cycle-create');
 $$('[data-cycle-detail]').forEach(b=>b.onclick=()=>go('cycle-detail',b.dataset.cycleDetail));$$('[data-cycle-edit]').forEach(b=>b.onclick=()=>go('cycle-edit',b.dataset.cycleEdit));bindPages('',()=>cycleListPage,v=>cycleListPage=v,list.length,size,renderCycleList);
}
function stageRows(c){const stages=config.growthStages.map(s=>{const k=getCriteria(c,s.stageId);let expectedStart=new Date(c.plannedStartAt||'2026-01-01T00:00:00');for(const prev of config.growthStages.filter(x=>x.order<s.order)){const n=getCriteria(c,prev.stageId)?.standardDays||0;expectedStart.setDate(expectedStart.getDate()+n)}
 const effective=c.stageHistory.find(h=>h.stageId===s.stageId);const range=k?.thresholds||{};
 return `<tr><td>${s.order}단계 · ${htmlText(s.name)}</td><td>${k?.standardDays??'—'}일</td><td>${dateFrom(expectedStart.toISOString())}</td><td>${effective?effective.effectiveDate:'—'}</td><td>${range.dayTempC?.join(' ~ ')||'—'} °C</td><td>${range.nightTempC?.join(' ~ ')||'—'} °C</td><td>${range.humidityPct?.join(' ~ ')||'—'} %RH</td><td>${range.substrateEcMsCm?.join(' ~ ')||'—'} mS/cm</td></tr>`;});return stages.join('')}
function renderCycleDetail(){const c=getSelectedCycle(),diaries=diaryRows.filter(d=>d.cycleId===c.cycleId),samples=config.environmentChanges.filter(s=>s.cycleId===c.cycleId);
 main.innerHTML=moduleHeading('작기계획 상세','', '작기계획 목록으로','cycle-list')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>작기 기본정보</h2><span class="counter">${htmlText(cycleStatus(c))}</span></div><div class="panel-body"><div class="module-facts">${[
 ['작기계획명',c.name],['온실',gh(c.greenhouseId)?.name||'—'],['품목',cropOf(c)?.name||'—'],['품종',varietyOf(c)?.name||'—'],['작기 상태',cycleStatus(c)],['단계별 환경 기준',stdSet(c.environmentStandardSetId)?.name||'—'],['계획 시작일시',formatAt(c.plannedStartAt)],['예상 종료일시',formatAt(c.expectedEndAt)],['실제 시작일시',formatAt(c.actualStartAt)],['실제 종료일시',formatAt(c.actualEndAt)],['작기계획 등록일시',formatAt(c.registeredAt)],['종료 사유',c.endReason||'—']].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}</div></div></section>
 <section class="panel"><div class="panel-head"><h2>생육단계별 환경 기준과 일정</h2></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>계획상 시작일</th><th>실제 시작일</th><th>주간 온도 기준</th><th>야간 온도 기준</th><th>습도 기준</th><th>배지 EC 기준</th></tr></thead><tbody>${stageRows(c)}</tbody></table></div></section>
 <section class="panel"><div class="panel-head"><h2>연결된 재배기록</h2></div><div class="panel-body"><div class="record-links"><div><span>재배일지 등록 건수</span><strong>${diaries.length}건</strong></div><div><span>작기 중 온실 환경변화 기록 건수</span><strong>${samples.length}건</strong></div><button class="btn" id="cycleViewDiary">재배일지 목록 조회</button><button class="btn" id="cycleViewEnv">온실 환경변화 기록 조회</button></div></div></section></div>
 <div class="module-actions"><button class="btn" id="cycleToList">목록</button><button class="btn" id="cycleToEdit">작기계획 수정</button>${c.status==='미진행'?'<button class="btn main" id="cycleStart">작기 시작</button>':''}${c.status==='진행'?'<button class="btn main" id="cycleEnd">작기 종료</button>':''}</div>`;
 bindModuleBack();$('#cycleToList').onclick=()=>go('cycle-list');$('#cycleToEdit').onclick=()=>go('cycle-edit');$('#cycleViewDiary').onclick=()=>{filterCycle=c.cycleId;listPage=1;go('list')};$('#cycleViewEnv').onclick=()=>{envFilters.cycle=c.cycleId;environmentListPage=1;go('env-list')};
 const start=$('#cycleStart');if(start)start.onclick=()=>{const dialog=$('#cycleStartDialog');$('#cycleStartTime').value=`${today()}T09:00`;dialog.showModal()};
 const end=$('#cycleEnd');if(end)end.onclick=()=>{const dialog=$('#cycleEndDialog');$('#cycleEndTime').value=`${today()}T17:00`;$('#cycleEndReason').value='';dialog.showModal()};
}
function commitCycleStart(){const c=getSelectedCycle(),start=$('#cycleStartTime').value;
 if(!start||dateFrom(start)>today()){toast('실제 시작일시를 확인하세요.');return}
 if(c.status!=='미진행'){toast('미진행 상태에서만 작기를 시작할 수 있습니다.');return}
 c.actualStartAt=start;c.actualStartDate=dateFrom(start);c.status='진행';c.stageHistory=[{eventId:'EV-START-'+Date.now(),stageId:'VEG',effectiveDate:c.actualStartDate,sourceDiaryId:null,reason:''}];storeCycleExtras();persist();$('#cycleStartDialog').close();toast('작기를 시작했습니다.');renderCycleDetail();
}
function commitCycleEnd(){const c=getSelectedCycle(),at=$('#cycleEndTime').value,reason=$('#cycleEndReason').value.trim();
 if(c.status!=='진행'||!at||at<c.actualStartAt||dateFrom(at)>today()){toast('실제 종료일시를 확인하세요.');return}
 c.actualEndAt=at;c.endReason=reason;c.status='종료';storeCycleExtras();$('#cycleEndDialog').close();toast('작기를 종료했습니다.');renderCycleDetail();
}
function renderCycleEditor(edit){const c=edit?getSelectedCycle():null,def={cycleId:'',name:'',greenhouseId:'GH-A',plannedStartAt:`${today()}T09:00`,expectedEndAt:'2027-03-01T18:00',environmentStandardSetId:'STD-MH-2026'};const row=c||def;const hasData=!!(c&&diaryRows.some(d=>d.cycleId===c.cycleId));
 main.innerHTML=moduleHeading(edit?'작기계획 수정':'작기계획 등록','', '작기계획 목록으로','cycle-list')+`<form class="module-form panel" id="cycleForm" novalidate><div class="panel-head"><h2>작기계획 기본정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="cycleName">작기계획명 *</label><input class="ctrl" id="cycleName" maxlength="80" value="${htmlText(row.name)}" placeholder="예: 2026년 호접란 A동 2차"></div>
 <div class="field"><label for="cycleGreenhouse">온실 *</label><select class="ctrl" id="cycleGreenhouse" ${hasData?'disabled':''}>${options(config.greenhouses.map(x=>({value:x.greenhouseId,label:x.name})),row.greenhouseId)}</select></div>
 <div class="field"><label>재배 품목</label><input class="ctrl" value="호접란" readonly></div><div class="field"><label>재배 품종</label><input class="ctrl" value="만천홍" readonly></div>
 <div class="field"><label for="cyclePlanStart">계획 시작일시 *</label><input type="datetime-local" class="ctrl" id="cyclePlanStart" value="${String(row.plannedStartAt||'').slice(0,16)}"></div>
 <div class="field"><label for="cycleExpectedEnd">예상 종료일시 *</label><input type="datetime-local" class="ctrl" id="cycleExpectedEnd" value="${String(row.expectedEndAt||'').slice(0,16)}"></div>
 <div class="field wide"><label for="cycleStd">작기 단계별 환경 기준 *</label><select class="ctrl" id="cycleStd">${options(config.standardSets.map(x=>({value:x.id,label:x.name})),row.environmentStandardSetId)}</select></div>
 </div><div class="subsection"><h3>생육단계별 환경 기준</h3><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>주간 온도</th><th>야간 온도</th><th>온실 내부 습도</th><th>배지 EC</th></tr></thead><tbody>${config.growthStages.map(s=>{const k=getCriteria(row,s.stageId);return `<tr><td>${s.order}단계 · ${s.name}</td><td>${k?.standardDays??'—'}일</td><td>${k?.thresholds.dayTempC?.join(' ~ ')} °C</td><td>${k?.thresholds.nightTempC?.join(' ~ ')} °C</td><td>${k?.thresholds.humidityPct?.join(' ~ ')} %RH</td><td>${k?.thresholds.substrateEcMsCm?.join(' ~ ')} mS/cm</td></tr>`}).join('')}</tbody></table></div></div>
 ${edit?`<div class="module-readonly"><span>작기 상태</span><strong>${htmlText(c.status)}</strong><span>실제 시작일시</span><strong>${formatAt(c.actualStartAt)}</strong><span>실제 종료일시</span><strong>${formatAt(c.actualEndAt)}</strong></div>`:''}
 <div class="errorbox hidden" id="cycleFormError" role="alert"></div></div><div class="module-actions inside"><button type="button" class="btn" id="cycleCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'작기계획 등록'}</button></div></form>`;
 bindModuleBack();$('#cycleCancel').onclick=()=>go(edit?'cycle-detail':'cycle-list');$('#cycleForm').onsubmit=e=>{e.preventDefault();const name=$('#cycleName').value.trim(),ghId=$('#cycleGreenhouse').value,start=$('#cyclePlanStart').value,end=$('#cycleExpectedEnd').value,setId=$('#cycleStd').value;
 const errors=[];if(!name)errors.push('작기계획명을 입력하세요.');if(!ghId)errors.push('온실을 선택하세요.');if(!start||!end||start>=end)errors.push('계획 시작일시와 예상 종료일시를 확인하세요.');if(config.cycles.some(x=>x.name===name&&x.cycleId!==c?.cycleId))errors.push('동일한 작기계획명이 존재합니다.');if(!setId)errors.push('환경 기준을 선택하세요.');
 if(errors.length){$('#cycleFormError').textContent=errors.join(' ');$('#cycleFormError').classList.remove('hidden');return}
 if(edit){Object.assign(c,{name,greenhouseId:hasData?c.greenhouseId:ghId,plannedStartAt:start,expectedEndAt:end,environmentStandardSetId:setId});storeCycleExtras();toast('작기계획을 수정했습니다.');go('cycle-detail',c.cycleId)}else{
 const newId='CY-NEW-'+Date.now();config.cycles.push({cycleId:newId,name,greenhouseId:ghId,cropId:'CR-ORCHID',varietyId:'V-MH',plannedStartAt:start,expectedEndAt:end,actualStartAt:null,actualStartDate:null,actualEndAt:null,endReason:null,registeredAt:`${today()}T09:00:00`,memberId:'FARMER-DEMO-01',status:'미진행',environmentStandardSetId:setId,stageHistory:[]});storeCycleExtras();toast('작기계획을 등록했습니다.');go('cycle-detail',newId)}
 };
}
function readingStage(r){
 const cycle=config.cycles.find(c=>c.cycleId===r.cycleId);
 return cycle?stageByDate(cycle,dateFrom(r.measuredAt)):'VEG';
}
// The logical entity stores cycleId, measuredAt and nine readings. Greenhouse comes from the cycle.
// Day/night classification is NOT a column in the uploaded ERD and its rule is unconfirmed.
// Therefore, measured inside temperature is shown but intentionally not evaluated against either day/night threshold.
function readingTests(r){
 const cycle=config.cycles.find(c=>c.cycleId===r.cycleId),criterion=getCriteria(cycle,readingStage(r));
 const values=criterion?.thresholds||{};
 return config.measurementFields.map(m=>{
   const current=r[m.key],threshold=m.key==='insideTempC'?null:values[m.criterion];
   const status=current===null||current===undefined?'미측정':m.key==='insideTempC'?'주간·야간 구분 기준 미확정':!threshold?'비교 기준 없음':current>=threshold[0]&&current<=threshold[1]?'기준 충족':'기준 이탈';
   return {key:m.key,label:m.label,value:current,unit:m.unit,range:threshold||null,status};
 });
}
function countExceeded(r){return readingTests(r).filter(s=>s.status==='기준 이탈').length}
function countMissing(r){return readingTests(r).filter(s=>s.status==='미측정').length}
function getCycleForReading(r){return config.cycles.find(c=>c.cycleId===r.cycleId)}
function renderEnvList(){
 const rows=config.environmentChanges.filter(s=>{
   const matchesCycle=envFilters.cycle==='all'||s.cycleId===envFilters.cycle;
   const matchesDate=(!envFilters.from||dateFrom(s.measuredAt)>=envFilters.from)&&(!envFilters.to||dateFrom(s.measuredAt)<=envFilters.to);
   const tests=readingTests(s);
   const matchesStatus=envFilters.comparison==='all'||
     (envFilters.comparison==='out'?countExceeded(s)>0:
     envFilters.comparison==='normal'?countExceeded(s)===0&&!tests.some(x=>x.status==='미측정'):
     tests.some(x=>x.status==='미측정'));
   return matchesCycle&&matchesDate&&matchesStatus;
 }).sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt));
 const size=config.pagination.environmentPageSize||7;
 environmentListPage=Math.min(Math.max(1,environmentListPage),Math.max(1,Math.ceil(rows.length/size)));
 const from=(environmentListPage-1)*size,shown=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('작기 중 발생하는 온실 환경변화 목록','작기계획에 연결된 측정일시별 환경변화 기록을 조회합니다. 온실은 작기계획에 등록된 온실정보에서 확인합니다.')+
 `<section class="panel list-panel"><div class="panel-body"><div class="filterbar module-filter env-filters">
 <div class="field"><label for="envCycle">작기계획</label><select class="ctrl" id="envCycle">${options([{value:'all',label:'전체 작기계획'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],envFilters.cycle)}</select></div>
 <div class="field"><label for="envFrom">측정 시작일</label><input type="date" class="ctrl" id="envFrom" value="${envFilters.from}"></div>
 <div class="field"><label for="envTo">측정 종료일</label><input type="date" class="ctrl" id="envTo" value="${envFilters.to}"></div>
 <div class="field"><label for="envState">환경 기준 비교 결과</label><select class="ctrl" id="envState">${options([{value:'all',label:'전체 비교 결과'},{value:'normal',label:'비교 가능한 항목에서 기준 이탈 없음'},{value:'out',label:'기준 이탈 항목 있음'},{value:'missing',label:'미측정 항목 있음'}],envFilters.comparison)}</select></div>
 <button class="btn" id="envDoFilter">조회</button></div>
 <p class="module-hint module-hint-filter">측정 기록은 작기계획에 종속됩니다. 주간·야간 구분 기준이 미확정이므로 내부 온도는 기준 이탈 계산에서 제외합니다.</p></div>
 <div class="tablewrap"><table class="data-table module-table env-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실명</th><th>환경변화 측정일시</th><th>해당 날짜의 실제 생육단계</th><th>온실 내부 온도 측정값</th><th>온실 내부 습도 측정값</th><th>기준 이탈 항목 수</th><th>미측정 항목 수</th><th>관리</th></tr></thead>
 <tbody>${shown.map((r,i)=>{const c=getCycleForReading(r);return `<tr><td class="row-index">${from+i+1}</td><td>${htmlText(c?.name||'—')}</td><td>${htmlText(gh(c?.greenhouseId)?.name||'—')}</td><td><button class="linkbtn" data-env-detail="${r.environmentChangeId}">${formatAt(r.measuredAt)}</button></td><td>${htmlText(getStage(readingStage(r)).name)}</td><td>${fmtVal(r.insideTempC)} °C</td><td>${fmtVal(r.humidityPct)} %RH</td><td>${countExceeded(r)}개</td><td>${countMissing(r)}개</td><td><button class="btn xs" data-env-detail="${r.environmentChangeId}">상세 조회</button></td></tr>`}).join('')||'<tr><td colspan="10" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>
 ${pageControls(rows.length,environmentListPage,size,'작기 중 발생하는 온실 환경변화')}</section>`;
 $('#envDoFilter').onclick=()=>{
   const next={cycle:$('#envCycle').value,from:$('#envFrom').value,to:$('#envTo').value,comparison:$('#envState').value};
   if(next.from&&next.to&&next.from>next.to){toast('측정 시작일과 종료일을 확인하세요.');return}
   envFilters=next;environmentListPage=1;renderEnvList();
 };
 $$('[data-env-detail]').forEach(b=>b.onclick=()=>go('env-detail',b.dataset.envDetail));
 bindPages('',()=>environmentListPage,v=>environmentListPage=v,rows.length,size,renderEnvList);
}
function renderEnvDetail(){
 const r=getReading(selectedMeasurementId);if(!r){go('env-list');return}
 selectedMeasurementId=r.environmentChangeId;
 const c=getCycleForReading(r),tested=readingTests(r),bad=tested.filter(x=>x.status==='기준 이탈').length,missing=countMissing(r);
 main.innerHTML=moduleHeading('작기 중 발생하는 온실 환경변화 상세','작기계획에 연결된 측정 기록을 조회합니다.', '환경변화 기록 목록으로','env-list')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>환경변화 측정 기본정보</h2><span class="counter">기준 이탈 ${bad}개 · 미측정 ${missing}개</span></div><div class="panel-body"><div class="module-facts compact">
 ${[['환경변화 기록 일련번호',r.environmentChangeId],['작기계획명',c?.name||'—'],['온실명 (작기계획 연결)',gh(c?.greenhouseId)?.name||'—'],['측정일시',formatAt(r.measuredAt)],['해당 날짜의 실제 생육단계',getStage(readingStage(r)).name],['적용 단계별 환경 기준',stdSet(c?.environmentStandardSetId)?.name||'—']].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}
 </div><p class="module-hint module-hint-detail">온실명은 환경변화 기록의 별도 외래키가 아니라 작기계획을 통해 조회합니다. 기준 수치는 화면 테스트용 가상 데이터입니다.</p></div></section>
 <section class="panel"><div class="panel-head"><h2>온실 환경변화 측정값과 생육단계별 환경 기준 비교</h2><span class="counter">환경측정 항목 9개</span></div><div class="tablewrap"><table class="data-table module-table metric-table"><thead><tr><th>환경측정 항목명</th><th>실제 측정값</th><th>기준 최저값</th><th>기준 최고값</th><th>비교 결과</th></tr></thead><tbody>
 ${tested.map(x=>`<tr><td>${htmlText(x.label)}</td><td>${x.value===null||x.value===undefined?'미측정':`${x.value} ${htmlText(x.unit)}`}</td><td>${x.range?`${x.range[0]} ${htmlText(x.unit)}`:'—'}</td><td>${x.range?`${x.range[1]} ${htmlText(x.unit)}`:'—'}</td><td><span class="metric-status ${x.status==='기준 이탈'?'emphasis':''}">${x.status}</span></td></tr>`).join('')}
 </tbody></table></div><div class="panel-body"><p class="module-hint">온실 내부 온도 측정값의 주간·야간 기준 적용 여부는 아직 합의되지 않아 판정하지 않습니다. 다른 8개 항목만 시연용 최저·최고 기준과 비교합니다.</p></div></section></div>
 <div class="module-actions"><button class="btn" id="envBack">목록</button><button class="btn" id="envCycleDetail">해당 작기계획 조회</button></div>`;
 bindModuleBack();$('#envBack').onclick=()=>go('env-list');$('#envCycleDetail').onclick=()=>go('cycle-detail',c.cycleId);
}

async function init(){try{const r=await fetch('./shared.json',{cache:'no-store'});if(r.ok)config=await r.json()}catch{}
 $('#brand').innerHTML=`${htmlText(config.meta.project)}<small>화훼 재배 관리</small>`;$('#sidebarFoot').textContent=`재배일지 · ${config.meta.commonCrop} ${config.meta.commonVariety}`;
 setupAccount();loadCycleExtras();loadSaved();render();
 $$('[data-close-dialog]').forEach(button=>{
  button.addEventListener('click',()=>document.getElementById(button.dataset.closeDialog).close());
 });
 $('#cycleStartConfirm').onclick=commitCycleStart;$('#cycleEndConfirm').onclick=commitCycleEnd;
}
init();
})();

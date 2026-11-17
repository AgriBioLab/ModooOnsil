(()=>{'use strict';
const { ready, notify: toast, allMembers, loadSignupMembers, signupKey, saveAuthUser, loadAuthUser, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;
const $=(s,base=document)=>base.querySelector(s), $$=(s,base=document)=>[...base.querySelectorAll(s)];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const htmlText=escapeHtml, clone=x=>JSON.parse(JSON.stringify(x));
const pageNums=(cur,total)=>{if(total<=7)return Array.from({length:total},(_,i)=>i+1);let s=Math.max(2,cur-2),e=Math.min(total-1,cur+2);if(cur<=3)e=5;if(cur>=total-2)s=total-4;const list=[1];if(s>2)list.push('...');for(let i=s;i<=e;i++)list.push(i);if(e<total-1)list.push('...');list.push(total);return list};
const pageBtns=(cur,total,attr)=>pageNums(cur,total).map(p=>p==='...'?'<span class="page-ellipsis" aria-hidden="true">…</span>':`<button type="button" class="page-button" ${attr}="${p}" ${p===cur?'aria-current="page"':''} aria-label="${p}페이지">${p}</button>`).join('');
const storageKey=kind=>`modoo-sprint2:${prototypeData.meta.version}:${config.header.currentUser.id}:${kind}`;
let config=clone(prototypeData), diaryRows=[], page='list',selectedId=null,working=[],editRow=null,selectedStage='VEG',filterCycle='all',filterGreenhouse='all',filterCrop='all',filterVariety='all',filterDate='',listPage=1;
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
function persist(){try{localStorage.setItem(storageKey("diaries"),JSON.stringify({diaries:diaryRows,cycleStageHistories:Object.fromEntries(config.cycles.map(c=>[c.cycleId,c.stageHistory]))}))}catch{}}
function loadSaved(){let saved;try{saved=JSON.parse(localStorage.getItem(storageKey("diaries"))||'null')}catch{}
 diaryRows=Array.isArray(saved?.diaries)?saved.diaries:clone(config.sampleDiaries);
 if(saved?.cycleStageHistories)for(const c of config.cycles){if(Array.isArray(saved.cycleStageHistories[c.cycleId]))c.stageHistory=saved.cycleStageHistories[c.cycleId].map(e=>{const {reasons,...rest}=e;return {...rest,reason:toReason(e.reason||reasons)}})}
 diaryRows.forEach(d=>{delete d.title;d.stageChangeReason=toReason(d.stageChangeReason||d.stageChangeReasons);delete d.stageChangeReasons;d.tasks=(d.tasks||[]).map(t=>({...t,startedAt:t.startedAt||makeStarted(d.workDate,t.time||'09:00'),name:t.name||t.type,content:t.content??''})).sort(timeSort)});
}
function error(s){const el=$('#formError');if(el){el.textContent=s;el.classList.remove('hidden')}toast(s)}
function updateNavigation() {
 const entry = (page.startsWith('cycle-')||page==='standard') ? 'cycle-list' : page.startsWith('gh-') ? 'gh-list' : page.startsWith('env-') ? 'env-list' : page.startsWith('issue-') ? 'issue-list' : 'list';
 const current = setCurrentMenu(entry);
 if (page==='standard') { $('#crumb').textContent='작기계획 / 생육단계별 환경기준'; return; }
 const state = page.replace(/^(cycle-|gh-|env-|issue-)/, '');
 const step = {list:'목록',create:'등록',detail:'상세',edit:'수정'}[state] || '목록';
 const prefix = (page.startsWith('gh-')||page.startsWith('env-')||page.startsWith('issue-')) ? ['온실', current?.textContent||'', step] : [current?.textContent||'', step];
 $('#crumb').textContent = prefix.filter(Boolean).join(' / ');
}
const pageFile=target=>target==='standard'?'crop-standard.html':target.startsWith('cycle-')?'cycle-list.html':target.startsWith('gh-')?'greenhouse-list.html':target.startsWith('env-')?'env-list.html':target.startsWith('issue-')?'issue-list.html':target==='profile'?'mypage.html':target==='cert'?'mypage.html?tab=cert':'diary-list.html';
function go(target,id){
 const hostPage=document.body?.dataset?.page;
 if(hostPage&&pageFile(target)!==pageFile(hostPage)){
  const url = new URL(pageFile(target), location.href);
  if (target !== hostPage && target !== 'cert') url.searchParams.set('view', target);
  if (id) url.searchParams.set('id', id);
  location.href = url.href;
  return;
 }
 if(target.startsWith('issue-')&&id)selectedIssueId=id;
 else if(target.startsWith('cycle-')&&id)selectedCycleId=id;
 else if(target.startsWith('gh-')&&id)selectedGhId=id;
 else if(target.startsWith('env-')&&id)selectedMeasurementId=id;
 else if(id)selectedId=id;
 if((target==='detail'||target==='edit')&&!diaryRows.length){toast('등록된 재배일지작업이 없습니다.');return}
 page=target;render();}
function heading(title,description='',back=false){return `<div class="pagehead"><div><h1>${title}</h1>${description?`<p>${htmlText(description)}</p>`:''}</div>${back?'<button type="button" class="backlink" id="returnList">← 재배일지작업 목록으로</button>':''}</div>`}
function bindBack(){const el=$('#returnList');if(el)el.addEventListener('click',()=>go('list'))}
function render(){updateNavigation();if(page.startsWith('cycle-')){if(page==='cycle-list')renderCycleList();else if(page==='cycle-detail')renderCycleDetail();else renderCycleEditor(page==='cycle-edit')}
 else if(page.startsWith('gh-')){if(page==='gh-list')renderGreenhouseList();else if(page==='gh-detail')renderGreenhouseDetail();else renderGreenhouseEditor(page==='gh-edit')}
 else if(page.startsWith('env-')){if(page==='env-list')renderEnvList();else renderEnvDetail()}
 else if(page.startsWith('issue-'))renderIssues(page==='issue-detail');
 else if(page==='standard')renderStandardPage();
 else if(page==='list')renderList();else if(page==='detail')renderDetail();else renderEditor(page==='edit')}
function renderList(){const rows=diaryRows.filter(d=>{
 const c=getCycle(d.cycleId);return(filterCycle==='all'||d.cycleId===filterCycle)&&(filterGreenhouse==='all'||c.greenhouseId===filterGreenhouse)&&(filterCrop==='all'||c.cropId===filterCrop)&&(filterVariety==='all'||c.varietyId===filterVariety)&&(!filterDate||d.workDate===filterDate)}).sort((a,b)=>b.workDate.localeCompare(a.workDate)||a.cycleId.localeCompare(b.cycleId));
 const usedCycles=diaryRows.map(d=>getCycle(d.cycleId)).filter(Boolean),usedCropIds=new Set(usedCycles.map(c=>c.cropId)),usedVarIds=new Set(usedCycles.map(c=>c.varietyId));const crops=config.crops.filter(c=>usedCropIds.has(c.cropId)).map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(filterCrop==='all'||c.cropId===filterCrop)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({...v,cropId:c.cropId})));
 const pageSize=Number(config.pagination?.pageSize)||5,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));listPage=Math.min(Math.max(1,listPage),totalPages);
 const first=(listPage-1)*pageSize,paged=rows.slice(first,first+pageSize),start=rows.length?first+1:0,end=Math.min(first+pageSize,rows.length);
 const pageButtons=pageBtns(listPage,totalPages,'data-list-page');
 main.innerHTML=heading('재배일지작업 목록')+`<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar"><div class="field"><label for="filterCycle">작기</label><select id="filterCycle" class="ctrl">${options([{value:'all',label:'전체 작기'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],filterCycle)}</select></div><div class="field"><label for="filterGreenhouse">온실</label><select id="filterGreenhouse" class="ctrl">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],filterGreenhouse)}</select></div><div class="field crop-filter"><label for="filterCrop">품목</label><select id="filterCrop" class="ctrl">${options([{value:'all',label:'전체 품목'},...crops],filterCrop)}</select></div><div class="field variety-filter"><label for="filterVariety">품종</label><select id="filterVariety" class="ctrl">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],filterVariety)}</select></div><div class="field query"><label for="workDateFilter">작업일</label><input id="workDateFilter" type="date" class="ctrl" value="${escapeHtml(filterDate)}"></div><button class="btn filter-submit" type="button" id="filterButton">검색</button></div></div></section>
 <section class="panel list-section" aria-label="재배일지작업 목록"><div class="panel-head"><div class="panel-head-title"><h2>재배일지작업 목록</h2><span class="counter">총 ${rows.length}건</span></div><button class="btn main xs" type="button" id="createButton">+ 재배일지작업 등록</button></div><div class="tablewrap"><table class="data-table"><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">실제 작업일</th><th scope="col">온실</th><th scope="col">품목</th><th scope="col">품종</th><th scope="col">작기</th><th scope="col">생육단계</th><th scope="col">작업 건수 (전체/미완료)</th></tr></thead><tbody>${paged.map((d,i)=>{const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;return `<tr><td class="row-index">${rows.length-first-i}</td><td><button class="linkbtn" data-detail="${d.diaryId}">${escapeHtml(d.workDate)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'-')}</td><td>${htmlText(cropOf(c)?.name||'-')}</td><td>${htmlText(varietyOf(c)?.name||'-')}</td><td>${htmlText(c.name)}</td><td>${htmlText(getStage(d.stageId).name)}</td><td class="tnum">${d.tasks.length} / ${d.tasks.length-done}</td></tr>`}).join('')||'<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>'}</tbody></table></div><div class="list-foot"><nav class="pagination" aria-label="재배일지작업 페이지 이동"><button class="page-button" type="button" data-page-direction="prev" ${listPage===1?'disabled':''}>이전</button>${pageButtons}<button class="page-button" type="button" data-page-direction="next" ${listPage===totalPages?'disabled':''}>다음</button></nav></div></section>`;
 $('#filterCrop').onchange=()=>{const selected=$('#filterCrop').value;const possible=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(selected==='all'||c.cropId===selected)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({value:v.varietyId,label:v.name})));const variety=$('#filterVariety');const old=variety.value;variety.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#filterButton').onclick=()=>{filterCycle=$('#filterCycle').value;filterGreenhouse=$('#filterGreenhouse').value;filterCrop=$('#filterCrop').value;filterVariety=$('#filterVariety').value;filterDate=$('#workDateFilter').value;listPage=1;renderList()};$('#workDateFilter').addEventListener('keydown',e=>{if(e.key==='Enter')$('#filterButton').click()});$('#createButton').onclick=()=>go('create');$$('[data-detail]').forEach(b=>b.onclick=()=>go('detail',b.dataset.detail));
 $$('[data-list-page]').forEach(b=>b.onclick=()=>{listPage=Number(b.dataset.listPage);renderList()});$$('[data-page-direction]').forEach(b=>b.onclick=()=>{listPage+=b.dataset.pageDirection==='next'?1:-1;renderList()});
}

function getContextHTML(c){return `<div class="cycle-meta"><div><span class="meta-label">품목</span><strong class="meta-value">${htmlText(cropOf(c)?.name||'-')}</strong></div><div><span class="meta-label">품종</span><strong class="meta-value">${htmlText(varietyOf(c)?.name||'-')}</strong></div><div><span class="meta-label">온실</span><strong class="meta-value">${htmlText(gh(c.greenhouseId)?.name||'-')}</strong></div></div>`}
function toReason(v){if(typeof v==='string')return v.trim();if(v&&typeof v==='object')return Object.values(v).filter(Boolean).map(x=>String(x).trim()).join(' / ');return ''}
function getReasons(reason){const text=toReason(reason);return text?`<p class="reason-text">${htmlText(text)}</p>`:''}
function renderDetail(){const d=getDiary(selectedId);if(!d){go('list');return}selectedId=d.diaryId;const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length,reason=toReason(d.stageChangeReason||d.stageChangeReasons);
 const dateMeta=[d.createdAt?`등록일 ${d.createdAt.slice(0,10)}`:'',d.updatedAt?`수정일 ${d.updatedAt.slice(0,10)}`:''].filter(Boolean).join(' · ');
 main.innerHTML=heading('재배일지작업 상세','')+`<div class="editor-shell"><section class="panel editor-summary detail-summary-card" aria-label="재배일지 요약">${summaryHTML(c,d.workDate,d.stageId)}${reason?`<div class="detail-meta-bar"><div class="detail-reason"><strong>생육단계 변경 사유</strong><span>${htmlText(reason)}</span></div></div>`:''}</section>
 <section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter">${d.tasks.length}건 · 완료 ${done} / 미완료 ${d.tasks.length-done}${dateMeta?` · ${htmlText(dateMeta)}`:''}</span></div><div class="task-body"><div class="task-list-header detail-task-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>상태</span></div><div class="task-scroll detail-list">${[...d.tasks].sort(timeSort).map(t=>`<article class="detail-task"><div class="t-row"><strong>${htmlText(t.name)}</strong><span>${timeOf(t)}</span><span>${htmlText(t.type)}</span><span>${htmlText(t.status)}</span></div><div class="details-content">${htmlText(t.content||'—')}</div></article>`).join('')||'<p class="empty" style="padding:24px">등록된 작업내용이 없습니다.</p>'}</div><div class="hidden" id="detailDeleteConfirm" style="padding:10px 12px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>이 재배일지작업을 삭제하시겠습니까?</span><button type="button" class="btn" id="detailDeleteCancel">취소</button><button type="button" class="btn main" id="detailDeleteOk">삭제 확인</button></div><div class="form-actions"><button class="btn" id="detailBack">목록</button><button class="btn" id="detailDelete">삭제</button><button class="btn main" id="detailEdit">수정</button></div></div></section></div>`;
 bindBack();$('#detailBack').onclick=()=>go('list');$('#detailEdit').onclick=()=>go('edit',d.diaryId);
 $('#detailDelete').onclick=()=>$('#detailDeleteConfirm').classList.remove('hidden');
 $('#detailDeleteCancel').onclick=()=>$('#detailDeleteConfirm').classList.add('hidden');
 $('#detailDeleteOk').onclick=()=>{diaryRows=diaryRows.filter(x=>x.diaryId!==d.diaryId);persist();toast('재배일지작업을 삭제했습니다.');go('list')};
}

const trashSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';
function freshTask(date){return{taskId:'NEW-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:'',type:config.workTypes[0].value,startedAt:makeStarted(date,'09:00'),status:'미완료',content:''}}
function taskPanel(t){return `<article class="task-card" data-taskid="${escapeHtml(t.taskId)}"><div class="task-summary"><strong class="task-title title-text">${htmlText(t.name||'새 작업')}</strong><span class="summary-time">${timeOf(t)}</span><span class="summary-type">${htmlText(t.type)}</span><span class="summary-status">${htmlText(t.status)}</span><button class="trash" type="button" data-remove="${escapeHtml(t.taskId)}" aria-label="${htmlText(t.name||'새 작업')} 삭제" title="삭제">${trashSvg}</button></div><div class="task-detail"><div class="field wide"><label>작업명 *</label><input class="ctrl compact-input t-name" maxlength="100" value="${escapeHtml(t.name)}" placeholder="작업명"></div><div class="field"><label>작업유형 *</label><select class="ctrl t-type">${options(config.workTypes,t.type)}</select></div><div class="field"><label>작업시간 *</label><input class="ctrl t-time" type="time" value="${timeOf(t)}"></div><div class="field"><label>작업상태 *</label><select class="ctrl t-status">${options(config.taskStatuses,t.status)}</select></div><div class="field wide"><label>작업내용</label><textarea class="ctrl t-content" rows="2" placeholder="작업 내용을 입력하세요">${htmlText(t.content)}</textarea></div></div></article>`}
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
 const canChange=!isEdit&&!laterHistory&&!laterDiary&&date>=(last?.effectiveDate||c.actualStartDate||'')&&date>=c.actualStartDate&&date<=today();
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
 const active=config.cycles.filter(c=>c.status==='진행'&&c.actualStartDate);
 if(!d&&!active.length){main.innerHTML=heading('재배일지작업 등록','진행 중인 작기가 없습니다.');bindBack();return}
 const c=getCycle(d?.cycleId||active[0].cycleId),date=d?.workDate||today();selectedStage=d?.stageId||stageByDate(c,date);working=d?clone(d.tasks): (config.formDefaults?.newDiaryTasks||[]).map((t,i)=>({...freshTask(date),taskId:`SAMPLE-${i+1}`,name:t.name,type:t.type,startedAt:makeStarted(date,t.time),status:t.status,content:t.content}));
 main.innerHTML=heading(isEdit?'재배일지작업 수정':'재배일지작업 등록','')+`<form class="editor-shell" id="diaryForm" novalidate><section class="panel editor-summary" aria-label="재배일지작업 기본정보">${summaryHTML(c,date,selectedStage)}<div class="summary-detail" id="baseFields"><div class="field"><label for="cycleId">작기 <span class="required">*</span></label><select class="ctrl" id="cycleId" ${isEdit?'disabled':''}>${options((isEdit?[c]:active).map(c=>({value:c.cycleId,label:c.name})),c.cycleId)}</select></div>
 <div class="field"><label for="workDate">실제 작업일 <span class="required">*</span></label><input class="ctrl" type="date" id="workDate" min="${c.actualStartDate}" max="${today()}" value="${date}" ${isEdit?'readonly':''}></div>
 <div class="stage-group" aria-label="실제 생육단계"><div class="field"><label for="stageId">해당 날짜의 실제 생육단계 <span class="required">*</span></label><select class="ctrl" id="stageId"></select><div id="stageHelp" class="stage-meta"></div></div></div>
 ${isEdit&&toReason(d.stageChangeReason||d.stageChangeReasons)?`<div class="reason-box"><strong>확정된 변경 사유</strong>${getReasons(d.stageChangeReason||d.stageChangeReasons)}</div>`:''}${!isEdit?reasonInputHtml():''}
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

 else if(working.some(t=>!t.name.trim()||!t.type||!timeOf(t)||!config.taskStatuses.some(s=>s.value===t.status)))fail='모든 작업의 작업명·유형·시간·상태를 입력하세요.';
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
 persist();selectedId=diaryId;toast(editRow?'재배일지작업을 수정했습니다.':'재배일지작업을 등록했습니다.');go('detail',diaryId);
}
function profileFacts(facts) {
 return `<dl class="profile-facts">
  ${facts.map(([label, value]) => `<dt>${label}</dt><dd>${htmlText(value || '—')}</dd>`).join('')}
 </dl>`;
}

function signIn(member, initialPage='list', initialId=null){
 config=clone(prototypeData);config.header.currentUser=member;
 config.greenhouses=config.greenhouses.filter(row=>row.memberId===member.id);
 config.cycles=config.cycles.filter(row=>row.memberId===member.id);
 const ids=new Set(config.cycles.map(row=>row.cycleId));
 for(const key of ['sampleDiaries','environmentChanges','issueSamples'])config[key]=config[key].filter(row=>ids.has(row.cycleId));
 page=initialPage;selectedId=null;selectedCycleId=null;selectedGhId=null;selectedMeasurementId=null;selectedIssueId=null;
 if(page.startsWith('issue-')&&initialId)selectedIssueId=initialId;
 else if(page.startsWith('cycle-')&&initialId)selectedCycleId=initialId;
 else if(page.startsWith('gh-')&&initialId)selectedGhId=initialId;
 else if(page.startsWith('env-')&&initialId)selectedMeasurementId=initialId;
 else if(initialId)selectedId=initialId;
 filterCycle=filterGreenhouse=filterCrop=filterVariety='all';filterDate='';listPage=cycleListPage=ghListPage=environmentListPage=issueListPage=1;
 cycleFilters={status:'all',greenhouse:'all',crop:'all',variety:'all',name:''};ghFilters={name:'',type:'all',cover:'all',medium:'all'};envFilters={cycle:'all',from:'',to:'',comparison:'all'};
 issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
 showAccount(member);loadStandards();loadGreenhouseExtras();loadCycleExtras();loadIssueExtras();loadSaved();render();
 if(main)main.focus();
}
// Additional modules: cycle plans and measured greenhouse environment.
let selectedCycleId=null,selectedMeasurementId=null,cycleListPage=1,environmentListPage=1;
let cycleFilters={status:'all',greenhouse:'all',crop:'all',variety:'all',name:''},envFilters={cycle:'all',from:'',to:'',comparison:'all'};
const formatAt=x=>x?String(x).replace('T',' ').slice(0,16):'—';
const dateFrom=x=>String(x||'').slice(0,10);
const getSelectedCycle=()=>config.cycles.find(c=>c.cycleId===selectedCycleId)||config.cycles[0];
const getReading=id=>config.environmentChanges.find(s=>s.environmentChangeId===id)||config.environmentChanges[0];
const stdSet=id=>config.standardSets.find(x=>x.id===id)||config.standardSets[0];
const getCriteria=(cycle,stageId)=>{const standard=stdSet(cycle?.environmentStandardSetId);return config.stageEnvironmentalCriteria.find(x=>x.varietyId===standard.varietyId&&x.stageId===stageId)};
const fmtVal=v=>v===null||v===undefined?'—':String(v);
function storeCycleExtras(){try{localStorage.setItem(storageKey("cycles"),JSON.stringify({cycles:config.cycles}))}catch{}}
function loadCycleExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey("cycles"))||'null');if(Array.isArray(saved?.cycles)){
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
 return `<div class="list-foot"><nav class="pagination" aria-label="${htmlText(kind)} 페이지 이동"><button class="page-button" data-modpage="prev" ${pageNum===1?'disabled':''}>이전</button>${pageBtns(pageNum,pages,'data-modpage')}<button class="page-button" data-modpage="next" ${pageNum===pages?'disabled':''}>다음</button></nav></div>`;
}
function bindPages(selector,get,set,total,size,draw){$$('[data-modpage]').forEach(b=>b.onclick=()=>{const v=b.dataset.modpage;set(v==='prev'?Math.max(1,get()-1):v==='next'?Math.min(Math.ceil(total/size),get()+1):Number(v));draw()})}
function renderCycleList(){let list=config.cycles.filter(c=>(cycleFilters.status==='all'||c.status===cycleFilters.status)&&(cycleFilters.greenhouse==='all'||c.greenhouseId===cycleFilters.greenhouse)&&(cycleFilters.crop==='all'||c.cropId===cycleFilters.crop)&&(cycleFilters.variety==='all'||c.varietyId===cycleFilters.variety)&&(!cycleFilters.name||c.name.includes(cycleFilters.name))).sort((a,b)=>(b.plannedStartAt||'').localeCompare(a.plannedStartAt||''));
 const usedCropIds=new Set(config.cycles.map(c=>c.cropId)),usedVarIds=new Set(config.cycles.map(c=>c.varietyId));const crops=config.crops.filter(c=>usedCropIds.has(c.cropId)).map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(cycleFilters.crop==='all'||c.cropId===cycleFilters.crop)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({...v,cropId:c.cropId})));
 const size=config.pagination.cyclePageSize||5;cycleListPage=Math.min(Math.max(1,cycleListPage),Math.max(1,Math.ceil(list.length/size)));let from=(cycleListPage-1)*size,rows=list.slice(from,from+size);
 main.innerHTML=moduleHeading('작기계획 목록')+`<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar module-filter"><div class="field"><label for="cycleFilterGH">온실</label><select class="ctrl" id="cycleFilterGH">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],cycleFilters.greenhouse)}</select></div><div class="field crop-filter"><label for="cycleFilterCrop">품목</label><select class="ctrl" id="cycleFilterCrop">${options([{value:'all',label:'전체 품목'},...crops],cycleFilters.crop)}</select></div><div class="field variety-filter"><label for="cycleFilterVariety">품종</label><select class="ctrl" id="cycleFilterVariety">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],cycleFilters.variety)}</select></div><div class="field"><label for="cycleFilterState">작기 상태</label><select class="ctrl" id="cycleFilterState">${options(['all','미진행','진행','종료'].map(s=>({value:s,label:s==='all'?'전체 상태':s})),cycleFilters.status)}</select></div><div class="field query"><label for="cycleFilterName">작기계획명</label><input class="ctrl" id="cycleFilterName" value="${htmlText(cycleFilters.name)}" placeholder="작기계획명을 입력하세요"></div><button type="button" class="btn filter-submit" id="cycleDoFilter">검색</button></div></div></section>
 <section class="panel list-section" aria-label="작기계획 목록"><div class="panel-head"><div class="panel-head-title"><h2>작기계획 목록</h2><span class="counter">총 ${list.length}건</span></div><button type="button" class="btn main xs" id="cycleCreate">+ 작기계획 등록</button></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실</th><th>품목</th><th>품종</th><th>작기 상태</th><th>계획 시작일</th><th>실제 시작일</th><th>예상 종료일</th></tr></thead><tbody>${rows.map((c,i)=>`<tr><td class="row-index">${list.length-from-i}</td><td><button class="linkbtn" data-cycle-detail="${c.cycleId}">${htmlText(c.name)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'—')}</td><td>${htmlText(cropOf(c)?.name||'—')}</td><td>${htmlText(varietyOf(c)?.name||'—')}</td><td>${htmlText(cycleStatus(c))}</td><td class="tnum">${dateFrom(c.plannedStartAt)||'—'}</td><td class="tnum">${dateFrom(c.actualStartAt)||'—'}</td><td class="tnum">${dateFrom(c.expectedEndAt)||'—'}</td></tr>`).join('')||'<tr><td colspan="9" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>${pageControls(list.length,cycleListPage,size,'작기계획')}</section>`;
 $('#cycleFilterCrop').onchange=()=>{const sel=$('#cycleFilterCrop').value;const possible=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(sel==='all'||c.cropId===sel)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({value:v.varietyId,label:v.name})));const vEl=$('#cycleFilterVariety');const old=vEl.value;vEl.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#cycleDoFilter').onclick=()=>{cycleFilters={status:$('#cycleFilterState').value,greenhouse:$('#cycleFilterGH').value,crop:$('#cycleFilterCrop').value,variety:$('#cycleFilterVariety').value,name:$('#cycleFilterName').value.trim()};cycleListPage=1;renderCycleList()};$('#cycleFilterName').onkeydown=e=>{if(e.key==='Enter')$('#cycleDoFilter').click()};$('#cycleCreate').onclick=()=>go('cycle-create');
 $$('[data-cycle-detail]').forEach(b=>b.onclick=()=>go('cycle-detail',b.dataset.cycleDetail));bindPages('',()=>cycleListPage,v=>cycleListPage=v,list.length,size,renderCycleList);
}
function stageRows(c){const stages=config.growthStages.map(s=>{const k=getCriteria(c,s.stageId);let expectedStart=new Date(c.plannedStartAt||'2026-01-01T00:00:00');for(const prev of config.growthStages.filter(x=>x.order<s.order)){const n=getCriteria(c,prev.stageId)?.standardDays||0;expectedStart.setDate(expectedStart.getDate()+n)}
 const effective=c.stageHistory.find(h=>h.stageId===s.stageId);const range=k?.thresholds||{};
 return `<tr><td>${s.order}단계 · ${htmlText(s.name)}</td><td>${k?.standardDays??'—'}일</td><td>${dateFrom(expectedStart.toISOString())}</td><td>${effective?effective.effectiveDate:'—'}</td><td>${range.dayTempC?.join(' ~ ')||'—'} °C</td><td>${range.nightTempC?.join(' ~ ')||'—'} °C</td><td>${range.humidityPct?.join(' ~ ')||'—'} %RH</td><td>${range.substrateEcMsCm?.join(' ~ ')||'—'} mS/cm</td></tr>`;});return stages.join('')}
function renderCycleDetail(){const c=getSelectedCycle();if(!c){go('cycle-list');return}const diaries=diaryRows.filter(d=>d.cycleId===c.cycleId),samples=config.environmentChanges.filter(s=>s.cycleId===c.cycleId),lastStage=c.stageHistory.at(-1),curStage=lastStage?getStage(lastStage.stageId).name:'—',hasStd=config.stageEnvironmentalCriteria.some(x=>x.varietyId===c.varietyId),stdLabel=`${varietyOf(c)?.name||'—'} · ${hasStd?'전체 생육단계 기준':'기준 미입력'}`;
 main.innerHTML=moduleHeading('작기계획 상세','')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>작기정보</h2><span class="counter">${htmlText(cycleStatus(c))}</span></div><div class="panel-body"><div class="module-facts">${[
 ['작기계획명',c.name],['온실',gh(c.greenhouseId)?.name||'—'],['품목',cropOf(c)?.name||'—'],['품종',varietyOf(c)?.name||'—'],['작기 상태',cycleStatus(c)],['현재 생육단계',curStage],['단계별 환경 기준',stdLabel],['계획 시작일',dateFrom(c.plannedStartAt)||'—'],['예상 종료일',dateFrom(c.expectedEndAt)||'—'],['실제 시작일',dateFrom(c.actualStartAt)||'—'],['실제 종료일',dateFrom(c.actualEndAt)||'—'],['작기계획 등록일시',formatAt(c.registeredAt)],['종료 사유',c.endReason||'—']].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}</div></div></section>
 ${cycleTimelineChart(c)}
 <section class="panel"><div class="panel-head"><h2>생육단계별 환경 기준과 일정</h2><button type="button" class="btn xs" id="cycleViewStd">전체 환경기준 보기</button></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>계획상 시작일</th><th>실제 시작일</th><th>주간 온도 기준</th><th>야간 온도 기준</th><th>습도 기준</th><th>배지 EC 기준</th></tr></thead><tbody>${stageRows(c)}</tbody></table></div></section>
 <section class="panel"><div class="panel-head"><h2>연결된 재배기록</h2></div><div class="panel-body"><div class="record-links"><div><span>재배일지작업 등록 건수</span><strong>${diaries.length}건</strong></div><div><span>작기 중 온실 환경변화 기록 건수</span><strong>${samples.length}건</strong></div><button class="btn" id="cycleViewDiary">재배일지작업 목록 조회</button><button class="btn" id="cycleViewEnv">온실 환경변화 기록 조회</button></div></div></section></div>
 <section class="panel hidden" id="cycleStartPanel"><div class="panel-head"><h2>작기 실제 시작일 등록</h2></div><div class="panel-body"><div class="filterbar"><div class="field"><label for="cycleStartTime">실제 시작일 *</label><input class="ctrl" type="date" id="cycleStartTime"></div><button class="btn" type="button" id="cycleStartCancel">취소</button><button class="btn main" type="button" id="cycleStartConfirm">작기 시작 확정</button></div></div></section>
 <section class="panel hidden" id="cycleEndPanel"><div class="panel-head"><h2>작기 종료</h2></div><div class="panel-body"><div class="module-input-grid"><div class="field"><label for="cycleEndTime">실제 종료일 *</label><input class="ctrl" type="date" id="cycleEndTime"></div><div class="field wide"><label for="cycleEndReason">종료 사유</label><textarea class="ctrl textarea" id="cycleEndReason" placeholder="종료 사유를 입력하세요"></textarea></div></div><div class="dialog-actions"><button class="btn" type="button" id="cycleEndCancel">취소</button><button class="btn main" type="button" id="cycleEndConfirm">종료 확정</button></div></div></section>
 <div class="module-actions"><button class="btn" id="cycleToList">목록</button><button class="btn" id="cycleToEdit">작기계획 수정</button>${c.status==='미진행'?'<button class="btn main" id="cycleStart">작기 시작</button>':''}${c.status==='진행'?'<button class="btn main" id="cycleEnd">작기 종료</button>':''}</div>`;
 bindModuleBack();$('#cycleToList').onclick=()=>go('cycle-list');$('#cycleToEdit').onclick=()=>go('cycle-edit');$('#cycleViewDiary').onclick=()=>{filterCycle=c.cycleId;listPage=1;go('list')};$('#cycleViewEnv').onclick=()=>{envFilters.cycle=c.cycleId;environmentListPage=1;go('env-list')};
 if($('#cycleViewStd'))$('#cycleViewStd').onclick=()=>{location.href='crop-standard.html?varietyId='+encodeURIComponent(c.varietyId||'')+'&cycleId='+encodeURIComponent(c.cycleId)};
 const start=$('#cycleStart');if(start)start.onclick=()=>{$('#cycleStartTime').value=today();$('#cycleStartPanel').classList.remove('hidden');$('#cycleStartTime').focus()};
 const end=$('#cycleEnd');if(end)end.onclick=()=>{$('#cycleEndTime').value=today();$('#cycleEndReason').value='';$('#cycleEndPanel').classList.remove('hidden');$('#cycleEndTime').focus()};
 if($('#cycleStartCancel'))$('#cycleStartCancel').onclick=()=>$('#cycleStartPanel').classList.add('hidden');
 if($('#cycleEndCancel'))$('#cycleEndCancel').onclick=()=>$('#cycleEndPanel').classList.add('hidden');
 if($('#cycleStartConfirm'))$('#cycleStartConfirm').onclick=commitCycleStart;
 if($('#cycleEndConfirm'))$('#cycleEndConfirm').onclick=commitCycleEnd;
}
function commitCycleStart(){const c=getSelectedCycle(),start=$('#cycleStartTime').value;
 if(!start||dateFrom(start)>today()){toast('실제 시작일을 확인하세요.');return}
 if(config.cycles.some(other=>other.cycleId!==c.cycleId&&other.greenhouseId===c.greenhouseId&&other.status==='진행')){toast('같은 온실에 진행 중인 작기가 있습니다.');return}
 if(c.status!=='미진행'){toast('미진행 상태에서만 작기를 시작할 수 있습니다.');return}
 c.actualStartDate=dateFrom(start);c.actualStartAt=`${c.actualStartDate}T00:00:00`;c.status='진행';c.stageHistory=[{eventId:'EV-START-'+Date.now(),stageId:'VEG',effectiveDate:c.actualStartDate,sourceDiaryId:null,reason:''}];storeCycleExtras();persist();toast('작기를 시작했습니다.');renderCycleDetail();
}
function commitCycleEnd(){const c=getSelectedCycle(),at=$('#cycleEndTime').value,reason=$('#cycleEndReason').value.trim();
 if(c.status!=='진행'||!at||dateFrom(at)<dateFrom(c.actualStartAt)||dateFrom(at)>today()){toast('실제 종료일을 확인하세요.');return}
 c.actualEndAt=`${dateFrom(at)}T23:59:59`;c.endReason=reason;c.status='종료';storeCycleExtras();toast('작기를 종료했습니다.');renderCycleDetail();
}
function renderCycleEditor(edit){if(!config.greenhouses.length){main.innerHTML=moduleHeading('작기계획 등록','등록된 온실이 없습니다.','작기계획 목록으로','cycle-list');bindModuleBack();return}const c=edit?getSelectedCycle():null,def={cycleId:'',name:'',greenhouseId:config.greenhouses[0].greenhouseId,cropId:config.crops[0]?.cropId||'',varietyId:config.crops[0]?.varieties[0]?.varietyId||'',plannedStartAt:`${today()}T00:00:00`,expectedEndAt:'2027-03-01T23:59:59',environmentStandardSetId:config.standardSets[0]?.id||''};const row=c||def;const hasData=!!(c&&diaryRows.some(d=>d.cycleId===c.cycleId));
 main.innerHTML=moduleHeading(edit?'작기계획 수정':'작기계획 등록','')+`<form class="module-form panel" id="cycleForm" novalidate><div class="panel-head"><h2>작기정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="cycleName">작기계획명 *</label><input class="ctrl" id="cycleName" maxlength="80" value="${htmlText(row.name)}" placeholder="예: 2026년 가을 4차 작기"></div>
 <div class="field"><label for="cycleGreenhouse">온실 *</label><select class="ctrl" id="cycleGreenhouse" ${hasData?'disabled':''}>${options(config.greenhouses.map(x=>({value:x.greenhouseId,label:x.name})),row.greenhouseId)}</select></div>
 <div class="field"><label for="cycleCrop">재배 품목 *</label><select class="ctrl" id="cycleCrop" ${hasData?'disabled':''}></select></div>
 <div class="field"><label for="cycleVariety">재배 품종 *</label><select class="ctrl" id="cycleVariety" ${hasData?'disabled':''}></select></div>
 <div class="field"><label for="cyclePlanStart">계획 시작일 *</label><input type="date" class="ctrl" id="cyclePlanStart" value="${dateFrom(row.plannedStartAt)}"></div>
 <div class="field"><label for="cycleExpectedEnd">예상 종료일 *</label><input type="date" class="ctrl" id="cycleExpectedEnd" value="${dateFrom(row.expectedEndAt)}"></div>
 <div class="field wide"><label>적용 환경기준</label><input class="ctrl" id="cycleStdSummary" readonly></div>
 </div><div class="subsection"><h3>생육단계별 환경 기준</h3><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>주간 온도</th><th>야간 온도</th><th>온실 내부 습도</th><th>배지 EC</th></tr></thead><tbody></tbody></table></div></div>
 ${edit?`<div class="module-readonly"><span>작기 상태</span><strong>${htmlText(c.status)}</strong><span>실제 시작일</span><strong>${dateFrom(c.actualStartAt)||'—'}</strong><span>실제 종료일</span><strong>${dateFrom(c.actualEndAt)||'—'}</strong></div>`:''}
 <div class="errorbox hidden" id="cycleFormError" role="alert"></div></div><div class="module-actions inside"><button type="button" class="btn" id="cycleCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'작기계획 등록'}</button></div></form>`;
 const allPairs=config.crops.flatMap(cr=>cr.varieties.map(v=>({cropId:cr.cropId,cropName:cr.cropName,varietyId:v.varietyId,varietyName:v.name})));
 let curCropId=row.cropId||allPairs[0]?.cropId||'';
 let curVarietyId=row.varietyId||allPairs[0]?.varietyId||'';
 const getSetForVariety=vid=>config.standardSets.find(x=>x.varietyId===vid)||config.standardSets[0];
 const paintStandards=()=>{
  const standard=getSetForVariety(curVarietyId);
  const hasStd=config.stageEnvironmentalCriteria.some(x=>x.varietyId===curVarietyId);
  const vObj=allPairs.find(x=>x.varietyId===curVarietyId);
  $('#cycleStdSummary').value=vObj?`${vObj.cropName} · ${vObj.varietyName} (${hasStd?'전체 생육단계 기준':'기준 미입력'})`:'—';
  $('#cycleForm tbody').innerHTML=config.growthStages.map(stage=>{
   const criterion=standard?getCriteria({...row,environmentStandardSetId:standard.id},stage.stageId):null;
   const ranges=criterion?.thresholds||{};
   return `<tr><td>${stage.order}단계 · ${htmlText(stage.name)}</td><td>${criterion?.standardDays??'—'}일</td>${['dayTempC','nightTempC','humidityPct','substrateEcMsCm'].map(key=>`<td>${ranges[key]?.join(' ~ ')||'—'}</td>`).join('')}</tr>`;
  }).join('');
 };
 const syncSelectors=()=>{
  const crops=config.crops.map(cr=>({value:cr.cropId,label:cr.name}));
  if(!crops.some(x=>x.value===curCropId))curCropId=crops[0]?.value||'';
  $('#cycleCrop').innerHTML=options(crops,curCropId);
  const vars=(config.crops.find(cr=>cr.cropId===curCropId)?.varieties||[]).map(v=>({value:v.varietyId,label:v.name}));
  if(!vars.some(x=>x.value===curVarietyId))curVarietyId=vars[0]?.value||'';
  $('#cycleVariety').innerHTML=options(vars,curVarietyId);
  paintStandards();
 };
 $('#cycleCrop').onchange=()=>{curCropId=$('#cycleCrop').value;curVarietyId='';syncSelectors()};
 $('#cycleVariety').onchange=()=>{curVarietyId=$('#cycleVariety').value;paintStandards()};
 syncSelectors();
 bindModuleBack();$('#cycleCancel').onclick=()=>go(edit?'cycle-detail':'cycle-list');$('#cycleForm').onsubmit=e=>{e.preventDefault();const name=$('#cycleName').value.trim(),ghId=$('#cycleGreenhouse').value,start=$('#cyclePlanStart').value,end=$('#cycleExpectedEnd').value;
 const standard=getSetForVariety(curVarietyId);
 const errors=[];if(!name)errors.push('작기계획명을 입력하세요.');if(!ghId)errors.push('온실을 선택하세요.');if(!curVarietyId||!standard)errors.push('재배 품목과 품종을 선택하세요.');if(!start||!end||start>=end)errors.push('계획 시작일과 예상 종료일을 확인하세요.');if(config.cycles.some(x=>x.name===name&&x.cycleId!==c?.cycleId))errors.push('동일한 작기계획명이 존재합니다.');
 if(errors.length){$('#cycleFormError').textContent=errors.join(' ');$('#cycleFormError').classList.remove('hidden');return}
 const startAt=`${dateFrom(start)}T00:00:00`,endAt=`${dateFrom(end)}T23:59:59`;
 if(edit){Object.assign(c,{cropId:curCropId,varietyId:curVarietyId,name,greenhouseId:hasData?c.greenhouseId:ghId,plannedStartAt:startAt,expectedEndAt:endAt,environmentStandardSetId:standard.id});storeCycleExtras();toast('작기계획을 수정했습니다.');go('cycle-detail',c.cycleId)}else{
 const newId='CY-NEW-'+Date.now();config.cycles.push({cycleId:newId,name,greenhouseId:ghId,cropId:curCropId,varietyId:curVarietyId,plannedStartAt:startAt,expectedEndAt:endAt,actualStartAt:null,actualStartDate:null,actualEndAt:null,endReason:null,registeredAt:`${today()}T09:00:00`,memberId:config.header.currentUser.id,status:'미진행',environmentStandardSetId:standard.id,stageHistory:[]});storeCycleExtras();toast('작기계획을 등록했습니다.');go('cycle-detail',newId)}
 };
}
function readingStage(r){
 const cycle=config.cycles.find(c=>c.cycleId===r.cycleId);
 return cycle?.stageHistory.filter(event=>(event.effectiveAt||event.effectiveDate)<=r.measuredAt).at(-1)?.stageId;
}
// The logical entity stores cycleId, measuredAt and nine readings. Greenhouse comes from the cycle.
// Day/night classification is NOT a column in the uploaded ERD and its rule is unconfirmed.
// Therefore, measured inside temperature is shown but intentionally not evaluated against either day/night threshold.
function readingTests(r){
 const cycle=config.cycles.find(c=>c.cycleId===r.cycleId),criterion=config.stageEnvironmentalCriteria.find(item=>item.setId===cycle?.environmentStandardSetId&&item.stageId===readingStage(r));
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
let envChartKey='insideTempC';
function envLineChart(rows, selectedCycle){
 const fields=config.measurementFields||[];
 const field=fields.find(f=>f.key===envChartKey)||fields[0]||{key:'insideTempC',label:'온실 내부 온도 측정값',unit:'°C'};
 const pts=rows.slice().sort((a,b)=>a.measuredAt.localeCompare(b.measuredAt)).filter(r=>r[field.key]!==null&&r[field.key]!==undefined);
 let body='<p class="empty" style="padding:20px">그래프에 표시할 측정값이 없습니다.</p>';
 if(pts.length){
  const vals=pts.map(r=>Number(r[field.key]));
  let min=Math.min(...vals),max=Math.max(...vals);
  if(min===max){min-=1;max+=1}
  const padL=48,padR=18,padT=16,padB=28,w=760,h=210,pw=w-padL-padR,ph=h-padT-padB;
  const xAt=i=>pts.length===1?padL+pw/2:padL+(i/(pts.length-1))*pw;
  const yAt=v=>padT+ph-((v-min)/(max-min))*ph;
  const poly=pts.map((r,i)=>`${xAt(i).toFixed(1)},${yAt(Number(r[field.key])).toFixed(1)}`).join(' ');
  const mid=((min+max)/2).toFixed(1);
  const grid=[min,(min+max)/2,max].map((v,idx)=>`<line x1="${padL}" y1="${yAt(v).toFixed(1)}" x2="${w-padR}" y2="${yAt(v).toFixed(1)}" stroke="#e5e9f0"/><text x="${padL-6}" y="${(yAt(v)+4).toFixed(1)}" text-anchor="end" font-size="11" fill="#666">${idx===1?mid:v.toFixed(1)}</text>`).join('');
  const dots=pts.map((r,i)=>`<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(Number(r[field.key])).toFixed(1)}" r="4.5" fill="#267337" data-env-detail="${r.environmentChangeId}" style="cursor:pointer"><title>${formatAt(r.measuredAt)} : ${r[field.key]} ${htmlText(field.unit)}</title></circle>`).join('');
  const xLabels=[0,Math.floor((pts.length-1)/2),pts.length-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${xAt(i).toFixed(1)}" y="${h-8}" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}" font-size="11" fill="#666">${formatAt(pts[i].measuredAt).slice(5)}</text>`).join('');
  body=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${htmlText(field.label)} 추이 그래프">${grid}<polyline fill="none" stroke="#267337" stroke-width="2" points="${poly}"/>${dots}${xLabels}</svg>`;
 }
 const ghName=selectedCycle?(gh(selectedCycle.greenhouseId)?.name||'—'):'—';
 const title=selectedCycle?`${selectedCycle.name} · ${ghName} (1시간 단위 평균)`:'환경변화 추이 그래프';
 return `<section class="panel chart-section" aria-label="온실 환경변화 추이"><div class="panel-head"><h2>${htmlText(title)}</h2><label style="display:flex;align-items:center;gap:6px;font-size:12px"><span>항목</span><select id="envChartMetric" class="ctrl" style="width:auto;min-height:28px;padding:2px 8px">${options(fields.map(f=>({value:f.key,label:`${f.label} (${f.unit})`})),field.key)}</select></label></div><div class="panel-body">${body}</div></section>`;
}
function issueSummaryChart(rows){
 const total=Math.max(1,rows.length);
 const statusCounts=['발생','조치중','조치 완료'].map(st=>({label:st,count:rows.filter(r=>r.status===st).length}));
 const typeMap=new Map();
 for(const r of rows)typeMap.set(r.issueType,(typeMap.get(r.issueType)||0)+1);
 const typeCounts=[...typeMap.entries()].map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count);
 const bar=(label,count,statusAttr='')=>`<div class="bar-row"><span>${htmlText(label)}</span><div class="bar-track"><div class="bar-fill" ${statusAttr?`data-status="${htmlText(statusAttr)}"`:''} style="width:${Math.round((count/total)*100)}%"></div></div><strong style="text-align:right">${count}건</strong></div>`;
 return `<section class="panel chart-section" aria-label="이슈 현황 요약"><div class="panel-head"><h2>이슈 현황 요약</h2><span class="counter">총 ${rows.length}건</span></div><div class="panel-body"><div class="chart-grid"><div><h3 style="margin:0 0 8px;font-size:13px">조치 상태별</h3><div class="bar-list">${statusCounts.map(x=>bar(x.label,x.count,x.label)).join('')}</div></div><div><h3 style="margin:0 0 8px;font-size:13px">이슈 유형별</h3><div class="bar-list">${typeCounts.length?typeCounts.map(x=>bar(x.label,x.count)).join(''):'<span class="muted">표시할 데이터가 없습니다.</span>'}</div></div></div></div></section>`;
}
function cycleTimelineChart(c){
 const startMs=new Date(c.plannedStartAt||today()).getTime(),endMs=new Date(c.expectedEndAt||today()).getTime();
 const nowMs=c.actualEndAt?new Date(c.actualEndAt).getTime():new Date(today()+'T23:59:59').getTime();
 const totalMs=Math.max(1,endMs-startMs);
 const pct=c.status==='미진행'?0:c.status==='종료'?100:Math.max(0,Math.min(100,Math.round(((nowMs-startMs)/totalMs)*100)));
 const stages=config.growthStages.map((st,i)=>{
  const k=getCriteria(c,st.stageId);const days=k?.standardDays||20;
  const eff=c.stageHistory.find(h=>h.stageId===st.stageId);
  return {name:st.name,days,cls:`s${i+1}`,date:eff?eff.effectiveDate:'미전환'};
 });
 const sumDays=stages.reduce((a,x)=>a+x.days,0)||1;
 return `<section class="panel chart-section"><div class="panel-head"><h2>작기 일정 · 생육단계 진행</h2><span class="counter">진행률 ${pct}%</span></div><div class="panel-body"><div class="timeline-meta"><span>계획 시작: ${dateFrom(c.plannedStartAt)||'—'}</span><span>예상 종료: ${dateFrom(c.expectedEndAt)||'—'}</span></div><div class="bar-track" style="height:10px;margin:6px 0 12px"><div class="bar-fill" style="width:${pct}%"></div></div><div class="timeline-bar">${stages.map(x=>`<div class="timeline-seg ${x.cls}" style="width:${((x.days/sumDays)*100).toFixed(1)}%" title="${htmlText(x.name)} (${x.days}일)">${htmlText(x.name)}</div>`).join('')}</div><div class="timeline-meta">${stages.map(x=>`<span>${htmlText(x.name)}: ${htmlText(x.date)}</span>`).join('')}</div></div></section>`;
}
function renderEnvList(){
 let selectedCycle=config.cycles.find(c=>c.cycleId===envFilters.cycle);
 if(!selectedCycle){
  selectedCycle=config.cycles.find(c=>config.environmentChanges.some(e=>e.cycleId===c.cycleId))||config.cycles[0];
  envFilters.cycle=selectedCycle?.cycleId||'';
 }
 if(!selectedCycle){
  main.innerHTML=moduleHeading('온실 환경변화 목록')+'<section class="panel list-section"><div class="panel-body"><p class="empty">조회할 작기계획이 없습니다.</p></div></section>';
  return;
 }
 const rows=config.environmentChanges.filter(s=>{
   const matchesCycle=s.cycleId===selectedCycle.cycleId;
   const matchesDate=(!envFilters.from||dateFrom(s.measuredAt)>=envFilters.from)&&(!envFilters.to||dateFrom(s.measuredAt)<=envFilters.to);
   return matchesCycle&&matchesDate;
 }).sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt));
 const size=config.pagination.environmentPageSize||7;
 environmentListPage=Math.min(Math.max(1,environmentListPage),Math.max(1,Math.ceil(rows.length/size)));
 const from=(environmentListPage-1)*size,shown=rows.slice(from,from+size);
 const ghName=gh(selectedCycle.greenhouseId)?.name||'—';
 main.innerHTML=moduleHeading('온실 환경변화 목록')+
 `<section class="panel search-section" aria-label="작기계획 및 기간 선택"><div class="panel-body"><div class="filterbar module-filter env-filters">
 <div class="field" style="flex:1 1 280px"><label for="envCycle">작기계획 (온실별 1:1)</label><select class="ctrl" id="envCycle">${options(config.cycles.map(c=>({value:c.cycleId,label:`${c.name} · ${gh(c.greenhouseId)?.name||'—'} (${cycleStatus(c)})`})),selectedCycle.cycleId)}</select></div>
 <div class="field"><label for="envFrom">측정 시작일</label><input type="date" class="ctrl" id="envFrom" value="${envFilters.from}"></div>
 <div class="field"><label for="envTo">측정 종료일</label><input type="date" class="ctrl" id="envTo" value="${envFilters.to}"></div>
 <button class="btn filter-submit" id="envDoFilter">검색</button></div></div></section>
 ${envLineChart(rows, selectedCycle)}
 <section class="panel list-section" aria-label="1시간 단위 환경측정 목록"><div class="panel-head"><h2>1시간 단위 환경측정 목록</h2><span class="counter">${htmlText(ghName)} · ${htmlText(cropOf(selectedCycle)?.name||'—')} (${htmlText(varietyOf(selectedCycle)?.name||'—')}) · 총 ${rows.length}건</span></div><div class="tablewrap"><table class="data-table module-table env-table"><thead><tr><th class="row-index">번호</th><th>측정일시</th><th>온도(°C)</th><th>습도(%RH)</th><th>CO₂(ppm)</th><th>일사량(W/m²)</th><th>광도</th><th>배지수분(%)</th><th>미측정</th></tr></thead>
 <tbody>${shown.map((r,i)=>`<tr><td class="row-index">${rows.length-from-i}</td><td><button class="linkbtn" data-env-detail="${r.environmentChangeId}">${formatAt(r.measuredAt)}</button></td><td class="tnum">${fmtVal(r.insideTempC)}</td><td class="tnum">${fmtVal(r.humidityPct)}</td><td class="tnum">${fmtVal(r.co2Ppm)}</td><td class="tnum">${fmtVal(r.solarWm2)}</td><td class="tnum">${fmtVal(r.lightUmolM2S)}</td><td class="tnum">${fmtVal(r.substrateMoisturePct)}</td><td>${countMissing(r)}개</td></tr>`).join('')||'<tr><td colspan="9" class="empty">해당 작기의 측정 기록이 없습니다.</td></tr>'}</tbody></table></div>${pageControls(rows.length,environmentListPage,size,'온실 환경변화')}</section>`;
 $('#envCycle').onchange=()=>{envFilters.cycle=$('#envCycle').value;environmentListPage=1;renderEnvList()};
 $('#envDoFilter').onclick=()=>{
   const next={cycle:$('#envCycle').value,from:$('#envFrom').value,to:$('#envTo').value,comparison:'all'};
   if(next.from&&next.to&&next.from>next.to){toast('측정 시작일과 종료일을 확인하세요.');return}
   envFilters=next;environmentListPage=1;renderEnvList();
 };
 if($('#envChartMetric'))$('#envChartMetric').onchange=e=>{envChartKey=e.target.value;renderEnvList()};
 $$('[data-env-detail]').forEach(b=>b.onclick=()=>go('env-detail',b.dataset.envDetail));
 bindPages('',()=>environmentListPage,v=>environmentListPage=v,rows.length,size,renderEnvList);
}
function renderEnvDetail(){
 const r=getReading(selectedMeasurementId);if(!r){go('env-list');return}
 selectedMeasurementId=r.environmentChangeId;
 const c=getCycleForReading(r),tested=readingTests(r),missing=countMissing(r);
 main.innerHTML=moduleHeading('온실 환경변화 상세','')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>환경변화 측정 기본정보</h2><span class="counter">미측정 ${missing}개</span></div><div class="panel-body"><div class="module-facts compact">
 ${[['작기계획명',c?.name||'—'],['온실명',gh(c?.greenhouseId)?.name||'—'],['측정일시',formatAt(r.measuredAt)]].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}
 </div></div></section>
 <section class="panel"><div class="panel-head"><h2>온실 환경변화 측정값</h2><span class="counter">환경측정 항목 9개</span></div><div class="tablewrap"><table class="data-table module-table metric-table"><thead><tr><th>환경측정 항목명</th><th>실제 측정값</th></tr></thead><tbody>
 ${tested.map(x=>`<tr><td>${htmlText(x.label)}</td><td>${x.value===null||x.value===undefined?'미측정':`${x.value} ${htmlText(x.unit)}`}</td></tr>`).join('')}
 </tbody></table></div></section></div>
 <div class="module-actions"><button class="btn" id="envBack">목록</button><button class="btn" id="envCycleDetail">해당 작기계획 상세</button></div>`;
 bindModuleBack();$('#envBack').onclick=()=>go('env-list');$('#envCycleDetail').onclick=()=>go('cycle-detail',c.cycleId);
}

let selectedIssueId=null,issueListPage=1,issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
function storeIssueExtras(){try{localStorage.setItem(storageKey('issues'),JSON.stringify({issues:config.issueSamples}))}catch{}}
function loadIssueExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('issues'))||'null');if(Array.isArray(saved?.issues)&&saved.issues.length)config.issueSamples=saved.issues}catch{}}
function renderIssues(detail){
 const issues=config.issueSamples;
 if(detail){
  const issue=issues.find(item=>item.issueId===selectedIssueId)||issues[0];
  if(!issue){go('issue-list');return}
  selectedIssueId=issue.issueId;
  const cycle=getCycle(issue.cycleId);
  const reading=config.environmentChanges.find(item=>item.cycleId===issue.cycleId&&item.measuredAt===issue.occurredAt);
  const facts=[['작기계획',cycle?.name||'—'],['온실',gh(cycle?.greenhouseId)?.name||'—'],['발생일시',formatAt(issue.occurredAt)],['이슈 유형',issue.issueType],['이슈 메시지',issue.message],['발생 측정값',issue.issueValue],['조치 상태',issue.status],['조치 내용',issue.actionContent],['조치 완료일시',formatAt(issue.actionCompletedAt)]];
  main.innerHTML=moduleHeading('온실 환경 이슈 상세','')+
  `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>이슈 정보</h2><span class="issue-status" data-status="${htmlText(issue.status)}">${htmlText(issue.status)}</span></div><div class="panel-body"><dl class="profile-facts">${facts.map(([label,value])=>`<dt>${label}</dt><dd>${htmlText(value??'—')}</dd>`).join('')}</dl>${reading?'<div style="margin-top:12px"><button id="issueReading" class="btn">발생 시점 측정 보기</button></div>':''}</div></section>
  <section class="panel" style="margin-top:14px"><div class="panel-head"><h2>조치 등록 및 상태 변경</h2></div><div class="panel-body"><form id="issueActionForm"><div class="module-input-grid">
  <div class="field"><label for="issueNextStatus">조치 상태 *</label><select id="issueNextStatus" class="ctrl">${options(['발생','조치중','조치 완료'].map(v=>({value:v,label:v})),issue.status)}</select></div>
  <div class="field wide"><label for="issueActionInput">조치 내용</label><textarea id="issueActionInput" class="ctrl textarea" placeholder="조치 내용을 입력하세요 (조치 완료 시 필수)">${htmlText(issue.actionContent||'')}</textarea></div>
  </div><div class="module-actions"><button type="button" class="btn" id="issueToList">목록</button><button type="submit" class="btn main">조치 저장</button></div></form></div></section></div>`;
  bindModuleBack();
  if(reading)$('#issueReading').onclick=()=>go('env-detail',reading.environmentChangeId);
  $('#issueToList').onclick=()=>go('issue-list');
  $('#issueActionForm').onsubmit=e=>{
   e.preventDefault();
   const nextStatus=$('#issueNextStatus').value;
   const actionText=$('#issueActionInput').value.trim();
   if(nextStatus==='조치 완료'&&!actionText){toast('조치 완료 시 조치 내용을 입력하세요.');return}
   issue.status=nextStatus;
   issue.actionContent=actionText||null;
   issue.actionCompletedAt=nextStatus==='조치 완료'?(issue.actionCompletedAt||`${today()}T${new Date().toTimeString().slice(0,8)}`):null;
   storeIssueExtras();
   toast('이슈 조치 내용을 저장했습니다.');
   renderIssues(true);
  };
  return;
 }
 const all=label=>({value:'all',label});
 const choose=(id,label,items,selected)=>`<label class="field" for="${id}">${label}<select id="${id}" class="ctrl">${options([all('전체'),...items],selected)}</select></label>`;
 const values=items=>[...new Set(items)].map(value=>({value,label:value}));
 const rows=issues.filter(item=>(issueFilters.cycle==='all'||item.cycleId===issueFilters.cycle)&&(issueFilters.type==='all'||item.issueType===issueFilters.type)&&(issueFilters.status==='all'||item.status===issueFilters.status)&&(!issueFilters.from||dateFrom(item.occurredAt)>=issueFilters.from)&&(!issueFilters.to||dateFrom(item.occurredAt)<=issueFilters.to)).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));
 const size=Number(config.pagination?.pageSize)||5;issueListPage=Math.min(Math.max(1,issueListPage),Math.max(1,Math.ceil(rows.length/size)));const fromIdx=(issueListPage-1)*size,pagedIssues=rows.slice(fromIdx,fromIdx+size);
 main.innerHTML=moduleHeading('온실 환경 이슈 목록')+`${issueSummaryChart(issues)}
 <section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><form class="filterbar issue-filters" id="issueFilters">
 ${choose('issueCycle','작기계획',config.cycles.map(row=>({value:row.cycleId,label:row.name})),issueFilters.cycle)}
 ${choose('issueType','이슈 유형',values(['온도','습도','이산화탄소','일사량','광도','배지온도','배지수분량','배지 EC','배지 pH',...issues.map(item=>item.issueType)]),issueFilters.type)}
 ${choose('issueStatus','조치 상태',values(['발생','조치중','조치 완료']),issueFilters.status)}
 <label class="field" for="issueFrom">시작일<input id="issueFrom" class="ctrl" type="date" value="${issueFilters.from}"></label>
 <label class="field" for="issueTo">종료일<input id="issueTo" class="ctrl" type="date" value="${issueFilters.to}"></label>
 <button class="btn filter-submit" type="submit">검색</button></form></div></section>

 <section class="panel list-section" aria-label="온실 환경 이슈 목록"><div class="panel-head"><div class="panel-head-title"><h2>온실 환경 이슈 목록</h2><span class="counter">총 ${rows.length}건</span></div></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>발생일시</th><th>작기계획</th><th>이슈 유형</th><th>이슈 내용</th><th>조치 상태</th></tr></thead>
 <tbody>${pagedIssues.map(item=>`<tr><td>${formatAt(item.occurredAt)}</td><td>${htmlText(getCycle(item.cycleId)?.name)}</td><td>${htmlText(item.issueType)}</td><td><button class="linkbtn" data-issue="${item.issueId}">${htmlText(item.message)}</button></td><td><span class="issue-status" data-status="${htmlText(item.status)}">${htmlText(item.status)}</span></td></tr>`).join('')||'<tr><td colspan="5" class="empty">조회된 이슈가 없습니다.</td></tr>'}</tbody></table></div>${pageControls(rows.length,issueListPage,size,'온실 환경 이슈')}</section>`;
 $('#issueCycle').onchange=()=>{issueFilters={cycle:$('#issueCycle').value,type:'all',status:'all',from:'',to:''};issueListPage=1;renderIssues(false)};
 $('#issueFilters').onsubmit=event=>{
  event.preventDefault();
  const from=$('#issueFrom').value,to=$('#issueTo').value;
  if(from&&to&&from>to){toast('시작일과 종료일을 확인하세요.');return}
  issueFilters={cycle:$('#issueCycle').value,type:$('#issueType').value,status:$('#issueStatus').value,from,to};issueListPage=1;renderIssues(false);
 };
 $$('[data-issue]').forEach(button=>button.onclick=()=>go('issue-detail',button.dataset.issue));
 bindPages('',()=>issueListPage,v=>issueListPage=v,rows.length,size,()=>renderIssues(false));
}
let selectedGhId=null,ghListPage=1,ghFilters={name:'',type:'all',cover:'all',medium:'all'};
function storeGreenhouseExtras(){try{localStorage.setItem(storageKey('greenhouses'),JSON.stringify({greenhouses:config.greenhouses}))}catch{}}
function loadGreenhouseExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('greenhouses'))||'null');if(Array.isArray(saved?.greenhouses)&&saved.greenhouses.length)config.greenhouses=saved.greenhouses.map(g=>(g.imageUrl!==undefined&&!String(g.imageUrl||'').endsWith('.svg'))?g:{...g,imageUrl:prototypeData.greenhouses.find(x=>x.greenhouseId===g.greenhouseId)?.imageUrl??null})}catch{}}
function renderGreenhouseList(){
 const rows=config.greenhouses.filter(g=>(!ghFilters.name||g.name.includes(ghFilters.name))&&(ghFilters.type==='all'||g.type===ghFilters.type)&&(ghFilters.cover==='all'||g.coverType===ghFilters.cover)&&(ghFilters.medium==='all'||g.mediumType===ghFilters.medium));
 const size=Number(config.pagination?.pageSize)||5;ghListPage=Math.min(Math.max(1,ghListPage),Math.max(1,Math.ceil(rows.length/size)));const from=(ghListPage-1)*size,paged=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('온실 정보')+
 `<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar module-filter">
 <div class="field query"><label for="ghFilterName">온실명</label><input class="ctrl" id="ghFilterName" value="${htmlText(ghFilters.name)}" placeholder="온실명을 입력하세요"></div>
 <div class="field"><label for="ghFilterType">유형</label><select class="ctrl" id="ghFilterType">${options([{value:'all',label:'전체'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],ghFilters.type)}</select></div>
 <div class="field"><label for="ghFilterCover">피복형태</label><select class="ctrl" id="ghFilterCover">${options([{value:'all',label:'전체'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],ghFilters.cover)}</select></div>
 <div class="field"><label for="ghFilterMedium">배지형태</label><select class="ctrl" id="ghFilterMedium">${options([{value:'all',label:'전체'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],ghFilters.medium)}</select></div>
 <button type="button" class="btn filter-submit" id="ghDoFilter">검색</button>
 </div></div></section>
 <section class="panel list-section" aria-label="온실 정보"><div class="panel-head"><div class="panel-head-title"><h2>온실 정보</h2><span class="counter">총 ${rows.length}건</span></div><button type="button" class="btn main xs" id="ghCreate">+ 온실 등록</button></div><div class="panel-body">${paged.length?`<div class="gh-card-grid">${paged.map(g=>`<article class="gh-card"><button type="button" class="gh-card-media" data-gh-detail="${g.greenhouseId}" aria-label="${htmlText(g.name)} 상세 보기">${g.imageUrl?`<img src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진">`:`<div class="gh-card-placeholder"><span>등록된 사진 없음</span></div>`}</button><div class="gh-card-body"><div class="gh-card-head"><button type="button" class="linkbtn gh-card-title" data-gh-detail="${g.greenhouseId}">${htmlText(g.name)}</button>${g.type?`<span class="gh-card-badge">${htmlText(g.type)}</span>`:''}</div><dl class="gh-card-specs"><div><dt>피복형태</dt><dd>${htmlText(g.coverType||'—')}</dd></div><div><dt>동 수</dt><dd>${g.buildingCount!=null?`${g.buildingCount}동`:'—'}</dd></div><div><dt>등록 면적</dt><dd>${g.registeredArea!=null?`${g.registeredArea} ㎡`:'—'}</dd></div><div><dt>배지형태</dt><dd>${htmlText(g.mediumType||'—')}</dd></div></dl></div></article>`).join('')}</div>`:'<p class="empty" style="padding:40px 12px;margin:0">등록된 온실이 없습니다.</p>'}</div>${pageControls(rows.length,ghListPage,size,'온실 정보')}</section>`;
 $('#ghDoFilter').onclick=()=>{ghFilters={name:$('#ghFilterName').value.trim(),type:$('#ghFilterType').value,cover:$('#ghFilterCover').value,medium:$('#ghFilterMedium').value};ghListPage=1;renderGreenhouseList()};
 $('#ghFilterName').onkeydown=e=>{if(e.key==='Enter')$('#ghDoFilter').click()};
 $('#ghCreate').onclick=()=>go('gh-create');
 $$('[data-gh-detail]').forEach(b=>b.onclick=()=>go('gh-detail',b.dataset.ghDetail));
 bindPages('',()=>ghListPage,v=>ghListPage=v,rows.length,size,renderGreenhouseList);
}
function renderGreenhouseDetail(){
 const g=config.greenhouses.find(x=>x.greenhouseId===selectedGhId)||config.greenhouses[0];
 if(!g){go('gh-list');return}
 selectedGhId=g.greenhouseId;
 const linked=config.cycles.filter(c=>c.greenhouseId===g.greenhouseId);
 const facts=[['온실명',g.name],['유형',g.type||'—'],['피복형태',g.coverType||'—'],['동 수',g.buildingCount??'—'],['측고(m)',g.sideHeight??'—'],['폭(m)',g.width??'—'],['길이(m)',g.length??'—'],['등록 면적(㎡)',g.registeredArea??'—'],['배지형태',g.mediumType||'—'],['온실 사진 URL',g.imageUrl||'—'],['연결된 작기 수',`${linked.length}건`]];
 main.innerHTML=moduleHeading('온실 정보 상세','')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>온실 정보</h2></div><div class="panel-body">${g.imageUrl?`<div class="gh-photo-box"><img class="gh-detail-photo" src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진"></div>`:''}<div class="module-facts">${facts.map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(String(b))}</strong></div>`).join('')}</div></div></section>
 <div class="hidden" id="ghDeleteConfirm" style="padding:10px 12px;border:1px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>이 온실을 삭제하시겠습니까?</span><button type="button" class="btn" id="ghDeleteCancel">취소</button><button type="button" class="btn main" id="ghDeleteOk">삭제 확인</button></div>
 <div class="module-actions"><button class="btn" id="ghToList">목록</button><button class="btn" id="ghDelete">삭제</button><button class="btn main" id="ghToEdit">수정</button></div></div>`;
 bindModuleBack();$('#ghToList').onclick=()=>go('gh-list');$('#ghToEdit').onclick=()=>go('gh-edit',g.greenhouseId);
 $('#ghDelete').onclick=()=>{
  if(linked.length){toast('연결된 작기가 있는 온실은 삭제할 수 없습니다.');return}
  $('#ghDeleteConfirm').classList.remove('hidden');
 };
 $('#ghDeleteCancel').onclick=()=>$('#ghDeleteConfirm').classList.add('hidden');
 $('#ghDeleteOk').onclick=()=>{config.greenhouses=config.greenhouses.filter(x=>x.greenhouseId!==g.greenhouseId);storeGreenhouseExtras();toast('온실을 삭제했습니다.');go('gh-list')};
}
function renderGreenhouseEditor(edit){
 const g=edit?(config.greenhouses.find(x=>x.greenhouseId===selectedGhId)||config.greenhouses[0]):null;
 if(edit&&!g){go('gh-list');return}
 const row=g||{greenhouseId:'',name:'',type:'단동',coverType:'비닐',buildingCount:1,sideHeight:'',width:'',length:'',registeredArea:'',mediumType:'수태',imageUrl:''};
 main.innerHTML=moduleHeading(edit?'온실 정보 수정':'온실 정보 등록','')+
 `<form class="module-form panel" id="ghForm" novalidate><div class="panel-head"><h2>온실 정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="ghName">온실명 *</label><input class="ctrl" id="ghName" maxlength="100" value="${htmlText(row.name)}" placeholder="예: E온실" required></div>
 <div class="field"><label for="ghType">유형</label><select class="ctrl" id="ghType">${options([{value:'',label:'미선택'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],row.type||'')}</select></div>
 <div class="field"><label for="ghCover">피복형태</label><select class="ctrl" id="ghCover">${options([{value:'',label:'미선택'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],row.coverType||'')}</select></div>
 <div class="field"><label for="ghCount">동 수</label><input class="ctrl" id="ghCount" type="number" min="1" value="${row.buildingCount??''}"></div>
 <div class="field"><label for="ghMedium">배지형태</label><select class="ctrl" id="ghMedium">${options([{value:'',label:'미선택'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],row.mediumType||'')}</select></div>
 <div class="field"><label for="ghSide">측고 (m)</label><input class="ctrl" id="ghSide" type="number" step="0.01" min="0" value="${row.sideHeight??''}"></div>
 <div class="field"><label for="ghWidth">폭 (m)</label><input class="ctrl" id="ghWidth" type="number" step="0.01" min="0" value="${row.width??''}"></div>
 <div class="field"><label for="ghLength">길이 (m)</label><input class="ctrl" id="ghLength" type="number" step="0.01" min="0" value="${row.length??''}"></div>
 <div class="field"><label for="ghArea">등록 면적 (㎡)</label><input class="ctrl" id="ghArea" type="number" step="0.01" min="0" value="${row.registeredArea??''}"></div>
 <div class="field wide"><label for="ghImageUrl">온실 사진 URL</label><input class="ctrl" id="ghImageUrl" type="text" maxlength="500" value="${htmlText(row.imageUrl||'')}" placeholder="이미지 URL을 입력하세요 (예: https://... 또는 img/gh-a.svg)"><div id="ghPhotoPreview" class="${row.imageUrl?'gh-photo-box':'gh-photo-box hidden'}" style="margin-top:10px">${row.imageUrl?`<img class="gh-detail-photo" src="${escapeHtml(row.imageUrl)}" alt="온실 사진 미리보기">`:''}</div></div>
 </div><div class="errorbox hidden" id="ghErr"></div></div>
 <div class="module-actions"><button type="button" class="btn" id="ghCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'등록'}</button></div></form>`;
 bindModuleBack();$('#ghCancel').onclick=()=>go(edit?'gh-detail':'gh-list',g?.greenhouseId);
 const updateGhPreview=src=>{const box=$('#ghPhotoPreview');if(!box)return;if(src){box.classList.remove('hidden');box.innerHTML=`<img class="gh-detail-photo" src="${escapeHtml(src)}" alt="온실 사진 미리보기">`}else{box.classList.add('hidden');box.innerHTML=''}};
 $('#ghImageUrl').oninput=e=>updateGhPreview(e.target.value.trim());
 $('#ghForm').onsubmit=e=>{
  e.preventDefault();
  const name=$('#ghName').value.trim();
  if(!name){$('#ghErr').textContent='온실명을 입력하세요.';$('#ghErr').classList.remove('hidden');return}
  const numOrNull=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
  const payload={greenhouseId:g?g.greenhouseId:'GH-NEW-'+Date.now(),memberId:config.header.currentUser.id,name,type:$('#ghType').value||null,coverType:$('#ghCover').value||null,buildingCount:numOrNull('#ghCount'),sideHeight:numOrNull('#ghSide'),width:numOrNull('#ghWidth'),length:numOrNull('#ghLength'),registeredArea:numOrNull('#ghArea'),mediumType:$('#ghMedium').value||null,imageUrl:$('#ghImageUrl').value.trim()||null};
  if(g)Object.assign(g,payload);else config.greenhouses.unshift(payload);
  storeGreenhouseExtras();toast(edit?'온실 정보를 수정했습니다.':'온실을 등록했습니다.');go('gh-detail',payload.greenhouseId);
 };
}
function storeStandards(){try{localStorage.setItem(storageKey('standards'),JSON.stringify({crops:config.crops,criteria:config.stageEnvironmentalCriteria}))}catch{}}
function loadStandards(){try{const saved=JSON.parse(localStorage.getItem(storageKey('standards'))||'null');if(Array.isArray(saved?.crops)&&saved.crops.length)config.crops=saved.crops;if(Array.isArray(saved?.criteria))config.stageEnvironmentalCriteria=saved.criteria}catch{}}
function renderStandardPage(){
 loadStandards();
 const params=new URLSearchParams(location.search);
 const fromCycleId=params.get('cycleId');
 const state=window.__stdState||(window.__stdState={tab:'criteria',cropFilter:'all',varietyFilter:'all',editCriteria:false,cropModal:null,varietyId:params.get('varietyId')||''});
 const allVarieties=config.crops.flatMap(cr=>cr.varieties.map(v=>({cropId:cr.cropId,varietyId:v.varietyId,label:`${cr.name} · ${v.name}`,cropName:cr.name,varietyName:v.name})));
 if(!allVarieties.some(v=>v.varietyId===state.varietyId))state.varietyId=allVarieties[0]?.varietyId||'';
 const stages=config.growthStages.slice().sort((a,b)=>a.order-b.order);
 const metrics=[
  ['dayTempC','주간 온도','°C'],['nightTempC','야간 온도','°C'],['humidityPct','온실 내부 습도','%RH'],
  ['co2Ppm','이산화탄소 (CO₂)','ppm'],['solarWm2','일사량','W/m²'],['lightUmolM2S','광도','μmol/m²/s'],
  ['substrateTempC','배지 온도','°C'],['substrateMoisturePct','배지 수분','%'],['substrateEcMsCm','배지 EC','mS/cm'],['substratePh','배지 pH','pH']
 ];
 const hasActiveCycle=varietyId=>config.cycles.some(c=>c.varietyId===varietyId&&c.status==='진행');
 const backBtn=fromCycleId?`<button type="button" class="backlink" id="stdBackCycle">← 작기계획 상세로</button>`:'';
 const tabs=`<div class="tabbar" role="tablist" aria-label="품목 및 환경기준 메뉴">
  <button type="button" class="tabbtn" role="tab" id="tabStdCriteria" aria-selected="${state.tab==='criteria'}">생육단계별 환경기준</button>
  <button type="button" class="tabbtn" role="tab" id="tabStdCrops" aria-selected="${state.tab==='crops'}">품목 · 품종 관리</button>
 </div>`;

 if(state.tab==='crops'){
  const cropOpts=config.crops.map(c=>({value:c.cropId,label:c.name}));
  const varOpts=config.crops.filter(c=>state.cropFilter==='all'||c.cropId===state.cropFilter).flatMap(c=>c.varieties.map(v=>({value:v.varietyId,label:v.name})));
  const rows=allVarieties.filter(v=>(state.cropFilter==='all'||v.cropId===state.cropFilter)&&(state.varietyFilter==='all'||v.varietyId===state.varietyFilter));
  const editing=state.cropModal;
  main.innerHTML=`<div class="pagehead"><div><h1>품목 및 환경기준</h1></div>${backBtn}</div>${tabs}
  <section class="panel search-section" aria-label="품목 검색 조건"><div class="panel-body"><div class="filterbar">
   <div class="field"><label for="stdCropFilter">품목</label><select id="stdCropFilter" class="ctrl">${options([{value:'all',label:'전체 품목'},...cropOpts],state.cropFilter)}</select></div>
   <div class="field"><label for="stdVarFilter">품종</label><select id="stdVarFilter" class="ctrl">${options([{value:'all',label:'전체 품종'},...varOpts],state.varietyFilter)}</select></div>
   <button type="button" class="btn filter-submit" id="stdCropSearch">검색</button>
  </div></div></section>
  ${editing?`<section class="panel" aria-label="품목 등록 및 수정"><div class="panel-head"><h2>${editing.varietyId?'품목 · 품종 수정':'품목 · 품종 등록'}</h2></div><div class="panel-body"><form id="stdCropForm" class="module-input-grid">
   <div class="field"><label for="stdCropName">품목명 *</label><input id="stdCropName" class="ctrl" maxlength="50" value="${htmlText(editing.cropName||'')}" placeholder="예: 호접란" required></div>
   <div class="field"><label for="stdVarietyName">품종명 *</label><input id="stdVarietyName" class="ctrl" maxlength="50" value="${htmlText(editing.varietyName||'')}" placeholder="예: 만천홍" required></div>
   <div class="field" style="display:flex;align-items:flex-end;gap:8px"><button type="button" class="btn" id="stdCropCancel">취소</button><button type="submit" class="btn main">${editing.varietyId?'수정 저장':'등록'}</button></div>
  </form></div></section>`:''}
  <section class="panel list-section" aria-label="품목 목록"><div class="panel-head"><div class="panel-head-title"><h2>품목 · 품종 목록</h2><span class="counter">총 ${rows.length}건</span></div><button type="button" class="btn main xs" id="stdCropAdd">+ 품목 등록</button></div>
  <div class="tablewrap"><table class="data-table"><thead><tr><th class="row-index">번호</th><th>품목명</th><th>품종명</th><th>진행 중 작기</th><th>관리</th></tr></thead>
  <tbody>${rows.map((r,i)=>`<tr><td class="row-index">${rows.length-i}</td><td>${htmlText(r.cropName)}</td><td><button type="button" class="linkbtn" data-std-view="${r.varietyId}">${htmlText(r.varietyName)}</button></td><td>${hasActiveCycle(r.varietyId)?'진행중':'없음'}</td><td style="white-space:nowrap;display:flex;gap:6px"><button type="button" class="btn xs" data-std-edit="${r.varietyId}">수정</button><button type="button" class="btn xs danger" data-std-del="${r.varietyId}">삭제</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">등록된 품목이 없습니다.</td></tr>'}</tbody></table></div></section>`;
  $('#stdCropSearch').onclick=()=>{state.cropFilter=$('#stdCropFilter').value;state.varietyFilter=$('#stdVarFilter').value;renderStandardPage()};
  $('#stdCropFilter').onchange=()=>{state.cropFilter=$('#stdCropFilter').value;state.varietyFilter='all';renderStandardPage()};
  $('#stdCropAdd').onclick=()=>{state.cropModal={cropId:'',varietyId:'',cropName:'',varietyName:''};renderStandardPage()};
  if($('#stdCropCancel'))$('#stdCropCancel').onclick=()=>{state.cropModal=null;renderStandardPage()};
  if($('#stdCropForm'))$('#stdCropForm').onsubmit=e=>{
   e.preventDefault();
   const cropName=$('#stdCropName').value.trim(),varietyName=$('#stdVarietyName').value.trim();
   if(!cropName||!varietyName){toast('품목명과 품종명을 모두 입력하세요.');return}
   if(editing.varietyId){
    const targetCrop=config.crops.find(c=>c.cropId===editing.cropId);
    const targetVar=targetCrop?.varieties.find(v=>v.varietyId===editing.varietyId);
    if(targetCrop)targetCrop.name=cropName;
    if(targetVar)targetVar.name=varietyName;
    toast('품목 · 품종 정보를 수정했습니다.');
   }else{
    let crop=config.crops.find(c=>c.name===cropName);
    if(!crop){crop={cropId:'CR-NEW-'+Date.now(),name:cropName,varieties:[]};config.crops.push(crop)}
    crop.varieties.push({varietyId:'VAR-NEW-'+Date.now(),name:varietyName});
    toast('품목 · 품종을 등록했습니다.');
   }
   state.cropModal=null;storeStandards();renderStandardPage();
  };
  $$('[data-std-view]').forEach(b=>b.onclick=()=>{state.varietyId=b.dataset.stdView;state.tab='criteria';state.editCriteria=false;renderStandardPage()});
  $$('[data-std-edit]').forEach(b=>b.onclick=()=>{const v=allVarieties.find(x=>x.varietyId===b.dataset.stdEdit);if(v){state.cropModal={...v};renderStandardPage()}});
  $$('[data-std-del]').forEach(b=>b.onclick=()=>{
   const vid=b.dataset.stdDel;
   if(hasActiveCycle(vid)){toast('진행 중인 작기에서 사용 중인 품목은 삭제할 수 없습니다.');return}
   config.crops=config.crops.map(c=>({...c,varieties:c.varieties.filter(v=>v.varietyId!==vid)})).filter(c=>c.varieties.length>0);
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==vid);
   storeStandards();toast('품종을 삭제했습니다.');renderStandardPage();
  });
 }else{
  const criteriaByStage=Object.fromEntries(stages.map(st=>[st.stageId,config.stageEnvironmentalCriteria.find(x=>x.varietyId===state.varietyId&&x.stageId===st.stageId)]));
  const fmtRange=(range,unit)=>(range&&range[0]!=null&&range[1]!=null)?`${range[0]} ~ ${range[1]} ${unit}`:'미입력';
  const curLabel=allVarieties.find(v=>v.varietyId===state.varietyId)?.label||'';
  main.innerHTML=`<div class="pagehead"><div><h1>품목 및 환경기준</h1></div>${backBtn}</div>${tabs}
  <section class="panel search-section" aria-label="품종 선택"><div class="panel-body"><div class="filterbar">
   <div class="field"><label for="stdVarietySelect">품목 · 품종</label><select id="stdVarietySelect" class="ctrl">${options(allVarieties.map(v=>({value:v.varietyId,label:v.label})),state.varietyId)}</select></div>
   <button type="button" class="btn" id="stdLoadApiBtn">외부 API 기준표 불러오기</button>
   <button type="button" class="btn main" id="stdToggleEdit">${state.editCriteria?'조회 모드로':'기준 등록/수정'}</button>
   <button type="button" class="btn danger" id="stdDeleteCriteria">기준 삭제</button>
  </div></div></section>
  <section class="panel list-section" aria-label="생육단계별 10개 환경기준 비교표"><div class="panel-head"><div class="panel-head-title"><h2>전체 환경기준 비교 (3단계 × 10항목)</h2><span class="counter">${htmlText(curLabel)}</span></div>${state.editCriteria?'<button type="button" class="btn main xs" id="stdSaveCriteria">기준 저장</button>':''}</div>
  <div class="tablewrap"><table class="data-table module-table"><thead><tr><th>환경 기준 항목</th><th>단위</th>${stages.map(st=>`<th>${st.order}단계 · ${htmlText(st.name)}</th>`).join('')}</tr></thead>
  <tbody>
  <tr><td><strong>기준 기간</strong></td><td>일</td>${stages.map(st=>{const d=criteriaByStage[st.stageId]?.standardDays;return state.editCriteria?`<td><input type="number" class="ctrl compact-input" style="width:90px" min="1" data-std-days="${st.stageId}" value="${d??''}" placeholder="일수"></td>`:`<td>${d!=null?`${d}일`:'미입력'}</td>`}).join('')}</tr>
  ${metrics.map(([key,label,unit])=>`<tr><td><strong>${htmlText(label)}</strong></td><td>${htmlText(unit)}</td>${stages.map(st=>{const r=criteriaByStage[st.stageId]?.thresholds?.[key];return state.editCriteria?`<td><div style="display:flex;gap:4px;align-items:center"><input type="number" step="0.1" class="ctrl compact-input" style="width:72px" data-std-min="${st.stageId}:${key}" value="${r?.[0]??''}" placeholder="최소"><span>~</span><input type="number" step="0.1" class="ctrl compact-input" style="width:72px" data-std-max="${st.stageId}:${key}" value="${r?.[1]??''}" placeholder="최대"></div></td>`:`<td class="tnum">${fmtRange(r,unit)}</td>`}).join('')}</tr>`).join('')}
  </tbody></table></div></section>`;
  $('#stdVarietySelect').onchange=e=>{state.varietyId=e.target.value;state.editCriteria=false;renderStandardPage()};
  $('#stdToggleEdit').onclick=()=>{state.editCriteria=!state.editCriteria;renderStandardPage()};
  $('#stdLoadApiBtn').onclick=()=>{
   const preset={VEG:{days:30,t:{dayTempC:[24,28],nightTempC:[18,22],humidityPct:[65,80],co2Ppm:[600,900],solarWm2:[150,350],lightUmolM2S:[120,250],substrateTempC:[20,24],substrateMoisturePct:[55,70],substrateEcMsCm:[0.8,1.2],substratePh:[5.5,6.2]}},IND:{days:35,t:{dayTempC:[20,24],nightTempC:[15,18],humidityPct:[60,75],co2Ppm:[500,800],solarWm2:[180,380],lightUmolM2S:[150,280],substrateTempC:[18,22],substrateMoisturePct:[50,65],substrateEcMsCm:[1.0,1.4],substratePh:[5.5,6.2]}},BLO:{days:40,t:{dayTempC:[22,26],nightTempC:[16,20],humidityPct:[55,70],co2Ppm:[500,800],solarWm2:[200,420],lightUmolM2S:[180,320],substrateTempC:[19,23],substrateMoisturePct:[50,65],substrateEcMsCm:[1.0,1.5],substratePh:[5.6,6.3]}}};
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==state.varietyId);
   for(const st of stages){const p=preset[st.stageId]||preset.VEG;config.stageEnvironmentalCriteria.push({varietyId:state.varietyId,stageId:st.stageId,standardDays:p.days,thresholds:clone(p.t)})}
   storeStandards();toast('외부 API 표준 환경기준표를 불러와 반영했습니다.');renderStandardPage();
  };
  $('#stdDeleteCriteria').onclick=()=>{
   if(hasActiveCycle(state.varietyId)){toast('진행 중인 작기가 있는 품종의 환경기준은 삭제할 수 없습니다.');return}
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==state.varietyId);
   storeStandards();state.editCriteria=false;toast('선택 품종의 환경기준을 삭제했습니다.');renderStandardPage();
  };
  if($('#stdSaveCriteria'))$('#stdSaveCriteria').onclick=()=>{
   for(const st of stages){
    const daysVal=$(`[data-std-days="${st.stageId}"]`).value.trim();
    const thresholds={};
    for(const [key] of metrics){
     const mn=$(`[data-std-min="${st.stageId}:${key}"]`).value.trim();
     const mx=$(`[data-std-max="${st.stageId}:${key}"]`).value.trim();
     if(mn!==''&&mx!=='')thresholds[key]=[Number(mn),Number(mx)];
    }
    const existing=config.stageEnvironmentalCriteria.find(x=>x.varietyId===state.varietyId&&x.stageId===st.stageId);
    if(existing){existing.standardDays=daysVal===''?null:Number(daysVal);existing.thresholds=thresholds}
    else{config.stageEnvironmentalCriteria.push({varietyId:state.varietyId,stageId:st.stageId,standardDays:daysVal===''?null:Number(daysVal),thresholds})}
   }
   storeStandards();state.editCriteria=false;toast('생육단계별 환경기준을 저장했습니다.');renderStandardPage();
  };
 }
 $('#tabStdCriteria').onclick=()=>{state.tab='criteria';renderStandardPage()};
 $('#tabStdCrops').onclick=()=>{state.tab='crops';renderStandardPage()};
 if($('#stdBackCycle'))$('#stdBackCycle').onclick=()=>{location.href='cycle-list.html?view=cycle-detail&id='+encodeURIComponent(fromCycleId)};
}
function setupLogin() {
 const form = $('#loginForm');
 const username = $('#loginUsername');
 const password = $('#loginPassword');
 const toggle = $('#loginPasswordToggle');
 const feedback = $('#loginError');
 username.value = loadAuthUser() || 'seedmum02';
 toggle.onclick = () => {
  const reveal = password.type === 'password';
  password.type = reveal ? 'text' : 'password';
  toggle.textContent = reveal ? '비밀번호 숨기기' : '비밀번호 보기';
 };
 form.addEventListener('input', () => { feedback.textContent = ''; });
 form.onsubmit = event => {
  event.preventDefault();
  const member = allMembers().find(row => row.username === username.value.trim());
  const pw = password.value;
  if (member && (pw === 'modoodemo01' || pw === 'demo' || pw === member.demoPassword)) {
   saveAuthUser(member.username);
   location.href = 'diary-list.html';
   return;
  }
  feedback.textContent = '아이디와 비밀번호를 확인하세요.';
  feedback.focus();
 };
}

const signupStages = ['회원정보 입력', '농업경영체 인증', '완료'];
const signupUsernamePattern = /^[a-z][a-z0-9]{5,19}$/;

function signupProgress(step) {
 return `<ol class="krds-step-wrap" aria-label="회원가입 단계">
  ${signupStages.map((label, index) => {
   const number = index + 1;
   const state = number === step ? 'class="active" aria-current="step"' : number < step ? 'class="done"' : '';
   return `<li ${state}><span><span class="step">${number}단계</span><span class="step-tit">${label}</span></span></li>`;
  }).join('')}
 </ol>`;
}

function signupField(id, label, { type = 'text', required = false, attributes = '', hint = '', checkLabel = '' } = {}) {
 return `<div class="form-group">
  <label class="form-label" for="${id}">${label}${required ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
  <div class="${checkLabel ? 'auth-input-row' : 'form-conts'}">
   <input id="${id}" class="krds-input medium" type="${type}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-feedback" ${required ? 'required' : ''} ${attributes}>
   ${checkLabel ? `<button type="button" class="krds-btn medium secondary" data-check="${id}" aria-label="${checkLabel} 중복 확인">중복 확인</button>` : ''}
  </div>
  ${hint ? `<p id="${id}-hint" class="auth-hint">${hint}</p>` : ''}
  <p id="${id}-feedback" class="auth-feedback" aria-live="polite"></p>
 </div>`;
}

function signupFeedback(input, message, state = 'error') {
 const feedback = document.getElementById(input.id + '-feedback');
 const invalid = Boolean(message) && state === 'error';
 input.closest('.form-group').classList.toggle('is-error', invalid);
 if (invalid) input.setAttribute('aria-invalid', 'true');
 else input.removeAttribute('aria-invalid');
 feedback.dataset.state = state;
 feedback.textContent = message;
}

function signupDuplicateMessage(members, key, value) {
 const normalized = value.trim().toLowerCase();
 if (!normalized || !members.some(member => member[key]?.trim().toLowerCase() === normalized)) return '';
 return key === 'username' ? '이미 사용 중인 아이디입니다.' : '이미 사용 중인 이메일입니다.';
}

function setupSignup() {
 const mount = $('#signupStepMount');
 let step = 1;
 let draft = {};
 let businessNumber = '';
 let certStatus = '미인증';
 let savedMember;

 function showStep(content, title = signupStages[step - 1]) {
  mount.innerHTML = signupProgress(step) + `<section class="panel signup-panel" aria-labelledby="signupStepTitle">
   <div class="panel-head"><h2 id="signupStepTitle" tabindex="-1">${title}</h2></div>
   <div class="panel-body">${content}</div>
  </section>`;
 }

 function focusStep() {
  $('#signupStepTitle', mount).focus();
 }

 function renderMemberForm(conflicts = {}) {
  step = 1;
  showStep(`<form id="signupForm" class="login-form" novalidate>
   ${signupField('signupFarmName', '농장명', { required: true, attributes: 'maxlength="100" autocomplete="organization"' })}
   ${signupField('signupRepresentativeName', '대표자명', { required: true, attributes: 'maxlength="50" autocomplete="name"' })}
   ${signupField('signupUsername', '아이디', {
    required: true, attributes: 'minlength="6" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false"',
    hint: '영문 소문자로 시작하는 영문 소문자·숫자 6~20자', checkLabel: '아이디'
   })}
   ${signupField('signupPassword', '비밀번호', {
    type: 'password', required: true, attributes: 'minlength="10" maxlength="64" autocomplete="new-password"', hint: '10~64자로 입력하세요.'
   })}
   ${signupField('signupPasswordConfirm', '비밀번호 확인', {
    type: 'password', required: true, attributes: 'minlength="10" maxlength="64" autocomplete="new-password"'
   })}
   ${signupField('signupEmail', '이메일 (선택)', { type: 'email', attributes: 'maxlength="255" autocomplete="email"', checkLabel: '이메일' })}
   ${signupField('signupPhone', '연락처 (선택)', { type: 'tel', attributes: 'maxlength="20" autocomplete="tel"' })}
   ${signupField('signupMainCrop', '주요 재배 품목 (선택)', { attributes: 'maxlength="100"' })}
   <div class="signup-actions"><button type="submit" class="krds-btn medium primary" id="signupNextBtn">다음</button></div>
  </form>`);

  const form = $('#signupForm', mount);
  const input = id => form.elements.namedItem(id);
  const value = id => input(id).value.trim();
  for (const [id, text] of Object.entries(draft)) input(id).value = text;

  const fieldsToCheck = {
   signupUsername: {
    key: 'username', label: '아이디', empty: '아이디를 입력하세요.',
    validate: () => signupUsernamePattern.test(value('signupUsername')) ? '' : '아이디 형식을 확인하세요.'
   },
   signupEmail: {
    key: 'email', label: '이메일', empty: '이메일을 입력하세요.',
    validate: () => input('signupEmail').validity.typeMismatch ? '이메일 주소 형식을 확인하세요.' : ''
   }
  };

  const displayErrors = errors => {
   const entries = Object.entries(errors);
   for (const [id, message] of entries) signupFeedback(input(id), message);
   const firstError = entries.find(([, message]) => message);
   if (firstError) input(firstError[0]).focus();
   return Boolean(firstError);
  };

  form.addEventListener('input', ({ target }) => signupFeedback(target, ''));
  for (const button of $$('[data-check]', form)) {
   const id = button.dataset.check;
   const field = fieldsToCheck[id];
   button.onclick = () => {
    const current = value(id);
    const message = !current ? field.empty :
     field.validate() || signupDuplicateMessage(allMembers(), field.key, current);
    signupFeedback(input(id), message || '사용할 수 있는 ' + field.label + '입니다.', message ? 'error' : 'success');
    if (message) input(id).focus();
   };
  }
  form.onsubmit = event => {
   event.preventDefault();
   const members = allMembers();
   const password = input('signupPassword').value;
   const confirmation = input('signupPasswordConfirm').value;
   const errors = {
    signupFarmName: value('signupFarmName') ? '' : '농장명을 입력하세요.',
    signupRepresentativeName: value('signupRepresentativeName') ? '' : '대표자명을 입력하세요.',
    signupUsername: !value('signupUsername') ? '아이디를 입력하세요.' : fieldsToCheck.signupUsername.validate() ||
     signupDuplicateMessage(members, 'username', value('signupUsername')),
    signupPassword: password.length >= 10 && password.length <= 64 ? '' : '비밀번호를 10~64자로 입력하세요.',
    signupPasswordConfirm: confirmation && confirmation === password ? '' : '비밀번호와 같은 값을 입력하세요.',
    signupEmail: fieldsToCheck.signupEmail.validate() || signupDuplicateMessage(members, 'email', value('signupEmail'))
   };
   if (displayErrors(errors)) return;
   draft = Object.fromEntries($$('input', form).map(field => [field.id, field.value]));
   renderCertificationForm();
   focusStep();
  };
  displayErrors(conflicts);
 }

 function renderCertificationForm() {
  step = 2;
  showStep(`<form id="signupCertificationForm" class="login-form">
   <p class="signup-cert-status" role="status">인증 상태
    <span id="signupCertStatus" class="krds-badge bg-light-gray">${certStatus}</span>
   </p>
   ${signupField('signupBusinessNumber', '농업경영체 등록번호 (선택)', { attributes: 'maxlength="20"' })}
   <div class="signup-actions">
    <button type="button" class="krds-btn medium tertiary" id="signupPrevBtn">이전</button>
    <button type="button" class="krds-btn medium secondary" id="signupCertBtn">인증 요청</button>
    <button type="submit" class="krds-btn medium primary">가입하기</button>
   </div>
   <p class="auth-feedback" id="signupSaveError" role="alert" data-state="error"></p>
  </form>`);

  const form = $('#signupCertificationForm', mount);
  const input = $('#signupBusinessNumber', form);
  const status = $('#signupCertStatus', form);
  const submit = $('button[type="submit"]', form);
  input.value = businessNumber;
  status.classList.toggle('bg-light-information', certStatus === '인증중');
  status.classList.toggle('bg-light-gray', certStatus !== '인증중');

  function updateCertification() {
   certStatus = businessNumber ? '인증중' : '미인증';
   status.textContent = certStatus;
   status.classList.toggle('bg-light-information', Boolean(businessNumber));
   status.classList.toggle('bg-light-gray', !businessNumber);
  }

  input.oninput = () => {
   signupFeedback(input, '');
   businessNumber = '';
   updateCertification();
  };
  $('#signupCertBtn', form).onclick = () => {
   businessNumber = input.value.trim();
   if (!businessNumber) {
    signupFeedback(input, '농업경영체 등록번호를 입력하세요.');
    input.focus();
    return;
   }
   signupFeedback(input, '');
   updateCertification();
  };
  $('#signupPrevBtn', form).onclick = () => {
   businessNumber = input.value.trim();
   updateCertification();
   renderMemberForm();
   focusStep();
  };
  form.onsubmit = async event => {
   event.preventDefault();
   if (submit.disabled) return;
   businessNumber = input.value.trim();
   updateCertification();
   const newMember = {
    id: 'MEM-' + Date.now(),
    displayName: draft.signupRepresentativeName.trim(),
    role: '화훼농민',
    certification: certStatus,
    businessNumber: businessNumber || null,
    username: draft.signupUsername.trim(),
    demoPassword: draft.signupPassword,
    farmName: draft.signupFarmName.trim(),
    email: draft.signupEmail.trim() || null,
    phone: draft.signupPhone.trim() || null,
    address: null,
    addressDetail: null,
    mainCrop: draft.signupMainCrop.trim() || null,
    description: null
   };
   const register = () => {
    if (!form.isConnected) return;
    const registered = loadSignupMembers();
    const members = allMembers(registered);
    const conflicts = {
     signupUsername: signupDuplicateMessage(members, 'username', newMember.username),
     signupEmail: signupDuplicateMessage(members, 'email', newMember.email || '')
    };
    if (Object.values(conflicts).some(Boolean)) {
     renderMemberForm(conflicts);
     return;
    }
    localStorage.setItem(signupKey(), JSON.stringify([...registered, newMember]));
    saveAuthUser(newMember.username);
    savedMember = newMember;
    draft = {};
    renderCompletion();
    focusStep();
   };
   submit.disabled = true;
   $('#signupSaveError', form).textContent = '';
   try {
    if (navigator.locks) await navigator.locks.request(signupKey(), register);
    else register();
   } catch {
    $('#signupSaveError', form).textContent = '회원정보를 저장하지 못했습니다. 다시 시도해 주세요.';
   } finally {
    submit.disabled = false;
   }
  };
 }

 function renderCompletion() {
  step = 3;
  showStep(`<div class="login-form">
   ${profileFacts([['농장명', savedMember.farmName], ['아이디', savedMember.username], ['인증 상태', savedMember.certification]])}
   <div class="signup-actions"><a class="krds-btn medium primary" href="login.html">로그인으로 이동</a></div>
  </div>`, '회원가입 완료');
 }

 renderMemberForm();
}

async function init(){
 const hostPage=document.body?.dataset?.page||'entry';
 if(hostPage==='entry'){
  const saved=loadAuthUser();
  const member=allMembers().find(row=>row.username===saved);
  location.replace(member?'diary-list.html':'login.html');return;
 }
 if (hostPage === 'login') {
  setupLogin();
  return;
 }
 if (hostPage === 'signup') {
  setupSignup();
  return;
 }
 await ready;
 const savedUser=loadAuthUser();
 const member=allMembers().find(row=>row.username===savedUser);
 if(!member){location.replace('login.html');return}
 bindAccount(() => go('profile'));
 for(const button of $$('#navigation [data-go]'))button.addEventListener('click',e=>{e.preventDefault();go(button.dataset.go)});
 for(const button of $$('[data-close-dialog]'))button.addEventListener('click',()=>document.getElementById(button.dataset.closeDialog).close());
 if($('#cycleStartConfirm'))$('#cycleStartConfirm').onclick=commitCycleStart;
 if($('#cycleEndConfirm'))$('#cycleEndConfirm').onclick=commitCycleEnd;
 const params=new URLSearchParams(location.search);
 const initialView=params.get('view')||hostPage;
 if (initialView === 'profile' || initialView === 'cert') {
  location.replace(pageFile(initialView));
  return;
 }
 const initialId=params.get('id');
 signIn(member,initialView,initialId);
}
init();
})();

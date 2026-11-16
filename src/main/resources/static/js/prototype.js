(()=>{'use strict';
const $=(s,base=document)=>base.querySelector(s), $$=(s,base=document)=>[...base.querySelectorAll(s)];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const htmlText=escapeHtml, clone=x=>JSON.parse(JSON.stringify(x));
const pageNums=(cur,total)=>{if(total<=7)return Array.from({length:total},(_,i)=>i+1);let s=Math.max(2,cur-2),e=Math.min(total-1,cur+2);if(cur<=3)e=5;if(cur>=total-2)s=total-4;const list=[1];if(s>2)list.push('...');for(let i=s;i<=e;i++)list.push(i);if(e<total-1)list.push('...');list.push(total);return list};
const pageBtns=(cur,total,attr)=>pageNums(cur,total).map(p=>p==='...'?'<span class="page-ellipsis" aria-hidden="true">…</span>':`<button type="button" class="page-button" ${attr}="${p}" ${p===cur?'aria-current="page"':''} aria-label="${p}페이지">${p}</button>`).join('');
const storageKey=kind=>`modoo-sprint2:${prototypeData.meta.version}:${config.header.currentUser.id}:${kind}`;
let config=clone(prototypeData), diaryRows=[], page='list',selectedId=null,working=[],editRow=null,selectedStage='VEG',filterCycle='all',filterGreenhouse='all',filterCrop='all',filterVariety='all',filterDate='',listPage=1,toastTimer;
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
function toast(s){let el=$('#toast');el.textContent=s;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),3400)}
function error(s){const el=$('#formError');if(el){el.textContent=s;el.classList.remove('hidden')}toast(s)}
function updateNavigation() {
 const entry = page.startsWith('cycle-') ? 'cycle-list' : page.startsWith('gh-') ? 'gh-list' : page.startsWith('env-') ? 'env-list' : page.startsWith('issue-') ? 'issue-list' : page==='profile' ? 'profile' : page==='cert' ? 'cert' : 'list';
 const current = $(`#navigation [data-go="${entry}"]`);
 for (const button of $$('#navigation [data-go]')) {
  if (button === current) button.setAttribute('aria-current', 'location');
  else button.removeAttribute('aria-current');
 }
 if (page==='profile') { $('#crumb').textContent='내정보'; return; }
 if (page==='cert') { $('#crumb').textContent='농업경영체 인증'; return; }
 const state = page.replace(/^(cycle-|gh-|env-|issue-)/, '');
 const step = {list:'목록',create:'등록',detail:'상세',edit:'수정'}[state] || '목록';
 const prefix = (page.startsWith('gh-')||page.startsWith('env-')||page.startsWith('issue-')) ? ['온실', current?.textContent||'', step] : [current?.textContent||'', step];
 $('#crumb').textContent = prefix.filter(Boolean).join(' / ');
}
const pageFile=target=>target.startsWith('cycle-')?'cycle-list.html':target.startsWith('gh-')?'greenhouse-list.html':target.startsWith('env-')?'env-list.html':target.startsWith('issue-')?'issue-list.html':target==='profile'?'mypage.html':target==='cert'?'certification.html':'diary-list.html';
function go(target,id){
 const hostPage=document.body?.dataset?.page;
 if(hostPage&&pageFile(target)!==pageFile(hostPage)){
  const q=new URLSearchParams();if(target!==hostPage)q.set('view',target);if(id)q.set('id',id);
  location.href=pageFile(target)+(q.toString()?'?'+q.toString():'');return;
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
 else if(page==='profile')renderProfile();
 else if(page==='cert')renderCertification();
 else if(page==='list')renderList();else if(page==='detail')renderDetail();else renderEditor(page==='edit')}
function renderList(){const rows=diaryRows.filter(d=>{
 const c=getCycle(d.cycleId);return(filterCycle==='all'||d.cycleId===filterCycle)&&(filterGreenhouse==='all'||c.greenhouseId===filterGreenhouse)&&(filterCrop==='all'||c.cropId===filterCrop)&&(filterVariety==='all'||c.varietyId===filterVariety)&&(!filterDate||d.workDate===filterDate)}).sort((a,b)=>b.workDate.localeCompare(a.workDate)||a.cycleId.localeCompare(b.cycleId));
 const crops=config.crops.map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.flatMap(c=>c.varieties.map(v=>({...v,cropId:c.cropId}))).filter(v=>filterCrop==='all'||v.cropId===filterCrop);
 const pageSize=Number(config.pagination?.pageSize)||5,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));listPage=Math.min(Math.max(1,listPage),totalPages);
 const first=(listPage-1)*pageSize,paged=rows.slice(first,first+pageSize),start=rows.length?first+1:0,end=Math.min(first+pageSize,rows.length);
 const pageButtons=pageBtns(listPage,totalPages,'data-list-page');
 main.innerHTML=heading('재배일지작업 목록')+`<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar"><div class="field"><label for="filterCycle">작기</label><select id="filterCycle" class="ctrl">${options([{value:'all',label:'전체 작기'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],filterCycle)}</select></div><div class="field"><label for="filterGreenhouse">온실</label><select id="filterGreenhouse" class="ctrl">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],filterGreenhouse)}</select></div><div class="field crop-filter"><label for="filterCrop">품목</label><select id="filterCrop" class="ctrl">${options([{value:'all',label:'전체 품목'},...crops],filterCrop)}</select></div><div class="field variety-filter"><label for="filterVariety">품종</label><select id="filterVariety" class="ctrl">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],filterVariety)}</select></div><div class="field query"><label for="workDateFilter">작업일</label><input id="workDateFilter" type="date" class="ctrl" value="${escapeHtml(filterDate)}"></div><button class="btn" type="button" id="filterButton">조회</button><button class="btn main" type="button" id="createButton">+ 재배일지작업 등록</button></div></div></section>
 <section class="panel list-section" aria-label="재배일지작업 목록"><div class="tablewrap"><table class="data-table"><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">실제 작업일</th><th scope="col">온실</th><th scope="col">품목</th><th scope="col">품종</th><th scope="col">작기</th><th scope="col">생육단계</th><th scope="col">전체 작업 건수</th><th scope="col">미완료 작업 건수</th></tr></thead><tbody>${paged.map((d,i)=>{const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;return `<tr><td class="row-index">${rows.length-first-i}</td><td><button class="linkbtn" data-detail="${d.diaryId}">${escapeHtml(d.workDate)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'-')}</td><td>${htmlText(cropOf(c)?.name||'-')}</td><td>${htmlText(varietyOf(c)?.name||'-')}</td><td>${htmlText(c.name)}</td><td>${htmlText(getStage(d.stageId).name)}</td><td>${d.tasks.length}건</td><td>${d.tasks.length-done}건</td></tr>`}).join('')||'<tr><td class="empty" colspan="9">조회 결과가 없습니다.</td></tr>'}</tbody></table></div></section>
 <section class="panel pagination-section" aria-label="페이지네이션"><div class="list-foot"><nav class="pagination" aria-label="재배일지작업 페이지 이동"><button class="page-button" type="button" data-page-direction="prev" ${listPage===1?'disabled':''}>이전</button>${pageButtons}<button class="page-button" type="button" data-page-direction="next" ${listPage===totalPages?'disabled':''}>다음</button></nav></div></section>`;
 $('#filterCrop').onchange=()=>{const selected=$('#filterCrop').value;const possible=config.crops.filter(c=>selected==='all'||c.cropId===selected).flatMap(c=>c.varieties.map(v=>({value:v.varietyId,label:v.name})));const variety=$('#filterVariety');const old=variety.value;variety.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#filterButton').onclick=()=>{filterCycle=$('#filterCycle').value;filterGreenhouse=$('#filterGreenhouse').value;filterCrop=$('#filterCrop').value;filterVariety=$('#filterVariety').value;filterDate=$('#workDateFilter').value;listPage=1;renderList()};$('#workDateFilter').addEventListener('keydown',e=>{if(e.key==='Enter')$('#filterButton').click()});$('#createButton').onclick=()=>go('create');$$('[data-detail]').forEach(b=>b.onclick=()=>go('detail',b.dataset.detail));
 $$('[data-list-page]').forEach(b=>b.onclick=()=>{listPage=Number(b.dataset.listPage);renderList()});$$('[data-page-direction]').forEach(b=>b.onclick=()=>{listPage+=b.dataset.pageDirection==='next'?1:-1;renderList()});
}

function getContextHTML(c){return `<div class="cycle-meta"><div><span class="meta-label">품목</span><strong class="meta-value">${htmlText(cropOf(c)?.name||'-')}</strong></div><div><span class="meta-label">품종</span><strong class="meta-value">${htmlText(varietyOf(c)?.name||'-')}</strong></div><div><span class="meta-label">온실</span><strong class="meta-value">${htmlText(gh(c.greenhouseId)?.name||'-')}</strong></div></div>`}
function toReason(v){if(typeof v==='string')return v.trim();if(v&&typeof v==='object')return Object.values(v).filter(Boolean).map(x=>String(x).trim()).join(' / ');return ''}
function getReasons(reason){const text=toReason(reason);return text?`<p class="reason-text">${htmlText(text)}</p>`:''}
function renderDetail(){const d=getDiary(selectedId);if(!d){go('list');return}selectedId=d.diaryId;const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;
 main.innerHTML=heading('재배일지작업 조회','',true)+`<div class="editor-shell"><section class="panel editor-summary detail-info" aria-label="재배일지정보"><div class="panel-head"><h2>재배일지정보</h2></div><div class="summary-detail" id="detailFacts"><dl class="details-kv"><dt>작기</dt><dd>${htmlText(c.name)}</dd><dt>품목 · 품종</dt><dd>${htmlText(cropOf(c)?.name||'-')} · ${htmlText(varietyOf(c)?.name||'-')}</dd><dt>온실</dt><dd>${htmlText(gh(c.greenhouseId)?.name||'-')}</dd><dt>실제 작업일</dt><dd>${htmlText(d.workDate)}</dd><dt>생육단계</dt><dd>${htmlText(getStage(d.stageId).name)}</dd><dt>등록일시</dt><dd>${htmlText(d.createdAt?d.createdAt.replace('T',' '):'—')}</dd>${d.updatedAt?`<dt>수정일시</dt><dd>${htmlText(d.updatedAt.replace('T',' '))}</dd>`:''}</dl>${toReason(d.stageChangeReason||d.stageChangeReasons)?`<div class="reason-box"><strong>생육단계 변경 사유</strong>${getReasons(d.stageChangeReason||d.stageChangeReasons)}</div>`:''}</div></section>
 <section class="panel editor-workpanel"><div class="panel-head"><h2>작업내용</h2><span class="counter">${d.tasks.length}건 · 완료 ${done} / 미완료 ${d.tasks.length-done}</span></div><div class="task-body"><div class="task-list-header detail-task-header"><span>작업명</span><span>작업시간</span><span>작업유형</span><span>상태</span></div><div class="task-scroll detail-list">${[...d.tasks].sort(timeSort).map(t=>`<article class="detail-task"><div class="t-row"><strong>${htmlText(t.name)}</strong><span>${timeOf(t)}</span><span>${htmlText(t.type)}</span><span>${htmlText(t.status)}</span></div><div class="details-content">${htmlText(t.content||'—')}</div></article>`).join('')}</div><div class="hidden" id="detailDeleteConfirm" style="padding:10px 12px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>이 재배일지작업을 삭제하시겠습니까?</span><button type="button" class="btn" id="detailDeleteCancel">취소</button><button type="button" class="btn main" id="detailDeleteOk">삭제 확인</button></div><div class="form-actions"><button class="btn" id="detailBack">목록</button><button class="btn" id="detailDelete">삭제</button><button class="btn main" id="detailEdit">수정</button></div></div></section></div>`;
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
 const active=config.cycles.filter(c=>c.status==='진행'&&c.actualStartDate);
 if(!d&&!active.length){main.innerHTML=heading('재배일지작업 등록','진행 중인 작기가 없습니다.',true);bindBack();return}
 const c=getCycle(d?.cycleId||active[0].cycleId),date=d?.workDate||today();selectedStage=d?.stageId||stageByDate(c,date);working=d?clone(d.tasks): (config.formDefaults?.newDiaryTasks||[]).map((t,i)=>({...freshTask(date),taskId:`SAMPLE-${i+1}`,name:t.name,type:t.type,startedAt:makeStarted(date,t.time),status:t.status,content:t.content}));if(!working.length)working=[freshTask(date)];
 main.innerHTML=heading(isEdit?'재배일지작업 수정':'재배일지작업 등록','',true)+`<form class="editor-shell" id="diaryForm" novalidate><section class="panel editor-summary" aria-label="재배일지작업 기본정보">${summaryHTML(c,date,selectedStage)}<div class="summary-detail" id="baseFields"><div class="field"><label for="cycleId">작기 <span class="required">*</span></label><select class="ctrl" id="cycleId" ${isEdit?'disabled':''}>${options((isEdit?[c]:active).map(c=>({value:c.cycleId,label:c.name})),c.cycleId)}</select></div>
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
function saveProfilePatch(username,patch){
 try{const map=loadCertOverrides();map[username]={...(map[username]||{}),...patch};localStorage.setItem(CERT_KEY,JSON.stringify(map))}catch{}
}
let profileEditing=false;
function renderProfile(){
 const user=config.header.currentUser;
 const cert=user.certification||'미인증';
 const certBody=cert==='인증'?'<p class="module-hint">농업경영체 인증이 완료된 회원입니다.</p>':cert==='인증중'?'<p class="module-hint">관리자 인증 확인이 진행 중입니다. (승인 완료 시 인증 상태로 전환됩니다.)</p>':`<form id="certRequestForm" class="filterbar"><div class="field"><label for="certBusinessNumber">농업경영체 등록번호 *</label><input id="certBusinessNumber" class="ctrl" maxlength="20" value="${htmlText(user.businessNumber||'')}" placeholder="예: AGRI-2026-0001" required></div><button type="submit" class="btn main">인증 요청</button></form>`;
 const certPanel=`<section class="panel" style="margin-top:14px"><div class="panel-head"><h2>농업경영체 인증</h2><span class="counter">${htmlText(cert)}</span></div><div class="panel-body">${certBody}</div></section>`;
 if(!profileEditing){
  const facts=[['농장명',user.farmName],['대표자명',user.displayName],['아이디',user.username],['인증 상태',cert],['농업경영체 등록번호',user.businessNumber||'—'],['이메일',user.email],['연락처',user.phone],['농장 주소',[user.address,user.addressDetail].filter(Boolean).join(' ')],['주요 재배 품목',user.mainCrop],['농장 소개',user.description]];
  main.innerHTML=heading('내정보')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>회원정보</h2><button type="button" class="btn xs" id="profileEditBtn">수정</button></div><div class="panel-body"><dl class="profile-facts">${facts.map(([label,value])=>`<dt>${label}</dt><dd>${htmlText(value||'—')}</dd>`).join('')}</dl></div></section>${certPanel}</div>`;
  $('#profileEditBtn').onclick=()=>{profileEditing=true;renderProfile()};
 }else{
  main.innerHTML=heading('내정보 수정')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>회원정보 수정</h2><span class="counter">${htmlText(user.username)} · ${htmlText(cert)}</span></div><div class="panel-body"><form id="profileForm"><div class="module-input-grid">
  <div class="field"><label for="profFarmName">농장명 *</label><input id="profFarmName" class="ctrl" maxlength="100" value="${htmlText(user.farmName||'')}" required></div>
  <div class="field"><label for="profDisplayName">대표자명 *</label><input id="profDisplayName" class="ctrl" maxlength="50" value="${htmlText(user.displayName||'')}" required></div>
  <div class="field"><label for="profEmail">이메일</label><input id="profEmail" type="email" class="ctrl" maxlength="255" value="${htmlText(user.email||'')}"></div>
  <div class="field"><label for="profPhone">연락처</label><input id="profPhone" class="ctrl" maxlength="20" value="${htmlText(user.phone||'')}"></div>
  <div class="field"><label for="profAddress">농장 주소</label><div style="display:flex;gap:6px"><input id="profAddress" class="ctrl" maxlength="255" value="${htmlText(user.address||'')}" readonly placeholder="주소 검색을 눌러 입력하세요"><button type="button" class="btn" id="addrSearchBtn" style="flex:none">주소 검색</button></div></div>
  <div class="field"><label for="profAddressDetail">상세 주소</label><input id="profAddressDetail" class="ctrl" maxlength="255" value="${htmlText(user.addressDetail||'')}"></div>
  <div class="field wide"><label for="profMainCrop">주요 재배 품목</label><input id="profMainCrop" class="ctrl" maxlength="100" value="${htmlText(user.mainCrop||'')}"></div>
  <div class="field wide"><label for="profDesc">농장 소개</label><textarea id="profDesc" class="ctrl textarea">${htmlText(user.description||'')}</textarea></div>
  </div><div class="module-actions"><button type="button" class="btn" id="profileCancelBtn">취소</button><button type="submit" class="btn main">저장</button></div></form></div></section>
  <section class="panel" style="margin-top:14px"><div class="panel-head"><h2>비밀번호 변경</h2></div><div class="panel-body"><form id="passwordForm" class="filterbar"><div class="field"><label for="curPw">현재 비밀번호 *</label><input id="curPw" type="password" class="ctrl" required></div><div class="field"><label for="newPw">새 비밀번호 *</label><input id="newPw" type="password" class="ctrl" required></div><div class="field"><label for="chkPw">새 비밀번호 확인 *</label><input id="chkPw" type="password" class="ctrl" required></div><button type="submit" class="btn">비밀번호 변경</button></form></div></section></div>`;
  $('#profileCancelBtn').onclick=()=>{profileEditing=false;renderProfile()};
  $('#profileForm').onsubmit=e=>{
   e.preventDefault();
   const farmName=$('#profFarmName').value.trim(),displayName=$('#profDisplayName').value.trim();
   if(!farmName||!displayName){toast('농장명과 대표자명을 입력하세요.');return}
   const patch={farmName,displayName,email:$('#profEmail').value.trim()||null,phone:$('#profPhone').value.trim()||null,address:$('#profAddress').value.trim()||null,addressDetail:$('#profAddressDetail').value.trim()||null,mainCrop:$('#profMainCrop').value.trim()||null,description:$('#profDesc').value.trim()||null};
   Object.assign(user,patch);saveProfilePatch(user.username,patch);
   if($('#sidebarFoot'))$('#sidebarFoot').textContent=user.farmName;
   profileEditing=false;setupAccount();renderProfile();toast('내정보를 저장했습니다.');
  };
  $('#addrSearchBtn').onclick=()=>{
   if(window.daum&&window.daum.Postcode){
    new window.daum.Postcode({oncomplete:data=>{
     const addr=data.roadAddress||data.jibunAddress||'';
     $('#profAddress').value=addr;
     $('#profAddressDetail').focus();
    }}).open();
    return;
   }
   $('#profAddress').readOnly=false;
   $('#profAddress').focus();
   toast('카카오 주소 API를 불러올 수 없어 직접 입력으로 전환했습니다.');
  };
  $('#passwordForm').onsubmit=e=>{
   e.preventDefault();
   const cur=$('#curPw').value,next=$('#newPw').value,chk=$('#chkPw').value;
   const expected=user.demoPassword||'modoodemo01';
   if(cur!==expected&&cur!=='modoodemo01'&&cur!=='demo'){toast('현재 비밀번호가 일치하지 않습니다.');return}
   if(next.length<10||next.length>64){toast('비밀번호는 10~64자로 입력하세요.');return}
   if(next!==chk){toast('새 비밀번호 확인이 일치하지 않습니다.');return}
   user.demoPassword=next;saveProfilePatch(user.username,{demoPassword:next});
   $('#passwordForm').reset();toast('비밀번호를 변경했습니다.');
  };
 }
 const certForm=$('#certRequestForm');
 if(certForm)certForm.onsubmit=e=>{
  e.preventDefault();
  const num=$('#certBusinessNumber').value.trim();
  if(!num){toast('농업경영체 등록번호를 입력하세요.');return}
  user.businessNumber=num;user.certification='인증중';
  saveProfilePatch(user.username,{certification:'인증중',businessNumber:num});
  setupAccount();renderProfile();
  toast('농업경영체 인증을 요청했습니다. (인증중)');
 };
}
const AUTH_KEY=`modoo-auth:${prototypeData.meta.version}`;
const SIGNUP_KEY=`modoo-signup-members:${prototypeData.meta.version}`;
const CERT_KEY=`modoo-cert-overrides:${prototypeData.meta.version}`;
function loadCertOverrides(){try{return JSON.parse(localStorage.getItem(CERT_KEY)||'{}')||{}}catch{return {}}}
function saveMemberCertification(username,certification,businessNumber){try{const map=loadCertOverrides();map[username]={certification,businessNumber};localStorage.setItem(CERT_KEY,JSON.stringify(map))}catch{}}
function allMembers(){
 let extra=[];try{extra=JSON.parse(localStorage.getItem(SIGNUP_KEY)||'[]')}catch{}
 const overrides=loadCertOverrides();
 return [...prototypeData.members,...(Array.isArray(extra)?extra:[])].map(m=>overrides[m.username]?{...m,...overrides[m.username]}:m);
}
function saveAuthUser(username){
 try{sessionStorage.setItem(AUTH_KEY,username);localStorage.setItem(AUTH_KEY,username)}catch{}
}
function loadAuthUser(){
 try{return sessionStorage.getItem(AUTH_KEY)||localStorage.getItem(AUTH_KEY)||''}catch{return ''}
}
function clearAuthUser(){
 try{sessionStorage.removeItem(AUTH_KEY);localStorage.removeItem(AUTH_KEY)}catch{}
}
function setupAccount(){
 const user=config.header.currentUser;
 $('#userName').textContent=user.displayName;
 $('#userCertification').textContent=user.certification?` (${user.certification})`:'';
 if($('#myInfoButton'))$('#myInfoButton').onclick=e=>{e.preventDefault();go('profile')};
 if($('#logoutButton'))$('#logoutButton').onclick=()=>{clearAuthUser();location.href='login.html'};
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
 cycleFilters={status:'all',greenhouse:'all',name:''};ghFilters={name:'',type:'all',cover:'all',medium:'all'};envFilters={cycle:'all',from:'',to:'',comparison:'all'};
 issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
 if($('#sidebarFoot'))$('#sidebarFoot').textContent=member.farmName;
 setupAccount();loadGreenhouseExtras();loadCycleExtras();loadIssueExtras();loadSaved();render();
 if(main)main.focus();
}
// Additional modules: cycle plans and measured greenhouse environment.
let selectedCycleId=null,selectedMeasurementId=null,cycleListPage=1,environmentListPage=1;
let cycleFilters={status:'all',greenhouse:'all',name:''},envFilters={cycle:'all',from:'',to:'',comparison:'all'};
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
 return `<section class="panel pagination-section" aria-label="페이지네이션"><div class="list-foot"><nav class="pagination" aria-label="${htmlText(kind)} 페이지 이동"><button class="page-button" data-modpage="prev" ${pageNum===1?'disabled':''}>이전</button>${pageBtns(pageNum,pages,'data-modpage')}<button class="page-button" data-modpage="next" ${pageNum===pages?'disabled':''}>다음</button></nav></div></section>`;
}
function bindPages(selector,get,set,total,size,draw){$$('[data-modpage]').forEach(b=>b.onclick=()=>{const v=b.dataset.modpage;set(v==='prev'?Math.max(1,get()-1):v==='next'?Math.min(Math.ceil(total/size),get()+1):Number(v));draw()})}
function renderCycleList(){let list=config.cycles.filter(c=>(cycleFilters.status==='all'||c.status===cycleFilters.status)&&(cycleFilters.greenhouse==='all'||c.greenhouseId===cycleFilters.greenhouse)&&(!cycleFilters.name||c.name.includes(cycleFilters.name))).sort((a,b)=>(b.plannedStartAt||'').localeCompare(a.plannedStartAt||''));
 const size=config.pagination.cyclePageSize||5;cycleListPage=Math.min(Math.max(1,cycleListPage),Math.max(1,Math.ceil(list.length/size)));let from=(cycleListPage-1)*size,rows=list.slice(from,from+size);
 main.innerHTML=moduleHeading('작기계획 목록')+`<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar module-filter"><div class="field"><label for="cycleFilterGH">온실</label><select class="ctrl" id="cycleFilterGH">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],cycleFilters.greenhouse)}</select></div><div class="field"><label for="cycleFilterState">작기 상태</label><select class="ctrl" id="cycleFilterState">${options(['all','미진행','진행','종료'].map(s=>({value:s,label:s==='all'?'전체 상태':s})),cycleFilters.status)}</select></div><div class="field query"><label for="cycleFilterName">작기계획명</label><input class="ctrl" id="cycleFilterName" value="${htmlText(cycleFilters.name)}" placeholder="작기계획명을 입력하세요"></div><button type="button" class="btn" id="cycleDoFilter">조회</button><button type="button" class="btn main" id="cycleCreate">+ 작기계획 등록</button></div></div></section>
 <section class="panel list-section" aria-label="작기계획 목록"><div class="tablewrap"><table class="data-table module-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실</th><th>품목</th><th>품종</th><th>작기 상태</th><th>계획 시작일</th><th>실제 시작일</th><th>예상 종료일</th></tr></thead><tbody>${rows.map((c,i)=>`<tr><td class="row-index">${list.length-from-i}</td><td><button class="linkbtn" data-cycle-detail="${c.cycleId}">${htmlText(c.name)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'—')}</td><td>${htmlText(cropOf(c)?.name||'—')}</td><td>${htmlText(varietyOf(c)?.name||'—')}</td><td>${htmlText(cycleStatus(c))}</td><td class="tnum">${dateFrom(c.plannedStartAt)||'—'}</td><td class="tnum">${dateFrom(c.actualStartAt)||'—'}</td><td class="tnum">${dateFrom(c.expectedEndAt)||'—'}</td></tr>`).join('')||'<tr><td colspan="9" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div></section>${pageControls(list.length,cycleListPage,size,'작기계획')}`;
 $('#cycleDoFilter').onclick=()=>{cycleFilters={status:$('#cycleFilterState').value,greenhouse:$('#cycleFilterGH').value,name:$('#cycleFilterName').value.trim()};cycleListPage=1;renderCycleList()};$('#cycleFilterName').onkeydown=e=>{if(e.key==='Enter')$('#cycleDoFilter').click()};$('#cycleCreate').onclick=()=>go('cycle-create');
 $$('[data-cycle-detail]').forEach(b=>b.onclick=()=>go('cycle-detail',b.dataset.cycleDetail));bindPages('',()=>cycleListPage,v=>cycleListPage=v,list.length,size,renderCycleList);
}
function stageRows(c){const stages=config.growthStages.map(s=>{const k=getCriteria(c,s.stageId);let expectedStart=new Date(c.plannedStartAt||'2026-01-01T00:00:00');for(const prev of config.growthStages.filter(x=>x.order<s.order)){const n=getCriteria(c,prev.stageId)?.standardDays||0;expectedStart.setDate(expectedStart.getDate()+n)}
 const effective=c.stageHistory.find(h=>h.stageId===s.stageId);const range=k?.thresholds||{};
 return `<tr><td>${s.order}단계 · ${htmlText(s.name)}</td><td>${k?.standardDays??'—'}일</td><td>${dateFrom(expectedStart.toISOString())}</td><td>${effective?effective.effectiveDate:'—'}</td><td>${range.dayTempC?.join(' ~ ')||'—'} °C</td><td>${range.nightTempC?.join(' ~ ')||'—'} °C</td><td>${range.humidityPct?.join(' ~ ')||'—'} %RH</td><td>${range.substrateEcMsCm?.join(' ~ ')||'—'} mS/cm</td></tr>`;});return stages.join('')}
function renderCycleDetail(){const c=getSelectedCycle();if(!c){go('cycle-list');return}const diaries=diaryRows.filter(d=>d.cycleId===c.cycleId),samples=config.environmentChanges.filter(s=>s.cycleId===c.cycleId);
 main.innerHTML=moduleHeading('작기계획 상세','', '작기계획 목록으로','cycle-list')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>작기 기본정보</h2><span class="counter">${htmlText(cycleStatus(c))}</span></div><div class="panel-body"><div class="module-facts">${[
 ['작기계획명',c.name],['온실',gh(c.greenhouseId)?.name||'—'],['품목',cropOf(c)?.name||'—'],['품종',varietyOf(c)?.name||'—'],['작기 상태',cycleStatus(c)],['단계별 환경 기준',stdSet(c.environmentStandardSetId)?.name||'—'],['계획 시작일',dateFrom(c.plannedStartAt)||'—'],['예상 종료일',dateFrom(c.expectedEndAt)||'—'],['실제 시작일',dateFrom(c.actualStartAt)||'—'],['실제 종료일',dateFrom(c.actualEndAt)||'—'],['작기계획 등록일시',formatAt(c.registeredAt)],['종료 사유',c.endReason||'—']].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}</div></div></section>
 <section class="panel"><div class="panel-head"><h2>생육단계별 환경 기준과 일정</h2></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>계획상 시작일</th><th>실제 시작일</th><th>주간 온도 기준</th><th>야간 온도 기준</th><th>습도 기준</th><th>배지 EC 기준</th></tr></thead><tbody>${stageRows(c)}</tbody></table></div></section>
 <section class="panel"><div class="panel-head"><h2>연결된 재배기록</h2></div><div class="panel-body"><div class="record-links"><div><span>재배일지작업 등록 건수</span><strong>${diaries.length}건</strong></div><div><span>작기 중 온실 환경변화 기록 건수</span><strong>${samples.length}건</strong></div><button class="btn" id="cycleViewDiary">재배일지작업 목록 조회</button><button class="btn" id="cycleViewEnv">온실 환경변화 기록 조회</button></div></div></section></div>
 <section class="panel hidden" id="cycleStartPanel"><div class="panel-head"><h2>작기 실제 시작일 등록</h2></div><div class="panel-body"><div class="filterbar"><div class="field"><label for="cycleStartTime">실제 시작일 *</label><input class="ctrl" type="date" id="cycleStartTime"></div><button class="btn" type="button" id="cycleStartCancel">취소</button><button class="btn main" type="button" id="cycleStartConfirm">작기 시작 확정</button></div></div></section>
 <section class="panel hidden" id="cycleEndPanel"><div class="panel-head"><h2>작기 종료</h2></div><div class="panel-body"><div class="module-input-grid"><div class="field"><label for="cycleEndTime">실제 종료일 *</label><input class="ctrl" type="date" id="cycleEndTime"></div><div class="field wide"><label for="cycleEndReason">종료 사유</label><textarea class="ctrl textarea" id="cycleEndReason" placeholder="종료 사유를 입력하세요"></textarea></div></div><div class="dialog-actions"><button class="btn" type="button" id="cycleEndCancel">취소</button><button class="btn main" type="button" id="cycleEndConfirm">종료 확정</button></div></div></section>
 <div class="module-actions"><button class="btn" id="cycleToList">목록</button><button class="btn" id="cycleToEdit">작기계획 수정</button>${c.status==='미진행'?'<button class="btn main" id="cycleStart">작기 시작</button>':''}${c.status==='진행'?'<button class="btn main" id="cycleEnd">작기 종료</button>':''}</div>`;
 bindModuleBack();$('#cycleToList').onclick=()=>go('cycle-list');$('#cycleToEdit').onclick=()=>go('cycle-edit');$('#cycleViewDiary').onclick=()=>{filterCycle=c.cycleId;listPage=1;go('list')};$('#cycleViewEnv').onclick=()=>{envFilters.cycle=c.cycleId;environmentListPage=1;go('env-list')};
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
function renderCycleEditor(edit){if(!config.greenhouses.length){main.innerHTML=moduleHeading('작기계획 등록','등록된 온실이 없습니다.','작기계획 목록으로','cycle-list');bindModuleBack();return}const c=edit?getSelectedCycle():null,def={cycleId:'',name:'',greenhouseId:config.greenhouses[0].greenhouseId,plannedStartAt:`${today()}T09:00`,expectedEndAt:'2027-03-01T18:00',environmentStandardSetId:config.standardSets[0].id};const row=c||def;const hasData=!!(c&&diaryRows.some(d=>d.cycleId===c.cycleId));
 main.innerHTML=moduleHeading(edit?'작기계획 수정':'작기계획 등록','', '작기계획 목록으로','cycle-list')+`<form class="module-form panel" id="cycleForm" novalidate><div class="panel-head"><h2>작기계획 기본정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="cycleName">작기계획명 *</label><input class="ctrl" id="cycleName" maxlength="80" value="${htmlText(row.name)}" placeholder="예: 2026년 호접란 A동 2차"></div>
 <div class="field"><label for="cycleGreenhouse">온실 *</label><select class="ctrl" id="cycleGreenhouse" ${hasData?'disabled':''}>${options(config.greenhouses.map(x=>({value:x.greenhouseId,label:x.name})),row.greenhouseId)}</select></div>
 <div class="field"><label>재배 품목</label><input class="ctrl" id="selectedCrop" readonly></div><div class="field"><label>재배 품종</label><input class="ctrl" id="selectedVariety" readonly></div>
 <div class="field"><label for="cyclePlanStart">계획 시작일 *</label><input type="date" class="ctrl" id="cyclePlanStart" value="${dateFrom(row.plannedStartAt)}"></div>
 <div class="field"><label for="cycleExpectedEnd">예상 종료일 *</label><input type="date" class="ctrl" id="cycleExpectedEnd" value="${dateFrom(row.expectedEndAt)}"></div>
 <div class="field wide"><label for="cycleStd">작기 단계별 환경 기준 *</label><select class="ctrl" id="cycleStd">${options(config.standardSets.map(x=>({value:x.id,label:x.name})),row.environmentStandardSetId)}</select></div>
 </div><div class="subsection"><h3>생육단계별 환경 기준</h3><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th><th>주간 온도</th><th>야간 온도</th><th>온실 내부 습도</th><th>배지 EC</th></tr></thead><tbody>${config.growthStages.map(s=>{const k=getCriteria(row,s.stageId);return `<tr><td>${s.order}단계 · ${s.name}</td><td>${k?.standardDays??'—'}일</td><td>${k?.thresholds.dayTempC?.join(' ~ ')} °C</td><td>${k?.thresholds.nightTempC?.join(' ~ ')} °C</td><td>${k?.thresholds.humidityPct?.join(' ~ ')} %RH</td><td>${k?.thresholds.substrateEcMsCm?.join(' ~ ')} mS/cm</td></tr>`}).join('')}</tbody></table></div></div>
 ${edit?`<div class="module-readonly"><span>작기 상태</span><strong>${htmlText(c.status)}</strong><span>실제 시작일</span><strong>${dateFrom(c.actualStartAt)||'—'}</strong><span>실제 종료일</span><strong>${dateFrom(c.actualEndAt)||'—'}</strong></div>`:''}
 <div class="errorbox hidden" id="cycleFormError" role="alert"></div></div><div class="module-actions inside"><button type="button" class="btn" id="cycleCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'작기계획 등록'}</button></div></form>`;
 const updateCrop=()=>{const standard=stdSet($('#cycleStd').value),crop=config.crops.find(item=>item.cropId===standard.cropId);
  $('#selectedCrop').value=crop.name;
  $('#selectedVariety').value=crop.varieties.find(item=>item.varietyId===standard.varietyId).name;
  $('#cycleForm tbody').innerHTML=config.growthStages.map(stage=>{
   const criterion=getCriteria({...row,environmentStandardSetId:standard.id},stage.stageId);
   const ranges=criterion?.thresholds||{};
   return `<tr><td>${htmlText(stage.name)}</td><td>${criterion?.standardDays??'—'}</td>${['dayTempC','nightTempC','humidityPct','substrateEcMsCm'].map(key=>`<td>${ranges[key]?.join(' ~ ')||'—'}</td>`).join('')}</tr>`;
  }).join('');
 };
 $('#cycleStd').onchange=updateCrop;updateCrop();
 bindModuleBack();$('#cycleCancel').onclick=()=>go(edit?'cycle-detail':'cycle-list');$('#cycleForm').onsubmit=e=>{e.preventDefault();const name=$('#cycleName').value.trim(),ghId=$('#cycleGreenhouse').value,start=$('#cyclePlanStart').value,end=$('#cycleExpectedEnd').value,setId=$('#cycleStd').value;
 const errors=[];if(!name)errors.push('작기계획명을 입력하세요.');if(!ghId)errors.push('온실을 선택하세요.');if(!start||!end||start>=end)errors.push('계획 시작일과 예상 종료일을 확인하세요.');if(config.cycles.some(x=>x.name===name&&x.cycleId!==c?.cycleId))errors.push('동일한 작기계획명이 존재합니다.');if(!setId)errors.push('환경 기준을 선택하세요.');
 if(errors.length){$('#cycleFormError').textContent=errors.join(' ');$('#cycleFormError').classList.remove('hidden');return}
 const standard=stdSet(setId),startAt=`${dateFrom(start)}T00:00:00`,endAt=`${dateFrom(end)}T23:59:59`;
 if(edit){Object.assign(c,{cropId:standard.cropId,varietyId:standard.varietyId,name,greenhouseId:hasData?c.greenhouseId:ghId,plannedStartAt:startAt,expectedEndAt:endAt,environmentStandardSetId:setId});storeCycleExtras();toast('작기계획을 수정했습니다.');go('cycle-detail',c.cycleId)}else{
 const newId='CY-NEW-'+Date.now();config.cycles.push({cycleId:newId,name,greenhouseId:ghId,cropId:standard.cropId,varietyId:standard.varietyId,plannedStartAt:startAt,expectedEndAt:endAt,actualStartAt:null,actualStartDate:null,actualEndAt:null,endReason:null,registeredAt:`${today()}T09:00:00`,memberId:config.header.currentUser.id,status:'미진행',environmentStandardSetId:setId,stageHistory:[]});storeCycleExtras();toast('작기계획을 등록했습니다.');go('cycle-detail',newId)}
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
function renderEnvList(){
 const rows=config.environmentChanges.filter(s=>{
   const matchesCycle=envFilters.cycle==='all'||s.cycleId===envFilters.cycle;
   const matchesDate=(!envFilters.from||dateFrom(s.measuredAt)>=envFilters.from)&&(!envFilters.to||dateFrom(s.measuredAt)<=envFilters.to);
   return matchesCycle&&matchesDate;
 }).sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt));
 const size=config.pagination.environmentPageSize||7;
 environmentListPage=Math.min(Math.max(1,environmentListPage),Math.max(1,Math.ceil(rows.length/size)));
 const from=(environmentListPage-1)*size,shown=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('온실 환경변화 목록')+
 `<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar module-filter env-filters">
 <div class="field"><label for="envCycle">작기계획</label><select class="ctrl" id="envCycle">${options([{value:'all',label:'전체 작기계획'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],envFilters.cycle)}</select></div>
 <div class="field"><label for="envFrom">측정 시작일</label><input type="date" class="ctrl" id="envFrom" value="${envFilters.from}"></div>
 <div class="field"><label for="envTo">측정 종료일</label><input type="date" class="ctrl" id="envTo" value="${envFilters.to}"></div>
 <button class="btn" id="envDoFilter">조회</button></div></div></section>
 <section class="panel list-section" aria-label="온실 환경변화 목록"><div class="tablewrap"><table class="data-table module-table env-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실명</th><th>환경변화 측정일시</th><th>해당 날짜의 실제 생육단계</th><th>온실 내부 온도 측정값</th><th>온실 내부 습도 측정값</th><th>미측정 항목 수</th></tr></thead>
 <tbody>${shown.map((r,i)=>{const c=getCycleForReading(r);return `<tr><td class="row-index">${rows.length-from-i}</td><td>${htmlText(c?.name||'—')}</td><td>${htmlText(gh(c?.greenhouseId)?.name||'—')}</td><td><button class="linkbtn" data-env-detail="${r.environmentChangeId}">${formatAt(r.measuredAt)}</button></td><td>${htmlText(readingStage(r)?getStage(readingStage(r)).name:'미확인')}</td><td>${fmtVal(r.insideTempC)} °C</td><td>${fmtVal(r.humidityPct)} %RH</td><td>${countMissing(r)}개</td></tr>`}).join('')||'<tr><td colspan="8" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div></section>
 ${pageControls(rows.length,environmentListPage,size,'온실 환경변화')}`;
 $('#envDoFilter').onclick=()=>{
   const next={cycle:$('#envCycle').value,from:$('#envFrom').value,to:$('#envTo').value,comparison:'all'};
   if(next.from&&next.to&&next.from>next.to){toast('측정 시작일과 종료일을 확인하세요.');return}
   envFilters=next;environmentListPage=1;renderEnvList();
 };
 $$('[data-env-detail]').forEach(b=>b.onclick=()=>go('env-detail',b.dataset.envDetail));
 bindPages('',()=>environmentListPage,v=>environmentListPage=v,rows.length,size,renderEnvList);
}
function renderEnvDetail(){
 const r=getReading(selectedMeasurementId);if(!r){go('env-list');return}
 selectedMeasurementId=r.environmentChangeId;
 const c=getCycleForReading(r),tested=readingTests(r),missing=countMissing(r);
 main.innerHTML=moduleHeading('온실 환경변화 상세','', '목록으로','env-list')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>환경변화 측정 기본정보</h2><span class="counter">미측정 ${missing}개</span></div><div class="panel-body"><div class="module-facts compact">
 ${[['작기계획명',c?.name||'—'],['온실명',gh(c?.greenhouseId)?.name||'—'],['측정일시',formatAt(r.measuredAt)],['해당 날짜의 실제 생육단계',getStage(readingStage(r)).name]].map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(b)}</strong></div>`).join('')}
 </div></div></section>
 <section class="panel"><div class="panel-head"><h2>온실 환경변화 측정값</h2><span class="counter">환경측정 항목 9개</span></div><div class="tablewrap"><table class="data-table module-table metric-table"><thead><tr><th>환경측정 항목명</th><th>실제 측정값</th></tr></thead><tbody>
 ${tested.map(x=>`<tr><td>${htmlText(x.label)}</td><td>${x.value===null||x.value===undefined?'미측정':`${x.value} ${htmlText(x.unit)}`}</td></tr>`).join('')}
 </tbody></table></div></section></div>
 <div class="module-actions"><button class="btn" id="envBack">목록</button><button class="btn" id="envCycleDetail">해당 작기계획 조회</button></div>`;
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
  main.innerHTML=moduleHeading('온실 환경 이슈 상세','','목록으로','issue-list')+
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
 main.innerHTML=moduleHeading('온실 환경 이슈 목록')+`<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><form class="filterbar issue-filters" id="issueFilters">
 ${choose('issueCycle','작기계획',config.cycles.map(row=>({value:row.cycleId,label:row.name})),issueFilters.cycle)}
 ${choose('issueType','이슈 유형',values(['온도','습도','이산화탄소','일사량','광도','배지온도','배지수분량','배지 EC','배지 pH',...issues.map(item=>item.issueType)]),issueFilters.type)}
 ${choose('issueStatus','조치 상태',values(['발생','조치중','조치 완료']),issueFilters.status)}
 <label class="field" for="issueFrom">시작일<input id="issueFrom" class="ctrl" type="date" value="${issueFilters.from}"></label>
 <label class="field" for="issueTo">종료일<input id="issueTo" class="ctrl" type="date" value="${issueFilters.to}"></label>
 <button class="btn" type="submit">조회</button></form></div></section>
 <section class="panel list-section" aria-label="온실 환경 이슈 목록"><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>발생일시</th><th>작기계획</th><th>이슈 유형</th><th>이슈 내용</th><th>조치 상태</th></tr></thead>
 <tbody>${pagedIssues.map(item=>`<tr><td>${formatAt(item.occurredAt)}</td><td>${htmlText(getCycle(item.cycleId)?.name)}</td><td>${htmlText(item.issueType)}</td><td><button class="linkbtn" data-issue="${item.issueId}">${htmlText(item.message)}</button></td><td><span class="issue-status" data-status="${htmlText(item.status)}">${htmlText(item.status)}</span></td></tr>`).join('')||'<tr><td colspan="5" class="empty">조회된 이슈가 없습니다.</td></tr>'}</tbody></table></div></section>
 ${pageControls(rows.length,issueListPage,size,'온실 환경 이슈')}`;
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
function loadGreenhouseExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('greenhouses'))||'null');if(Array.isArray(saved?.greenhouses)&&saved.greenhouses.length)config.greenhouses=saved.greenhouses}catch{}}
function renderGreenhouseList(){
 const rows=config.greenhouses.filter(g=>(!ghFilters.name||g.name.includes(ghFilters.name))&&(ghFilters.type==='all'||g.type===ghFilters.type)&&(ghFilters.cover==='all'||g.coverType===ghFilters.cover)&&(ghFilters.medium==='all'||g.mediumType===ghFilters.medium));
 const size=Number(config.pagination?.pageSize)||5;ghListPage=Math.min(Math.max(1,ghListPage),Math.max(1,Math.ceil(rows.length/size)));const from=(ghListPage-1)*size,paged=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('온실 목록')+
 `<section class="panel search-section" aria-label="검색 조건"><div class="panel-body"><div class="filterbar module-filter">
 <div class="field query"><label for="ghFilterName">온실명</label><input class="ctrl" id="ghFilterName" value="${htmlText(ghFilters.name)}" placeholder="온실명을 입력하세요"></div>
 <div class="field"><label for="ghFilterType">온실 형태</label><select class="ctrl" id="ghFilterType">${options([{value:'all',label:'전체'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],ghFilters.type)}</select></div>
 <div class="field"><label for="ghFilterCover">피복 자재</label><select class="ctrl" id="ghFilterCover">${options([{value:'all',label:'전체'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],ghFilters.cover)}</select></div>
 <div class="field"><label for="ghFilterMedium">배지 종류</label><select class="ctrl" id="ghFilterMedium">${options([{value:'all',label:'전체'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],ghFilters.medium)}</select></div>
 <button type="button" class="btn" id="ghDoFilter">조회</button><button type="button" class="btn main" id="ghCreate">+ 온실 등록</button>
 </div></div></section>
 <section class="panel list-section" aria-label="온실 목록"><div class="tablewrap"><table class="data-table module-table"><thead><tr><th class="row-index">번호</th><th>온실명</th><th>온실 형태</th><th>피복 자재</th><th>동 수</th><th>등록 면적(㎡)</th><th>배지 종류</th></tr></thead>
 <tbody>${paged.map((g,i)=>`<tr><td class="row-index">${rows.length-from-i}</td><td><button class="linkbtn" data-gh-detail="${g.greenhouseId}">${htmlText(g.name)}</button></td><td>${htmlText(g.type||'—')}</td><td>${htmlText(g.coverType||'—')}</td><td>${g.buildingCount??'—'}</td><td>${g.registeredArea??'—'}</td><td>${htmlText(g.mediumType||'—')}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">등록된 온실이 없습니다.</td></tr>'}</tbody></table></div></section>
 ${pageControls(rows.length,ghListPage,size,'온실 목록')}`;
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
 const facts=[['온실명',g.name],['온실 형태',g.type||'—'],['피복 자재',g.coverType||'—'],['연동 수(동)',g.buildingCount??'—'],['측고(m)',g.sideHeight??'—'],['폭(m)',g.width??'—'],['길이(m)',g.length??'—'],['등록 면적(㎡)',g.registeredArea??'—'],['배지 종류',g.mediumType||'—'],['연결된 작기 수',`${linked.length}건`]];
 main.innerHTML=moduleHeading('온실 상세','','온실 목록으로','gh-list')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>온실 정보</h2></div><div class="panel-body"><div class="module-facts">${facts.map(([a,b])=>`<div><span>${htmlText(a)}</span><strong>${htmlText(String(b))}</strong></div>`).join('')}</div></div></section>
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
 const row=g||{greenhouseId:'',name:'',type:'단동',coverType:'비닐',buildingCount:1,sideHeight:'',width:'',length:'',registeredArea:'',mediumType:'수태'};
 main.innerHTML=moduleHeading(edit?'온실 수정':'온실 등록','','온실 목록으로','gh-list')+
 `<form class="module-form panel" id="ghForm" novalidate><div class="panel-head"><h2>온실 정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="ghName">온실명 *</label><input class="ctrl" id="ghName" maxlength="100" value="${htmlText(row.name)}" placeholder="예: E온실" required></div>
 <div class="field"><label for="ghType">온실 형태</label><select class="ctrl" id="ghType">${options([{value:'',label:'미선택'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],row.type||'')}</select></div>
 <div class="field"><label for="ghCover">피복 자재</label><select class="ctrl" id="ghCover">${options([{value:'',label:'미선택'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],row.coverType||'')}</select></div>
 <div class="field"><label for="ghCount">동 수</label><input class="ctrl" id="ghCount" type="number" min="1" value="${row.buildingCount??''}"></div>
 <div class="field"><label for="ghMedium">배지 종류</label><select class="ctrl" id="ghMedium">${options([{value:'',label:'미선택'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],row.mediumType||'')}</select></div>
 <div class="field"><label for="ghSide">측고 (m)</label><input class="ctrl" id="ghSide" type="number" step="0.01" min="0" value="${row.sideHeight??''}"></div>
 <div class="field"><label for="ghWidth">폭 (m)</label><input class="ctrl" id="ghWidth" type="number" step="0.01" min="0" value="${row.width??''}"></div>
 <div class="field"><label for="ghLength">길이 (m)</label><input class="ctrl" id="ghLength" type="number" step="0.01" min="0" value="${row.length??''}"></div>
 <div class="field"><label for="ghArea">등록 면적 (㎡)</label><input class="ctrl" id="ghArea" type="number" step="0.01" min="0" value="${row.registeredArea??''}"></div>
 </div><div class="errorbox hidden" id="ghErr"></div></div>
 <div class="module-actions"><button type="button" class="btn" id="ghCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'등록'}</button></div></form>`;
 bindModuleBack();$('#ghCancel').onclick=()=>go(edit?'gh-detail':'gh-list',g?.greenhouseId);
 $('#ghForm').onsubmit=e=>{
  e.preventDefault();
  const name=$('#ghName').value.trim();
  if(!name){$('#ghErr').textContent='온실명을 입력하세요.';$('#ghErr').classList.remove('hidden');return}
  const numOrNull=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
  const payload={greenhouseId:g?g.greenhouseId:'GH-NEW-'+Date.now(),memberId:config.header.currentUser.id,name,type:$('#ghType').value||null,coverType:$('#ghCover').value||null,buildingCount:numOrNull('#ghCount'),sideHeight:numOrNull('#ghSide'),width:numOrNull('#ghWidth'),length:numOrNull('#ghLength'),registeredArea:numOrNull('#ghArea'),mediumType:$('#ghMedium').value||null};
  if(g)Object.assign(g,payload);else config.greenhouses.unshift(payload);
  storeGreenhouseExtras();toast(edit?'온실 정보를 수정했습니다.':'온실을 등록했습니다.');go('gh-detail',payload.greenhouseId);
 };
}
function renderCertification(){
 const user=config.header.currentUser;
 const cert=user.certification||'미인증';
 const body=cert==='인증'?'<p class="module-hint">농업경영체 인증이 완료된 회원입니다.</p>':cert==='인증중'?'<p class="module-hint">관리자 인증 확인이 진행 중입니다. (승인 완료 시 인증 상태로 전환됩니다.)</p>':`<form id="certPageForm" class="filterbar"><div class="field"><label for="certPageNumber">농업경영체 등록번호 *</label><input id="certPageNumber" class="ctrl" maxlength="20" value="${htmlText(user.businessNumber||'')}" placeholder="예: AGRI-2026-0001" required></div><button type="submit" class="btn main">인증 요청</button></form>`;
 main.innerHTML=heading('농업경영체 인증')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><h2>인증 상태</h2><span class="counter">${htmlText(cert)}</span></div><div class="panel-body"><dl class="profile-facts"><dt>농장명</dt><dd>${htmlText(user.farmName||'—')}</dd><dt>대표자명</dt><dd>${htmlText(user.displayName||'—')}</dd><dt>인증 상태</dt><dd>${htmlText(cert)}</dd><dt>농업경영체 등록번호</dt><dd>${htmlText(user.businessNumber||'—')}</dd></dl></div></section><section class="panel" style="margin-top:14px"><div class="panel-head"><h2>농업경영체 인증 요청</h2></div><div class="panel-body">${body}</div></section></div>`;
 const form=$('#certPageForm');
 if(form)form.onsubmit=e=>{
  e.preventDefault();
  const num=$('#certPageNumber').value.trim();
  if(!num){toast('농업경영체 등록번호를 입력하세요.');return}
  user.businessNumber=num;user.certification='인증중';
  saveProfilePatch(user.username,{certification:'인증중',businessNumber:num});
  setupAccount();renderCertification();
  toast('농업경영체 인증을 요청했습니다. (인증중)');
 };
}
async function init(){
 const hostPage=document.body?.dataset?.page||'entry';
 if(hostPage==='entry'){
  const saved=loadAuthUser();
  const member=allMembers().find(row=>row.username===saved);
  location.replace(member?'diary-list.html':'login.html');return;
 }
 if(hostPage==='login'){
  const members=allMembers();
  $('#loginUsername').value=loadAuthUser()||'seedmum02';
  $('#loginForm').onsubmit=event=>{
   event.preventDefault();
   const username=$('#loginUsername').value.trim();
   const member=allMembers().find(row=>row.username===username);
   const pw=$('#loginPassword').value;
   if(member&&(pw==='modoodemo01'||pw==='demo'||(member.demoPassword&&pw===member.demoPassword))){
    saveAuthUser(member.username);location.href='diary-list.html';return;
   }
   $('#loginError').textContent='아이디와 비밀번호를 확인하세요.';$('#loginError').hidden=false;
  };
  return;
 }
 if(hostPage==='signup'){
  $('#signupForm').onsubmit=event=>{
   event.preventDefault();
   const farmName=$('#signupFarmName').value.trim(),representativeName=$('#signupRepresentativeName').value.trim();
   const username=$('#signupUsername').value.trim(),password=$('#signupPassword').value,passwordConfirm=$('#signupPasswordConfirm')?.value??password;
   const err=$('#signupError');
   if(!farmName||!representativeName||!username||!password){err.textContent='필수 항목을 입력하세요.';err.hidden=false;return}
   if(!/^[a-z][a-z0-9]{5,19}$/.test(username)){err.textContent='아이디는 영문 소문자로 시작하는 6~20자 영문 소문자·숫자여야 합니다.';err.hidden=false;return}
   if(password.length<10||password.length>64){err.textContent='비밀번호는 10~64자로 입력하세요.';err.hidden=false;return}
   if(password!==passwordConfirm){err.textContent='비밀번호 확인이 일치하지 않습니다.';err.hidden=false;return}
   if(allMembers().some(m=>m.username===username)){err.textContent='이미 사용 중인 아이디입니다.';err.hidden=false;return}
   const businessNumber=$('#signupBusinessNumber')?.value.trim()||null;
   const newMember={id:'MEM-'+Date.now(),displayName:representativeName,role:'화훼농민',certification:businessNumber?'인증중':'미인증',businessNumber,username,demoPassword:password,farmName,email:$('#signupEmail').value.trim()||null,phone:$('#signupPhone').value.trim()||null,address:null,addressDetail:null,mainCrop:$('#signupMainCrop').value.trim()||null,description:null};
   try{const prev=JSON.parse(localStorage.getItem(SIGNUP_KEY)||'[]');localStorage.setItem(SIGNUP_KEY,JSON.stringify([...(Array.isArray(prev)?prev:[]),newMember]))}catch{}
   saveAuthUser(username);toast('회원가입이 완료되었습니다.');setTimeout(()=>{location.href='login.html'},400);
  };
  return;
 }
 if(window.ModooLayoutReady)await window.ModooLayoutReady;
 const savedUser=loadAuthUser();
 const member=allMembers().find(row=>row.username===savedUser);
 if(!member){location.replace('login.html');return}
 if($('#brand'))$('#brand').innerHTML=`${htmlText(prototypeData.meta.project)}<small>화훼 재배 관리</small>`;
 for(const button of $$('#navigation [data-go]'))button.addEventListener('click',e=>{e.preventDefault();go(button.dataset.go)});
 for(const button of $$('[data-close-dialog]'))button.addEventListener('click',()=>document.getElementById(button.dataset.closeDialog).close());
 if($('#cycleStartConfirm'))$('#cycleStartConfirm').onclick=commitCycleStart;
 if($('#cycleEndConfirm'))$('#cycleEndConfirm').onclick=commitCycleEnd;
 const params=new URLSearchParams(location.search);
 const initialView=params.get('view')||hostPage;
 const initialId=params.get('id');
 signIn(member,initialView,initialId);
}
init();
})();

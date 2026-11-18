(()=>{'use strict';
const { ready, notify: toast, allMembers, loadSignupMembers, signupKey, saveAuthUser, loadAuthUser, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;
const $=(s,base=document)=>base.querySelector(s), $$=(s,base=document)=>[...base.querySelectorAll(s)];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const htmlText=escapeHtml, clone=x=>JSON.parse(JSON.stringify(x));
const pageNums=(cur,total)=>{if(total<=7)return Array.from({length:total},(_,i)=>i+1);let s=Math.max(2,cur-2),e=Math.min(total-1,cur+2);if(cur<=3)e=5;if(cur>=total-2)s=total-4;const list=[1];if(s>2)list.push('...');for(let i=s;i<=e;i++)list.push(i);if(e<total-1)list.push('...');list.push(total);return list};
const pageBtns=(cur,total,attr)=>pageNums(cur,total).map(p=>p==='...'?'<span class="page-ellipsis" aria-hidden="true">…</span>':`<button type="button" class="page-button" ${attr}="${p}" ${p===cur?'aria-current="page"':''} aria-label="${p}페이지">${p}</button>`).join('');
const storageKey=kind=>`modoo-sprint2:${sampleData.meta.version}:${config.header.currentUser.id}:${kind}`;
let config=clone(sampleData), diaryRows=[], page='list',selectedId=null,working=[],editRow=null,selectedStage='VEG',filterCycle='all',filterGreenhouse='all',filterCrop='all',filterVariety='all',filterDate='',listPage=1;
const main=$('#main'), today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
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
 loadStandards();
}
function error(s){const el=$('#formError');if(el){el.textContent=s;el.classList.remove('hidden')}toast(s)}
function updateNavigation() {
 const isStd = page==='standard'||page==='standard-create';
 const stdModal = window.__stdState?.cropModal;
 const stdDetail = window.__stdState?.cropDetailId;
 const isStdCreate = page==='standard-create' || (stdModal && !stdModal.varietyId);
 const entry = isStd ? (isStdCreate?'standard-create':'standard') : page==='cycle-create' ? 'cycle-create' : page.startsWith('cycle-') ? 'cycle-list' : page==='gh-create' ? 'gh-create' : page.startsWith('gh-') ? 'gh-list' : page.startsWith('env-') ? 'env-list' : page.startsWith('issue-') ? 'issue-list' : page==='create' ? 'create' : 'list';
 const current = setCurrentMenu(entry);
 if (isStd) {
  $('#crumb').textContent = isStdCreate ? '재배품목 / 품목 · 품종 등록' : stdModal?.varietyId ? '재배품목 / 품목 · 품종 수정' : stdDetail ? '재배품목 / 품목 · 품종 상세' : '재배품목 / 품목 · 품종 목록';
  return;
 }
 const state = page.replace(/^(cycle-|gh-|env-|issue-)/, '');
 const step = {list:'목록',create:'등록',detail:'상세',edit:'수정'}[state] || '목록';
 const section = page.startsWith('cycle-') ? '작기계획' : page.startsWith('gh-') ? '온실 정보' : (page.startsWith('env-')||page.startsWith('issue-')) ? (current?.textContent||'') : '재배일지작업';
 const prefix = (page.startsWith('gh-')||page.startsWith('env-')||page.startsWith('issue-')) ? ['온실', section, step] : [section, step];
 $('#crumb').textContent = prefix.filter(Boolean).join(' / ');
}
const pageFile=target=>(target==='standard'||target==='standard-create')?'cropStageStandard.html':target.startsWith('cycle-')?'cultivationPlanList.html':target.startsWith('gh-')?'greenhouseList.html':target.startsWith('env-')?'environmentChangeList.html':target.startsWith('issue-')?'environmentIssueList.html':target==='member'?'mypage.html?tab=pw':target==='profile'?'mypage.html':target==='cert'?'mypage.html?tab=cert':'cultivationDiaryList.html';
function go(target,id){
 const hostPage=document.body?.dataset?.page;
 if(hostPage&&pageFile(target).split('?')[0]!==pageFile(hostPage).split('?')[0]){
  const url = new URL(pageFile(target), location.href);
  if (target !== hostPage && target !== 'cert') url.searchParams.set('view', target);
  if (id) url.searchParams.set('id', id);
  location.href = url.href;
  return;
 }
 if(target==='standard'||target==='standard-create'){
  const st=window.__stdState||(window.__stdState={cropFilter:'all',editCriteria:false,cropModal:null,cropDetailId:null});
  st.editCriteria=false;st.cropDetailId=null;
  st.cropModal=target==='standard-create'?{cropId:'',varietyId:'',cropName:'',varietyName:''}:null;
  page=target;render();return;
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
 else if(page==='standard'||page==='standard-create')renderStandardPage();
 else if(page==='list')renderList();else if(page==='detail')renderDetail();else renderEditor(page==='edit')}
function unifiedListPanel({title,count,actionHtml='',filterHtml='',filterTag='div',filterId='',filterClass='',bodyHtml='',footHtml='',ariaLabel}){
 const fAttr=filterId?` id="${filterId}"`:'';
 const fCls=filterClass?`list-filter-strip ${filterClass}`:'list-filter-strip';
 const filterBar=filterHtml?`<${filterTag} class="${fCls}"${fAttr}>${filterHtml}</${filterTag}>`:'';
 const summaryBar=`<div class="list-summary-bar"><span class="list-total-count">총 <strong>${count}</strong>건</span>${actionHtml?`<div class="list-summary-actions">${actionHtml}</div>`:''}</div>`;
 return `<section class="panel list-section" aria-label="${htmlText(ariaLabel||title)}">${filterBar}${summaryBar}${bodyHtml}${footHtml}</section>`;
}
function listFilterField(id,label,ctrlHtml,extraClass=''){const cls=extraClass?`list-ctrl-field ${extraClass}`:'list-ctrl-field';return `<label class="${cls}"${id?` for="${id}"`:''}><span>${htmlText(label)}</span>${ctrlHtml}</label>`}

function renderList(){const rows=diaryRows.filter(d=>{
 const c=getCycle(d.cycleId);return(filterCycle==='all'||d.cycleId===filterCycle)&&(filterGreenhouse==='all'||c.greenhouseId===filterGreenhouse)&&(filterCrop==='all'||c.cropId===filterCrop)&&(filterVariety==='all'||c.varietyId===filterVariety)&&(!filterDate||d.workDate===filterDate)}).sort((a,b)=>b.workDate.localeCompare(a.workDate)||a.cycleId.localeCompare(b.cycleId));
 const usedCycles=diaryRows.map(d=>getCycle(d.cycleId)).filter(Boolean),usedCropIds=new Set(usedCycles.map(c=>c.cropId)),usedVarIds=new Set(usedCycles.map(c=>c.varietyId));const crops=config.crops.filter(c=>usedCropIds.has(c.cropId)).map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(filterCrop==='all'||c.cropId===filterCrop)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({...v,cropId:c.cropId})));
 const pageSize=Number(config.pagination?.pageSize)||5,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));listPage=Math.min(Math.max(1,listPage),totalPages);
 const first=(listPage-1)*pageSize,paged=rows.slice(first,first+pageSize),start=rows.length?first+1:0,end=Math.min(first+pageSize,rows.length);
 const pageButtons=pageBtns(listPage,totalPages,'data-list-page');
 main.innerHTML=heading('재배일지작업 목록')+unifiedListPanel({
  title:'재배일지작업 목록',
  count:rows.length,
  actionHtml:'<button class="btn main xs" type="button" id="createButton">+ 재배일지작업 등록</button>',
  filterHtml:`${listFilterField('filterCycle','작기',`<select id="filterCycle" class="ctrl">${options([{value:'all',label:'전체 작기'},...config.cycles.map(c=>({value:c.cycleId,label:c.name}))],filterCycle)}</select>`)}${listFilterField('filterGreenhouse','온실',`<select id="filterGreenhouse" class="ctrl">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],filterGreenhouse)}</select>`)}${listFilterField('filterCrop','품목',`<select id="filterCrop" class="ctrl">${options([{value:'all',label:'전체 품목'},...crops],filterCrop)}</select>`)}${listFilterField('filterVariety','품종',`<select id="filterVariety" class="ctrl">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],filterVariety)}</select>`)}${listFilterField('workDateFilter','작업일',`<input id="workDateFilter" type="date" class="ctrl" value="${escapeHtml(filterDate)}">`) }<button class="btn main list-search-btn" type="button" id="filterButton">검색</button>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table diary-table"><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">실제 작업일</th><th scope="col">온실</th><th scope="col">품목</th><th scope="col">품종</th><th scope="col">작기</th><th scope="col">생육단계</th><th class="tnum" scope="col">작업 건수 (전체/미완료)</th></tr></thead><tbody>${paged.map((d,i)=>{const c=getCycle(d.cycleId),done=d.tasks.filter(t=>t.status==='완료').length;return `<tr><td class="row-index">${rows.length-first-i}</td><td><button class="linkbtn" data-detail="${d.diaryId}">${escapeHtml(d.workDate)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'-')}</td><td>${htmlText(cropOf(c)?.name||'-')}</td><td>${htmlText(varietyOf(c)?.name||'-')}</td><td>${htmlText(c.name)}</td><td>${htmlText(getStage(d.stageId).name)}</td><td class="tnum">${d.tasks.length} / ${d.tasks.length-done}</td></tr>`}).join('')||'<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:`<div class="list-foot"><nav class="pagination" aria-label="재배일지작업 페이지 이동"><button class="page-button" type="button" data-page-direction="prev" ${listPage===1?'disabled':''}>이전</button>${pageButtons}<button class="page-button" type="button" data-page-direction="next" ${listPage===totalPages?'disabled':''}>다음</button></nav></div>`
 });
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
const statusBadge=(label,toneMap={})=>`<span class="krds-badge ${toneMap[label]||'bg-light-gray'}">${htmlText(label)}</span>`;
const taskTone=status=>status==='완료'?'bg-light-success':'bg-light-gray';
function taskPanel(t){return `<article class="task-card" data-taskid="${escapeHtml(t.taskId)}"><div class="task-summary"><strong class="task-title title-text">${htmlText(t.name||'새 작업')}</strong><span class="summary-time">${timeOf(t)}</span><span class="summary-type">${htmlText(t.type)}</span><span class="krds-badge ${taskTone(t.status)} summary-status">${htmlText(t.status)}</span><button class="trash" type="button" data-remove="${escapeHtml(t.taskId)}" aria-label="${htmlText(t.name||'새 작업')} 삭제" title="삭제">${trashSvg}</button></div><div class="task-detail"><div class="field wide"><label>작업명 *</label><input class="ctrl compact-input t-name" maxlength="100" value="${escapeHtml(t.name)}" placeholder="작업명"></div><div class="field"><label>작업유형 *</label><select class="ctrl t-type">${options(config.workTypes,t.type)}</select></div><div class="field"><label>작업시간 *</label><input class="ctrl t-time" type="time" value="${timeOf(t)}"></div><div class="field"><label>작업상태 *</label><select class="ctrl t-status">${options(config.taskStatuses,t.status)}</select></div><div class="field wide"><label>작업내용</label><textarea class="ctrl t-content" rows="2" placeholder="작업 내용을 입력하세요">${htmlText(t.content)}</textarea></div></div></article>`}
function gatherTasks(){const current=$$('[data-taskid]',main);if(!current.length)return;
 working=current.map(el=>{const old=working.find(x=>x.taskId===el.dataset.taskid)||freshTask($('#workDate')?.value||today());const time=$('.t-time',el)?.value||timeOf(old);return{...old,name:$('.t-name',el)?.value??old.name,type:$('.t-type',el)?.value??old.type,status:$('.t-status',el)?.value??old.status,content:$('.t-content',el)?.value??old.content,startedAt:makeStarted($('#workDate')?.value||today(),time)}})}
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
function stagePolicy(c,date,d){const last=lastEvent(c),pastStage=stageByDate(c,date),laterHistory=c.stageHistory.some(e=>e.effectiveDate>date),laterDiary=diaryRows.some(x=>x.cycleId===c.cycleId&&x.workDate>date&&x.diaryId!==d?.diaryId),isEdit=!!d;
 const canChange=!isEdit&&!laterHistory&&!laterDiary&&date>=(last?.effectiveDate||c.actualStartDate||'')&&date>=c.actualStartDate&&date<=today();
 return {stageId:isEdit?d.stageId:pastStage,canChange,laterDiary,laterHistory}}
function updateCycleData(){const sel=$('#cycleId');if(!sel)return;const c=getCycle(sel.value);const date=$('#workDate');date.min=c.actualStartDate;date.max=today();if(!date.value||date.value<c.actualStartDate)date.value=c.actualStartDate;updateStageOptions()}
function updateStageOptions(){const c=getCycle($('#cycleId').value),date=$('#workDate').value||today(),policy=stagePolicy(c,date,editRow),select=$('#stageId');
 const allowed=new Set([policy.stageId]);if(policy.canChange){let next=config.growthStages.find(s=>s.order===stageOrder(policy.stageId)+1);if(next)allowed.add(next.stageId)}
 const candidate=select.value;select.innerHTML=config.growthStages.map(s=>`<option value="${s.stageId}" ${!allowed.has(s.stageId)?'disabled':''}>${htmlText(s.name)}${stageOrder(s.stageId)<stageOrder(policy.stageId)?' (종료)':''}</option>`).join('');select.value=allowed.has(candidate)?candidate:policy.stageId;
 select.disabled=!policy.canChange;
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
 <div class="stage-group" aria-label="실제 생육단계"><div class="field"><label for="stageId">해당 날짜의 실제 생육단계 <span class="required">*</span></label><select class="ctrl" id="stageId"></select></div></div>
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
 config=clone(sampleData);config.header.currentUser=member;
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
 cycleFilters={status:'all',greenhouse:'all',crop:'all',variety:'all',periodType:'planned',from:'',to:''};ghFilters={name:'',type:'all',cover:'all',medium:'all'};envFilters={cycle:'all',from:'',to:'',comparison:'all'};
 issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
 showAccount(member);loadStandards();loadGreenhouseExtras();loadCycleExtras();loadIssueExtras();loadSaved();render();
 if(main)main.focus();
}
// Additional modules: cycle plans and measured greenhouse environment.
let selectedCycleId=null,selectedMeasurementId=null,cycleListPage=1,environmentListPage=1;
let cycleFilters={status:'all',greenhouse:'all',crop:'all',variety:'all',periodType:'planned',from:'',to:''},envFilters={cycle:'all',from:'',to:'',comparison:'all'};
const formatAt=x=>x?String(x).replace('T',' ').slice(0,16):'—';
const dateFrom=x=>String(x||'').slice(0,10);
const getSelectedCycle=()=>config.cycles.find(c=>c.cycleId===selectedCycleId)||config.cycles[0];
const getReading=id=>config.environmentChanges.find(s=>s.environmentChangeId===id)||config.environmentChanges[0];
const stdSet=id=>config.standardSets.find(x=>x.id===id)||config.standardSets[0];
const getCriteria=(cycle,stageId)=>{const standard=stdSet(cycle?.environmentStandardSetId);return config.stageEnvironmentalCriteria.find(x=>x.varietyId===standard.varietyId&&x.stageId===stageId)};
const fmtVal=v=>v===null||v===undefined?'—':String(v);
const CYCLE_SEED_REV='2026-11-18-v2';
function storeCycleExtras(){try{localStorage.setItem(storageKey("cycles"),JSON.stringify({seedRev:CYCLE_SEED_REV,cycles:config.cycles}))}catch{}}
function loadCycleExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey("cycles"))||'null');if(Array.isArray(saved?.cycles)){
  const valid=saved.cycles.filter(c=>c&&c.cycleId&&c.greenhouseId&&c.environmentStandardSetId).map(c=>({...c,stageHistory:Array.isArray(c.stageHistory)?c.stageHistory:[]}));
  if(saved.seedRev!==CYCLE_SEED_REV){
   const seedIds=new Set(sampleData.cycles.map(s=>s.cycleId));
   const customCycles=valid.filter(c=>!seedIds.has(c.cycleId));
   config.cycles=[...clone(sampleData.cycles),...customCycles];
   storeCycleExtras();
   return;
  }
  config.cycles=valid;
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
function renderCycleList(){let list=config.cycles.filter(c=>{
  if(!(cycleFilters.status==='all'||c.status===cycleFilters.status))return false;
  if(!(cycleFilters.greenhouse==='all'||c.greenhouseId===cycleFilters.greenhouse))return false;
  if(!(cycleFilters.crop==='all'||c.cropId===cycleFilters.crop))return false;
  if(!(cycleFilters.variety==='all'||c.varietyId===cycleFilters.variety))return false;
  if(cycleFilters.from||cycleFilters.to){
   const s=cycleFilters.periodType==='actual'?dateFrom(c.actualStartAt):dateFrom(c.plannedStartAt);
   const e=cycleFilters.periodType==='actual'?(dateFrom(c.actualEndAt)||(s?today():'')):dateFrom(c.expectedEndAt);
   if(!s)return false;
   if(cycleFilters.from&&(e||s)<cycleFilters.from)return false;
   if(cycleFilters.to&&s>cycleFilters.to)return false;
  }
  return true;
 }).sort((a,b)=>(b.plannedStartAt||'').localeCompare(a.plannedStartAt||''));
 const usedCropIds=new Set(config.cycles.map(c=>c.cropId)),usedVarIds=new Set(config.cycles.map(c=>c.varietyId));const crops=config.crops.filter(c=>usedCropIds.has(c.cropId)).map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(cycleFilters.crop==='all'||c.cropId===cycleFilters.crop)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({...v,cropId:c.cropId})));
 const size=config.pagination.cyclePageSize||5;cycleListPage=Math.min(Math.max(1,cycleListPage),Math.max(1,Math.ceil(list.length/size)));let from=(cycleListPage-1)*size,rows=list.slice(from,from+size);
 const cycleTone={'진행':'bg-light-success','미진행':'bg-light-information','종료':'bg-light-gray'};
 main.innerHTML=moduleHeading('작기계획 목록')+unifiedListPanel({
  title:'작기계획 목록',
  count:list.length,
  actionHtml:'<button type="button" class="btn main xs" id="cycleCreate">+ 작기계획 등록</button>',
  filterHtml:`${listFilterField('cycleFilterGH','온실',`<select class="ctrl" id="cycleFilterGH">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],cycleFilters.greenhouse)}</select>`)}${listFilterField('cycleFilterState','작기 상태',`<select class="ctrl" id="cycleFilterState">${options(['all','미진행','진행','종료'].map(s=>({value:s,label:s==='all'?'전체 상태':s})),cycleFilters.status)}</select>`)}${listFilterField('cycleFilterCrop','품목',`<select class="ctrl" id="cycleFilterCrop">${options([{value:'all',label:'전체 품목'},...crops],cycleFilters.crop)}</select>`)}${listFilterField('cycleFilterVariety','품종',`<select class="ctrl" id="cycleFilterVariety">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],cycleFilters.variety)}</select>`)}${listFilterField('cycleFilterPeriodType','조회 기간',`<div class="cycle-period-inline"><select class="ctrl cycle-period-select" id="cycleFilterPeriodType" aria-label="기간 기준">${options([{value:'planned',label:'계획 기간'},{value:'actual',label:'실제 기간'}],cycleFilters.periodType)}</select><input type="date" class="ctrl" id="cycleFilterFrom" value="${cycleFilters.from}" aria-label="조회 시작일"><span class="env-date-tilde" aria-hidden="true">~</span><input type="date" class="ctrl" id="cycleFilterTo" value="${cycleFilters.to}" aria-label="조회 종료일"></div>`,'is-span-3')}<button type="button" class="btn main list-search-btn" id="cycleDoFilter">검색</button>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table module-table cycle-table"><thead><tr><th class="row-index">번호</th><th>작기계획명</th><th>온실</th><th>품목</th><th>품종</th><th>계획 기간</th><th>실제 기간</th><th>작기 상태</th></tr></thead><tbody>${rows.map((c,i)=>{const planText=`${dateFrom(c.plannedStartAt)||'—'} ~ ${dateFrom(c.expectedEndAt)||'—'}`;const actualText=c.actualStartAt?`${dateFrom(c.actualStartAt)} ~ ${dateFrom(c.actualEndAt)||'진행 중'}`:'미시작';return `<tr><td class="row-index">${list.length-from-i}</td><td><button class="linkbtn" data-cycle-detail="${c.cycleId}">${htmlText(c.name)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'—')}</td><td>${htmlText(cropOf(c)?.name||'—')}</td><td>${htmlText(varietyOf(c)?.name||'—')}</td><td class="col-date">${htmlText(planText)}</td><td class="col-date">${htmlText(actualText)}</td><td>${statusBadge(cycleStatus(c),cycleTone)}</td></tr>`}).join('')||'<tr><td colspan="8" class="empty">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:pageControls(list.length,cycleListPage,size,'작기계획')
 });
 $('#cycleFilterCrop').onchange=()=>{const sel=$('#cycleFilterCrop').value;const possible=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(sel==='all'||c.cropId===sel)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({value:v.varietyId,label:v.name})));const vEl=$('#cycleFilterVariety');const old=vEl.value;vEl.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#cycleDoFilter').onclick=()=>{const from=$('#cycleFilterFrom').value,to=$('#cycleFilterTo').value;if(from&&to&&from>to){toast('조회 시작일과 종료일을 확인하세요.');return}cycleFilters={status:$('#cycleFilterState').value,greenhouse:$('#cycleFilterGH').value,crop:$('#cycleFilterCrop').value,variety:$('#cycleFilterVariety').value,periodType:$('#cycleFilterPeriodType').value,from,to};cycleListPage=1;renderCycleList()};$('#cycleCreate').onclick=()=>go('cycle-create');
 $$('[data-cycle-detail]').forEach(b=>b.onclick=()=>go('cycle-detail',b.dataset.cycleDetail));bindPages('',()=>cycleListPage,v=>cycleListPage=v,list.length,size,renderCycleList);
}
const stdMetricCols=[['dayTempC','주간 온도(°C)'],['nightTempC','야간 온도(°C)'],['humidityPct','습도(%RH)'],['co2Ppm','CO₂(ppm)'],['solarWm2','일사량(W/m²)'],['lightUmolM2S','광도(μmol/m²/s)'],['substrateTempC','배지 온도(°C)'],['substrateMoisturePct','배지 수분(%)'],['substrateEcMsCm','배지 EC(mS/cm)'],['substratePh','배지 pH']];
function stageRows(c){const stages=config.growthStages.map(s=>{const k=getCriteria(c,s.stageId);
 const range=k?.thresholds||{};
 return `<tr><td>${s.order}단계 · ${htmlText(s.name)}</td><td>${k?.standardDays??'—'}일</td>${stdMetricCols.map(([key])=>`<td class="tnum">${range[key]?.join(' ~ ')||'—'}</td>`).join('')}</tr>`;});return stages.join('')}
function renderCycleDetail(){const c=getSelectedCycle();if(!c){go('cycle-list');return}
 const ghName=gh(c.greenhouseId)?.name||'—',cropLabel=`${cropOf(c)?.name||'—'} · ${varietyOf(c)?.name||'—'}`;
 const planPeriod=`${dateFrom(c.plannedStartAt)||'—'} ~ ${dateFrom(c.expectedEndAt)||'—'}`;
 const actualPeriod=c.actualStartAt?`${dateFrom(c.actualStartAt)} ~ ${dateFrom(c.actualEndAt)||'진행 중'}`:'미시작';
 const facts=[['온실',ghName],['품목 · 품종',cropLabel],['계획 기간',planPeriod],['실제 기간',actualPeriod]];
 if(c.status==='종료'||c.endReason)facts.push(['종료 사유',c.endReason||'—']);
 const factsHtml=`<dl class="profile-facts facts-2col">${facts.map(([a,b])=>`<dt>${htmlText(a)}</dt><dd>${htmlText(b)}</dd>`).join('')}</dl>`;
 const hasActiveInGh=cycleStatus(c)==='미진행'&&config.cycles.some(other=>other.cycleId!==c.cycleId&&other.greenhouseId===c.greenhouseId&&cycleStatus(other)==='진행');
 const activeNotice=hasActiveInGh?`<div class="cycle-active-notice" role="status">현재 <strong>${htmlText(ghName)}</strong>에 진행 중인 작기가 있어, 기존 작기를 종료한 뒤 시작할 수 있습니다.</div>`:'';
 main.innerHTML=moduleHeading('작기계획 상세','')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><div class="panel-head-title"><h2>${htmlText(c.name)}</h2>${statusBadge(cycleStatus(c),{'진행':'bg-light-success','미진행':'bg-light-information','종료':'bg-light-gray'})}</div><span class="counter">등록일 ${htmlText(dateFrom(c.registeredAt)||'—')}</span></div><div class="panel-body">${factsHtml}</div></section>
 <section class="panel" style="margin-top:12px"><div class="panel-head"><h2>생육단계별 환경기준</h2><span class="counter">${htmlText(cropLabel)} 기준</span></div><div class="tablewrap"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th>${stdMetricCols.map(([,lbl])=>`<th>${htmlText(lbl)}</th>`).join('')}</tr></thead><tbody>${stageRows(c)}</tbody></table></div></section></div>
 <section class="panel hidden" id="cycleStartPanel"><div class="panel-head"><h2>작기 실제 시작일 등록</h2></div><div class="panel-body"><div class="filterbar"><div class="field"><label for="cycleStartTime">실제 시작일 *</label><input class="ctrl" type="date" id="cycleStartTime"></div><button class="btn" type="button" id="cycleStartCancel">취소</button><button class="btn main" type="button" id="cycleStartConfirm">작기 시작 확정</button></div></div></section>
 <section class="panel hidden" id="cycleEndPanel"><div class="panel-head"><h2>작기 종료</h2></div><div class="panel-body"><div class="module-input-grid"><div class="field"><label for="cycleEndTime">실제 종료일 *</label><input class="ctrl" type="date" id="cycleEndTime"></div><div class="field wide"><label for="cycleEndReason">종료 사유</label><textarea class="ctrl textarea" id="cycleEndReason" placeholder="종료 사유를 입력하세요"></textarea></div></div><div class="dialog-actions"><button class="btn" type="button" id="cycleEndCancel">취소</button><button class="btn main" type="button" id="cycleEndConfirm">종료 확정</button></div></div></section>
 <section class="panel hidden" id="cycleDeleteConfirm"><div class="panel-body" style="display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>미진행 상태의 작기계획을 삭제하시겠습니까?</span><button type="button" class="btn" id="cycleDeleteCancel">취소</button><button type="button" class="btn danger" id="cycleDeleteOk">삭제 확인</button></div></section>
 ${activeNotice}<div class="module-actions"><div class="module-actions-left"><button class="btn" id="cycleToList">목록</button></div>${cycleStatus(c)==='미진행'?`<button class="btn danger" id="cycleDelete">삭제</button><button class="btn" id="cycleToEdit">작기계획 수정</button><button class="btn main" id="cycleStart"${hasActiveInGh?' disabled':''}>작기 시작</button>`:''}${cycleStatus(c)==='진행'?'<button class="btn main" id="cycleEnd">작기 종료</button>':''}</div>`;
 bindModuleBack();$('#cycleToList').onclick=()=>go('cycle-list');if($('#cycleToEdit'))$('#cycleToEdit').onclick=()=>go('cycle-edit');
 if($('#cycleDelete'))$('#cycleDelete').onclick=()=>$('#cycleDeleteConfirm').classList.remove('hidden');
 if($('#cycleDeleteCancel'))$('#cycleDeleteCancel').onclick=()=>$('#cycleDeleteConfirm').classList.add('hidden');
 if($('#cycleDeleteOk'))$('#cycleDeleteOk').onclick=()=>{if(cycleStatus(c)!=='미진행'){toast('미진행 상태의 작기계획만 삭제할 수 있습니다.');return}config.cycles=config.cycles.filter(x=>x.cycleId!==c.cycleId);storeCycleExtras();toast('작기계획을 삭제했습니다.');go('cycle-list')};
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
function renderCycleEditor(edit){if(!config.greenhouses.length){main.innerHTML=moduleHeading('작기계획 등록','등록된 온실이 없습니다.','작기계획 목록으로','cycle-list');bindModuleBack();return}const c=edit?getSelectedCycle():null;if(edit&&c&&cycleStatus(c)!=='미진행'){toast('미진행 상태의 작기만 수정할 수 있습니다.');go('cycle-detail',c.cycleId);return}const def={cycleId:'',name:'',greenhouseId:config.greenhouses[0].greenhouseId,cropId:config.crops[0]?.cropId||'',varietyId:config.crops[0]?.varieties[0]?.varietyId||'',plannedStartAt:`${today()}T00:00:00`,expectedEndAt:'2027-03-01T23:59:59',environmentStandardSetId:config.standardSets[0]?.id||''};const row=c||def;const hasData=!!(c&&diaryRows.some(d=>d.cycleId===c.cycleId));
 main.innerHTML=moduleHeading(edit?'작기계획 수정':'작기계획 등록','')+`<form class="module-form panel" id="cycleForm" novalidate><div class="panel-head"><h2>작기 기본 정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid cycle-basic-grid">
 <div class="field"><label for="cycleName">작기계획명 *</label><input class="ctrl" id="cycleName" maxlength="80" value="${htmlText(row.name)}" placeholder="예: 2026년 가을 4차 작기"></div>
 <div class="field"><label for="cycleGreenhouse">온실 *</label><select class="ctrl" id="cycleGreenhouse" ${hasData?'disabled':''}>${options(config.greenhouses.map(x=>({value:x.greenhouseId,label:x.registeredArea!=null?`${x.name} (${Number(x.registeredArea).toLocaleString()}㎡)`:x.name})),row.greenhouseId)}</select></div>
 <div class="field"><label for="cyclePlanStart">계획 시작일 *</label><input type="date" class="ctrl" id="cyclePlanStart" value="${dateFrom(row.plannedStartAt)}"></div>
 <div class="field"><label for="cycleExpectedEnd">예상 종료일 *</label><input type="date" class="ctrl" id="cycleExpectedEnd" value="${dateFrom(row.expectedEndAt)}"></div>
 </div><div class="subsection"><div class="subsection-head"><h3>생육단계별 환경기준</h3><span class="counter" id="cycleStdHint"></span></div><div class="module-input-grid cycle-crop-bar"><div class="field"><label for="cycleCrop">재배 품목 *</label><select class="ctrl" id="cycleCrop" ${hasData?'disabled':''}></select></div><div class="field"><label for="cycleVariety">재배 품종 *</label><select class="ctrl" id="cycleVariety" ${hasData?'disabled':''}></select></div>${hasData?'':'<div class="field cycle-load-action"><button type="button" class="btn" id="cycleLoadStdBtn">환경기준 불러오기</button></div>'}</div><div class="tablewrap" style="margin-top:14px"><table class="data-table module-table"><thead><tr><th>생육단계</th><th>기준 기간</th>${stdMetricCols.map(([,lbl])=>`<th>${htmlText(lbl)}</th>`).join('')}</tr></thead><tbody></tbody></table></div></div>
 <div class="errorbox hidden" id="cycleFormError" role="alert"></div></div><div class="module-actions inside"><button type="button" class="btn" id="cycleCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'작기계획 등록'}</button></div></form>`;
 const allPairs=config.crops.flatMap(cr=>cr.varieties.map(v=>({cropId:cr.cropId,cropName:cr.name,varietyId:v.varietyId,varietyName:v.name})));
 let curCropId=row.cropId||allPairs[0]?.cropId||'';
 let curVarietyId=row.varietyId||allPairs[0]?.varietyId||'';
 let standardsLoaded=!!edit;
 const getSetForVariety=vid=>config.standardSets.find(x=>x.varietyId===vid)||config.standardSets[0];
 const paintStandards=()=>{
  const standard=getSetForVariety(curVarietyId);
  const hintEl=$('#cycleStdHint');
  if(hintEl){
   const cr=config.crops.find(x=>x.cropId===curCropId);
   const vr=cr?.varieties.find(v=>v.varietyId===curVarietyId);
   hintEl.textContent=standardsLoaded&&cr&&vr?`${cr.name} · ${vr.name} 기준`:'';
  }
  const loadBtn=$('#cycleLoadStdBtn');
  if(loadBtn){
   loadBtn.classList.toggle('main',!standardsLoaded);
  }
  if(!standardsLoaded){
   $('#cycleForm tbody').innerHTML=`<tr><td colspan="12" class="empty" style="padding:24px 12px">불러온 환경기준이 없습니다.</td></tr>`;
   return;
  }
  $('#cycleForm tbody').innerHTML=config.growthStages.map(stage=>{
   const criterion=standard?getCriteria({...row,environmentStandardSetId:standard.id},stage.stageId):null;
   const ranges=criterion?.thresholds||{};
   return `<tr><td>${stage.order}단계 · ${htmlText(stage.name)}</td><td>${criterion?.standardDays??'—'}일</td>${stdMetricCols.map(([key])=>`<td class="tnum">${ranges[key]?.join(' ~ ')||'—'}</td>`).join('')}</tr>`;
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
 $('#cycleCrop').onchange=()=>{curCropId=$('#cycleCrop').value;curVarietyId='';standardsLoaded=false;syncSelectors()};
 $('#cycleVariety').onchange=()=>{curVarietyId=$('#cycleVariety').value;standardsLoaded=false;paintStandards()};
 if($('#cycleLoadStdBtn'))$('#cycleLoadStdBtn').onclick=()=>{standardsLoaded=true;paintStandards();toast('선택한 품목·품종의 생육단계별 환경기준을 불러왔습니다.')};
 syncSelectors();
 bindModuleBack();$('#cycleCancel').onclick=()=>go(edit?'cycle-detail':'cycle-list');$('#cycleForm').onsubmit=e=>{e.preventDefault();const name=$('#cycleName').value.trim(),ghId=$('#cycleGreenhouse').value,start=$('#cyclePlanStart').value,end=$('#cycleExpectedEnd').value;
 const standard=getSetForVariety(curVarietyId);
 const errors=[];if(!name)errors.push('작기계획명을 입력하세요.');if(!ghId)errors.push('온실을 선택하세요.');if(!curVarietyId||!standard)errors.push('재배 품목과 품종을 선택하세요.');if(!standardsLoaded)errors.push('환경기준 불러오기를 먼저 진행하세요.');if(!start||!end||start>end)errors.push('계획 시작일과 예상 종료일을 확인하세요.');if(config.cycles.some(x=>x.name===name&&x.cycleId!==c?.cycleId))errors.push('동일한 작기계획명이 존재합니다.');
 if(errors.length){$('#cycleFormError').textContent=errors.join(' ');$('#cycleFormError').classList.remove('hidden');return}
 const startAt=`${dateFrom(start)}T00:00:00`,endAt=`${dateFrom(end)}T23:59:59`;
 if(edit){if(cycleStatus(c)!=='미진행'||(c.memberId&&c.memberId!==config.header.currentUser.id)){toast('미진행 상태의 본인 작기계획만 수정할 수 있습니다.');return}Object.assign(c,{name,greenhouseId:ghId,cropId:curCropId,varietyId:curVarietyId,environmentStandardSetId:standard.id,plannedStartAt:startAt,expectedEndAt:endAt,updatedAt:`${today()}T${new Date().toTimeString().slice(0,8)}`});storeCycleExtras();toast('작기계획을 수정했습니다.');go('cycle-detail',c.cycleId)}else{
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
const envShortLabel=l=>(l||'').replace('온실 내부 ','').replace(' 측정값','');
function envLatestSummary(cycleRows){
 const latest=cycleRows.slice().sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt))[0];
 if(!latest)return '';
 const fields=config.measurementFields||[];
 const airKeys=['insideTempC','humidityPct','co2Ppm','solarWm2','lightUmolM2S'];
 const subKeys=['substrateTempC','substrateMoisturePct','substrateEcMsCm','substratePh'];
 const iconMap={
  insideTempC:'<path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0Z"/>',
  humidityPct:'<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  co2Ppm:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  solarWm2:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  lightUmolM2S:'<path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M18 12h3M16.3 7.7l2.1-2.1M8 14a4 4 0 1 1 8 0c0 1.6-1 2.6-1.5 3.5H9.5C9 16.6 8 15.6 8 14Z"/><path d="M10 21h4"/>',
  substrateTempC:'<path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0Z"/>',
  substrateMoisturePct:'<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  substrateEcMsCm:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  substratePh:'<path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/>'
 };
 const card=(f,groupCls)=>{
  if(!f)return '';
  const v=latest[f.key];
  const empty=v===null||v===undefined;
  const svg=`<svg class="env-kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconMap[f.key]||''}</svg>`;
  return `<div class="env-kpi-card ${groupCls}"><div class="env-kpi-top">${svg}<span class="env-kpi-label">${htmlText(envShortLabel(f.label))}</span></div><strong class="env-kpi-value${empty?' is-empty':''}">${empty?'미측정':`${htmlText(String(v))}<small>${htmlText(f.unit)}</small>`}</strong></div>`;
 };
 const airCards=airKeys.map(k=>card(fields.find(f=>f.key===k),'is-air')).join('');
 const subCards=subKeys.map(k=>card(fields.find(f=>f.key===k),'is-sub')).join('');
 const ghSvg=`<svg class="env-gh-bg" viewBox="0 0 1200 220" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M80 185V92c0-42 64-72 160-72h720c96 0 160 30 160 72v93" stroke="#1f7a4c" stroke-opacity="0.14" stroke-width="2"/><path d="M80 96h1040M240 20v165M420 20v165M600 20v165M780 20v165M960 20v165" stroke="#1f7a4c" stroke-opacity="0.09" stroke-width="1.5"/><path d="M140 62c60-18 120 18 180 0s120 18 180 0 120 18 180 0 120 18 180 0 120 18 180 0" stroke="#2563eb" stroke-opacity="0.11" stroke-width="1.5" stroke-dasharray="6 6"/><circle cx="1040" cy="48" r="18" stroke="#d97706" stroke-opacity="0.18" stroke-width="1.5"/><path d="M60 190h1080M90 204h1020" stroke="#b46914" stroke-opacity="0.16" stroke-width="2" stroke-dasharray="10 6"/></svg>`;
 return `<section class="panel env-latest-panel is-svg-iot" aria-label="최근 측정 현황"><div class="panel-head"><div class="panel-head-title"><h2>최근 측정 현황</h2><span class="iot-live-pill"><span class="iot-live-dot" aria-hidden="true"></span>실시간 센서</span></div><span class="counter">기준 시각 ${htmlText(formatAt(latest.measuredAt))}</span></div><div class="panel-body env-kpi-groups">${ghSvg}<div class="env-kpi-grid cols-5">${airCards}</div><div class="env-kpi-grid cols-4">${subCards}</div></div></section>`;
}
function envLineChart(rows){
 const fields=config.measurementFields||[];
 const field=fields.find(f=>f.key===envChartKey)||fields[0]||{key:'insideTempC',label:'온실 내부 온도 측정값',unit:'°C'};
 const hasRange=Boolean(envFilters.from||envFilters.to);
 const sortedAll=rows.slice().sort((a,b)=>a.measuredAt.localeCompare(b.measuredAt));
 const targetDate=!hasRange?(sortedAll.some(r=>dateFrom(r.measuredAt)===today())?today():dateFrom(sortedAll.at(-1)?.measuredAt||'')):'';
 const scoped=targetDate?sortedAll.filter(r=>dateFrom(r.measuredAt)===targetDate):sortedAll;
 const pts=scoped.filter(r=>r[field.key]!==null&&r[field.key]!==undefined);
 let body='<p class="empty" style="padding:20px">그래프에 표시할 측정값이 없습니다.</p>';
 if(pts.length){
  const vals=pts.map(r=>Number(r[field.key]));
  let min=Math.min(...vals),max=Math.max(...vals);
  if(min===max){min-=1;max+=1}
  const padL=48,padR=20,padT=16,padB=28,w=1080,h=230,pw=w-padL-padR,ph=h-padT-padB;
  const xAt=i=>pts.length===1?padL+pw/2:padL+(i/(pts.length-1))*pw;
  const yAt=v=>padT+ph-((v-min)/(max-min))*ph;
  const coords=pts.map((r,i)=>({x:xAt(i),y:yAt(Number(r[field.key])),r}));
  const poly=coords.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPoly=`${coords[0].x.toFixed(1)},${(padT+ph).toFixed(1)} ${poly} ${coords.at(-1).x.toFixed(1)},${(padT+ph).toFixed(1)}`;
  const mid=((min+max)/2).toFixed(1);
  const grid=[min,(min+max)/2,max].map((v,idx)=>`<line x1="${padL}" y1="${yAt(v).toFixed(1)}" x2="${w-padR}" y2="${yAt(v).toFixed(1)}" stroke="#e1eae5" stroke-dasharray="${idx===0?'none':'3 3'}"/><text x="${padL-8}" y="${(yAt(v)+4).toFixed(1)}" text-anchor="end" font-size="11" fill="#64748b">${idx===1?mid:v.toFixed(1)}</text>`).join('');
  const dots=coords.map((p,i)=>{
   const isLast=i===coords.length-1;
   const title=`${formatAt(p.r.measuredAt)} : ${p.r[field.key]} ${htmlText(field.unit)}`;
   return isLast
    ?`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" fill="rgba(31,122,76,0.16)"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.2" fill="#1f7a4c" stroke="#ffffff" stroke-width="1.5"><title>${title}</title></circle>`
    :`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.6" fill="#ffffff" stroke="#1f7a4c" stroke-width="2"><title>${title}</title></circle>`;
  }).join('');
  const singleDay=Boolean(targetDate)||(pts.length>0&&dateFrom(pts[0].measuredAt)===dateFrom(pts.at(-1).measuredAt));
  const xTickIdxs=[0,0.25,0.5,0.75,1].map(r=>Math.round((pts.length-1)*r)).filter((v,i,a)=>a.indexOf(v)===i);
  const xLabels=xTickIdxs.map(i=>`<text x="${xAt(i).toFixed(1)}" y="${h-7}" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}" font-size="11" fill="#64748b">${singleDay?formatAt(pts[i].measuredAt).slice(11,16):formatAt(pts[i].measuredAt).slice(5)}</text>`).join('');
  body=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${htmlText(envShortLabel(field.label))} 추이 그래프"><defs><linearGradient id="envAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f7a4c" stop-opacity="0.22"/><stop offset="100%" stop-color="#1f7a4c" stop-opacity="0.01"/></linearGradient></defs>${grid}<polygon fill="url(#envAreaGrad)" points="${areaPoly}"/><polyline fill="none" stroke="#1f7a4c" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round" points="${poly}"/>${dots}${xLabels}</svg>`;
 }
 const scopeLabel=targetDate?`${targetDate===today()?`오늘 ${targetDate}`:targetDate} · 1시간 단위`:`${envFilters.from||'시작'} ~ ${envFilters.to||'종료'} · 1시간 단위`;
 return `<div class="env-chart-toolbar"><div class="env-chart-meta"><span class="env-chart-badge">${htmlText(envShortLabel(field.label))} (${htmlText(field.unit)})</span><span class="counter">${htmlText(scopeLabel)} · 총 ${pts.length}건</span></div></div><div class="panel-body env-chart-body">${body}</div>`;
}
function issueSummaryStrip(rows,activeStatus){
 const items=[
  {key:'all',label:'전체',tone:'is-neutral',count:rows.length},
  {key:'발생',label:'미조치(발생)',tone:'is-danger',count:rows.filter(r=>r.status==='발생').length},
  {key:'조치중',label:'조치중',tone:'is-warning',count:rows.filter(r=>r.status==='조치중').length},
  {key:'조치 완료',label:'조치 완료',tone:'is-success',count:rows.filter(r=>r.status==='조치 완료').length}
 ];
 return `<div class="issue-status-tabs" role="tablist" aria-label="조치 상태별 보기">${items.map(x=>`<button type="button" role="tab" aria-selected="${activeStatus===x.key}" class="issue-status-tab ${x.tone}${activeStatus===x.key?' is-active':''}" data-issue-status-card="${x.key}"><span>${x.label}</span><strong>${x.count}</strong></button>`).join('')}</div>`;
}
function cycleTimelineChart(c){
 const startMs=new Date(c.plannedStartAt||today()).getTime(),endMs=new Date(c.expectedEndAt||today()).getTime();
 const nowMs=c.actualEndAt?new Date(c.actualEndAt).getTime():new Date(today()+'T23:59:59').getTime();
 const totalMs=Math.max(1,endMs-startMs);
 const pct=c.status==='미진행'?0:c.status==='종료'?100:Math.max(0,Math.min(100,Math.round(((nowMs-startMs)/totalMs)*100)));
 const stages=config.growthStages.map((st,i)=>{
  const k=getCriteria(c,st.stageId);const days=k?.standardDays||20;
  const eff=c.stageHistory.find(h=>h.stageId===st.stageId);
  const startDate=eff?.effectiveDate||(st.order===1&&c.actualStartAt?dateFrom(c.actualStartAt):'');
  return {name:st.name,days,cls:`s${i+1}`,date:startDate||'미시작'};
 });
 const sumDays=stages.reduce((a,x)=>a+x.days,0)||1;
 return `<section class="panel chart-section"><div class="panel-head"><h2>작기 일정 · 생육단계 진행</h2><span class="counter">계획 기간 대비 작기 진행률 ${pct}%</span></div><div class="panel-body"><div class="timeline-meta"><span>계획 시작: ${dateFrom(c.plannedStartAt)||'—'}</span><span>예상 종료: ${dateFrom(c.expectedEndAt)||'—'}</span></div><div class="bar-track" style="height:10px;margin:6px 0 12px"><div class="bar-fill" style="width:${pct}%"></div></div><div class="timeline-bar">${stages.map(x=>`<div class="timeline-seg ${x.cls}" style="width:${((x.days/sumDays)*100).toFixed(1)}%" title="${htmlText(x.name)} (${x.days}일)">${htmlText(x.name)}</div>`).join('')}</div><div class="timeline-meta">${stages.map(x=>`<span>${htmlText(x.name)} 시작일: ${htmlText(x.date)}</span>`).join('')}</div></div></section>`;
}
function cycleContextBar(ghSelectId,cycleSelectId,cycles,selected){
 const ghMap=new Map();
 for(const c of cycles){if(!ghMap.has(c.greenhouseId))ghMap.set(c.greenhouseId,{value:c.greenhouseId,label:gh(c.greenhouseId)?.name||'—'})}
 const ghList=[...ghMap.values()];
 const ghCycles=cycles.filter(c=>c.greenhouseId===selected.greenhouseId).sort((a,b)=>(cycleStatus(a)==='진행'?0:cycleStatus(a)==='종료'?1:2)-(cycleStatus(b)==='진행'?0:cycleStatus(b)==='종료'?1:2)||(b.actualStartAt||'').localeCompare(a.actualStartAt||''));
 const st=cycleStatus(selected);
 const tone={'진행':'bg-light-success','미진행':'bg-light-information','종료':'bg-light-gray'};
 return `<section class="panel context-bar-panel" aria-label="조회 온실 및 작기 선택"><div class="panel-body context-bar"><div class="context-bar-fields"><div class="context-bar-select"><label for="${ghSelectId}">온실</label><select id="${ghSelectId}" class="ctrl">${options(ghList,selected.greenhouseId)}</select></div><div class="context-bar-select"><label for="${cycleSelectId}">작기계획</label><select id="${cycleSelectId}" class="ctrl">${options(ghCycles.map(c=>({value:c.cycleId,label:`${c.name} (${cycleStatus(c)})`})),selected.cycleId)}</select></div></div><div class="context-bar-meta">${statusBadge(st,tone)}<span>${htmlText(cropOf(selected)?.name||'—')} (${htmlText(varietyOf(selected)?.name||'—')})</span></div></div></section>`;
}
function bindCycleContextBar(ghSelectId,cycleSelectId,cycles,onChange){
 const pickForGh=ghId=>{
  const sorted=cycles.filter(c=>c.greenhouseId===ghId).sort((a,b)=>(cycleStatus(a)==='진행'?0:cycleStatus(a)==='종료'?1:2)-(cycleStatus(b)==='진행'?0:cycleStatus(b)==='종료'?1:2)||(b.actualStartAt||'').localeCompare(a.actualStartAt||''));
  return sorted[0]?.cycleId||'';
 };
 $(`#${ghSelectId}`).onchange=()=>{const nextId=pickForGh($(`#${ghSelectId}`).value);if(nextId)onChange(nextId)};
 $(`#${cycleSelectId}`).onchange=()=>onChange($(`#${cycleSelectId}`).value);
}
let envViewTab='chart';
function renderEnvList(){
 const envCycles=config.cycles.filter(c=>['진행','종료'].includes(cycleStatus(c)));
 let selectedCycle=envCycles.find(c=>c.cycleId===envFilters.cycle);
 if(!selectedCycle){
  selectedCycle=envCycles.find(c=>config.environmentChanges.some(e=>e.cycleId===c.cycleId))||envCycles[0]||config.cycles[0];
  envFilters.cycle=selectedCycle?.cycleId||'';
 }
 if(!selectedCycle){
  main.innerHTML=moduleHeading('온실 환경변화 목록')+'<section class="panel list-section"><div class="panel-body"><p class="empty">조회할 작기계획이 없습니다.</p></div></section>';
  return;
 }
 const listCycles=envCycles.length?envCycles:config.cycles;
 const cycleAllRows=config.environmentChanges.filter(s=>s.cycleId===selectedCycle.cycleId);
 const rows=cycleAllRows.filter(s=>(!envFilters.from||dateFrom(s.measuredAt)>=envFilters.from)&&(!envFilters.to||dateFrom(s.measuredAt)<=envFilters.to)).sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt));
 const size=7;
 environmentListPage=Math.min(Math.max(1,environmentListPage),Math.max(1,Math.ceil(rows.length/size)));
 const from=(environmentListPage-1)*size,shown=rows.slice(from,from+size);
 const fields=config.measurementFields||[];
 const metricOptions=fields.map(f=>({value:f.key,label:f.unit==='pH'?envShortLabel(f.label):`${envShortLabel(f.label)} (${f.unit})`}));
 const tableCols=fields.map(f=>`<th>${htmlText(f.unit==='pH'?envShortLabel(f.label):`${envShortLabel(f.label)}(${f.unit})`)}</th>`).join('');
 const historyHead=`<div class="panel-head env-history-head">
  <div class="env-inline-tabs" role="tablist" aria-label="환경변화 보기 방식">
   <button type="button" class="env-inline-tab" role="tab" id="envTabChart" aria-selected="${envViewTab==='chart'}">그래프로 보기</button>
   <button type="button" class="env-inline-tab" role="tab" id="envTabTable" aria-selected="${envViewTab==='table'}">목록으로 보기</button>
  </div>
  <div class="env-history-controls">
   ${envViewTab==='chart'?`<label class="env-ctrl-field"><span>항목</span><select id="envChartMetric" class="ctrl">${options(metricOptions,envChartKey)}</select></label>`:''}
   <div class="env-period-filter">
    <label class="env-ctrl-field"><span>측정 기간</span><input type="date" class="ctrl" id="envFrom" value="${envFilters.from}" aria-label="측정 시작일"></label>
    <span class="env-date-tilde" aria-hidden="true">~</span>
    <input type="date" class="ctrl" id="envTo" value="${envFilters.to}" aria-label="측정 종료일">
    <button type="button" class="btn main env-search-btn" id="envDoFilter">검색</button>
   </div>
  </div>
 </div>`;
 const historyBody=envViewTab==='chart'
  ?envLineChart(rows)
  :`<div class="tablewrap"><table class="data-table module-table env-table"><thead><tr><th class="row-index">번호</th><th>측정일시</th>${tableCols}</tr></thead><tbody>${shown.map((r,i)=>`<tr><td class="row-index">${rows.length-from-i}</td><td>${formatAt(r.measuredAt)}</td>${fields.map(f=>`<td class="tnum">${fmtVal(r[f.key])}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="11" class="empty">해당 작기의 측정 기록이 없습니다.</td></tr>'}</tbody></table></div>${pageControls(rows.length,environmentListPage,size,'온실 환경변화')}`;
 main.innerHTML=moduleHeading('온실 환경변화 목록')+
 cycleContextBar('envGh','envCycle',listCycles,selectedCycle)+
 envLatestSummary(cycleAllRows)+
 `<section class="panel env-history-panel" aria-label="온실 환경변화 이력 조회">${historyHead}${historyBody}</section>`;
 bindCycleContextBar('envGh','envCycle',listCycles,nextId=>{envFilters.cycle=nextId;environmentListPage=1;renderEnvList()});
 $('#envDoFilter').onclick=()=>{
   const next={cycle:selectedCycle.cycleId,from:$('#envFrom').value,to:$('#envTo').value,comparison:'all'};
   if(next.from&&next.to&&next.from>next.to){toast('측정 시작일과 종료일을 확인하세요.');return}
   envFilters=next;environmentListPage=1;renderEnvList();
 };
 $('#envTabChart').onclick=()=>{envViewTab='chart';renderEnvList()};
 $('#envTabTable').onclick=()=>{envViewTab='table';renderEnvList()};
 if($('#envChartMetric'))$('#envChartMetric').onchange=e=>{envChartKey=e.target.value;renderEnvList()};
 bindPages('',()=>environmentListPage,v=>environmentListPage=v,rows.length,size,renderEnvList);
}
function renderEnvDetail(){
 page='env-list';updateNavigation();renderEnvList();
}

let selectedIssueId=null,issueListPage=1,issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
function storeIssueExtras(){try{localStorage.setItem(storageKey('issues'),JSON.stringify({issues:config.issueSamples}))}catch{}}
function loadIssueExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('issues'))||'null');if(Array.isArray(saved?.issues)&&saved.issues.length)config.issueSamples=saved.issues}catch{}}
function renderIssues(detail){
 const issues=config.issueSamples;
 const issueBadge=status=>statusBadge(status,{'발생':'bg-light-danger','조치중':'bg-light-warning','조치 완료':'bg-light-success'});
 if(detail){
  const issue=issues.find(item=>item.issueId===selectedIssueId)||issues[0];
  if(!issue){go('issue-list');return}
  selectedIssueId=issue.issueId;
  const cycle=getCycle(issue.cycleId);
  const facts=[
   ['온실',gh(cycle?.greenhouseId)?.name||'—'],
   ['작기계획',cycle?.name||'—'],
   ['이슈 유형',issue.issueType||'—'],
   ['발생 측정값',issue.issueValue??'—'],
   ['발생일시',formatAt(issue.occurredAt)],
   ['조치 완료일시',formatAt(issue.actionCompletedAt)]
  ];
  main.innerHTML=moduleHeading('온실 환경 이슈 상세','')+
  `<div class="module-scroll"><section class="panel" aria-label="이슈 발생 정보"><div class="panel-head"><div class="panel-head-title"><h2>${htmlText(issue.message||'이슈 상세')}</h2>${issueBadge(issue.status)}</div><span class="counter">${htmlText(issue.issueType)} · ${htmlText(String(issue.issueValue??'—'))}</span></div><div class="panel-body"><dl class="profile-facts facts-2col">${facts.map(([label,value])=>`<dt>${label}</dt><dd>${htmlText(value??'—')}</dd>`).join('')}</dl></div></section>
  <section class="panel" style="margin-top:12px" aria-label="조치 등록 및 상태 변경"><div class="panel-head"><h2>조치 등록 및 상태 변경</h2></div><div class="panel-body"><form id="issueActionForm" class="issue-action-form">
  <div class="field"><label for="issueNextStatus">조치 상태 *</label><select id="issueNextStatus" class="ctrl">${options(['발생','조치중','조치 완료'].map(v=>({value:v,label:v})),issue.status)}</select></div>
  <div class="field"><label for="issueActionInput">조치 내용</label><textarea id="issueActionInput" class="ctrl textarea" placeholder="조치 내용을 입력하세요 (조치 완료 시 필수)">${htmlText(issue.actionContent||'')}</textarea></div>
  <div class="module-actions"><div class="module-actions-left"><button type="button" class="btn" id="issueToList">목록</button></div><button type="submit" class="btn main">조치 저장</button></div></form></div></section></div>`;
  bindModuleBack();
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
 const choose=(id,label,items,selected)=>listFilterField(id,label,`<select id="${id}" class="ctrl">${options([all('전체'),...items],selected)}</select>`);
 const values=items=>[...new Set(items)].map(value=>({value,label:value}));
 const selectableCycles=config.cycles.filter(row=>['진행','종료'].includes(cycleStatus(row)));
 let selectedIssueCycle=selectableCycles.find(c=>c.cycleId===issueFilters.cycle);
 if(!selectedIssueCycle){
  selectedIssueCycle=selectableCycles.find(c=>issues.some(i=>i.cycleId===c.cycleId))||selectableCycles[0];
  issueFilters.cycle=selectedIssueCycle?.cycleId||'';
 }
 if(!selectedIssueCycle){
  main.innerHTML=moduleHeading('온실 환경 이슈 목록')+'<section class="panel list-section"><div class="panel-body"><p class="empty">조회할 작기계획이 없습니다.</p></div></section>';
  return;
 }
 const cycleIssues=issues.filter(item=>item.cycleId===selectedIssueCycle.cycleId);
 const statusRank=st=>st==='발생'?0:st==='조치중'?1:2;
 const rows=cycleIssues
  .filter(item=>(issueFilters.type==='all'||item.issueType===issueFilters.type)&&(issueFilters.status==='all'||item.status===issueFilters.status)&&(!issueFilters.from||dateFrom(item.occurredAt)>=issueFilters.from)&&(!issueFilters.to||dateFrom(item.occurredAt)<=issueFilters.to))
  .sort((a,b)=>statusRank(a.status)-statusRank(b.status)||b.occurredAt.localeCompare(a.occurredAt));
 const size=Number(config.pagination?.pageSize)||5;issueListPage=Math.min(Math.max(1,issueListPage),Math.max(1,Math.ceil(rows.length/size)));const fromIdx=(issueListPage-1)*size,pagedIssues=rows.slice(fromIdx,fromIdx+size);
 const ghMap=new Map();
 for(const c of selectableCycles){if(!ghMap.has(c.greenhouseId))ghMap.set(c.greenhouseId,{value:c.greenhouseId,label:gh(c.greenhouseId)?.name||'—'})}
 const ghList=[...ghMap.values()];
 const ghCycles=selectableCycles.filter(c=>c.greenhouseId===selectedIssueCycle.greenhouseId).sort((a,b)=>(cycleStatus(a)==='진행'?0:cycleStatus(a)==='종료'?1:2)-(cycleStatus(b)==='진행'?0:cycleStatus(b)==='종료'?1:2)||(b.actualStartAt||'').localeCompare(a.actualStartAt||''));
 main.innerHTML=moduleHeading('온실 환경 이슈 목록')+
 unifiedListPanel({
  title:'온실 환경 이슈 목록',
  count:rows.length,
  filterTag:'form',
  filterId:'issueFilters',
  filterHtml:`${listFilterField('issueGh','온실',`<select id="issueGh" class="ctrl">${options(ghList,selectedIssueCycle.greenhouseId)}</select>`)}${listFilterField('issueCycle','작기계획',`<select id="issueCycle" class="ctrl">${options(ghCycles.map(c=>({value:c.cycleId,label:`${c.name} (${cycleStatus(c)})`})),selectedIssueCycle.cycleId)}</select>`)}${choose('issueType','이슈 유형',values(['온도','습도','이산화탄소','일사량','광도','배지온도','배지수분량','배지 EC','배지 pH',...cycleIssues.map(item=>item.issueType)]),issueFilters.type)}${choose('issueStatus','조치 상태',values(['발생','조치중','조치 완료']),issueFilters.status)}${listFilterField('issueFrom','조회 기간',`<div class="cycle-date-range"><input id="issueFrom" class="ctrl" type="date" value="${issueFilters.from}" aria-label="시작일"><span class="env-date-tilde" aria-hidden="true">~</span><input id="issueTo" class="ctrl" type="date" value="${issueFilters.to}" aria-label="종료일"></div>`,'is-span-2')}<button class="btn main list-search-btn" type="submit">검색</button>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table module-table issue-table"><thead><tr><th class="row-index">번호</th><th class="col-type">이슈 유형</th><th>이슈 내용</th><th class="tnum col-val">발생 측정값</th><th class="col-date">발생일시</th><th class="col-status">조치 상태</th></tr></thead><tbody>${pagedIssues.map((item,i)=>`<tr><td class="row-index">${rows.length-fromIdx-i}</td><td class="col-type">${htmlText(item.issueType)}</td><td><button class="linkbtn" data-issue="${item.issueId}">${htmlText(item.message)}</button></td><td class="tnum col-val">${htmlText(String(item.issueValue??'—'))}</td><td class="col-date">${formatAt(item.occurredAt)}</td><td class="col-status">${issueBadge(item.status)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">조회된 이슈가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:pageControls(rows.length,issueListPage,size,'온실 환경 이슈')
 });
 bindCycleContextBar('issueGh','issueCycle',selectableCycles,nextId=>{issueFilters={cycle:nextId,type:'all',status:'all',from:'',to:''};issueListPage=1;renderIssues(false)});
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
function loadGreenhouseExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('greenhouses'))||'null');if(Array.isArray(saved?.greenhouses)&&saved.greenhouses.length)config.greenhouses=saved.greenhouses.map(g=>(g.imageUrl!==undefined&&!String(g.imageUrl||'').endsWith('.svg'))?g:{...g,imageUrl:sampleData.greenhouses.find(x=>x.greenhouseId===g.greenhouseId)?.imageUrl??null})}catch{}}
function renderGreenhouseList(){
 const rows=config.greenhouses.filter(g=>(!ghFilters.name||g.name.includes(ghFilters.name))&&(ghFilters.type==='all'||g.type===ghFilters.type)&&(ghFilters.cover==='all'||g.coverType===ghFilters.cover)&&(ghFilters.medium==='all'||g.mediumType===ghFilters.medium));
 const size=Number(config.pagination?.pageSize)||5;ghListPage=Math.min(Math.max(1,ghListPage),Math.max(1,Math.ceil(rows.length/size)));const from=(ghListPage-1)*size,paged=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('온실 정보')+unifiedListPanel({
  title:'온실 정보',
  count:rows.length,
  actionHtml:'<button type="button" class="btn main xs" id="ghCreate">+ 온실 등록</button>',
  filterHtml:`${listFilterField('ghFilterName','온실명',`<input class="ctrl" id="ghFilterName" value="${htmlText(ghFilters.name)}" placeholder="온실명을 입력하세요">`)}${listFilterField('ghFilterType','유형',`<select class="ctrl" id="ghFilterType">${options([{value:'all',label:'전체'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],ghFilters.type)}</select>`)}${listFilterField('ghFilterCover','피복형태',`<select class="ctrl" id="ghFilterCover">${options([{value:'all',label:'전체'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],ghFilters.cover)}</select>`)}${listFilterField('ghFilterMedium','배지형태',`<select class="ctrl" id="ghFilterMedium">${options([{value:'all',label:'전체'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],ghFilters.medium)}</select>`)}<button type="button" class="btn main list-search-btn" id="ghDoFilter">검색</button>`,
  bodyHtml:`<div class="panel-body">${paged.length?`<div class="gh-card-grid">${paged.map(g=>`<article class="gh-card"><button type="button" class="gh-card-media" data-gh-detail="${g.greenhouseId}" aria-label="${htmlText(g.name)} 상세 보기">${g.imageUrl?`<img src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진">`:`<div class="gh-card-placeholder"><span>등록된 사진 없음</span></div>`}</button><div class="gh-card-body"><div class="gh-card-head"><button type="button" class="linkbtn gh-card-title" data-gh-detail="${g.greenhouseId}">${htmlText(g.name)}</button>${g.type?`<span class="krds-badge bg-light-success">${htmlText(g.type)}</span>`:''}</div><dl class="gh-card-specs"><div><dt>피복형태</dt><dd>${htmlText(g.coverType||'—')}</dd></div><div><dt>동 수</dt><dd>${g.buildingCount!=null?`${g.buildingCount}동`:'—'}</dd></div><div><dt>등록 면적</dt><dd>${g.registeredArea!=null?`${g.registeredArea} ㎡`:'—'}</dd></div><div><dt>배지형태</dt><dd>${htmlText(g.mediumType||'—')}</dd></div></dl></div></article>`).join('')}</div>`:'<p class="empty" style="padding:40px 12px;margin:0">등록된 온실이 없습니다.</p>'}</div>`,
  footHtml:pageControls(rows.length,ghListPage,size,'온실 정보')
 });
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
 const facts=[
  ['등록 면적',g.registeredArea!=null?`${g.registeredArea} ㎡`:'—'],
  ['동 수',g.buildingCount!=null?`${g.buildingCount}동`:'—'],
  ['피복형태',g.coverType||'—'],
  ['배지형태',g.mediumType||'—'],
  ['측고',g.sideHeight!=null?`${g.sideHeight} m`:'—'],
  ['폭',g.width!=null?`${g.width} m`:'—'],
  ['길이',g.length!=null?`${g.length} m`:'—'],
  ['온실 사진 URL',g.imageUrl||'—']
 ];
 main.innerHTML=moduleHeading('온실 정보 상세','')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><div class="panel-head-title"><h2>${htmlText(g.name)}</h2>${g.type?`<span class="krds-badge bg-light-success">${htmlText(g.type)}</span>`:''}</div><span class="counter">${htmlText(g.type||'유형 미지정')} · ${htmlText(g.coverType||'피복 미지정')}</span></div><div class="panel-body"><div class="${g.imageUrl?'gh-detail-layout':''}">${g.imageUrl?`<div class="gh-photo-box"><img class="gh-detail-photo" src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진"></div>`:''}<dl class="profile-facts facts-2col">${facts.map(([a,b])=>`<dt>${htmlText(a)}</dt><dd>${htmlText(String(b))}</dd>`).join('')}</dl></div></div></section>
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
 <div class="field wide"><label for="ghImageUrl">온실 사진 URL</label><input class="ctrl" id="ghImageUrl" type="text" maxlength="500" value="${htmlText(row.imageUrl||'')}" placeholder="이미지 URL을 입력하세요 (예: https://... 또는 img/gh-a.jpg)"><div id="ghPhotoPreview" class="${row.imageUrl?'gh-photo-box':'gh-photo-box hidden'}" style="margin-top:10px">${row.imageUrl?`<img class="gh-detail-photo" src="${escapeHtml(row.imageUrl)}" alt="온실 사진 미리보기">`:''}</div></div>
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
function storeStandards(){try{localStorage.setItem(storageKey('standards'),JSON.stringify({crops:config.crops,criteria:config.stageEnvironmentalCriteria,standardMeta:config.standardMeta||{}}))}catch{}}
function loadStandards(){try{const saved=JSON.parse(localStorage.getItem(storageKey('standards'))||'null');if(Array.isArray(saved?.crops)&&saved.crops.length)config.crops=saved.crops;if(Array.isArray(saved?.criteria))config.stageEnvironmentalCriteria=saved.criteria;if(saved?.standardMeta&&typeof saved.standardMeta==='object')config.standardMeta=saved.standardMeta}catch{}}
function getCriteriaMeta(varietyId){
 const hasStd=config.stageEnvironmentalCriteria.some(x=>x.varietyId===varietyId&&x.thresholds&&Object.keys(x.thresholds).length);
 if(!hasStd)return {hasStd:false,source:'none',name:''};
 const saved=config.standardMeta?.[varietyId];
 if(saved?.name)return {hasStd:true,source:saved.source||'custom',name:saved.name};
 return {hasStd:true,source:'default',name:'표준 환경기준표'};
}
function renderStandardPage(){
 loadStandards();
 const params=new URLSearchParams(location.search);
 const fromCycleId=params.get('cycleId');
 const paramVariety=params.get('varietyId')||'';
 const isCreateEntry=page==='standard-create';
 const state=window.__stdState||(window.__stdState={
  cropFilter:'all',
  editCriteria:false,
  cropModal:isCreateEntry?{cropId:'',varietyId:'',cropName:'',varietyName:''}:null,
  cropDetailId:paramVariety||null
 });
 if(isCreateEntry&&!state.cropModal&&!state.cropDetailId)state.cropModal={cropId:'',varietyId:'',cropName:'',varietyName:''};
 updateNavigation();
 const allVarieties=config.crops.flatMap(cr=>cr.varieties.map(v=>({cropId:cr.cropId,varietyId:v.varietyId,label:`${cr.name} · ${v.name}`,cropName:cr.name,varietyName:v.name})));
 const stages=config.growthStages.slice().sort((a,b)=>a.order-b.order);
 const metrics=[
  ['dayTempC','주간 온도','°C'],['nightTempC','야간 온도','°C'],['humidityPct','온실 내부 습도','%RH'],
  ['co2Ppm','이산화탄소 (CO₂)','ppm'],['solarWm2','일사량','W/m²'],['lightUmolM2S','광도','μmol/m²/s'],
  ['substrateTempC','배지 온도','°C'],['substrateMoisturePct','배지 수분','%'],['substrateEcMsCm','배지 EC','mS/cm'],['substratePh','배지 pH','pH']
 ];
 const hasActiveCycle=varietyId=>config.cycles.some(c=>cycleStatus(c)==='진행'&&(c.varietyId===varietyId||config.standardSets?.some(s=>s.id===c.environmentStandardSetId&&s.varietyId===varietyId)));
 const backBtn=fromCycleId?`<button type="button" class="backlink" id="stdBackCycle">← 작기계획 상세로</button>`:'';
 const detailItem=state.cropDetailId?allVarieties.find(v=>v.varietyId===state.cropDetailId):null;
 const editing=state.cropModal;

 if(editing){
  main.innerHTML=`<div class="pagehead"><div><h1>${editing.varietyId?'품목 · 품종 수정':'품목 · 품종 등록'}</h1></div>${backBtn}</div>
  <section class="panel" style="flex:none" aria-label="품목 등록 및 수정"><div class="panel-head"><h2>품목 정보</h2><span class="counter">* 필수 입력</span></div><div class="panel-body"><form id="stdCropForm"><div class="module-input-grid">
   ${editing.varietyId?`<div class="field"><label for="stdCropId">품목ID</label><input id="stdCropId" class="ctrl" value="${htmlText(editing.varietyId)}" readonly></div>`:''}
   <div class="field"><label for="stdCropName">품목명 <span class="required" aria-hidden="true">*</span></label><input id="stdCropName" class="ctrl" maxlength="50" value="${htmlText(editing.cropName||'')}" placeholder="예: 장미" required></div>
   <div class="field"><label for="stdVarietyName">품종명 <span class="required" aria-hidden="true">*</span></label><input id="stdVarietyName" class="ctrl" maxlength="50" value="${htmlText(editing.varietyName||'')}" placeholder="예: 덩굴장미" required></div>
  </div><div class="module-actions"><button type="button" class="btn" id="stdCropCancel">취소</button><button type="submit" class="btn main">${editing.varietyId?'수정 저장':'등록'}</button></div></form></div></section>`;
  $('#stdCropName')?.focus();
  $('#stdCropCancel').onclick=()=>{state.cropModal=null;page='standard';renderStandardPage()};
  $('#stdCropForm').onsubmit=e=>{
   e.preventDefault();
   const cropName=$('#stdCropName').value.trim(),varietyName=$('#stdVarietyName').value.trim();
   if(!cropName||!varietyName){toast('품목명과 품종명을 모두 입력하세요.');return}
   const duplicated=allVarieties.some(v=>v.varietyId!==editing.varietyId&&v.cropName===cropName&&v.varietyName===varietyName);
   if(duplicated){toast('이미 등록된 품목 · 품종입니다.');return}
   if(editing.varietyId){
    const oldCrop=config.crops.find(c=>c.cropId===editing.cropId);
    const targetVar=oldCrop?.varieties.find(v=>v.varietyId===editing.varietyId);
    if(oldCrop&&targetVar){
     if(oldCrop.name===cropName){
      targetVar.name=varietyName;
     }else if(oldCrop.varieties.length===1){
      oldCrop.name=cropName;
      targetVar.name=varietyName;
     }else{
      oldCrop.varieties=oldCrop.varieties.filter(v=>v.varietyId!==editing.varietyId);
      let destCrop=config.crops.find(c=>c.name===cropName);
      if(!destCrop){destCrop={cropId:'CR-NEW-'+Date.now(),name:cropName,varieties:[]};config.crops.push(destCrop)}
      destCrop.varieties.push({varietyId:editing.varietyId,name:varietyName});
     }
    }
    state.cropModal=null;page='standard';storeStandards();toast('품목 · 품종 정보를 수정했습니다.');renderStandardPage();
   }else{
    let crop=config.crops.find(c=>c.name===cropName);
    if(!crop){crop={cropId:'CR-NEW-'+Date.now(),name:cropName,varieties:[]};config.crops.push(crop)}
    const newVarId='VAR-NEW-'+Date.now();
    crop.varieties.push({varietyId:newVarId,name:varietyName});
    state.cropModal=null;state.cropDetailId=newVarId;state.editCriteria=false;page='standard';storeStandards();
    toast('품목 · 품종을 등록했습니다. 환경기준을 등록하거나 외부 API 기준표를 불러오세요.');
    renderStandardPage();
   }
  };
 }else if(detailItem){
  const vid=detailItem.varietyId;
  const criteriaByStage=Object.fromEntries(stages.map(st=>[st.stageId,config.stageEnvironmentalCriteria.find(x=>x.varietyId===vid&&x.stageId===st.stageId)]));
  const stdMeta=getCriteriaMeta(vid);
  const fmtRange=(range,unit)=>(range&&range[0]!=null&&range[1]!=null)?`${range[0]} ~ ${range[1]} ${unit}`:'미입력';
  main.innerHTML=`<div class="pagehead"><div><h1>품목 · 품종 상세</h1></div>${backBtn}</div>
  <div class="module-scroll">
   <section class="panel" aria-label="품목 · 품종 기본 정보">
    <div class="panel-head"><h2>품목 정보</h2></div>
    <div class="panel-body"><dl class="profile-facts"><dt>품목명</dt><dd>${htmlText(detailItem.cropName)}</dd><dt>품종명</dt><dd>${htmlText(detailItem.varietyName)}</dd><dt>적용 기준표명</dt><dd>${htmlText(stdMeta.hasStd?stdMeta.name:'기준 미입력')}</dd></dl></div>
    <div class="hidden" id="stdCropDeleteConfirm" style="padding:10px 16px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>선택한 품목 · 품종을 삭제하시겠습니까?</span><button type="button" class="btn" id="stdCropDeleteCancel">취소</button><button type="button" class="btn danger" id="stdCropDeleteOk">삭제 확인</button></div>
    <div class="panel-body"><div class="module-actions"><button type="button" class="btn" id="stdCropBackToList">목록</button><button type="button" class="btn danger" id="stdCropDetailDel">삭제</button><button type="button" class="btn main" id="stdCropDetailEdit">수정</button></div></div>
   </section>
   <section class="panel" style="margin-top:14px" aria-label="생육단계별 환경기준">
    <div class="panel-head">
     <div class="panel-head-title"><h2>생육단계별 환경기준</h2><span class="counter">${htmlText(stdMeta.hasStd?stdMeta.name:'기준 미입력')}</span></div>
     <div class="std-toolbar-actions">
      <button type="button" class="btn xs" id="stdLoadApiBtn">외부 API 기준표 불러오기</button>
      <button type="button" class="btn main xs" id="stdToggleEdit">${state.editCriteria?'조회 모드로':(stdMeta.hasStd?'환경기준 수정':'환경기준 등록')}</button>
      ${stdMeta.hasStd?'<button type="button" class="btn danger xs" id="stdDeleteCriteria">기준 삭제</button>':''}
     </div>
    </div>
    ${state.editCriteria?`<div class="panel-body std-criteria-meta"><div class="field"><label for="stdCriteriaName">기준표명 <span class="required" aria-hidden="true">*</span></label><input id="stdCriteriaName" class="ctrl" maxlength="60" value="${htmlText(stdMeta.name||`${detailItem.varietyName} 맞춤 환경기준표`)}" placeholder="구분할 기준표명을 입력하세요"></div></div>`:''}
    <div class="panel-body" style="padding-bottom:0"><div class="std-stage-cards">${stages.map(st=>{const c=criteriaByStage[st.stageId],t=c?.thresholds||{};return `<article class="panel std-stage-card"><div class="panel-head"><h2>${st.order}단계 · ${htmlText(st.name)}</h2><span class="counter">${c?.standardDays!=null?`${c.standardDays}일`:'기간 미입력'}</span></div><div class="panel-body"><dl class="std-stage-facts"><div><dt>주간/야간 온도</dt><dd>${t.dayTempC?`${t.dayTempC[0]}~${t.dayTempC[1]}°C`:'—'} / ${t.nightTempC?`${t.nightTempC[0]}~${t.nightTempC[1]}°C`:'—'}</dd></div><div><dt>습도 / CO₂</dt><dd>${t.humidityPct?`${t.humidityPct[0]}~${t.humidityPct[1]}%`:'—'} / ${t.co2Ppm?`${t.co2Ppm[0]}~${t.co2Ppm[1]}ppm`:'—'}</dd></div></dl></div></article>`}).join('')}</div></div>
    <div class="tablewrap" style="margin-top:14px"><table class="data-table module-table"><thead><tr><th>환경 기준 항목</th><th>단위</th>${stages.map(st=>`<th>${st.order}단계 · ${htmlText(st.name)}</th>`).join('')}</tr></thead>
    <tbody>
     <tr><td><strong>기준 기간</strong></td><td>일</td>${stages.map(st=>{const d=criteriaByStage[st.stageId]?.standardDays;return state.editCriteria?`<td><input type="number" class="ctrl compact-input std-days-input" min="1" data-std-days="${st.stageId}" value="${d??''}" placeholder="일수"></td>`:`<td class="tnum">${d!=null?`${d}일`:'미입력'}</td>`}).join('')}</tr>
     ${metrics.map(([key,label,unit])=>`<tr><td><strong>${htmlText(label)}</strong></td><td>${htmlText(unit)}</td>${stages.map(st=>{const r=criteriaByStage[st.stageId]?.thresholds?.[key];return state.editCriteria?`<td><div class="std-range-inputs"><input type="number" step="0.1" class="ctrl compact-input" data-std-min="${st.stageId}:${key}" value="${r?.[0]??''}" placeholder="최소"><span>~</span><input type="number" step="0.1" class="ctrl compact-input" data-std-max="${st.stageId}:${key}" value="${r?.[1]??''}" placeholder="최대"></div></td>`:`<td class="tnum">${fmtRange(r,unit)}</td>`}).join('')}</tr>`).join('')}
    </tbody></table></div>
    <div class="hidden" id="stdCriteriaDeleteConfirm" style="padding:10px 16px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>해당 품목의 생육단계별 환경기준을 삭제하시겠습니까?</span><button type="button" class="btn" id="stdCriteriaDeleteCancel">취소</button><button type="button" class="btn danger" id="stdCriteriaDeleteOk">삭제 확인</button></div>
    ${state.editCriteria?'<div class="panel-body"><div class="module-actions"><button type="button" class="btn" id="stdEditCancel">취소</button><button type="button" class="btn main" id="stdSaveCriteria">기준 저장</button></div></div>':''}
   </section>
  </div>`;
  $('#stdCropBackToList').onclick=()=>{state.cropDetailId=null;state.editCriteria=false;renderStandardPage()};
  $('#stdCropDetailEdit').onclick=()=>{state.cropModal={...detailItem};state.editCriteria=false;renderStandardPage()};
  $('#stdCropDetailDel').onclick=()=>{
   if(hasActiveCycle(vid)){toast('진행 중인 작기에서 사용 중인 품목은 삭제할 수 없습니다.');return}
   $('#stdCropDeleteConfirm').classList.remove('hidden');
  };
  $('#stdCropDeleteCancel').onclick=()=>$('#stdCropDeleteConfirm').classList.add('hidden');
  $('#stdCropDeleteOk').onclick=()=>{
   if(hasActiveCycle(vid)){toast('진행 중인 작기에서 사용 중인 품목은 삭제할 수 없습니다.');return}
   config.crops=config.crops.map(c=>({...c,varieties:c.varieties.filter(v=>v.varietyId!==vid)})).filter(c=>c.varieties.length>0);
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==vid);
   if(Array.isArray(config.standardSets))config.standardSets=config.standardSets.filter(x=>x.varietyId!==vid);
   if(config.standardMeta)delete config.standardMeta[vid];
   state.cropDetailId=null;state.editCriteria=false;storeStandards();toast('품종을 삭제했습니다.');renderStandardPage();
  };
  $('#stdToggleEdit').onclick=()=>{state.editCriteria=!state.editCriteria;renderStandardPage()};
  if($('#stdEditCancel'))$('#stdEditCancel').onclick=()=>{state.editCriteria=false;renderStandardPage()};
  $('#stdLoadApiBtn').onclick=()=>{
   const preset={VEG:{days:30,t:{dayTempC:[24,28],nightTempC:[18,22],humidityPct:[65,80],co2Ppm:[600,900],solarWm2:[150,350],lightUmolM2S:[120,250],substrateTempC:[20,24],substrateMoisturePct:[55,70],substrateEcMsCm:[0.8,1.2],substratePh:[5.5,6.2]}},IND:{days:35,t:{dayTempC:[20,24],nightTempC:[15,18],humidityPct:[60,75],co2Ppm:[500,800],solarWm2:[180,380],lightUmolM2S:[150,280],substrateTempC:[18,22],substrateMoisturePct:[50,65],substrateEcMsCm:[1.0,1.4],substratePh:[5.5,6.2]}},BLO:{days:40,t:{dayTempC:[22,26],nightTempC:[16,20],humidityPct:[55,70],co2Ppm:[500,800],solarWm2:[200,420],lightUmolM2S:[180,320],substrateTempC:[19,23],substrateMoisturePct:[50,65],substrateEcMsCm:[1.0,1.5],substratePh:[5.6,6.3]}}};
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==vid);
   for(const st of stages){const p=preset[st.stageId]||preset.VEG;config.stageEnvironmentalCriteria.push({varietyId:vid,stageId:st.stageId,standardDays:p.days,thresholds:clone(p.t)})}
   config.standardMeta=config.standardMeta||{};
   config.standardMeta[vid]={name:`${detailItem.varietyName} 외부 API 표준 기준표`,source:'api'};
   storeStandards();toast('외부 API 표준 환경기준표를 불러와 저장했습니다.');renderStandardPage();
  };
  if($('#stdDeleteCriteria'))$('#stdDeleteCriteria').onclick=()=>{
   if(hasActiveCycle(vid)){toast('진행 중인 작기가 있는 품종의 환경기준은 삭제할 수 없습니다.');return}
   $('#stdCriteriaDeleteConfirm').classList.remove('hidden');
  };
  $('#stdCriteriaDeleteCancel').onclick=()=>$('#stdCriteriaDeleteConfirm').classList.add('hidden');
  $('#stdCriteriaDeleteOk').onclick=()=>{
   if(hasActiveCycle(vid)){toast('진행 중인 작기가 있는 품종의 환경기준은 삭제할 수 없습니다.');return}
   config.stageEnvironmentalCriteria=config.stageEnvironmentalCriteria.filter(x=>x.varietyId!==vid);
   if(config.standardMeta)delete config.standardMeta[vid];
   storeStandards();state.editCriteria=false;toast('선택 품종의 환경기준을 삭제했습니다.');renderStandardPage();
  };
  if($('#stdSaveCriteria'))$('#stdSaveCriteria').onclick=()=>{
   const criteriaName=$('#stdCriteriaName').value.trim();
   if(!criteriaName){toast('구분할 기준표명을 입력하세요.');$('#stdCriteriaName').focus();return}
   for(const st of stages){
    const daysVal=$(`[data-std-days="${st.stageId}"]`).value.trim();
    const thresholds={};
    for(const [key] of metrics){
     const mn=$(`[data-std-min="${st.stageId}:${key}"]`).value.trim();
     const mx=$(`[data-std-max="${st.stageId}:${key}"]`).value.trim();
     if(mn!==''&&mx!=='')thresholds[key]=[Number(mn),Number(mx)];
    }
    const existing=config.stageEnvironmentalCriteria.find(x=>x.varietyId===vid&&x.stageId===st.stageId);
    if(existing){existing.standardDays=daysVal===''?null:Number(daysVal);existing.thresholds=thresholds}
    else{config.stageEnvironmentalCriteria.push({varietyId:vid,stageId:st.stageId,standardDays:daysVal===''?null:Number(daysVal),thresholds})}
   }
   config.standardMeta=config.standardMeta||{};
   config.standardMeta[vid]={name:criteriaName,source:'custom'};
   storeStandards();state.editCriteria=false;toast(`'${criteriaName}' 기준표를 저장했습니다.`);renderStandardPage();
  };
 }else{
  const cropOpts=config.crops.map(c=>({value:c.cropId,label:c.name}));
  const rows=allVarieties.filter(v=>state.cropFilter==='all'||v.cropId===state.cropFilter);
  main.innerHTML=`<div class="pagehead"><div><h1>품목 · 품종 목록</h1></div>${backBtn}</div>`+unifiedListPanel({
   title:'품목 · 품종 목록',
   count:rows.length,
   ariaLabel:'품목 목록',
   actionHtml:'<button type="button" class="btn main xs" id="stdCropAdd">+ 품목 등록</button>',
   filterHtml:`${listFilterField('stdCropFilter','품목',`<select id="stdCropFilter" class="ctrl">${options([{value:'all',label:'전체 품목'},...cropOpts],state.cropFilter)}</select>`)}<button type="button" class="btn main list-search-btn" id="stdCropSearch">검색</button>`,
   bodyHtml:`<div class="tablewrap"><table class="data-table module-table std-crop-table"><thead><tr><th class="row-index">번호</th><th>품목명</th><th>품종명</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="row-index">${rows.length-i}</td><td>${htmlText(r.cropName)}</td><td><button type="button" class="linkbtn" data-std-crop-detail="${r.varietyId}">${htmlText(r.varietyName)}</button></td></tr>`).join('')||'<tr><td colspan="3" class="empty">등록된 품목이 없습니다.</td></tr>'}</tbody></table></div>`
  });
  $('#stdCropSearch').onclick=()=>{state.cropFilter=$('#stdCropFilter').value;renderStandardPage()};
  $('#stdCropFilter').onchange=()=>{state.cropFilter=$('#stdCropFilter').value;renderStandardPage()};
  $('#stdCropAdd').onclick=()=>{state.cropModal={cropId:'',varietyId:'',cropName:'',varietyName:''};renderStandardPage()};
  $$('[data-std-crop-detail]').forEach(b=>b.onclick=()=>{state.cropDetailId=b.dataset.stdCropDetail;state.editCriteria=false;renderStandardPage()});
 }
 if($('#stdBackCycle'))$('#stdBackCycle').onclick=()=>{location.href='cultivationPlanList.html?view=cycle-detail&id='+encodeURIComponent(fromCycleId)};
}
async function init(){
 const hostPage=document.body?.dataset?.page||'entry';
 if(hostPage==='entry'){
  const saved=loadAuthUser();
  const member=allMembers().find(row=>row.username===saved);
  location.replace(member?'cultivationDiaryList.html':'login.html');return;
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
 const initialCycleId=params.get('cycleId');
 signIn(member,initialView,initialId);
 if(initialCycleId&&initialView==='list'&&config.cycles.some(c=>c.cycleId===initialCycleId)){
  filterCycle=initialCycleId;
  listPage=1;
  renderList();
 }
}
init();
})();

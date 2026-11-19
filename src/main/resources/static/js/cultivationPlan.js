(() => {
'use strict';
const app = window.ModooApp;
const { state, config, diaryRows, pages, $, $$, escapeHtml, htmlText, clone, toast, today, options, storageKey, pageNums, pageBtns, pageControls, bindPages, getCycle, gh, cropOf, varietyOf, getStage, stageOrder, stageByDate, lastEvent, getDiary, timeOf, timeSort, makeStarted, statusBadge, taskTone, trashSvg, formatAt, dateFrom, getSelectedCycle, getReading, stdSet, getCriteria, fmtVal, stdMetricCols, toReason, getReasons, getContextHTML, persist, loadSaved, storeCycleExtras, loadCycleExtras, storeIssueExtras, loadIssueExtras, storeGreenhouseExtras, loadGreenhouseExtras, storeStandards, loadStandards, error, go, render, heading, bindBack, moduleHeading, bindModuleBack, cycleStatus, unifiedListPanel, listFilterField, dateRangeControl, mountDateRangePicker, singleDateControl, setSingleDateValue, mountSingleDatePicker } = app;
let cycleListPage=1,cycleFilters={plan:'all',status:'all',greenhouse:'all',crop:'all',variety:'all',periodType:'planned',from:'',to:''};
function renderCycleList(){let list=config.cycles.filter(c=>{
  if(!(cycleFilters.plan==='all'||c.cycleId===cycleFilters.plan))return false;
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
 const planOptions=[...config.cycles].sort((a,b)=>(b.plannedStartAt||'').localeCompare(a.plannedStartAt||'')).map(c=>({value:c.cycleId,label:c.name}));
 const usedCropIds=new Set(config.cycles.map(c=>c.cropId)),usedVarIds=new Set(config.cycles.map(c=>c.varietyId));const crops=config.crops.filter(c=>usedCropIds.has(c.cropId)).map(c=>({value:c.cropId,label:c.name})),varieties=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(cycleFilters.crop==='all'||c.cropId===cycleFilters.crop)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({...v,cropId:c.cropId})));
 const size=config.pagination.cyclePageSize||5;cycleListPage=Math.min(Math.max(1,cycleListPage),Math.max(1,Math.ceil(list.length/size)));let from=(cycleListPage-1)*size,rows=list.slice(from,from+size);
 const cycleTone={'진행':'bg-light-success','미진행':'bg-light-information','종료':'bg-light-gray'};
 main.innerHTML=moduleHeading('작기계획 목록')+unifiedListPanel({
  title:'작기계획 목록',
  count:list.length,
  actionHtml:'<button type="button" class="btn main xs" id="cycleCreate">+ 작기계획 등록</button>',
  filterHtml:`${listFilterField('cycleFilterPlan','작기계획명',`<select class="ctrl" id="cycleFilterPlan">${options([{value:'all',label:'전체 작기'},...planOptions],cycleFilters.plan)}</select>`)}${listFilterField('cycleFilterGH','온실명',`<select class="ctrl" id="cycleFilterGH">${options([{value:'all',label:'전체 온실'},...config.greenhouses.map(g=>({value:g.greenhouseId,label:g.name}))],cycleFilters.greenhouse)}</select>`)}${listFilterField('cycleFilterCrop','품목명',`<select class="ctrl" id="cycleFilterCrop">${options([{value:'all',label:'전체 품목'},...crops],cycleFilters.crop)}</select>`)}${listFilterField('cycleFilterVariety','품종명',`<select class="ctrl" id="cycleFilterVariety">${options([{value:'all',label:'전체 품종'},...varieties.map(v=>({value:v.varietyId,label:v.name}))],cycleFilters.variety)}</select>`)}${listFilterField('cycleFilterState','작기 상태',`<select class="ctrl" id="cycleFilterState">${options(['all','미진행','진행','종료'].map(s=>({value:s,label:s==='all'?'전체 상태':s})),cycleFilters.status)}</select>`)}${listFilterField('cycleFilterPeriodType','조회 기간',`<div class="cycle-period-inline"><select class="ctrl cycle-period-select" id="cycleFilterPeriodType" aria-label="기간 기준">${options([{value:'planned',label:'계획 기간'},{value:'actual',label:'실제 기간'}],cycleFilters.periodType)}</select>${dateRangeControl('cycleFilter',cycleFilters.from,cycleFilters.to)}</div>`,'is-span-2')}<div class="list-filter-actions"><button type="button" class="btn list-reset-btn" id="cycleResetFilter">초기화</button><button type="button" class="btn main list-search-btn" id="cycleDoFilter">검색</button></div>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table module-table cycle-table"><caption class="sr-only">작기계획 목록</caption><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">작기계획명</th><th scope="col">온실명</th><th scope="col">품목명</th><th scope="col">품종명</th><th scope="col">계획 기간</th><th scope="col">실제 기간</th><th scope="col">작기 상태</th></tr></thead><tbody>${rows.map((c,i)=>{const planText=`${dateFrom(c.plannedStartAt)||'—'} ~ ${dateFrom(c.expectedEndAt)||'—'}`;const actualText=c.actualStartAt?`${dateFrom(c.actualStartAt)} ~ ${dateFrom(c.actualEndAt)||'진행 중'}`:'미시작';return `<tr><td class="row-index">${list.length-from-i}</td><td><button class="linkbtn" data-cycle-detail="${c.cycleId}">${htmlText(c.name)}</button></td><td>${htmlText(gh(c.greenhouseId)?.name||'—')}</td><td>${htmlText(cropOf(c)?.name||'—')}</td><td>${htmlText(varietyOf(c)?.name||'—')}</td><td class="col-date">${htmlText(planText)}</td><td class="col-date">${htmlText(actualText)}</td><td>${statusBadge(cycleStatus(c),cycleTone)}</td></tr>`}).join('')||'<tr><td colspan="8" class="empty empty-cell">조회 결과가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:pageControls(list.length,cycleListPage,size,'작기계획')
 });
 mountDateRangePicker('cycleFilter');
 $('#cycleFilterCrop').onchange=()=>{const sel=$('#cycleFilterCrop').value;const possible=config.crops.filter(c=>usedCropIds.has(c.cropId)&&(sel==='all'||c.cropId===sel)).flatMap(c=>c.varieties.filter(v=>usedVarIds.has(v.varietyId)).map(v=>({value:v.varietyId,label:v.name})));const vEl=$('#cycleFilterVariety');const old=vEl.value;vEl.innerHTML=options([{value:'all',label:'전체 품종'},...possible],possible.some(v=>v.value===old)?old:'all')};
 $('#cycleResetFilter').onclick=()=>{cycleFilters={plan:'all',status:'all',greenhouse:'all',crop:'all',variety:'all',periodType:'planned',from:'',to:''};cycleListPage=1;renderCycleList()};
 $('#cycleDoFilter').onclick=()=>{const from=$('#cycleFilterFrom').value,to=$('#cycleFilterTo').value;if(from&&to&&from>to){toast('조회 시작일과 종료일을 확인하세요.');return}cycleFilters={plan:$('#cycleFilterPlan').value,status:$('#cycleFilterState').value,greenhouse:$('#cycleFilterGH').value,crop:$('#cycleFilterCrop').value,variety:$('#cycleFilterVariety').value,periodType:$('#cycleFilterPeriodType').value,from,to};cycleListPage=1;renderCycleList()};$('#cycleCreate').onclick=()=>go('cycle-create');
 $$('[data-cycle-detail]').forEach(b=>b.onclick=()=>go('cycle-detail',b.dataset.cycleDetail));bindPages('',()=>cycleListPage,v=>cycleListPage=v,list.length,size,renderCycleList);
}
function stageRows(c){const stages=config.growthStages.map(s=>{const k=getCriteria(c,s.stageId);
 const range=k?.thresholds||{};
 return `<tr><td>${s.order}단계 · ${htmlText(s.name)}</td><td>${k?.standardDays??'—'}일</td>${stdMetricCols.map(([key])=>`<td class="tnum">${range[key]?.join(' ~ ')||'—'}</td>`).join('')}</tr>`;});return stages.join('')}
function renderCycleDetail(){const c=getSelectedCycle();if(!c){go('cycle-list');return}
 const ghName=gh(c.greenhouseId)?.name||'—',cropLabel=`${cropOf(c)?.name||'—'} · ${varietyOf(c)?.name||'—'}`;
 const planPeriod=`${dateFrom(c.plannedStartAt)||'—'} ~ ${dateFrom(c.expectedEndAt)||'—'}`;
 const actualPeriod=c.actualStartAt?`${dateFrom(c.actualStartAt)} ~ ${dateFrom(c.actualEndAt)||'진행 중'}`:'미시작';
 const facts=[['온실명',ghName],['품목명 · 품종명',cropLabel],['계획 기간',planPeriod],['실제 기간',actualPeriod]];
 if(c.status==='종료'||c.endReason)facts.push(['종료 사유',c.endReason||'—']);
 const factsHtml=`<dl class="profile-facts facts-2col">${facts.map(([a,b])=>`<dt>${htmlText(a)}</dt><dd>${htmlText(b)}</dd>`).join('')}</dl>`;
 const hasActiveInGh=cycleStatus(c)==='미진행'&&config.cycles.some(other=>other.cycleId!==c.cycleId&&other.greenhouseId===c.greenhouseId&&cycleStatus(other)==='진행');
 const activeNotice=hasActiveInGh?`<div class="cycle-active-notice" role="status">현재 <strong>${htmlText(ghName)}</strong>에 진행 중인 작기가 있어, 기존 작기를 종료한 뒤 시작할 수 있습니다.</div>`:'';
 main.innerHTML=moduleHeading('작기계획 상세','')+`<div class="module-scroll"><section class="panel"><div class="panel-head"><div class="panel-head-title"><h2>${htmlText(c.name)}</h2>${statusBadge(cycleStatus(c),{'진행':'bg-light-success','미진행':'bg-light-information','종료':'bg-light-gray'})}</div><span class="counter">등록일 ${htmlText(dateFrom(c.registeredAt)||'—')}</span></div><div class="panel-body">${factsHtml}</div></section>
 <section class="panel" style="margin-top:12px"><div class="panel-head"><h2>생육단계별 환경기준</h2><span class="counter">${htmlText(cropLabel)} 기준</span></div><div class="tablewrap"><table class="data-table module-table std-criteria-table"><caption class="sr-only">생육단계별 환경기준</caption><thead><tr><th scope="col">생육단계</th><th scope="col">기준 기간</th>${stdMetricCols.map(([,lbl])=>`<th scope="col">${htmlText(lbl)}</th>`).join('')}</tr></thead><tbody>${stageRows(c)}</tbody></table></div></section></div>
 <section class="panel hidden" id="cycleStartPanel"><div class="panel-head"><h2>작기 실제 시작일 등록</h2></div><div class="panel-body"><div class="filterbar"><div class="field"><label for="cycleStartTimeTrigger">실제 시작일 *</label>${singleDateControl('cycleStartTime','',{max:today(),clearable:false})}</div><button class="btn" type="button" id="cycleStartCancel">취소</button><button class="btn main" type="button" id="cycleStartConfirm">작기 시작 확정</button></div></div></section>
 <section class="panel hidden" id="cycleEndPanel"><div class="panel-head"><h2>작기 종료</h2></div><div class="panel-body"><div class="module-input-grid"><div class="field"><label for="cycleEndTimeTrigger">실제 종료일 *</label>${singleDateControl('cycleEndTime','',{min:dateFrom(c.actualStartAt),max:today(),clearable:false})}</div><div class="field wide"><label for="cycleEndReason">종료 사유</label><textarea class="ctrl textarea" id="cycleEndReason" placeholder="종료 사유를 입력하세요"></textarea></div></div><div class="dialog-actions"><button class="btn" type="button" id="cycleEndCancel">취소</button><button class="btn main" type="button" id="cycleEndConfirm">종료 확정</button></div></div></section>
 <section class="panel hidden" id="cycleDeleteConfirm"><div class="panel-body" style="display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>미진행 상태의 작기계획을 삭제하시겠습니까?</span><button type="button" class="btn" id="cycleDeleteCancel">취소</button><button type="button" class="btn danger" id="cycleDeleteOk">삭제 확인</button></div></section>
 ${activeNotice}<div class="module-actions"><div class="module-actions-left"><button class="btn" id="cycleToList">목록</button></div>${cycleStatus(c)==='미진행'?`<button class="btn danger" id="cycleDelete">삭제</button><button class="btn" id="cycleToEdit">작기계획 수정</button><button class="btn main" id="cycleStart"${hasActiveInGh?' disabled':''}>작기 시작</button>`:''}${cycleStatus(c)==='진행'?'<button class="btn main" id="cycleEnd">작기 종료</button>':''}</div>`;
 mountSingleDatePicker('cycleStartTime');mountSingleDatePicker('cycleEndTime');
 bindModuleBack();$('#cycleToList').onclick=()=>go('cycle-list');if($('#cycleToEdit'))$('#cycleToEdit').onclick=()=>go('cycle-edit');
 if($('#cycleDelete'))$('#cycleDelete').onclick=()=>$('#cycleDeleteConfirm').classList.remove('hidden');
 if($('#cycleDeleteCancel'))$('#cycleDeleteCancel').onclick=()=>$('#cycleDeleteConfirm').classList.add('hidden');
 if($('#cycleDeleteOk'))$('#cycleDeleteOk').onclick=()=>{if(cycleStatus(c)!=='미진행'){toast('미진행 상태의 작기계획만 삭제할 수 있습니다.');return}config.cycles=config.cycles.filter(x=>x.cycleId!==c.cycleId);storeCycleExtras();toast('작기계획을 삭제했습니다.');go('cycle-list')};
 const start=$('#cycleStart');if(start)start.onclick=()=>{setSingleDateValue('cycleStartTime',today(),{max:today()});$('#cycleStartPanel').classList.remove('hidden');$('#cycleStartTimeTrigger').focus()};
 const end=$('#cycleEnd');if(end)end.onclick=()=>{setSingleDateValue('cycleEndTime',today(),{min:dateFrom(c.actualStartAt),max:today()});$('#cycleEndReason').value='';$('#cycleEndPanel').classList.remove('hidden');$('#cycleEndTimeTrigger').focus()};
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
 <div class="field"><label for="cycleGreenhouse">온실명 *</label><select class="ctrl" id="cycleGreenhouse" ${hasData?'disabled':''}>${options(config.greenhouses.map(x=>({value:x.greenhouseId,label:x.registeredArea!=null?`${x.name} (${Number(x.registeredArea).toLocaleString()}㎡)`:x.name})),row.greenhouseId)}</select></div>
 <div class="field"><label for="cyclePlanStartTrigger">계획 시작일 *</label>${singleDateControl('cyclePlanStart',dateFrom(row.plannedStartAt),{clearable:false})}</div>
 <div class="field"><label for="cycleExpectedEndTrigger">예상 종료일 *</label>${singleDateControl('cycleExpectedEnd',dateFrom(row.expectedEndAt),{clearable:false})}</div>
 </div><div class="subsection"><div class="subsection-head"><h3>생육단계별 환경기준</h3><span class="counter" id="cycleStdHint"></span></div><div class="module-input-grid cycle-crop-bar"><div class="field"><label for="cycleCrop">재배 품목 *</label><select class="ctrl" id="cycleCrop" ${hasData?'disabled':''}></select></div><div class="field"><label for="cycleVariety">재배 품종 *</label><select class="ctrl" id="cycleVariety" ${hasData?'disabled':''}></select></div>${hasData?'':'<div class="field cycle-load-action"><button type="button" class="btn" id="cycleLoadStdBtn">환경기준 불러오기</button></div>'}</div><div class="tablewrap" style="margin-top:14px"><table class="data-table module-table std-criteria-table"><thead><tr><th>생육단계</th><th>기준 기간</th>${stdMetricCols.map(([,lbl])=>`<th>${htmlText(lbl)}</th>`).join('')}</tr></thead><tbody></tbody></table></div></div>
 <div class="errorbox hidden" id="cycleFormError" role="alert"></div></div><div class="module-actions inside"><button type="button" class="btn" id="cycleCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'작기계획 등록'}</button></div></form>`;
 mountSingleDatePicker('cyclePlanStart');mountSingleDatePicker('cycleExpectedEnd');
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
   $('#cycleForm tbody').innerHTML=`<tr><td colspan="12" class="empty empty-cell">불러온 환경기준이 없습니다.</td></tr>`;
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

pages.cycle = { renderCycleList, renderCycleDetail, renderCycleEditor, commitCycleStart, commitCycleEnd };
})();

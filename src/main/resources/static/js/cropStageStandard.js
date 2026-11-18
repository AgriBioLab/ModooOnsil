(() => {
'use strict';
const app = window.ModooApp;
const { state, config, diaryRows, pages, $, $$, escapeHtml, htmlText, clone, toast, today, options, storageKey, pageNums, pageBtns, pageControls, bindPages, getCycle, gh, cropOf, varietyOf, getStage, stageOrder, stageByDate, lastEvent, getDiary, timeOf, timeSort, makeStarted, statusBadge, taskTone, trashSvg, formatAt, dateFrom, getSelectedCycle, getReading, stdSet, getCriteria, fmtVal, stdMetricCols, toReason, getReasons, getContextHTML, persist, loadSaved, storeCycleExtras, loadCycleExtras, storeIssueExtras, loadIssueExtras, storeGreenhouseExtras, loadGreenhouseExtras, storeStandards, loadStandards, error, go, render, heading, bindBack, moduleHeading, bindModuleBack, cycleStatus, unifiedListPanel, listFilterField, dateRangeControl, mountDateRangePicker } = app;
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
    <div class="panel-body"><div class="module-actions"><div class="module-actions-left"><button type="button" class="btn" id="stdCropBackToList">목록</button></div><button type="button" class="btn danger" id="stdCropDetailDel">삭제</button><button type="button" class="btn main" id="stdCropDetailEdit">수정</button></div></div>
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
   filterHtml:`${listFilterField('stdCropFilter','품목명',`<select id="stdCropFilter" class="ctrl">${options([{value:'all',label:'전체 품목'},...cropOpts],state.cropFilter)}</select>`)}<button type="button" class="btn main list-search-btn" id="stdCropSearch">검색</button>`,
   bodyHtml:`<div class="tablewrap"><table class="data-table module-table std-crop-table"><caption class="sr-only">품목 · 품종 목록</caption><thead><tr><th class="row-index" scope="col">번호</th><th scope="col">품목명</th><th scope="col">품종명</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="row-index">${rows.length-i}</td><td>${htmlText(r.cropName)}</td><td><button type="button" class="linkbtn" data-std-crop-detail="${r.varietyId}">${htmlText(r.varietyName)}</button></td></tr>`).join('')||'<tr><td colspan="3" class="empty">등록된 품목이 없습니다.</td></tr>'}</tbody></table></div>`
  });
  $('#stdCropSearch').onclick=()=>{state.cropFilter=$('#stdCropFilter').value;renderStandardPage()};
  $('#stdCropFilter').onchange=()=>{state.cropFilter=$('#stdCropFilter').value;renderStandardPage()};
  $('#stdCropAdd').onclick=()=>{state.cropModal={cropId:'',varietyId:'',cropName:'',varietyName:''};renderStandardPage()};
  $$('[data-std-crop-detail]').forEach(b=>b.onclick=()=>{state.cropDetailId=b.dataset.stdCropDetail;state.editCriteria=false;renderStandardPage()});
 }
 if($('#stdBackCycle'))$('#stdBackCycle').onclick=()=>{location.href='cultivationPlanList.html?view=cycle-detail&id='+encodeURIComponent(fromCycleId)};
}

pages.standard = { renderStandardPage };
})();

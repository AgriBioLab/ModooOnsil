(() => {
'use strict';
const app = window.ModooApp;
const { state, config, diaryRows, pages, $, $$, escapeHtml, htmlText, clone, toast, today, options, storageKey, pageNums, pageBtns, pageControls, bindPages, getCycle, gh, cropOf, varietyOf, getStage, stageOrder, stageByDate, lastEvent, getDiary, timeOf, timeSort, makeStarted, statusBadge, taskTone, trashSvg, formatAt, dateFrom, getSelectedCycle, getReading, stdSet, getCriteria, fmtVal, stdMetricCols, toReason, getReasons, getContextHTML, persist, loadSaved, storeCycleExtras, loadCycleExtras, storeIssueExtras, loadIssueExtras, storeGreenhouseExtras, loadGreenhouseExtras, storeStandards, loadStandards, error, go, render, heading, bindBack, moduleHeading, bindModuleBack, cycleStatus, unifiedListPanel, listFilterField, dateRangeControl, mountDateRangePicker } = app;
let environmentListPage=1,envFilters={cycle:'all',from:'',to:'',comparison:'all'},envChartKey='insideTempC',envViewTab='chart',issueListPage=1,issueFilters={cycle:'all',type:'all',status:'all',from:'',to:''};
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
 const badgeLabel=field.unit==='pH'?envShortLabel(field.label):`${envShortLabel(field.label)} (${field.unit})`;
 return `<div class="env-chart-toolbar"><div class="env-chart-meta"><span class="env-chart-badge">${htmlText(badgeLabel)}</span><span class="counter">${htmlText(scopeLabel)} · 총 ${pts.length}건</span></div></div><div class="panel-body env-chart-body">${body}</div>`;
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
 return `<section class="panel context-bar-panel" aria-label="조회 온실 및 작기 선택"><div class="panel-body context-bar"><div class="context-bar-fields"><div class="context-bar-select"><label for="${ghSelectId}">온실명</label><select id="${ghSelectId}" class="ctrl">${options(ghList,selected.greenhouseId)}</select></div><div class="context-bar-select"><label for="${cycleSelectId}">작기계획명</label><select id="${cycleSelectId}" class="ctrl">${options(ghCycles.map(c=>({value:c.cycleId,label:`${c.name} (${cycleStatus(c)})`})),selected.cycleId)}</select></div></div><div class="context-bar-meta">${statusBadge(st,tone)}<span>${htmlText(cropOf(selected)?.name||'—')} (${htmlText(varietyOf(selected)?.name||'—')})</span></div></div></section>`;
}
function bindCycleContextBar(ghSelectId,cycleSelectId,cycles,onChange){
 const pickForGh=ghId=>{
  const sorted=cycles.filter(c=>c.greenhouseId===ghId).sort((a,b)=>(cycleStatus(a)==='진행'?0:cycleStatus(a)==='종료'?1:2)-(cycleStatus(b)==='진행'?0:cycleStatus(b)==='종료'?1:2)||(b.actualStartAt||'').localeCompare(a.actualStartAt||''));
  return sorted[0]?.cycleId||'';
 };
 $(`#${ghSelectId}`).onchange=()=>{const nextId=pickForGh($(`#${ghSelectId}`).value);if(nextId)onChange(nextId)};
 $(`#${cycleSelectId}`).onchange=()=>onChange($(`#${cycleSelectId}`).value);
}
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
 const tableCols=fields.map(f=>`<th class="tnum">${htmlText(f.unit==='pH'?envShortLabel(f.label):`${envShortLabel(f.label)}(${f.unit})`)}</th>`).join('');
 const historyHead=`<div class="panel-head env-history-head">
  <div class="env-inline-tabs" role="tablist" aria-label="환경변화 보기 방식">
   <button type="button" class="env-inline-tab" role="tab" id="envTabChart" aria-selected="${envViewTab==='chart'}">그래프로 보기</button>
   <button type="button" class="env-inline-tab" role="tab" id="envTabTable" aria-selected="${envViewTab==='table'}">목록으로 보기</button>
  </div>
  <div class="env-history-controls">
   ${envViewTab==='chart'?`<label class="env-ctrl-field"><span>항목</span><select id="envChartMetric" class="ctrl">${options(metricOptions,envChartKey)}</select></label>`:''}
   <div class="env-period-filter">
    <label class="env-ctrl-field" for="envTrigger"><span>측정 기간</span></label>
    ${dateRangeControl('env',envFilters.from,envFilters.to)}
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
 mountDateRangePicker('env');
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

function renderIssues(detail){
 const issues=config.issueSamples;
 const issueBadge=status=>statusBadge(status,{'발생':'bg-light-danger','조치중':'bg-light-warning','조치 완료':'bg-light-success'});
 if(detail){
  const issue=issues.find(item=>item.issueId===selectedIssueId)||issues[0];
  if(!issue){go('issue-list');return}
  state.selectedIssueId=issue.issueId;
  const cycle=getCycle(issue.cycleId);
  const facts=[
   ['온실명',gh(cycle?.greenhouseId)?.name||'—'],
   ['작기계획명',cycle?.name||'—'],
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
  filterHtml:`${listFilterField('issueGh','온실명',`<select id="issueGh" class="ctrl">${options(ghList,selectedIssueCycle.greenhouseId)}</select>`)}${listFilterField('issueCycle','작기계획명',`<select id="issueCycle" class="ctrl">${options(ghCycles.map(c=>({value:c.cycleId,label:`${c.name} (${cycleStatus(c)})`})),selectedIssueCycle.cycleId)}</select>`)}${choose('issueType','이슈 유형',values(['온도','습도','이산화탄소','일사량','광도','배지온도','배지수분량','배지 EC','배지 pH',...cycleIssues.map(item=>item.issueType)]),issueFilters.type)}${choose('issueStatus','조치 상태',values(['발생','조치중','조치 완료']),issueFilters.status)}${listFilterField('issueTrigger','조회 기간',dateRangeControl('issue',issueFilters.from,issueFilters.to),'is-span-2')}<button class="btn main list-search-btn" type="submit">검색</button>`,
  bodyHtml:`<div class="tablewrap"><table class="data-table module-table issue-table"><thead><tr><th class="row-index">번호</th><th class="col-type">이슈 유형</th><th>이슈 내용</th><th class="tnum col-val">발생 측정값</th><th class="col-date">발생일시</th><th class="col-status">조치 상태</th></tr></thead><tbody>${pagedIssues.map((item,i)=>`<tr><td class="row-index">${rows.length-fromIdx-i}</td><td class="col-type">${htmlText(item.issueType)}</td><td><button class="linkbtn" data-issue="${item.issueId}">${htmlText(item.message)}</button></td><td class="tnum col-val">${htmlText(String(item.issueValue??'—'))}</td><td class="col-date">${formatAt(item.occurredAt)}</td><td class="col-status">${issueBadge(item.status)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">조회된 이슈가 없습니다.</td></tr>'}</tbody></table></div>`,
  footHtml:pageControls(rows.length,issueListPage,size,'온실 환경 이슈')
 });
 mountDateRangePicker('issue');
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

pages.environment = { renderEnvList, renderEnvDetail, renderIssues };
})();

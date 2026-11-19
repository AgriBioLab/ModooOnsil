(() => {
'use strict';
const {config,diaryRows,pages,$,escapeHtml:e,formatAt,cropOf,varietyOf,statusBadge}=window.ModooApp;
let tab='overview',planId='',page=1;
const alive=x=>!x.deletedAt&&!x.deleted_at;
// Home preview date requested for the November 13 diary scenario.
const HOME_PREVIEW_DATE='2026-11-13';
const day=()=>HOME_PREVIEW_DATE;
const link=(file,label,params={},primary=false)=>`<a class="btn${primary?' main':''}" href="${file}?${e(new URLSearchParams(params).toString())}">${e(label)}</a>`;
const empty=text=>`<div class="home-empty">${e(text)}</div>`;
const badge=s=>statusBadge(s,s==='진행'?{'진행':'bg-light-success'}:{});
function renderHome(){
 const houses=config.greenhouses.filter(g=>alive(g)&&g.memberId===config.header.currentUser.id);
 const houseIds=new Set(houses.map(g=>g.greenhouseId));
 const plans=config.cycles.filter(p=>alive(p)&&p.memberId===config.header.currentUser.id&&houseIds.has(p.greenhouseId));
 const ids=new Set(plans.map(p=>p.cycleId));
 const issues=config.issueSamples.filter(i=>alive(i)&&ids.has(i.cycleId)&&['발생','조치중'].includes(i.status)).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));
 const diaries=diaryRows.filter(d=>alive(d)&&ids.has(d.cycleId));
 const todayDiaries=diaries.filter(d=>d.workDate===day());
 const tasks=todayDiaries.flatMap(d=>(d.tasks||[]).filter(alive));
 const active=plans.filter(p=>p.status==='진행');
 const plan=active.find(p=>p.cycleId===planId)||active[0];planId=plan?.cycleId||'';
 const house=houses.find(g=>g.greenhouseId===plan?.greenhouseId);
 $('#main').innerHTML=`<div class="pagehead"><div><h1>${e(config.header.currentUser.farmName||'나의 농장')}</h1><div class="home-date-line"><time class="home-today" datetime="${day()}">오늘 ${day()}</time></div></div></div>
 <div class="home-summary-cards" aria-label="전체 작기 요약"><section class="home-summary-card"><h2>전체 작기 오늘 작업</h2><strong>${tasks.length}건</strong></section><section class="home-summary-card"><h2>전체 작기 오늘 미완료 작업</h2><strong>${tasks.filter(t=>t.status==='미완료').length}건</strong></section><section class="home-summary-card"><h2>전체 작기 미조치 이슈</h2><div class="home-issue-total"><span>발생 ${issues.filter(i=>i.status==='발생').length}건 · 조치중 ${issues.filter(i=>i.status==='조치중').length}건</span><strong>${issues.length}건</strong></div><div class="home-summary-card-footer"><button class="btn" type="button" id="homeCheckIssues">전체 이슈 확인</button></div></section></div>
 <section class="home-panel" id="home-panel" aria-label="${tab==='overview'?'진행 작기 현황':'전체 작기 이슈'}" tabindex="0"></section>
 <p class="home-source muted small">기존 시연 데이터 기준 · 환경값은 각 측정시각의 기록입니다.</p>`;
 const panel=$('#home-panel');
 if(tab==='overview'){
  if(!plan){panel.innerHTML=empty('진행 중인 작기가 없습니다. 작기계획에서 시작할 작기를 확인해 주세요.')+link('cultivationPlanList.html','작기계획 보기');}
  else {
   const latest=plan?config.environmentChanges.filter(r=>alive(r)&&r.cycleId===plan.cycleId).sort((a,b)=>b.measuredAt.localeCompare(a.measuredAt)||String(b.environmentChangeId).localeCompare(String(a.environmentChangeId),undefined,{numeric:true}))[0]:null;
   const selectedDiaries=todayDiaries.filter(d=>d.cycleId===planId);
   const selectedTasks=selectedDiaries.flatMap(d=>(d.tasks||[]).filter(alive).map(t=>({...t,diaryId:d.diaryId}))).sort((a,b)=>String(a.startedAt||'').localeCompare(String(b.startedAt||'')));
   const taskHtml=selectedTasks.length?selectedTasks.map(t=>`<article class="home-task-row"><div><strong>${e(t.name||t.type||'작업')}</strong>${badge(t.status)}</div><small>${e(formatAt(t.startedAt))} · ${e(t.type||'—')}</small><p>${e(t.content||'작성된 작업 내용이 없습니다.')}</p></article>`).join(''):empty(selectedDiaries.length?'오늘 일지에 등록된 작업이 없습니다.':'이 작기에 오늘 실제 작업일로 기록된 일지가 없습니다.');
   panel.innerHTML=`<div class="home-toolbar"><label>진행 중인 작기 <select class="ctrl" id="homePlan">${active.map(p=>`<option value="${e(p.cycleId)}" ${p===plan?'selected':''}>${e(p.name)}</option>`).join('')}</select></label></div>
   ${plan?`<div class="home-overview home-work-layout"><article class="home-card home-detail-card"><div class="home-card-heading"><h2>오늘 작업 내용</h2>${link('cultivationDiaryList.html','재배일지작업 등록',{view:'create',cycleId:planId},true)}</div><div class="home-task-list">${taskHtml}</div></article>
<article class="home-card home-plan-card"><div class="home-card-heading"><h2>${e(plan.name)}</h2>${badge(plan.status)}</div><p class="home-house-name"><strong>${e(house.name)}</strong></p><div class="home-crop-identity"><div><span>재배 품목</span><strong>${e(cropOf(plan)?.name||'—')}</strong></div><div><span>재배 품종</span><strong>${e(varietyOf(plan)?.name||'—')}</strong></div></div><dl class="home-details"><div><dt>실제 시작일</dt><dd>${e((plan.actualStartAt||plan.actualStartDate||'').slice(0,10)||'미기록')}</dd></div><div><dt>예상 종료일</dt><dd>${e((plan.expectedEndAt||'').slice(0,10)||'미기록')}</dd></div></dl></article>
<section class="home-environment-secondary home-environment-below" aria-label="선택 작기 최근 측정 현황"><div class="home-card-heading"><h2>최근 측정 현황</h2>${link('environmentChangeList.html','온실 환경변화 보기',{cycleId:planId})}<small>${latest?'기준시각 '+e(formatAt(latest.measuredAt)):'측정 기록 없음'}</small></div><div class="home-environment-body"><div class="home-metrics">${['insideTempC','humidityPct','co2Ppm','solarWm2','substrateTempC','substratePh'].map(key=>{const f=config.measurementFields.find(field=>field.key===key);return [f.label.replace('온실 내부 ','').replace(' 측정값',''),latest?.[key],f.unit]}).map(([label,value,unit])=>`<div><span>${label}</span><strong>${value==null?'—':e(value)} <small>${value==null?'':unit}</small></strong></div>`).join('')}</div></div></section></div>`:empty('진행 중인 작기가 없습니다.')+link('cultivationPlanList.html','작기계획 보기')}`;
   if($('#homePlan'))$('#homePlan').onchange=ev=>{planId=ev.target.value;renderHome();$('#homePlan').focus()};
  }
 }else{
  const rows=tab==='issues'?issues:todayDiaries;
  const total=Math.max(1,Math.ceil(rows.length/4));page=Math.min(page,total);
  panel.innerHTML=`<button class="btn" type="button" id="homeBackOverview">← 작기 현황으로</button><div class="home-list-title"><h2>${tab==='issues'?'확인이 필요한 환경 이슈':'오늘의 재배일지'}</h2><span class="muted">${tab==='issues'?'전체 작기(종료 포함) · 발생·조치중':`기록된 작업 ${tasks.length}건 · 미완료 ${tasks.filter(t=>t.status==='미완료').length}건`}</span></div><div class="home-records">${rows.length?rows.slice((page-1)*4,page*4).map(row=>{
   const p=plans.find(p=>p.cycleId===row.cycleId),g=houses.find(g=>g.greenhouseId===p.greenhouseId);
   if(tab==='issues')return `<article class="home-record"><div><strong>${e(g.name)} · ${e(row.issueType)}</strong><p>${e(row.message||'메시지 없음')}</p><small>${e(p.name)} · ${e(formatAt(row.occurredAt))}</small></div><div class="home-record-action">${badge(row.status)}${link('environmentIssueList.html','상세',{view:'issue-detail',id:row.issueId})}</div></article>`;
   const ts=(row.tasks||[]).filter(alive);return `<article class="home-record"><div><strong>${e(g.name)} · ${e(p.name)}</strong><p>전체 ${ts.length} · 완료 ${ts.filter(t=>t.status==='완료').length} · 미완료 ${ts.filter(t=>t.status==='미완료').length}</p><small>실제 작업일 ${e(row.workDate)}</small></div>${link('cultivationDiaryList.html','일지 상세',{view:'detail',id:row.diaryId})}</article>`;
  }).join(''):empty(tab==='issues'?'발생 또는 조치중 상태의 이슈가 없습니다.':'오늘 작성된 재배일지가 없습니다. 작업 후 일지를 작성해 주세요.')}</div><div class="home-pagination"><button class="btn" id="homePrev" ${page===1?'disabled':''}>이전</button><span aria-live="polite">${page} / ${total}</span><button class="btn" id="homeNext" ${page===total?'disabled':''}>다음</button></div>`;
  $('#homePrev').onclick=()=>{page--;renderHome();$('#home-panel').focus()};$('#homeNext').onclick=()=>{page++;renderHome();$('#home-panel').focus()};
 }
 $('#homeCheckIssues').onclick=()=>{tab='issues';page=1;renderHome();$('#home-panel').focus()};
 const back=document.getElementById('homeBackOverview');if(back)back.onclick=()=>{tab='overview';renderHome();$('#home-panel').focus()};
}
pages.home={renderHome};
})();

/* 계획 UI. 목표·일정·실적은 ProducerPlanning과 공통 저장소에서 읽습니다. */
(function(root){
  'use strict';
  function create(ui){
    const {e,n,date,link,button,panel,field,select,textarea,form,table,getState,today}=ui;
    const P=root.ProducerPlanning;const s=()=>getState();
    const hidden=(name,value)=>'<input type="hidden" name="'+e(name)+'" value="'+e(value)+'">';
    const cycleLink=c=>'<p class="pm-muted">'+link('cycles-detail',c.name,{id:c.id,tab:'plan'})+'</p>';
    function goal(c){
      const m=P.summary(s(),c,today());const qty=v=>v==null?'미정':n(v)+' '+e(c.unit);
      return '<section class="pm-plan-goal" aria-label="출하 목표와 실적"><div class="pm-row"><div><h2>출하 목표와 실적</h2><p class="pm-plan-period">출하 예정기간 '+date(c.targetStart)+' ~ '+date(c.targetEnd)+'</p></div>'+button('cycles-add','목표 수정',{id:c.id,section:'target'})+'</div><dl class="pm-plan-metrics">'+[
        ['현재 재배수량',e(ui.stockText(c))],['목표 출하량',qty(m.target)],['실제 출하량',qty(m.shipped)],['목표까지 남은 수량',qty(m.remaining)]
      ].map(([k,v])=>'<div><dt>'+e(k)+'</dt><dd>'+v+'</dd></div>').join('')+'</dl><div class="pm-plan-target-detail"><span>목표 등급 <strong>'+e(c.targetGrade||'미정')+'</strong></span><span>규격 <strong>'+e(c.targetSpecification||'미정')+'</strong></span><span>예정 거래처 <strong>'+e(c.targetRecipient||'미정')+'</strong></span><span>출하 달성률 <strong>'+(m.achievement==null?'미정':n(m.achievement)+'%')+'</strong></span></div><p class="pm-muted">실제 출하량은 취소를 제외한 출하의 재배 차감 수량('+e(c.unit)+') 기준입니다.</p></section>';
    }
    function taskCard(t,c,day){
      const stage=(s().planStages||[]).find(p=>p.id===t.stageId);const editable=c.status!=='ended'&&!t.automationEventId;
      const links=t.records.map(r=>link('journal-detail',(r.date+' '+(r.time||'')).trim()+' 일지',{id:r.id}));
      const result=t.event?'<p class="pm-plan-evidence">자동 실행 결과 · '+e(t.event.status==='completed'?'완료':t.event.status==='failed'?'실패':'진행 중')+' · '+e(t.event.result)+'</p>':'';
      const record=editable&&t.date<=today()&&!['completed','skipped'].includes(t.currentStatus)?button('journal-add','작업 기록',{cycleId:c.id,planTaskId:t.id,date:day<today()?day:today()},true):'';
      return '<article class="pm-plan-task" data-plan-task="'+e(t.id)+'"><div class="pm-row"><h3>'+e(t.title)+'</h3><div class="pm-plan-tags">'+(t.overdue?'<span class="pm-badge closed">지연</span>':'')+'<span class="pm-badge '+(t.currentStatus==='completed'?'':'closed')+'">'+e(t.statusLabel)+'</span>'+(t.priority==='high'?'<span class="pm-badge closed">우선 확인</span>':'')+'</div></div><p class="pm-muted">'+date(t.date)+(t.time?' '+e(t.time):'')+' · '+e(t.type)+' · '+e(stage?.name||'개별 작업')+'</p><p>담당 '+e(t.assignee)+' · '+e(t.zone)+(t.quantity!==''&&t.quantity!=null?' · 계획량 '+n(t.quantity)+' '+e(t.unit):'')+'</p><p class="pm-plan-criteria">완료 기준 · '+e(t.criteria)+'</p>'+(t.reason?'<p class="pm-muted">사유 · '+e(t.reason)+'</p>':'')+result+'<div class="pm-actions">'+record+(editable?button('plan-task','계획 수정',{cycleId:c.id,id:t.id}):'')+(t.automationEventId?button('journal-day','실행 이력',{cycleId:c.id,date:t.date,section:'automation'}):'')+links.join(' · ')+'</div></article>';
    }
    function daily(c,day,compact=false){
      if(c.status==='ended')return '';
      const m=P.summary(s(),c,day);const chosen=[...m.late,...m.today].filter((t,i,a)=>a.findIndex(v=>v.id===t.id)===i);
      const pending=chosen.filter(t=>!['completed','skipped'].includes(t.currentStatus));const rows=compact?(pending.length?pending:chosen).slice(0,3):chosen;
      const preview=t=>'<li><div><strong>'+e(t.title)+'</strong><small>'+date(t.date)+(t.time?' '+e(t.time):'')+' · '+e(t.assignee)+' · '+e(t.overdue?'지연':t.statusLabel)+'</small></div>'+(c.status!=='ended'&&!t.automationEventId&&t.date<=today()&&!['completed','skipped'].includes(t.currentStatus)?button('journal-add','작업 기록',{cycleId:c.id,planTaskId:t.id,date:day<today()?day:today()}):link('cycles-detail','계획 보기',{id:c.id,tab:'plan'}))+'</li>';
      return '<section class="pm-plan-daily'+(compact?' is-compact':'')+'" aria-label="오늘의 계획"><div class="pm-row"><div><h2>'+date(day)+' 할 일</h2><p class="pm-muted">당일 '+m.today.length+'건 · 완료 '+m.today.filter(t=>t.currentStatus==='completed').length+'건 · 지연 '+m.late.length+'건</p></div>'+button('cycles-detail','계획 전체보기',{id:c.id,tab:'plan',date:day})+'</div>'+(rows.length?(compact?'<details class="pm-plan-preview-disclosure"><summary>오늘 작업 미리보기</summary><ul class="pm-plan-preview">'+rows.map(preview).join('')+'</ul></details>':rows.map(t=>taskCard(t,c,day)).join('')):'<p class="pm-empty">등록된 당일·지연 작업이 없습니다.</p>')+'</section>';
    }
    function guides(c,day){
      const items=P.guides(s(),c,day);
      const rules=c.planGuide||P.defaultGuide;const bound=(metric,unit)=>(rules[metric+'Min']==null||rules[metric+'Min']===''?'하한 없음':e(rules[metric+'Min']))+' ~ '+(rules[metric+'Max']==null||rules[metric+'Max']===''?'상한 없음':e(rules[metric+'Max']))+' '+unit;
      return '<section class="pm-plan-guides"><div class="pm-row"><h2>데일리 가이드</h2>'+(c.status==='ended'?'':button('plan-guide','가이드 기준 설정',{cycleId:c.id}))+'</div><p class="pm-muted">생육단계·최근 일지·관측 품질·자동 실행 결과를 바탕으로 확인할 작업을 제안합니다.</p><p class="pm-plan-guide-rules">생육조사 '+e(rules.growthIntervalDays)+'일 주기 · 온도 '+bound('temp','°C')+' · 습도 '+bound('humidity','%')+'</p>'+(items.length?'<div class="pm-plan-guide-grid">'+items.map(g=>'<article><h3>'+e(g.title)+'</h3><p>'+e(g.reason)+'</p><p class="pm-muted">'+e(g.criteria)+'</p><button type="button" class="btn" data-plan-guide="'+e(g.key)+'" data-plan-cycle="'+e(c.id)+'">계획에 추가</button></article>').join('')+'</div>':'<p class="pm-empty">추가할 가이드가 없습니다.</p>')+'</section>';
    }
    function guideForm(q){
      const c=s().cycles.find(c=>c.id===q.get('cycleId'));if(!c)return ui.missing();
      if(c.status==='ended')return panel('가이드 기준',cycleLink(c)+'<p>종료된 작기의 가이드 기준은 이력으로 보관합니다.</p>');
      const g=c.planGuide||P.defaultGuide;
      const last=(s().records||[]).filter(r=>r.cycleId===c.id&&r.metric&&!r.cancelled).map(r=>r.date).sort().at(-1);
      return panel('데일리 가이드 기준',cycleLink(c)+'<p class="pm-muted">현재 단계 '+e(c.stage)+' · '+e(P.stageTemplate(c).title)+(last?' · 최근 생육조사 '+date(last)+' · 다음 확인 '+date(P.shift(last,g.growthIntervalDays)):'')+'</p>'+form('planGuide',hidden('cycleId',c.id)+field('growthIntervalDays','생육조사 주기 (일)',g.growthIntervalDays,'number',true,'min="1" max="90" step="1"')+field('tempMin','온도 확인 최솟값 (°C)',g.tempMin,'number',false,'step="any"')+field('tempMax','온도 확인 최댓값 (°C)',g.tempMax,'number',false,'step="any"')+field('humidityMin','습도 확인 최솟값 (%)',g.humidityMin,'number',false,'min="0" max="100" step="any"')+field('humidityMax','습도 확인 최댓값 (%)',g.humidityMax,'number',false,'min="0" max="100" step="any"')+'<p class="pm-muted pm-wide">환경 범위를 비우면 해당 상한·하한 비교를 적용하지 않습니다. 집계 제외된 값은 범위 비교에서도 제외하고 관측값 확인으로 안내합니다. 변경한 기준은 이후 가이드에 적용되며 등록한 작업계획은 유지합니다.</p>','','기준 저장')+(c.guideHistory?.length?'<details class="pm-disclosure"><summary>가이드 기준 변경 이력 '+c.guideHistory.length+'건</summary>'+table(['시각','생육조사 주기','온도 범위','습도 범위'],c.guideHistory.map(h=>[e(h.at),e(h.after.growthIntervalDays)+'일',e(h.after.tempMin)+' ~ '+e(h.after.tempMax)+' °C',e(h.after.humidityMin)+' ~ '+e(h.after.humidityMax)+' %']),'가이드 기준 변경 이력')+'</details>':''));
    }
    function plan(c,q){
      const day=P.dateOK(q.get('date'))?q.get('date'):c.endDate||today();const scope=q.get('scope')||(c.status==='ended'?'all':'week');const stateFilter=q.get('taskStatus')||'';const m=P.summary(s(),c,day);
      const rows=root.ProducerInsights.sort(m.all.filter(t=>(scope==='all'||(t.date>=day&&t.date<=P.shift(day,scope==='day'?0:6)))&&(!stateFilter||(stateFilter==='overdue'?t.overdue:t.currentStatus===stateFilter))),q.get('sort')||'dateAsc','tasks',s());
      const late=m.late.filter(t=>!rows.some(r=>r.id===t.id)&&(!stateFilter||stateFilter==='overdue'||stateFilter===t.currentStatus));
      const stages=(s().planStages||[]).filter(p=>p.cycleId===c.id).sort((a,b)=>a.start.localeCompare(b.start));
      const shipmentStage=stages.find(p=>p.kind==='shipment');
      const review=c.status!=='ended'&&shipmentStage&&c.targetStart&&c.targetEnd&&(shipmentStage.start!==c.targetStart||shipmentStage.end!==c.targetEnd)?'<p class="pm-notice">목표 출하기간과 단계 일정이 다릅니다. '+link('plan-stage','출하 단계 일정 검토',{cycleId:c.id,id:shipmentStage.id})+'</p>':'';
      const filters='<form class="pm-plan-filter" data-query="cycles-detail">'+hidden('id',c.id)+hidden('tab','plan')+field('date','기준일',day,'date',true)+select('scope','조회 범위',[['day','기준일 하루'],['week','기준일부터 7일'],['all','전체 기간']],scope)+select('taskStatus','작업 상태',[['','전체 상태'],['overdue','지연'],...Object.entries(P.statuses)],stateFilter)+select('sort','정렬',[['dateAsc','예정일 빠른순'],['dateDesc','예정일 늦은순'],['priority','우선순위순'],['nameAsc','작업명순']],q.get('sort')||'dateAsc')+'<button class="btn primary" type="submit">조회</button></form>';
      const stageRows=stages.map(p=>{const ts=m.all.filter(t=>t.stageId===p.id);const completed=ts.filter(t=>t.currentStatus==='completed').length;return [e(p.name),date(p.start)+' ~ '+date(p.end),e(p.goal)+'<small>'+e(p.criteria)+'</small>',ts.length?completed+' / '+ts.filter(t=>t.currentStatus!=='skipped').length+'건':'작업 미배정',c.status==='ended'?'종료 작기':link('plan-stage','단계 수정',{cycleId:c.id,id:p.id})+' · '+link('plan-task','작업 추가',{cycleId:c.id,stageId:p.id})];});
      const targetHistory=c.targetHistory?.length?'<details class="pm-disclosure"><summary>출하 목표 변경 이력 '+c.targetHistory.length+'건</summary>'+table(['시각','이전 목표','변경 목표'],c.targetHistory.map(h=>[e(h.at),e(h.before.targetQty)+' '+e(c.unit)+' · '+e(h.before.targetStart)+' ~ '+e(h.before.targetEnd),e(h.after.targetQty)+' '+e(c.unit)+' · '+e(h.after.targetStart)+' ~ '+e(h.after.targetEnd)]),'출하 목표 변경 이력')+'</details>':'';
      return '<div class="pm-plan-workspace"><section><div class="pm-row"><h2>단계별 계획</h2>'+(c.status==='ended'?'':button('plan-stage','단계 추가',{cycleId:c.id}))+'</div>'+review+table(['단계','계획기간','목표·완료 기준','작업 완료','관리'],stageRows,'작기 단계별 계획',{indexed:true})+targetHistory+'</section><section><div class="pm-row"><div><h2>일일 작업계획</h2><p class="pm-muted">전체 작업 완료 '+m.completed+' / '+m.workCount+'건 · '+(m.workCount?n(m.completed/m.workCount*100):'0')+'%'+(c.status==='ended'?' · 종료 시점의 계획·실적 보관':'')+'</p></div>'+(c.status==='ended'?'':button('plan-task','작업 추가',{cycleId:c.id,date:day},true))+'</div>'+filters+(late.length?'<details class="pm-plan-late" open><summary>기준일 이전 지연 작업 '+late.length+'건</summary>'+late.map(t=>taskCard(t,c,day)).join('')+'</details>':'')+'<div class="pm-plan-task-list">'+(rows.length?rows.map(t=>taskCard(t,c,day)).join(''):'<p class="pm-empty">조회 조건에 맞는 작업이 없습니다.</p>')+'</div></section>'+(day===today()?guides(c,day):'<p class="pm-muted">데일리 가이드는 오늘 기준으로 확인합니다.</p>')+'</div>';
    }
    function history(item){return item?.history?.length?'<details class="pm-disclosure"><summary>계획 변경 이력 '+item.history.length+'건</summary>'+table(['시각','변경','이전 일정','사유'],item.history.map(h=>[e(h.at),e(h.action),e(h.before?.date||h.before?.start||'—'),e(h.reason||'—')]),'계획 변경 이력')+'</details>':'';}
    function taskForm(q){
      const item=(s().planTasks||[]).find(t=>t.id===q.get('id'));const c=s().cycles.find(c=>c.id===(q.get('cycleId')||item?.cycleId));
      if(!c||(q.get('id')&&!item)||(item&&item.cycleId!==c.id))return ui.missing();
      if(c.status==='ended'||item?.automationEventId)return panel('계획 조회',cycleLink(c)+'<p>종료 작기와 자동 실행 계획은 원본 이력에서 확인합니다.</p>');
      const day=P.dateOK(q.get('date'))?q.get('date'):today();const t=item||{date:day<c.start?c.start:day,stageId:(s().planStages||[]).some(p=>p.id===q.get('stageId')&&p.cycleId===c.id)?q.get('stageId'):'',status:'planned',priority:'normal',assignee:s().profile.name,zone:s().houses.find(h=>h.id===c.houseId)?.zone||'온실 전체',type:'재배작업'};
      const completed=item&&P.status(s(),item)==='completed';
      const stages=(s().planStages||[]).filter(p=>p.cycleId===c.id);
      return panel(item?'작업계획 수정':'작업계획 등록',cycleLink(c)+form('planTasks',hidden('cycleId',c.id)+field('title','작업명',t.title,'text',true)+select('stageId','단계 계획',[['','개별 작업'],...stages.map(p=>[p.id,p.name])],t.stageId)+field('date','작업 예정일',t.date,'date',true)+field('time','예정시각',t.time,'time')+select('type','작업 유형',P.workTypes.map(v=>[v,v]),t.type,false,true)+field('zone','대상 구역',t.zone,'text',true)+field('assignee','담당자',t.assignee,'text',true)+select('priority','우선순위',[['normal','보통'],['high','우선 확인']],t.priority)+field('quantity','계획량',t.quantity,'number',false,'min="0" step="any"')+field('unit','계획량 단위',t.unit)+(completed?hidden('status',t.status)+'<p class="pm-wide">상태 · 완료 (연결된 일지 기준)</p>':select('status','진행 상태',Object.entries(P.statuses).filter(([key])=>key!=='completed'),t.status))+textarea('criteria','완료 기준',t.criteria,true)+textarea('reason','일정 변경·연기·생략 사유',t.reason),item?.id||'','계획 저장')+history(item));
    }
    function stageForm(q){
      const item=(s().planStages||[]).find(p=>p.id===q.get('id'));const c=s().cycles.find(c=>c.id===(q.get('cycleId')||item?.cycleId));
      if(!c||(q.get('id')&&!item)||(item&&item.cycleId!==c.id))return ui.missing();
      if(c.status==='ended')return panel('단계 계획',cycleLink(c)+'<p>종료된 작기의 계획은 이력으로 보관합니다.</p>');
      const p=item||{start:today()<c.start?c.start:today(),end:c.targetEnd&&c.targetEnd>=today()?c.targetEnd:today()};
      return panel(item?'단계 계획 수정':'단계 계획 등록',cycleLink(c)+form('planStages',hidden('cycleId',c.id)+field('name','단계명',p.name,'text',true)+field('start','계획 시작일',p.start,'date',true)+field('end','계획 종료일',p.end,'date',true)+textarea('goal','단계 목표',p.goal,true)+textarea('criteria','완료 기준',p.criteria,true)+textarea('reason','변경 사유',p.reason),item?.id||'','단계 저장')+history(item));
    }
    function recordFields(c,r={}){
      if(!c)return '';
      const choices=(s().planTasks||[]).filter(t=>t.cycleId===c.id&&!t.automationEventId);
      return select('planTaskId','연결할 작업계획',[['','계획 없이 직접 기록'],...choices.map(t=>[t.id,t.date+' · '+t.title])],r.planTaskId||'')+select('planOutcome','작업 결과',[['in_progress','진행 중 · 추가 작업 필요'],['completed','완료 · 완료 기준 충족']],r.planOutcome||'in_progress')+'<p class="pm-muted pm-wide">계획을 선택한 경우에만 진행 결과가 해당 작업에 반영됩니다.</p>';
    }
    function recordLinks(r){
      const t=(s().planTasks||[]).find(t=>t.id===r.planTaskId&&t.cycleId===r.cycleId);
      return t?'<p class="pm-plan-record-link">연결 작업 · '+link('plan-task',t.title,{id:t.id,cycleId:t.cycleId})+' · '+e(r.planOutcome==='completed'?'완료':'진행 중')+' · '+link('cycles-detail','작기 계획으로 돌아가기',{id:t.cycleId,tab:'plan'})+'</p>':'';
    }
    function home(c,houseId){
      const cycles=s().cycles.filter(c=>c.houseId===houseId&&c.status!=='ended');const ids=cycles.map(c=>c.id);const rows=P.tasks(s(),null,today()).filter(t=>ids.includes(t.cycleId)&&(t.date===today()||t.overdue));
      return '<section class="pm-home-card pm-home-checks" aria-label="오늘 체크사항"><div class="pm-row"><h2>'+date(today())+' · 오늘의 계획</h2>'+(c?link('cycles-detail','전체보기',{id:c.id,tab:'plan'}):'')+'</div>'+(rows.length?'<ul class="pm-plan-home-list">'+rows.slice(0,4).map(t=>'<li>'+link('cycles-detail',t.title,{id:t.cycleId,tab:'plan'})+'<small>'+e(s().cycles.find(c=>c.id===t.cycleId)?.name)+' · '+e(t.overdue?'지연':t.statusLabel)+'</small></li>').join('')+'</ul><p class="pm-muted">당일·지연 작업 '+rows.length+'건</p>':'<p class="pm-muted">등록된 오늘의 계획이 없습니다.</p>')+'</section>';
    }
    function houseSummary(c){if(c.status==='ended')return '<p class="pm-muted">종료된 작기의 계획·실적은 작기 상세에서 확인합니다.</p>';const m=P.summary(s(),c,today());return '<p class="pm-muted">오늘 계획 '+m.today.length+'건 · 완료 '+m.today.filter(t=>t.currentStatus==='completed').length+'건 · 지연 '+m.late.length+'건</p>';}
    return {goal,plan,daily,taskForm,stageForm,guideForm,recordFields,recordLinks,home,houseSummary};
  }
  root.ProducerPlanningUI={create};
})(typeof globalThis!=='undefined'?globalThis:this);

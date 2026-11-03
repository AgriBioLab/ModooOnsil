/* 작기 목표·단계·일일 계획의 공통 모델. 계획은 재고나 작업 실적을 만들지 않습니다. */
(function(root){
  'use strict';
  const statuses={planned:'예정',in_progress:'진행 중',completed:'완료',deferred:'연기',skipped:'생략'};
  const workTypes=['생육·관찰','관수·시비','재배작업','병해충·이상','시설·환경','출하 준비'];
  const defaultGuide={growthIntervalDays:7,tempMin:18,tempMax:28,humidityMin:55,humidityMax:80};
  const stageTemplate=c=>/꽃대|봉오리/.test(c.stage)?{title:'꽃대·봉오리 상태 확인',criteria:'동일 표본의 꽃대 길이·봉오리 상태를 조사하고 기록합니다.'}:/개화|출하/.test(c.stage)?{title:'개화·상품성 확인',criteria:'개화율·화색·손상 여부를 기록하고 목표 등급·규격과 비교합니다.'}:/정식|활착|입고/.test(c.stage)?{title:'활착·배지 상태 확인',criteria:'잎·뿌리·배지 상태와 이상 여부를 확인하고 기록합니다.'}:{title:'생육 상태 확인',criteria:'동일 표본의 생육·이상 여부를 확인하고 일지를 남깁니다.'};
  const shift=(day,n)=>new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  const taskRecords=(s,t)=>(s.records||[]).filter(r=>r.planTaskId===t.id&&r.cycleId===t.cycleId&&!r.cancelled);
  function event(s,t){return (s.automationEvents||[]).find(a=>a.id===t.automationEventId&&a.cycleId===t.cycleId&&a.date===t.date);}
  function status(s,t){
    if(event(s,t)?.status==='completed'||taskRecords(s,t).some(r=>r.planOutcome==='completed'))return 'completed';
    if(['deferred','skipped'].includes(t.status))return t.status;
    return taskRecords(s,t).length?'in_progress':t.status||'planned';
  }
  function tasks(s,cycleId,day){
    return (s.planTasks||[]).filter(t=>!cycleId||t.cycleId===cycleId).map(t=>{
      const current=status(s,t);return {...t,currentStatus:current,statusLabel:statuses[current],overdue:t.date<day&&!['completed','skipped'].includes(current),records:taskRecords(s,t),event:event(s,t)};
    }).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')||a.id.localeCompare(b.id));
  }
  function summary(s,c,day){
    const all=tasks(s,c.id,day);const shipped=s.shipments.filter(v=>v.cycleId===c.id&&!v.cancelled).reduce((sum,v)=>sum+Number(v.stockQuantity==null||v.stockQuantity===''?v.quantity:v.stockQuantity),0);
    const target=c.targetQty==null||c.targetQty===''?null:Number(c.targetQty);
    return {all,shipped,target,remaining:target==null?null:Math.max(0,target-shipped),achievement:target?shipped/target*100:null,today:all.filter(t=>t.date===day),late:all.filter(t=>t.overdue),completed:all.filter(t=>t.currentStatus==='completed').length,workCount:all.filter(t=>t.currentStatus!=='skipped').length};
  }
  function guides(s,c,day){
    if(!c||c.status==='ended'||day<c.start)return [];
    const list=[];const add=(key,title,type,reason,criteria)=>list.push({key:c.id+'|'+day+'|'+key,cycleId:c.id,date:day,title,type,reason,criteria,stageId:(s.planStages||[]).find(p=>p.cycleId===c.id&&p.start<=day&&p.end>=day)?.id||'',assignee:s.profile.name,zone:s.houses.find(h=>h.id===c.houseId)?.zone||'온실 전체',priority:'normal'});
    const rules=c.planGuide||defaultGuide;const template=stageTemplate(c);
    const lastGrowth=(s.records||[]).filter(r=>r.cycleId===c.id&&r.metric&&r.date<=day&&!r.cancelled).map(r=>r.date).sort().at(-1);
    if(!lastGrowth||shift(lastGrowth,Number(rules.growthIntervalDays)||7)<=day)add('growth',template.title,'생육·관찰',c.crop+' · '+(c.variety||'')+' · '+c.stage+' / 조사 주기 '+rules.growthIntervalDays+'일'+(lastGrowth?' / 최근 조사 '+lastGrowth:''),template.criteria);
    const observations=(s.environment||[]).filter(r=>r.houseId===c.houseId&&r.date===day);
    if(!observations.length)add('sensor-gap','센서 수집 상태 점검','시설·환경','오늘 이 온실의 환경 관측 기록이 없습니다.','장비 전원·통신·마지막 수신 시각과 점검 결과를 기록합니다.');
    else if(observations.some(r=>Object.values(r.quality||{}).includes('invalid')))add('sensor-quality','환경 관측값 확인','시설·환경','오늘 관측에 집계 제외된 값이 있습니다.','원자료와 장비 상태를 확인하고 확인 결과를 기록합니다.');
    for(const [metric,label,unit]of [['temp','온도','°C'],['humidity','습도','%']]){
      const min=rules[metric+'Min'];const max=rules[metric+'Max'];const hasMin=min!==''&&min!=null;const hasMax=max!==''&&max!=null;
      const outside=observations.filter(r=>r.quality?.[metric]!=='invalid'&&r.units?.[metric]===unit&&r[metric]!==''&&r[metric]!=null&&Number.isFinite(Number(r[metric]))&&((hasMin&&Number(r[metric])<Number(min))||(hasMax&&Number(r[metric])>Number(max))));
      if(outside.length)add('range-'+metric,label+' 확인 범위 이탈 점검','시설·환경',outside.length+'건의 유효 '+label+' 관측이 작기에 설정한 '+(hasMin?min:'하한 없음')+' ~ '+(hasMax?max:'상한 없음')+' '+unit+' 범위를 벗어났습니다.','환경 원자료·장비 상태를 확인한 뒤 작업 필요 여부와 결과를 기록합니다.');
    }
    const failed=(s.automationEvents||[]).filter(a=>a.cycleId===c.id&&a.date===day&&a.status==='failed');
    if(failed.length)add('execution-failed','자동 실행 실패 확인','시설·환경',failed.length+'건의 자동 작업에 완료 응답이 없습니다.','실행 이력에서 실패 사유와 장치 상태를 확인하고 조치 결과를 기록합니다.');
    if(c.targetStart&&day>=shift(c.targetStart,-14)&&day<=(c.targetEnd||c.targetStart))add('shipping-ready','출하 준비 확인','출하 준비','목표 출하기간이 다가왔습니다.','출하 가능 수량·등급·규격·포장·거래처를 확인합니다.');
    const recent=(s.records||[]).filter(r=>r.cycleId===c.id&&r.date<day&&r.followup&&r.inputSource!=='automatic'&&!r.cancelled).sort((a,b)=>b.date.localeCompare(a.date))[0];
    if(recent)add('followup-'+recent.id,'이전 일지 후속 확인','생육·관찰',recent.followup,'이전 일지의 확인 사항을 점검하고 결과를 기록합니다.');
    return list.filter(g=>!(s.planTasks||[]).some(t=>t.guideKey===g.key));
  }
  function needsSeed(s){return s.planningDataVersion!==1;}
  function enrich(s,day){
    s.planStages||=[];s.planTasks||=[];s.planningSeededCycles||=[];
    for(const c of s.cycles){
      if(s.planningSeededCycles.includes(c.id))continue;
      const end=c.endDate||'';const ref=end&&end<day?end:day;const clamp=d=>d<c.start?c.start:end&&d>end?end:d;
      const prep=clamp(shift(c.targetStart||ref,-14));const ship=clamp(c.targetStart||ref);const finish=clamp(c.targetEnd||ship);
      const prefix='plan22-'+c.id;
      const stages=[{id:prefix+'-growing',name:'재배·생육 관리',start:c.start,end:prep<c.start?c.start:prep,goal:'생육·환경 상태 확인 ('+c.stage+')',criteria:'동일 표본의 관찰과 시설 점검 기록 확인'},
        {id:prefix+'-preparation',name:'출하 준비',start:prep,end:ship,goal:'등급·규격·출하 가능 수량 확인',criteria:'선별·포장·거래처 확인'},
        {id:prefix+'-shipment',name:'목표 출하',start:ship,end:finish<ship?ship:finish,goal:'목표 출하량과 기간 준수',criteria:'실제 출하 기록과 목표 대비 수량 확인'}];
      for(const [index,p] of stages.entries())if(!s.planStages.some(v=>v.id===p.id))s.planStages.push({...p,kind:['growing','preparation','shipment'][index],cycleId:c.id,history:[]});
      const currentStage=stages.find(p=>p.start<=ref&&p.end>=ref)||stages.at(-1);
      const add=(suffix,values)=>{const id=prefix+'-'+suffix;if(!s.planTasks.some(t=>t.id===id))s.planTasks.push({id,cycleId:c.id,stageId:currentStage.id,date:ref,time:'',title:'',type:'재배작업',zone:s.houses.find(h=>h.id===c.houseId)?.zone||'온실 전체',assignee:s.profile.name,priority:'normal',quantity:'',unit:'',status:'planned',reason:'',criteria:'작업 결과를 일지로 남깁니다.',history:[],...values});};
      add('growth',{title:'표본 생육조사',time:'08:40',type:'생육·관찰',criteria:'P-01 표본의 초장·잎·이상 여부를 확인하고 기록합니다.'});
      add('water-check',{title:'배지·관수 상태 점검',time:'10:10',criteria:'배지 상태와 관수 공급부를 확인하고 결과를 기록합니다.'});
      if(ref>c.start)add('overdue',{title:'관수 공급부 점검',date:shift(ref,-1),time:'16:00',priority:'high',criteria:'공급부 누수·막힘 여부 확인'});
      if(!end||shift(ref,3)<=end)add('weekly',{title:'주간 생육 변화 확인',date:shift(ref,3),type:'생육·관찰',criteria:'지난 조사와 동일 표본·항목·단위로 비교합니다.'});
      add('preparation',{title:'선별·포장·거래처 확인',stageId:stages[1].id,date:prep,type:'출하 준비',criteria:'목표 등급·규격과 출하 가능 수량 확인'});
      for(const a of (s.automationEvents||[]).filter(a=>a.cycleId===c.id&&a.date===ref))add('auto-'+a.id,{title:a.operation+' 자동 실행 확인',time:a.startedAt?.slice(11,16)||'',type:a.operation==='관수'?'관수·시비':'시설·환경',automationEventId:a.id,quantity:a.quantity,unit:a.unit,criteria:'장치의 완료 응답과 실제 결과를 확인합니다.'});
      for(const key of ['targetGrade','targetSpecification','targetRecipient'])if(c[key]==null||c[key]==='')c[key]=({targetGrade:'상',targetSpecification:'분화 7호',targetRecipient:'화훼유통센터'})[key];
      if(!c.planGuide)c.planGuide={...defaultGuide};
      s.planningSeededCycles.push(c.id);
    }
    s.planningDataVersion=1;
  }
  function validate(s){
    const required=(v,label)=>{if(!String(v??'').trim())throw new Error(label+'을(를) 입력해 주세요.');};
    const cycle=id=>s.cycles.find(c=>c.id===id);
    for(const c of s.cycles){
      if(!c.planGuide)continue;const g=c.planGuide;
      if(!Number.isSafeInteger(g.growthIntervalDays)||g.growthIntervalDays<1||g.growthIntervalDays>90)throw new Error('생육조사 주기는 1~90일의 정수로 입력해 주세요.');
      for(const metric of ['temp','humidity']){
        const lo=g[metric+'Min'];const hi=g[metric+'Max'];const has=v=>v!==''&&v!=null;
        if([lo,hi].some(v=>has(v)&&!Number.isFinite(Number(v)))||(has(lo)&&has(hi)&&Number(lo)>Number(hi)))throw new Error('환경 확인 범위의 최솟값·최댓값을 확인해 주세요.');
        if(metric==='humidity'&&[lo,hi].some(v=>has(v)&&(Number(v)<0||Number(v)>100)))throw new Error('습도 확인 범위는 0~100%로 입력해 주세요.');
      }
    }
    for(const type of ['planStages','planTasks']){
      const rows=s[type]||[];if(!Array.isArray(rows))throw new Error('계획 데이터 형식을 확인해 주세요.');
      if(new Set(rows.map(v=>v.id)).size!==rows.length)throw new Error('계획 ID가 중복되었습니다.');
      for(const p of rows){
        required(p.id,'계획 ID');const c=cycle(p.cycleId);if(!c)throw new Error('계획의 작기를 찾을 수 없습니다.');
        if(type==='planStages'){
          required(p.name,'단계명');required(p.goal,'단계 목표');required(p.criteria,'완료 기준');
          if(!dateOK(p.start)||!dateOK(p.end)||p.start>p.end||p.start<c.start)throw new Error('단계 계획기간은 작기 시작일 이후로 입력해 주세요.');
        }else{
          required(p.title,'작업명');required(p.assignee,'담당자');required(p.zone,'대상 구역');required(p.criteria,'작업 완료 기준');
          if(!dateOK(p.date)||p.date<c.start)throw new Error('작업 예정일은 작기 시작일 이후여야 합니다.');
          if(p.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time))throw new Error('작업 예정시각을 확인해 주세요.');
          if(!workTypes.includes(p.type)||!['planned','in_progress','deferred','skipped'].includes(p.status)||!['normal','high'].includes(p.priority))throw new Error('작업 유형·상태·우선순위를 확인해 주세요.');
          if(p.stageId&&!(s.planStages||[]).some(v=>v.id===p.stageId&&v.cycleId===c.id))throw new Error('같은 작기의 단계 계획을 선택해 주세요.');
          if(p.quantity!==''&&p.quantity!=null){if(!Number.isFinite(Number(p.quantity))||Number(p.quantity)<0)throw new Error('계획량은 0 이상의 수로 입력해 주세요.');required(p.unit,'계획량 단위');}
          if(['deferred','skipped'].includes(p.status))required(p.reason,'연기·생략 사유');
          if(p.automationEventId&&!event(s,p))throw new Error('자동 작업 계획의 실행 원본을 확인해 주세요.');
        }
      }
    }
    for(const r of s.records){if(!r.planTaskId)continue;const t=(s.planTasks||[]).find(t=>t.id===r.planTaskId&&t.cycleId===r.cycleId);if(!t)throw new Error('일지와 같은 작기의 계획 작업을 선택해 주세요.');if(t.automationEventId)throw new Error('자동 실행 계획은 장치의 실행 결과로 확인합니다.');if(!['in_progress','completed'].includes(r.planOutcome))throw new Error('계획 작업의 진행 결과를 선택해 주세요.');}
  }
  const api={statuses,workTypes,defaultGuide,stageTemplate,shift,dateOK,taskRecords,event,status,tasks,summary,guides,needsSeed,enrich,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProducerPlanning=api;
})(typeof globalThis!=='undefined'?globalThis:this);

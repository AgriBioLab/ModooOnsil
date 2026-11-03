/* 화면별 조회 우선순위와 의사결정 통계. 저장 원본은 읽기만 합니다. */
(function(root){
  'use strict';
  const D=root.ProducerManagementStore||(typeof module!=='undefined'&&module.exports?require('./producerManagementStore.js'):null);
  const P=root.ProducerPlanning||(typeof module!=='undefined'&&module.exports?require('./producerPlanning.js'):null);
  const policies={
    cycles:['houseId','status','search','variety'],journal:['startDate','endDate','houseId','cycleId','type'],shipments:['startDate','endDate','houseId','cycleId','status'],houses:['farmId','search','status'],farms:['search','status'],comparison:['houseId','cycleId','startDate','endDate','series','envMetric'],'shipping-stats':['mode','houseId','cycleId','startDate','endDate','cutoff','unit'],'journal-day':['date','houseId','cycleId'],'sensor-data':['houseId','date','metric','quality'],'decision-stats':['startDate','endDate','houseId','cycleId']
  };
  const sortOptions={
    cycles:[['dateDesc','재배 시작일 최신순'],['dateAsc','재배 시작일 오래된순'],['nameAsc','작기명순'],['quantityDesc','단위별 잔량 많은순']],journal:[['dateDesc','최신 기록순'],['dateAsc','오래된 기록순'],['nameAsc','작기명순']],shipments:[['dateDesc','최근 출하순'],['dateAsc','오래된 출하순'],['quantityDesc','단위별 출하량 많은순'],['amountDesc','등록금액 높은순']],houses:[['nameAsc','온실명순'],['nameDesc','온실명 역순'],['areaDesc','면적 큰순']],farms:[['nameAsc','농장명순'],['nameDesc','농장명 역순']],'sensor-data':[['dateDesc','최근 관측순'],['dateAsc','오래된 관측순']],'decision-stats':[['priority','확인 우선순'],['dateAsc','출하 예정일 빠른순'],['remainingDesc','단위별 목표 잔여량 많은순']],'shipping-stats':[['dateAsc','월 오름차순'],['dateDesc','월 내림차순']]
  };
  const textCompare=(a,b)=>String(a??'').localeCompare(String(b??''),'ko',{numeric:true});
  function sort(rows,key,kind,s){
    const selected=key||sortOptions[kind]?.[0]?.[0]||'dateAsc';
    const name=r=>kind==='tasks'?(r.title||''):r.name||r.cycle?.name||(s?.cycles.find(c=>c.id===r.cycleId)?.name)||r.title||'';
    const stamp=r=>r.start||r.date||r.observedAt||r.month||'';
    const quantity=r=>kind==='cycles'?r.initial+s.adjustments.filter(a=>a.cycleId===r.id).reduce((n,a)=>n+a.quantity,0)-s.shipments.filter(v=>v.cycleId===r.id&&!v.cancelled).reduce((n,v)=>n+D.stockQuantity(v),0):r.quantity;
    const number=(r,k)=>r[k]==null||r[k]===''?-Infinity:Number(r[k]);
    return rows.slice().sort((a,b)=>{
      let result=0;
      if(selected==='nameAsc'||selected==='nameDesc')result=textCompare(name(a),name(b))*(selected==='nameDesc'?-1:1);
      else if(selected==='quantityDesc')result=textCompare(a.unit,b.unit)||quantity(b)-quantity(a);
      else if(selected==='amountDesc')result=number(b,'totalAmount')-number(a,'totalAmount');
      else if(selected==='areaDesc')result=number(b,'area')-number(a,'area');
      else if(selected==='priority')result=(a.rank??(a.priority==='high'?0:1))-(b.rank??(b.priority==='high'?0:1));
      else if(selected==='remainingDesc')result=textCompare(a.cycle?.unit,b.cycle?.unit)||(b.remaining??-Infinity)-(a.remaining??-Infinity);
      else result=textCompare(stamp(a),stamp(b))*(selected==='dateDesc'?-1:1);
      return result||(selected==='priority'?textCompare(stamp(a),stamp(b)):0)||textCompare(a.time,b.time)*(selected==='dateDesc'?-1:1)||textCompare(a.id,b.id);
    });
  }
  function matchesCycle(s,c,q){
    if(!c)return false;
    const get=k=>q.get(k);const h=s.houses.find(h=>h.id===c.houseId);
    return (!get('cycleId')||c.id===get('cycleId'))&&(!get('houseId')||c.houseId===get('houseId'))&&(!get('farmId')||h?.farmId===get('farmId'))&&(!get('variety')||String(c.variety||'').toLocaleLowerCase().includes(get('variety').trim().toLocaleLowerCase()));
  }
  function enhanceFilters(content,q,ui){
    content.querySelectorAll('.pm-filters').forEach(filter=>{
      const view=filter.dataset.query;let primary=policies[view];
      if(view==='journal'&&q.get('mode')==='calendar')primary=['month','houseId','cycleId','type'];
      if(sortOptions[view])filter.insertAdjacentHTML('beforeend',ui.select('sort','정렬',sortOptions[view],q.get('sort')||sortOptions[view][0][0]));
      const fields=[...filter.children].filter(el=>el.matches('label'));
      const find=name=>fields.find(el=>el.querySelector('[name="'+name+'"]'));
      const main=document.createElement('div');main.className='pm-filter-primary';
      for(const name of primary||fields.map(el=>el.querySelector('[name]')?.name).filter(n=>n!=='sort')){const field=find(name);if(field)main.append(field);}
      const start=main.querySelector('[name=startDate]')?.closest('label'),end=main.querySelector('[name=endDate]')?.closest('label');
      if(start&&end){const range=document.createElement('div');range.className='pm-date-range';start.before(range);range.append(start,end);}
      const extra=fields.filter(el=>el.parentElement===filter&&!el.querySelector('[name=sort]'));
      const toolbar=document.createElement('div');toolbar.className='pm-filter-toolbar';
      if(extra.length){const more=document.createElement('details');more.className='pm-filter-more';const summary=document.createElement('summary');const applied=extra.some(el=>{const n=el.querySelector('[name]')?.name;return q.has(n)&&!!q.get(n);});summary.textContent=applied?'상세 조건 · 적용 중':'상세 조건';more.open=applied;more.append(summary);const grid=document.createElement('div');grid.className='pm-filter-extra';extra.forEach(el=>grid.append(el));more.append(grid);toolbar.append(more);}
      if(start&&end){const shortcuts=document.createElement('div');shortcuts.className='pm-filter-presets';shortcuts.innerHTML=[['today','오늘'],['week','최근 7일'],['month','이번 달']].map(([key,label])=>'<button type="button" class="btn" data-filter-range="'+key+'">'+label+'</button>').join('');toolbar.append(shortcuts);}
      const sorter=find('sort');if(sorter){sorter.classList.add('pm-filter-sort');toolbar.append(sorter);}
      toolbar.append(filter.querySelector('.search-actions'));filter.append(main,toolbar);filter.classList.add('pm-priority-filters');
    });
  }
  function dashboard(s,q,today){
    const end=P.dateOK(q.get('endDate'))?q.get('endDate'):today;const cutoff=end>today?today:end;const start=P.dateOK(q.get('startDate'))?q.get('startDate'):P.shift(cutoff,-29);
    const view={...s,records:s.records.filter(r=>r.date<=cutoff),shipments:s.shipments.filter(r=>r.date<=cutoff),adjustments:s.adjustments.filter(r=>r.date<=cutoff),automationEvents:(s.automationEvents||[]).filter(r=>r.date<=cutoff)};
    const scope=q.get('cycleStatus')||'active';const cycles=s.cycles.filter(c=>matchesCycle(s,c,q)&&c.start<=cutoff&&(scope==='all'||((c.endDate&&c.endDate<=cutoff)?'ended':'active')===scope));const ids=new Set(cycles.map(c=>c.id));
    const inPeriod=r=>r.date>=start&&r.date<=cutoff;
    const issues=[];const targets=[];const addIssue=(c,rank,title,evidence,view,params)=>issues.push({id:c.id+'-'+title,cycleId:c.id,rank,title,evidence,view,params});
    for(const c of cycles){
      const model=P.summary(view,c,cutoff);const changes=view.adjustments.filter(r=>r.cycleId===c.id).reduce((n,r)=>n+r.quantity,0);const balance=c.initial+changes-model.shipped;
      const shortfall=model.remaining==null||c.quantityPending?null:Math.max(0,model.remaining-balance);const past=!!(c.targetEnd&&c.targetEnd<cutoff&&model.remaining>0);const soon=!!(c.targetStart&&c.targetStart<=P.shift(cutoff,14)&&(!c.targetEnd||c.targetEnd>=cutoff));
      targets.push({id:c.id,cycle:c,date:c.targetStart||'9999',balance:c.quantityPending?null:balance,shipped:model.shipped,remaining:model.remaining,target:model.target,achievement:model.achievement,shortfall,past,soon,rank:shortfall>0?0:past?1:soon?2:3});
      if(c.status!=='ended'||(c.endDate&&c.endDate>cutoff)){
        const late=model.late;const failed=view.automationEvents.filter(a=>a.cycleId===c.id&&a.date===cutoff&&a.status==='failed');
        if(failed.length)addIssue(c,0,'자동 실행 실패',failed.length+'건 · 완료 응답 확인','journal-day',{cycleId:c.id,date:cutoff,section:'automation'});
        const observations=s.environment.filter(r=>r.houseId===c.houseId&&r.date===cutoff);const rules=c.planGuide||P.defaultGuide;
        if(!observations.length)addIssue(c,1,'당일 센서 수집 확인','기준일 관측 없음','sensor-data',{houseId:c.houseId,date:cutoff});
        else{
          const excluded=observations.filter(r=>typeof r.quality==='string'?['invalid','error','rejected'].includes(r.quality):Object.values(r.quality||{}).some(v=>['invalid','error','rejected'].includes(v))).length;
          if(excluded)addIssue(c,1,'관측 품질 확인',excluded+'개 관측 묶음에 제외값 있음','sensor-data',{houseId:c.houseId,date:cutoff,quality:'excluded'});
          for(const [metric,label,unit]of [['temp','온도','°C'],['humidity','습도','%']]){const min=rules[metric+'Min'],max=rules[metric+'Max'];const has=v=>v!==''&&v!=null;const outside=observations.filter(r=>!['invalid','error','rejected'].includes(r.quality?.[metric]||(typeof r.quality==='string'?r.quality:''))&&r.units?.[metric]===unit&&typeof r[metric]==='number'&&Number.isFinite(r[metric])&&((has(min)&&r[metric]<min)||(has(max)&&r[metric]>max)));
            if(outside.length)addIssue(c,0,label+' 설정 범위 확인',outside.length+'건 · '+(has(min)?min:'하한 없음')+' ~ '+(has(max)?max:'상한 없음')+' '+unit,'sensor-data',{houseId:c.houseId,date:cutoff,metric});}
        }
        if(late.length)addIssue(c,2,'지연 작업 확인',late.length+'건 · 기준일 이전 미완료','cycles-detail',{id:c.id,tab:'plan',date:cutoff,taskStatus:'overdue'});
      }
      const pest=view.records.filter(r=>r.cycleId===c.id&&!r.cancelled&&inPeriod(r)&&r.type==='병해충·이상');
      if(pest.length)addIssue(c,1,'병해충·이상 기록 확인',pest.length+'건 · 관찰 기록 기준','journal',{cycleId:c.id,type:'병해충·이상',startDate:start,endDate:cutoff});
    }
    const shipments=view.shipments.filter(r=>ids.has(r.cycleId)&&!r.cancelled&&inPeriod(r));const grades=new Map();
    for(const v of shipments){const parts=v.gradeBreakdown?.length?v.gradeBreakdown:[{grade:v.specification==null?'미지정':v.grade||'미지정',quantity:v.quantity}];for(const row of parts){const key=JSON.stringify([v.unit,row.grade]);if(!grades.has(key))grades.set(key,{unit:v.unit,grade:row.grade,quantity:0});grades.get(key).quantity+=row.quantity;}}
    const gradeRows=[...grades.values()].map(g=>({...g,total:shipments.filter(r=>r.unit===g.unit).reduce((n,r)=>n+r.quantity,0)}));
    const waste=view.adjustments.filter(a=>ids.has(a.cycleId)&&inPeriod(a)&&a.type==='폐기'&&a.quantity<0).map(a=>({...a,unit:cycles.find(c=>c.id===a.cycleId).unit}));
    const merchants=new Map();for(const v of shipments){const key=JSON.stringify([v.cycleId,v.recipient,v.unit]);if(!merchants.has(key))merchants.set(key,{id:key,cycleId:v.cycleId,recipient:v.recipient,unit:v.unit,quantity:0,amount:0,pricedQuantity:0,missing:0,records:0});const row=merchants.get(key);row.records++;row.quantity+=v.quantity;if(v.totalAmount!==''&&v.totalAmount!=null&&Number.isFinite(Number(v.totalAmount))){row.amount+=Number(v.totalAmount);row.pricedQuantity+=v.quantity;}else row.missing++;}
    const amount=shipments.reduce((n,v)=>n+(v.totalAmount!==''&&v.totalAmount!=null&&Number.isFinite(Number(v.totalAmount))?Number(v.totalAmount):0),0);
    const moneyMissing=shipments.filter(v=>v.totalAmount===''||v.totalAmount==null).length;
    return {start,cutoff,cycles,issues:issues.sort((a,b)=>a.rank-b.rank||textCompare(a.id,b.id)),targets:sort(targets,q.get('sort')||'priority','decision-stats',s),shipments,grades:gradeRows,waste,merchants:[...merchants.values()].sort((a,b)=>b.amount-a.amount||textCompare(a.id,b.id)),amount,moneyMissing};
  }
  function environmentForRecord(s,r){
    const c=s.cycles.find(c=>c.id===r.cycleId);if(!c)return null;
    const quality=(v,k)=>v.quality?.[k]||(typeof v.quality==='string'?v.quality:'');
    const rows=s.environment.filter(v=>v.houseId===c.houseId&&v.date===r.date).sort((a,b)=>textCompare(a.time,b.time));
    const valid=rows.filter(v=>['temp','humidity','light','co2'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k])&&!['invalid','error','rejected'].includes(quality(v,k))));
    const available=valid.length?valid:rows;const observed=(r.time?available.filter(v=>(v.time||'')<=r.time).at(-1):available.at(-1))||available[0];
    return observed?{cycle:c,observation:observed,label:r.time&&observed.time<=r.time?'작업 시각 이전 최근 관측':'작업일 관측'}:null;
  }
  function createUI(ui){
    const {e,n,date,link,button,panel,table,kpis,filterForm,select,field,getState,today}=ui;
    function render(q){
      const s=getState(),m=dashboard(s,q,today());const houses=s.houses;const cycles=s.cycles.filter(c=>!q.get('houseId')||c.houseId===q.get('houseId'));const lookup=id=>s.cycles.find(c=>c.id===id);
      const location=c=>s.houses.find(h=>h.id===c.houseId)?.name||'';const quantity=(v,c)=>v==null?'미정':n(v)+' '+e(c.unit);
      const filters=filterForm('decision-stats',field('startDate','실적 시작일',m.start,'date')+field('endDate','실적 종료·현황 기준일',m.cutoff,'date')+select('houseId','온실명',houses.map(h=>[h.id,h.name]),q.get('houseId'),true)+select('cycleId','작기명',cycles.map(c=>[c.id,c.name]),q.get('cycleId'),true)+select('cycleStatus','작기 상태',[['active','진행 중'],['all','전체'],['ended','종료']],q.get('cycleStatus')||'active')+field('variety','품종',q.get('variety')));
      const source=(c)=>link('cycles-detail',c.name,{id:c.id})+'<small>'+e(location(c))+' · '+e(c.variety||'')+'</small>';
      const summary=kpis([['조치 확인 항목',m.issues.length+'건'],['14일 내 출하 대상',m.targets.filter(t=>t.soon).length+'개 작기'],['잔량 대비 목표 부족',m.targets.filter(t=>t.shortfall>0).length+'개 작기'],['기간 출하 등록금액',n(m.amount)+'원']]);
      const p1=panel('1. 오늘 조치할 일',table(['우선순위','대상 작기','확인 항목','근거','다음 작업'],m.issues.map(r=>[r.rank===0?'먼저 확인':'확인',source(lookup(r.cycleId)),e(r.title),e(r.evidence),button(r.view,'원기록·작업 확인',r.params)]),'조치 확인 항목',{indexed:true}));
      const p2=panel('2. 출하 일정·목표 판단',table(['작기','예정기간','현재 잔량','누적 / 목표','목표까지','판단 근거','작업'],m.targets.map(t=>[source(t.cycle),date(t.cycle.targetStart)+' ~ '+date(t.cycle.targetEnd),quantity(t.balance,t.cycle),quantity(t.shipped,t.cycle)+' / '+quantity(t.target,t.cycle),quantity(t.remaining,t.cycle),t.shortfall>0?'잔량 대비 '+quantity(t.shortfall,t.cycle)+' 부족':t.past?'목표기간 경과':t.soon?'14일 내 출하 대상':t.target==null?'목표 설정 필요':'계획 확인',button('cycles-detail','계획 검토',{id:t.id,tab:'plan'})]),'작기별 출하 판단',{indexed:true})+'<p class="pm-muted">누적·잔량은 기준일까지의 재배 차감 수량이며 목표는 현재 등록된 목표입니다. 현재 잔량 전체가 목표 등급의 출하 가능 수량임을 뜻하지 않습니다.</p><div class="pm-actions">'+button('shipping-stats','기간별 출하 실적',{startDate:m.start,endDate:m.cutoff,...(q.get('houseId')?{houseId:q.get('houseId')}:{}),...(q.get('variety')?{variety:q.get('variety')}:{}),...(q.get('cycleId')?{cycleId:q.get('cycleId')}:{})})+'<a class="btn" href="https://flower.at.or.kr/" target="_blank" rel="noopener noreferrer">공판장 시세 확인</a></div>');
      const p3=panel('3. 품질·폐기 확인',table(['출하 단위','등급','출하량','같은 단위 내 비중'],m.grades.map(g=>[e(g.unit),e(g.grade),n(g.quantity)+' '+e(g.unit),g.total?n(g.quantity/g.total*100)+'%':'계산 대기']),'등급별 출하 구성',{indexed:true})+table(['발생일','작기','폐기수량','기록 사유','원기록'],m.waste.map(w=>[date(w.date),source(lookup(w.cycleId)),n(Math.abs(w.quantity))+' '+e(w.unit),e(w.note),link('cycles-detail','수량 변경 이력',{id:w.cycleId,tab:'quantity'})]),'폐기 기록',{indexed:true})+'<p class="pm-muted">등급은 같은 출하 단위끼리 비교합니다. 폐기는 폐기 유형의 감소 기록만 집계하며 정정 감소와 구분합니다.</p>');
      const p4=panel('4. 거래처·등록금액 확인',table(['거래처','작기','단위','출하량','등록금액','금액 기록분 평균단가','금액 미입력','원기록'],m.merchants.map(r=>[e(r.recipient),source(lookup(r.cycleId)),e(r.unit),n(r.quantity)+' '+e(r.unit),n(r.amount)+' 원',r.pricedQuantity?n(r.amount/r.pricedQuantity)+' 원/'+e(r.unit):'계산 불가',r.missing+'건',link('shipments','출하 내역',{recipient:r.recipient,cycleId:r.cycleId,unit:r.unit,startDate:m.start,endDate:m.cutoff,...(q.get('houseId')?{houseId:q.get('houseId')}:{}),...(q.get('variety')?{variety:q.get('variety')}:{}),...(q.get('cycleId')?{cycleId:q.get('cycleId')}:{})})]),'거래처·작기별 출하 등록금액',{indexed:true})+'<p class="pm-muted">등록된 출하 금액 기준이며 원가·수수료·정산 입금은 포함하지 않습니다. 금액 미입력 '+m.moneyMissing+'건은 0원과 구분합니다.</p>');
      return filters+'<p class="pm-insights-basis">대상 '+e(({active:'진행 중 작기',all:'전체 작기',ended:'종료 작기'})[q.get('cycleStatus')||'active']||'진행 중 작기')+' · 현황 기준 '+date(m.cutoff)+' · 실적 기간 '+date(m.start)+' ~ '+date(m.cutoff)+' · 긴급성 → 출하 영향 → 품질·손실 → 거래 결과 순으로 확인합니다.</p>'+summary+'<div class="pm-insights-sections">'+p1+p2+p3+p4+'</div><div class="pm-actions">'+button('comparison','생육·환경 원인 검토',q.get('cycleId')?{cycleId:q.get('cycleId')}:{} )+'</div>';
    }
    function journalEnvironment(r,compact=false){
      const m=environmentForRecord(getState(),r);if(!m)return compact?'<span class="pm-muted">온실·관측 연결 확인</span>':panel('작업일 온실환경','<p class="pm-empty">작기·온실 연결과 관측 기록을 확인해 주세요.</p>');
      const v=m.observation;const definitions=root.ProducerTerminology.environment;const fields=definitions.filter(([key])=>['temp','humidity','light','co2','outsideTemp','outsideHumidity'].includes(key));
      const value=([key,label,unit])=>typeof v[key]==='number'&&Number.isFinite(v[key])&&!['invalid','error','rejected'].includes(v.quality?.[key]||v.quality)?n(v[key])+' '+e(v.units?.[key]||unit):'집계 제외';
      if(compact)return fields.slice(0,4).map(item=>'<span>'+e(item[1].replace('온실내부',''))+' '+value(item)+'</span>').join('<br>')+'<small>'+e(v.time)+' · '+e(m.label)+'</small>';
      return panel('작업일 온실환경','<p class="pm-journal-env-caption">'+e(m.label)+' · '+date(v.date)+' '+e(v.time)+' · '+e(v.source)+' · '+e(v.sensorId)+'</p><dl class="pm-journal-env-metrics">'+fields.map(item=>'<div><dt>'+e(item[1].replace('온실',''))+'</dt><dd>'+value(item)+'</dd></div>').join('')+'</dl><details class="pm-disclosure"><summary>환경 관측 전체 항목</summary>'+table(['항목','값','단위'],definitions.map(([key,label,unit])=>[e(label),e(v[key]),e(v.units?.[key]||unit)]),'일지 연결 환경값')+'</details>'+button('sensor-data','같은 날 센서 원자료',{houseId:m.cycle.houseId,date:r.date}));
    }
    return {render,journalEnvironment};
  }
  const api={policies,sortOptions,sort,matchesCycle,enhanceFilters,dashboard,environmentForRecord,createUI};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProducerInsights=api;
})(typeof globalThis!=='undefined'?globalThis:this);

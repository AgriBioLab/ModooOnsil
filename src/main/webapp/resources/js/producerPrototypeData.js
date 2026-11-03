/* 업무·데이터 구조 검토용 공통 예시. 기존 행을 덮어쓰지 않고 한 번만 보충합니다. */
(function(root){
  'use strict';
  const VERSION=21;
  const UNITS={temp:'°C',humidity:'%',light:'W/m²',dli:'mol/m²/day',dewPoint:'°C',co2:'ppm',outsideRadiation:'W/m²',outsideTemp:'°C',outsideHumidity:'%',windDirection:'°',windSpeed:'m/s',outsideCo2:'ppm',substrateTemp:'°C',ec:'mS/cm',ph:'pH'};
  function enrich(s,today){
    if(s.prototypeDataVersion>=VERSION)return false;
    s.devices ||= [];s.automationEvents ||= [];
    const add=(type,item)=>{if(!s[type].some(old=>old.id===item.id))s[type].push(item);};
    const scopedDays=new Map();
    for(const c of s.cycles){
      const lastDay=c.endDate&&c.endDate<today?c.endDate:today;
      if(lastDay<c.start)continue;
      const priorDays=s.environment.filter(r=>r.houseId===c.houseId&&r.date>=c.start&&r.date<=lastDay).map(r=>r.date).sort();
      for(const day of new Set([lastDay,priorDays.at(-1)].filter(Boolean))){
      const key=c.houseId+'|'+day;if(!scopedDays.has(key))scopedDays.set(key,{houseId:c.houseId,day});
      const prefix='prototype20-'+c.id+'-'+day;
      const base={cycleId:c.id,date:day,photo:'',metric:'',value:'',measureUnit:'',sample:'',method:'',authorId:s.profile.loginId,authorName:s.profile.name,inputSource:'manual'};
      add('records',{...base,id:prefix+'-growth',time:'08:40',type:'생육·관찰',text:'생육 상태와 잎의 이상 여부를 확인했습니다.',metric:'초장',value:35,measureUnit:'cm',sample:'P-01',method:'동일 개체의 높이',growthWeek:7});
      add('records',{...base,id:prefix+'-work',time:'10:10',type:'재배작업',text:'배지 상태를 확인하고 관수 공급부를 점검했습니다.',irrigation:'5 L',fertilizer:'영농용 비료 A',fertilizerUsage:'희석액 100 mL/주',shading:'0',followup:'다음 관측에서 배지 상태 확인'});
      const controller=c.houseId+'-CTRL-01';
      const events=[
        {id:prefix+'-irrigation',operation:'관수',trigger:'예약 실행',startedAt:day+' 09:00:00',finishedAt:day+' 09:05:00',status:'completed',quantity:12,unit:'L',result:'공급량 확인 후 종료',irrigation:'12 L',type:'관수·시비'},
        {id:prefix+'-shading',operation:'차광',trigger:'예약 실행',startedAt:day+' 11:00:00',finishedAt:day+' 11:02:00',status:'completed',quantity:'',unit:'',result:'차광막 닫힘 확인',shading:'1',type:'시설·환경'},
        {id:prefix+'-failed',operation:'관수',trigger:'예약 실행',startedAt:day+' 13:00:00',finishedAt:day+' 13:01:00',status:'failed',quantity:'',unit:'',result:'장치 완료 응답 없음',type:'관수·시비'}
      ];
      for(const event of events){
        add('automationEvents',{...event,cycleId:c.id,houseId:c.houseId,deviceId:controller,date:day,source:'자동제어기'});
        if(event.status==='completed')add('records',{...base,id:event.id+'-record',time:event.finishedAt.slice(11,16),type:event.type,text:event.operation+' 자동 실행을 완료했습니다. '+event.result+'.',inputSource:'automatic',automationEventId:event.id,sourceDeviceId:controller,...(event.irrigation?{irrigation:event.irrigation}:{}),...(event.shading?{shading:event.shading}:{})});
      }
      }
    }
    for(const {houseId,day}of scopedDays.values()){
      const sensorId=houseId+'-ENV-01';const house=s.houses.find(h=>h.id===houseId);
      add('devices',{id:sensorId,houseId,name:house.name+' 복합 환경센서',kind:'environment',zone:house.zone || '온실 내부',status:'수집 중',intervalMinutes:60,metrics:Object.keys(UNITS)});
      add('devices',{id:houseId+'-CTRL-01',houseId,name:house.name+' 관수·차광 제어기',kind:'controller',zone:house.zone || '온실 내부',status:'사용 중',intervalMinutes:null,metrics:[]});
      for(let i=0;i<8;i++){
        const time=String(8+i).padStart(2,'0')+':30';
        if(s.environment.some(r=>r.houseId===houseId&&r.date===day&&r.time===time))continue;
        const offset=[-.4,0,.3,.6,1,.7,.2,0][i];
        add('environment',{id:'prototype20-env-'+houseId+'-'+day+'-'+i,houseId,date:day,time,observedAt:day+' '+time+':00',receivedAt:day+' '+time+':04',sensorId,source:'온실 환경센서',units:{...UNITS},quality:i===4?{temp:'invalid'}:{},temp:i===4?999:Number((24.5+offset).toFixed(2)),humidity:68-offset,light:320+offset*20,dli:12.4,dewPoint:18,co2:485+offset*10,outsideRadiation:420,outsideTemp:22,outsideHumidity:50,windDirection:180,windSpeed:1.2,outsideCo2:420,substrateTemp:23,ec:1.4,ph:5.8});
      }
    }
    completeFields(s,today);
    s.prototypeDataVersion=VERSION;return true;
  }
  const missing=value=>value==null || (typeof value==='string' && ['', '미등록'].includes(value.trim()));
  function fill(item,values){for(const[key,value]of Object.entries(values))if(missing(item[key]))item[key]=value;}
  const shift=(day,count)=>new Date(Date.parse(day+'T00:00:00Z')+count*86400000).toISOString().slice(0,10);
  function completeFields(s,today){
    fill(s.profile,{phone:'000-0000-0000',entityNumber:'AGRI-2026-000001',entityRepresentative:s.profile.name});
    for(const f of s.farms)fill(f,{address:'가상특별시 화훼구 영농로 100',note:'화훼 재배·생육조사·출하 기록을 관리하는 농장입니다.'});
    for(const h of s.houses)fill(h,{zone:'1번 베드',area:1000,houseType:'단동',buildingCount:1,covering:'비닐',sideHeight:4,width:20,length:50,substrate:'수태'});
    for(const c of s.cycles){
      const h=s.houses.find(h=>h.id===c.houseId);
      if(c.quantityPending){c.initial=1000;c.quantityPending=false;}
      fill(c,{crop:'호접란',stage:'영양생장',unit:'화분',variety:'만천홍',plantingDate:c.start,supplier:'화훼육묘센터 A',cultivationArea:h.area,displayProgress:80,flowerStalks:2,flowering:50,color:'양호',targetStart:c.targetEnd || shift(c.start,180),targetQty:Math.max(1,Math.floor(c.initial*.9)),note:'생육조사·관수 상태와 출하 목표를 확인합니다.'});
      const migrationNote=/^이전 시안에서 가져옴\. 시작 재배수량·단위를 확인해 주세요\.(?: 실제 시작일이 없어 최초 기록일 또는 오늘을 임시 표시합니다\. 실제 날짜로 수정해 주세요\.)?\s*$/;
      if(migrationNote.test(c.note))c.note+=' 생육조사·관수 상태와 출하 목표를 확인합니다.';
      fill(c,{targetEnd:shift(c.targetStart,7)});
      if(c.status==='ended')fill(c,{endNote:'재배 종료 후 잔여 수량을 확인하고 온실을 정리했습니다.'});
      const shipments=s.shipments.filter(v=>v.cycleId===c.id&&!v.cancelled).sort((a,b)=>a.date.localeCompare(b.date));
      if(shipments.length)fill(c,{harvestDate:shipments[0].harvestDate || shipments[0].date});
    }
    const noWork={pruning:'전정 작업 없음',repotting:'분갈이 작업 없음',transplanting:'이식 작업 없음',planting:'정식 작업 없음',pestControl:'방제 작업 없음',pesticide:'사용 없음',pesticideUsage:'사용 없음',fertilizer:'사용 없음',fertilizerUsage:'사용 없음',irrigation:'관수 작업 없음'};
    for(const r of s.records){
      const c=s.cycles.find(c=>c.id===r.cycleId);
      fill(r,{...noWork,time:'09:00',inputSource:'manual',authorId:s.profile.loginId,authorName:s.profile.name,growthWeek:Math.max(1,Math.floor((Date.parse(r.date)-Date.parse(c?.plantingDate || c?.start || r.date))/604800000)+1),stemNumber:/꽃대/.test(r.metric || '')?'1':'개체 전체',shading:'0',followup:r.inputSource==='automatic'?'자동 실행 이력에서 공급량·장치 상태를 확인합니다.':'다음 관찰에서 생육·배지 상태를 다시 확인합니다.'});
      if(r.metric)fill(r,{sample:'P-01',method:'동일 개체·동일 부위 조사'});
      if(root.ProducerPrototypeMedia && !r.photo){r.photo=root.ProducerPrototypeMedia.image;r.photoCaption='온실·재배구역 기록 참고 이미지';}
    }
    const defaults={temp:24.5,humidity:68,light:320,dli:12.4,dewPoint:18,co2:485,outsideRadiation:420,outsideTemp:22,outsideHumidity:50,windDirection:180,windSpeed:1.2,outsideCo2:420,substrateTemp:23,ec:1.4,ph:5.8};
    for(const r of s.environment){
      fill(r,{date:today,time:'09:00',sensorId:r.houseId+'-ENV-01',source:'온실 환경센서',...defaults});
      fill(r,{observedAt:r.date+' '+r.time+':00',receivedAt:r.date+' '+r.time+':04'});
      r.units ||= {};fill(r.units,UNITS);
    }
    for(const v of s.shipments){
      const c=s.cycles.find(c=>c.id===v.cycleId);
      fill(v,{harvestDate:v.date<c.start?c.start:v.date,totalAmount:Math.round(v.quantity*10000),note:'출하 수량·규격·거래처 확인을 완료했습니다.'});
      if(v.specification!=null)fill(v,{specification:'분화 7호',grade:'상'});
      if(!v.history?.length)v.history=[{action:'등록',at:v.date+'T09:00:00+09:00',quantity:v.quantity,unit:v.unit,reason:'출하 원기록 등록'}];
    }
    for(const a of s.adjustments)fill(a,{note:'발생 수량 확인 후 반영',time:'09:00',operator:s.profile.name});
    for(const d of s.devices)fill(d,{zone:'온실 내부',status:'사용 중'});
  }
  function needsJournalEnvironment(s){
    return s.records.some(r=>{const c=s.cycles.find(c=>c.id===r.cycleId);if(!c)return false;const rows=s.environment.filter(v=>v.houseId===c.houseId&&v.date===r.date);return !rows.length||rows.some(v=>Object.keys(UNITS).some(k=>missing(v[k])||!v.units?.[k]))||!rows.some(v=>['temp','humidity','light','co2'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k])&&!['invalid','error','rejected'].includes(v.quality?.[k]||v.quality)));});
  }
  function ensureJournalEnvironment(s){
    const defaults={temp:24.5,humidity:68,light:320,dli:12.4,dewPoint:18,co2:485,outsideRadiation:420,outsideTemp:22,outsideHumidity:50,windDirection:180,windSpeed:1.2,outsideCo2:420,substrateTemp:23,ec:1.4,ph:5.8};
    const days=new Map();for(const r of s.records){const c=s.cycles.find(c=>c.id===r.cycleId);if(c)days.set(c.houseId+'|'+r.date,{houseId:c.houseId,day:r.date});}
    for(const {houseId,day}of days.values()){
      const rows=s.environment.filter(v=>v.houseId===houseId&&v.date===day);
      for(const r of rows){fill(r,defaults);r.units||={};fill(r.units,UNITS);fill(r,{sensorId:houseId+'-ENV-01',source:'온실 환경센서',time:'09:00'});fill(r,{observedAt:day+' '+r.time+':00',receivedAt:day+' '+r.time+':04'});}
      if(rows.some(r=>['temp','humidity','light','co2'].every(k=>typeof r[k]==='number'&&Number.isFinite(r[k])&&!['invalid','error','rejected'].includes(r.quality?.[k]||r.quality))))continue;
      for(const [i,time]of ['08:30','12:30','16:30'].entries()){const id='journal-env24-'+houseId+'-'+day+'-'+i;if(!s.environment.some(r=>r.id===id))s.environment.push({id,houseId,date:day,time,observedAt:day+' '+time+':00',receivedAt:day+' '+time+':04',sensorId:houseId+'-ENV-01',source:'온실 환경센서',units:{...UNITS},quality:{},...defaults,temp:24.5+i*.2,light:320+i*15});}
      s.devices||=[];const h=s.houses.find(h=>h.id===houseId);if(!s.devices.some(d=>d.id===houseId+'-ENV-01'))s.devices.push({id:houseId+'-ENV-01',houseId,name:h.name+' 복합 환경센서',kind:'environment',zone:h.zone||'온실 내부',status:'수집 중',intervalMinutes:60,metrics:Object.keys(UNITS)});
    }
  }
  const api={VERSION,enrich,needsJournalEnvironment,ensureJournalEnvironment};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProducerPrototypeData=api;
})(typeof globalThis!=='undefined'?globalThis:this);

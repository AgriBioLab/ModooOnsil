/* Stored observations are read-only. No live connection or actuator execution is implied. */
(function(root){
  'use strict';
  const stamp=r=>r.observedAt || [r.date,r.time || ''].join(' ').trim();
  function snapshot(state,houseId,day,definitions){
    const house=state.houses.find(h=>h.id===houseId);if(!house)return null;
    const observations=state.environment.filter(r=>r.houseId===houseId&&r.date===day).slice().sort((a,b)=>stamp(a).localeCompare(stamp(b)));
    const points=[];const groups=new Map();
    for(const r of observations)for(const[key,label,defaultUnit]of definitions){
      if(r[key]==null||r[key]==='')continue;
      const value=r[key];const unit=r.units?.[key] || defaultUnit || '';
      const quality=r.quality?.[key] || (typeof r.quality==='string'?r.quality:'');
      const valid=typeof value==='number'&&Number.isFinite(value)&&!['invalid','error','rejected'].includes(quality);
      const hasSource=!!(r.sensorId || r.deviceId);
      const point={recordId:r.id,metric:key,label,value,unit,sensorId:r.sensorId || r.deviceId || '출처 ID 미등록',source:r.source || '출처 미등록',zone:r.zoneId || '',observedAt:stamp(r),receivedAt:r.receivedAt || '',quality:!valid?'검증 제외':!unit?'단위 미등록':!hasSource?'출처 ID 미등록':'관측값',eligible:valid&&!!unit&&hasSource};
      points.push(point);
      const id=JSON.stringify([point.sensorId,point.zone,key,unit]);
      if(!groups.has(id))groups.set(id,{...point,values:[],excluded:0});
      const group=groups.get(id);if(point.eligible)group.values.push(value);else group.excluded++;
    }
    const summaries=[...groups.values()].map(g=>({metric:g.metric,label:g.label,unit:g.unit,sensorId:g.sensorId,source:g.source,zone:g.zone,count:g.values.length,excluded:g.excluded,min:g.values.length?Math.min(...g.values):null,max:g.values.length?Math.max(...g.values):null,mean:g.values.length?g.values.reduce((a,b)=>a+b,0)/g.values.length:null}));
    return {house,day,observations,points,summaries,lastObservation:observations.at(-1)||null,missingMetrics:definitions.filter(([key])=>!points.some(p=>p.metric===key)).map(([,label])=>label)};
  }
  function daily(state,cycleId,day,definitions){
    const cycle=state.cycles.find(c=>c.id===cycleId);if(!cycle)return null;
    const outOfPeriod=day<cycle.start || !!(cycle.endDate&&day>cycle.endDate);
    const environment=outOfPeriod?{house:state.houses.find(h=>h.id===cycle.houseId),day,observations:[],points:[],summaries:[],missingMetrics:definitions.map(([,label])=>label),lastObservation:null}:snapshot(state,cycle.houseId,day,definitions);
    const records=outOfPeriod?[]:state.records.filter(r=>!r.cancelled&&r.cycleId===cycleId&&r.date===day).slice().sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    return {cycle,day,environment,records,outOfPeriod};
  }
  const api={snapshot,daily};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProducerSensorData=api;
})(typeof globalThis!=='undefined'?globalThis:this);

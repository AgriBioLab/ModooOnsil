/* 출하의 생산정보는 작기 원본을 참조합니다. 초안·예상 수량은 실제 원장을 변경하지 않습니다. */
(function(root){
  'use strict';
  const domain=root.ProducerManagementStore||(typeof module!=='undefined'&&module.exports?require('./producerManagementStore.js'):null);
  function production(s,cycleId,editingId=''){
    const context=domain.context(s,{cycleId});if(!context?.cycle)return null;
    const c=context.cycle;const adjustments=s.adjustments.filter(v=>v.cycleId===c.id).reduce((sum,v)=>sum+v.quantity,0);
    const shipments=s.shipments.filter(v=>v.cycleId===c.id&&!v.cancelled);const shipped=shipments.reduce((sum,v)=>sum+domain.stockQuantity(v),0);
    const previous=shipments.find(v=>v.id===editingId);const replacing=previous?domain.stockQuantity(previous):0;
    const balance=c.initial+adjustments-shipped;const target=c.targetQty==null||c.targetQty===''?null:Number(c.targetQty);
    const harvestDates=[...new Set(shipments.map(v=>v.harvestDate).filter(Boolean))].sort();
    return {...context,adjustments,shipped,balance,replacing,available:balance+replacing,target,harvestDates,remaining:target==null?null:Math.max(0,target-shipped),achievement:target?shipped/target*100:null};
  }
  const defaults=c=>({recipient:c?.targetRecipient||'',specification:c?.targetSpecification||''});
  function draftValues(current,previous,next,touched={}){
    return Object.fromEntries(['recipient','specification'].map(key=>[key,!touched[key]&&(current[key]===''||current[key]===previous[key])?next[key]:current[key]]));
  }
  function projection(m,draft){
    if(m?.cycle.quantityPending)return {ready:false,message:'작기의 시작 재배수량·단위를 등록한 뒤 출하량을 확인해 주세요.'};
    if(!m||draft.quantity===''||draft.quantity==null)return {ready:false};
    const quantity=Number(draft.quantity);const same=draft.unit===m.cycle.unit;
    if(!Number.isFinite(quantity)||quantity<=0)return {ready:false,error:'실제 출하량은 0보다 큰 수로 입력해 주세요.'};
    if(!same&&(draft.stockQuantity===''||draft.stockQuantity==null))return {ready:false,message:'출하 단위가 다릅니다. 차감 재배수량을 입력하면 예상 잔량을 확인할 수 있습니다.'};
    const deduction=same?quantity:Number(draft.stockQuantity);
    if(!Number.isSafeInteger(deduction)||deduction<=0)return {ready:false,error:'차감 재배수량은 1 이상의 정수로 입력해 주세요.'};
    const balance=m.available-deduction;const shipped=m.shipped-m.replacing+deduction;
    return {ready:true,balance,shipped,deduction,remaining:m.target==null?null:Math.max(0,m.target-shipped),achievement:m.target?shipped/m.target*100:null,error:balance<0?'현재 가능한 재배수량을 초과했습니다.':''};
  }
  function createUI(ui){
    const {e,n,date,link,button,getState}=ui;
    const metric=(name,value)=>'<div><dt>'+e(name)+'</dt><dd>'+value+'</dd></div>';
    function context(c,editingId=''){
      const m=production(getState(),c.id,editingId);if(!m)return '';
      const qty=value=>n(value)+' '+e(c.unit);const optional=value=>value==null||value===''?'미등록':e(value);
      return '<div class="pm-shipment-source"><section class="pm-shipment-production" aria-label="작기 생산정보"><div class="pm-row"><h2>생산정보</h2>'+link('cycles-detail',c.name,{id:c.id})+'</div><dl class="pm-shipment-source-fields">'+metric('농장',link('farms-detail',m.farm.name,{id:m.farm.id}))+metric('온실',link('houses-detail',m.house.name,{id:m.house.id}))+metric('품목',e(c.crop))+metric('품종',optional(c.variety))+'</dl><details class="pm-shipment-source-more"><summary>재배기간·정식·면적·수확정보</summary><dl class="pm-shipment-source-fields">'+metric('회원',link('account',m.profile.name))+metric('재배 시작일',date(c.start))+metric('정식일',date(c.plantingDate))+metric('재배면적',c.cultivationArea==null||c.cultivationArea===''?'미등록':n(Number(c.cultivationArea))+' m²')+metric('묘 구입처',optional(c.supplier))+metric('작기 등록 수확일',c.harvestDate?date(c.harvestDate):m.harvestDates.length?'출하별 수확일 기록 있음':c.status==='ended'?'수확 이력 없음':'수확 전')+'</dl></details></section><section class="pm-shipment-stock" aria-label="생산 수량 현황"><dl>'+metric('시작 재배수량',c.quantityPending?'수량 확인 필요':qty(c.initial))+metric('수량 변경',qty(m.adjustments))+metric('누적 출하량',qty(m.shipped))+metric('현재 잔량',qty(m.balance))+'</dl></section><section class="pm-shipment-target" aria-label="작기 출하 목표"><div class="pm-row"><h2>출하 목표</h2>'+link('cycles-detail','작기 계획 보기',{id:c.id,tab:'plan'})+'</div><p class="pm-shipment-target-main"><strong>'+(m.target==null?'목표 미정':qty(m.target))+'</strong><span>'+date(c.targetStart)+' ~ '+date(c.targetEnd)+'</span><span>목표까지 '+(m.remaining==null?'미정':qty(m.remaining))+'</span><span>달성률 '+(m.achievement==null?'미정':n(m.achievement)+'%')+'</span></p><dl class="pm-shipment-target-fields">'+metric('목표 등급',e(c.targetGrade||'미정'))+metric('목표 규격',e(c.targetSpecification||'미정'))+metric('예정 거래처',e(c.targetRecipient||'미정'))+'</dl></section></div>';
    }
    function preview(c,editingId,draft){
      const m=production(getState(),c.id,editingId);const p=projection(m,draft);
      if(!p.ready)return '<p'+(p.error?' class="pm-error"':'')+'>'+e(p.error||p.message||'실제 출하량을 입력하면 저장 후 예상 잔량과 목표 실적을 확인할 수 있습니다.')+'</p>';
      const qty=v=>n(v)+' '+e(c.unit);
      return '<h3>'+(editingId?'정정':'등록')+' 후 예상</h3><dl class="pm-shipment-projection-fields">'+metric('예상 잔량',qty(p.balance))+metric('예상 누적 출하량',qty(p.shipped))+metric('목표까지 남은 수량',p.remaining==null?'미정':qty(p.remaining))+'</dl>'+(p.error?'<p class="pm-error">'+e(p.error)+'</p>':'')+'<p class="pm-muted">'+(editingId?'기존 출하 차감분을 대체해 계산합니다. ':'')+'누적 출하량과 잔량은 재배 단위('+e(c.unit)+') 기준입니다.</p>';
    }
    function listSource(c){
      const m=production(getState(),c.id);return link('cycles-detail',c.name,{id:c.id})+'<small>'+e(c.crop)+' · '+e(c.variety||'품종 미등록')+'</small><small>'+e(m.farm.name)+' · '+e(m.house.name)+'</small>';
    }
    return {context,preview,listSource};
  }
  const api={production,defaults,draftValues,projection,createUI};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProducerShipment=api;
})(typeof globalThis!=='undefined'?globalThis:this);

/* 업무 영역 > 기능 묶음 > 실제 화면. 이름과 대상 선택 규칙을 한곳에서 관리합니다. */
(function (root) {
  'use strict';
  const domains = [
    {id:'overview',label:'영농현황',icon:'i-leaf',view:'home',groups:[
      {label:'현재 영농현황',items:[{id:'dashboard',label:'홈·영농현황',view:'home'},{id:'all-cultivation',label:'전체 재배현황',view:'home',params:{source:'records'}}]},
      {label:'온실별 현황',items:[{id:'house-dashboard',label:'온실별 재배·환경 현황',view:'home',scope:'houses',target:'houseId',keywords:'온도 습도 CO2 광도'}]}
    ]},
    {id:'farms',label:'농장관리',icon:'i-leaf',view:'farms',groups:[
      {label:'농장 등록·관리',items:[{id:'farm-list',label:'농장 목록',view:'farms'},{id:'farm-add',label:'농장 등록',view:'farms-add'},{id:'farm-info',label:'농장 정보 조회',view:'farms-detail',scope:'farms',target:'id'},{id:'farm-edit',label:'농장 정보 수정',view:'farms-add',scope:'farms',target:'id'}]},
      {label:'연결 정보',items:[{id:'farm-houses',label:'농장별 온실 목록',view:'houses',scope:'farms',target:'farmId'},{id:'member-farms',label:'회원·연결 농장 정보',view:'account'}]}
    ]},
    {id:'houses',label:'온실관리',icon:'i-sun',view:'houses',groups:[
      {label:'온실 등록·정보',items:[{id:'house-list',label:'온실 목록',view:'houses'},{id:'house-add',label:'온실 등록',view:'houses-add'},{id:'house-info',label:'온실 정보 조회',view:'houses-detail',scope:'houses',target:'id'},{id:'house-edit',label:'온실 정보 수정',view:'houses-add',scope:'houses',target:'id',keywords:'유형 형태 측고 폭 길이 면적 배지'}]},
      {label:'온실 환경',items:[{id:'sensor-data',label:'센서 관측 현황·원자료',view:'sensor-data',scope:'houses',target:'houseId',keywords:'관측 시각 수신 시각 출처 ID 단위 누락 검증'},{id:'house-environment',label:'온실 환경·관측기록',view:'houses-detail',params:{tab:'environment'},scope:'houses',target:'id',keywords:'온도 습도 광도 일사 CO2 그래프 센서'},{id:'environment-compare',label:'생육·환경 비교',view:'comparison',scope:'cycles',target:'cycleId',keywords:'환경 데이터 추이'}]},
      {label:'연결 작기',items:[{id:'house-cycles',label:'온실별 작기 목록',view:'cycles',scope:'houses',target:'houseId'},{id:'house-cycle-add',label:'온실에서 작기 등록',view:'cycles-add',params:{from:'house'},scope:'houses',target:'houseId',policy:'available'},{id:'house-cycle-history',label:'온실별 종료 작기',view:'cycles',params:{status:'ended'},scope:'houses',target:'houseId'}]}
    ]},
    {id:'journal',label:'재배일지',icon:'i-checklist',view:'journal',groups:[
      {label:'일지 등록·조회',items:[{id:'journal-day',label:'일지·센서 통합조회',view:'journal-day',scope:'cycles',target:'cycleId',keywords:'자동수집 작업 관측 요약 최저 평균 최고'},{id:'journal-list',label:'재배일지 목록',view:'journal'},{id:'journal-add',label:'재배일지 작성',view:'journal-add',scope:'cycles',target:'cycleId'},{id:'journal-calendar',label:'재배일지 달력',view:'journal',params:{mode:'calendar'}},{id:'journal-detail',label:'일지 상세·사진 조회',view:'journal-detail',scope:'records',target:'id'},{id:'journal-edit',label:'재배일지 수정',view:'journal-add',scope:'records',target:'id'}]},
      {label:'생육조사·재배작업',items:[{id:'growth-record',label:'생육조사 기록',view:'journal-add',params:{measurement:'1'},scope:'cycles',target:'cycleId',keywords:'초장 엽장 엽폭 화색 개체 꽃대'},{id:'work-record',label:'재배작업 기록',view:'journal-add',params:{type:'재배작업'},scope:'cycles',target:'cycleId',keywords:'관수 시비 차광 방제 농약 비료 정식 분갈이'}]}
    ]},
    {id:'cycles',label:'작기관리',icon:'i-leaf',view:'cycles',groups:[
      {label:'작기 등록·관리',items:[{id:'cycle-list',label:'작기 목록·검색',view:'cycles'},{id:'cycle-add',label:'작기 등록',view:'cycles-add'},{id:'cycle-edit',label:'작기 기본정보 수정',view:'cycles-add',scope:'cycles',target:'id'}]},
      {label:'목표·작업계획',items:[{id:'cycle-goal',label:'목표 출하 설정',view:'cycles-add',params:{section:'target'},scope:'cycles',target:'id'},{id:'cycle-plan',label:'작기 계획·데일리 가이드',view:'cycles-detail',params:{tab:'plan'},scope:'cycles',target:'id',keywords:'오늘 할 일 주간 일정 목표 출하 지연 작업 실적'},{id:'cycle-stage-plan',label:'단계별 계획 등록',view:'plan-stage',scope:'cycles',target:'cycleId',policy:'active'},{id:'cycle-daily-plan',label:'일일 작업계획 등록',view:'plan-task',scope:'cycles',target:'cycleId',policy:'active'},{id:'cycle-guide-rules',label:'데일리 가이드 기준 설정',view:'plan-guide',scope:'cycles',target:'cycleId',policy:'active'}]},
      {label:'재배정보·이력',items:[{id:'cycle-info',label:'작기 상세·생육 현황',view:'cycles-detail',scope:'cycles',target:'id',keywords:'품목 품종 생육단계 재배기간 꽃대 개화율 화색'},{id:'cycle-journal',label:'작기별 재배일지',view:'cycles-detail',params:{tab:'journal'},scope:'cycles',target:'id'},{id:'cycle-shipments',label:'작기별 출하 이력',view:'cycles-detail',params:{tab:'shipments'},scope:'cycles',target:'id'}]},
      {label:'작기 종료',items:[{id:'cycle-end',label:'작기 종료 등록',view:'cycles-add',params:{end:'1'},scope:'cycles',target:'id',policy:'active'},{id:'cycle-ended',label:'종료 작기 목록',view:'cycles',params:{status:'ended'}}]}
    ]},
    {id:'shipments',label:'수량·출하관리',icon:'i-truck',view:'shipments',groups:[
      {label:'재배수량',items:[{id:'quantity-add',label:'수량 변경 등록',view:'quantity',scope:'cycles',target:'id',policy:'stock',keywords:'추가 입고 폐기 정정'},{id:'quantity-history',label:'수량 변경 이력',view:'cycles-detail',params:{tab:'quantity'},scope:'cycles',target:'id'}]},
      {label:'출하 등록·관리',items:[{id:'shipment-list',label:'출하 목록·검색',view:'shipments'},{id:'shipment-add',label:'출하 등록·등급별 수량',view:'shipments-add',scope:'cycles',target:'cycleId',policy:'stock',keywords:'특상 상 중 규격 단위 거래처'},{id:'shipment-detail',label:'출하 상세·변경 이력',view:'shipments-detail',scope:'shipments',target:'id'},{id:'shipment-edit',label:'출하 정정',view:'shipments-add',scope:'shipments',target:'id',policy:'valid'}]}
    ]},
    {id:'comparison',label:'비교·통계',icon:'i-chart',view:'decision-stats',groups:[
      {label:'영농 의사결정',items:[{id:'decision-stats',label:'우선순위별 영농 통계',view:'decision-stats',keywords:'긴급 조치 환경 출하 목표 품질 폐기 거래처 등록금액'}]},
      {label:'생육·환경',items:[{id:'growth-compare',label:'작기별 생육·환경 비교',view:'comparison',scope:'cycles',target:'cycleId',keywords:'측정 그래프 원자료'}]},
      {label:'출하 실적',items:[{id:'shipment-period',label:'기간별 출하 실적',view:'shipping-stats'},{id:'shipment-target',label:'목표 대비 출하 실적',view:'shipping-stats',params:{mode:'target'},scope:'cycles',target:'cycleId'}]}
    ]},
    {id:'account',label:'회원정보',icon:'i-user',view:'account',groups:[
      {label:'내 정보',items:[{id:'member-profile',label:'회원정보 조회·수정',view:'account'},{id:'member-password',label:'비밀번호 변경',view:'password'},{id:'member-verification',label:'농업경영체 인증',view:'account',params:{section:'verification'}}]}
    ]}
  ];
  const items = domains.flatMap(domain => domain.groups.flatMap(group => group.items.map(item => ({...item,domainId:domain.id,domainLabel:domain.label,groupLabel:group.label}))));
  const task = id => items.find(item => item.id === id);
  const eligible = (state, item) => (state[item.scope] || []).filter(entry => {
    if (item.scope === 'records' && entry.cancelled) return false;
    if (item.id === 'journal-edit' && entry.inputSource === 'automatic') return false;
    if (item.policy === 'valid') return !entry.cancelled;
    if (item.policy === 'active') return entry.status !== 'ended';
    if (item.policy === 'stock') return entry.status !== 'ended' && !entry.quantityPending;
    if (item.policy === 'available') return entry.active && state.farms.some(f => f.id === entry.farmId && f.active);
    return true;
  });
  const destination = (state, itemId, targetId) => {
    const item = task(itemId); if (!item) return null;
    if (item.scope && !eligible(state,item).some(entry => entry.id === targetId)) return null;
    return {view:item.view,params:{...item.params,...(item.scope ? {[item.target]:targetId} : {})}};
  };
  const api = {domains,items,task,eligible,destination};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.ProducerSiteMap=api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

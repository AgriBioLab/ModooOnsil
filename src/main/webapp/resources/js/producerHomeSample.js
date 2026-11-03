/* 홈의 보조 표시 데이터. 온실·작기·출하·환경의 원본은 공통 저장소에서 조회합니다. */
'use strict';
window.ProducerHomeSample = Object.freeze({
  summary: {alerts:3,alertNote:'병해충 1건 · 환경 2건',income:1500000,incomeChange:'지난달 대비 +1.2%'},
  houses: [
    {name:'A동',checks:['관수 상태 점검','응애 방제 상태 확인','11월 출하 예정분 상품 상태 확인'],more:['오후 온도 변화 확인','출하 예정일 재확인']},
    {name:'B동',checks:['양액 공급 상태 점검','꽃봉오리 상태 관찰','출하 수량 확인'],more:['배수 상태 확인','작업 도구 정리']},
    {name:'C동',checks:['온실 환기 상태 점검','잎과 꽃봉오리 상태 확인','출하 포장 준비'],more:['오후 습도 확인','작업 내용 일지 작성']}
  ]
});

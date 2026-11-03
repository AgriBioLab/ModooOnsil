/* UI 확인을 위한 가상 운영기관. 회원·농장 저장 데이터와 분리합니다. */
(function(root) {
  'use strict';
  const info = Object.freeze({
    organization:'한국화훼영농지원센터',
    organizationNote:'가상 기관',
    address:'가상특별시 화훼구 영농로 100, 화훼지원관 3층',
    phone:'000-0000-0000',
    email:'support@flower-farm.example',
    hours:'평일 09:00~18:00 · 주말·공휴일 휴무',
    privacyDate:'2026.11.03',
    privacySections:[
      ['개인정보 처리 목적','회원정보와 농장·온실 정보를 관리하고, 작기·재배일지·수량 변경·출하 기록을 연결하여 영농관리 화면을 제공하는 내용을 가정합니다.'],
      ['처리 항목','회원 아이디·이름·연락처와 회원이 입력한 농장·온실·작기·재배일지·출하 정보를 대상으로 하는 가상 구성입니다.'],
      ['열람 및 수정','내 정보와 각 업무의 상세·수정 화면에서 등록 내용을 확인하고 변경하는 흐름을 안내합니다.'],
      ['개인정보 관련 문의','아래 가상 운영기관의 담당 연락처를 표시합니다. 전화번호와 이메일은 실제 문의 채널이 아닙니다.']
    ]
  });
  if(typeof module!=='undefined' && module.exports) module.exports=info;
  else root.ProducerServiceInfo=info;
})(typeof globalThis!=='undefined' ? globalThis : this);

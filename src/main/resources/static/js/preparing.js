// 서비스 준비중 화면 문구 분기 및 이전 페이지 이동.
(() => {
  'use strict';

  const PAGE_MESSAGES = {
    env: {
      title: '온실 환경변화',
      heading: '온실 환경변화 페이지는 준비중입니다.'
    },
    issue: {
      title: '온실 환경 이슈',
      heading: '온실 환경 이슈 페이지는 준비중입니다.'
    }
  };

  // === 1. 페이지별 안내 문구 반영 ===

  const params = new URLSearchParams(location.search);
  const pageKey = params.get('page') || '';
  const info = PAGE_MESSAGES[pageKey];

  if (info) {
    document.title = `모두의온실 | ${info.title} 준비중`;
    const heading = document.getElementById('preparingHeading');
    if (heading) heading.textContent = info.heading;
  }

  // === 2. 이전 페이지 이동 ===

  document.getElementById('preparingBackBtn')?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = '/index.html';
  });
})();

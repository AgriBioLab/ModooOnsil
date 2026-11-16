// 공통 레이아웃(사이드바·헤더) 로더.
// HTTP(S) 환경에서는 fragments/*.html을 fetch하고, file:// 환경에서는 동일 마크업 폴백을 사용한다.
(function () {
  const SIDEBAR_HTML = `<aside class="sidebar" aria-label="서비스 탐색">
  <div class="brand" id="brand">모두의온실<small>화훼 재배 관리</small></div>
  <nav class="nav" id="navigation" aria-label="주 메뉴">
    <a class="navbtn" href="diary-list.html" data-go="list">재배일지작업</a>
    <a class="navbtn" href="cycle-list.html" data-go="cycle-list">작기계획</a>
    <a class="navbtn" href="env-list.html" data-go="env-list">온실 환경변화</a>
    <a class="navbtn" href="issue-list.html" data-go="issue-list">온실 환경 이슈</a>
  </nav>
  <div class="sidebar-foot" id="sidebarFoot"></div>
</aside>`;

  const HEADER_HTML = `<header class="topbar">
  <div class="header-account" aria-label="로그인 사용자 정보">
    <span class="header-identity"><strong id="userName"></strong><span id="userCertification"></span></span>
    <a class="btn xs header-btn" href="mypage.html" id="myInfoButton">내정보</a>
    <button class="btn xs header-btn" type="button" id="logoutButton">로그아웃</button>
  </div>
</header>`;

  async function loadFragment(slotId, url, fallback) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    if (location.protocol.startsWith('http')) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          slot.outerHTML = await res.text();
          return;
        }
      } catch {
        // Fallback below when static fragment fetch is unavailable.
      }
    }
    slot.outerHTML = fallback;
  }

  window.ModooLayoutReady = Promise.all([
    loadFragment('sidebarSlot', 'fragments/sidebar.html', SIDEBAR_HTML),
    loadFragment('headerSlot', 'fragments/header.html', HEADER_HTML),
  ]);
})();

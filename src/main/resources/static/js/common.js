// 공통 레이아웃과 브라우저 계정 상태.
// HTTP(S) 환경에서는 fragments/*.html을 fetch하고, file:// 환경에서는 동일 마크업 폴백을 사용한다.
(function () {
  const SIDEBAR_HTML = `<aside class="sidebar" aria-label="서비스 탐색">
  <div class="brand" id="brand">모두의온실<small>재배 관리</small></div>
  <nav class="nav" id="navigation" aria-label="주 메뉴">
    <div class="navgroup" role="group" aria-label="재배일지작업">
      <div class="navhead nav-group-title"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>재배일지작업</div>
      <a class="navbtn nav-sub" href="cultivationDiaryList.html" data-go="list">재배일지작업목록</a>
      <a class="navbtn nav-sub" href="cultivationDiaryList.html?view=create" data-go="create">재배일지작업등록</a>
    </div>
    <div class="navgroup" role="group" aria-label="작기계획">
      <div class="navhead nav-group-title"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>작기계획</div>
      <a class="navbtn nav-sub" href="cultivationPlanList.html" data-go="cycle-list">작기계획목록</a>
      <a class="navbtn nav-sub" href="cultivationPlanList.html?view=cycle-create" data-go="cycle-create">작기계획등록</a>
    </div>
    <div class="navgroup" role="group" aria-label="재배품목" hidden>
      <div class="navhead nav-group-title"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22v-9M12 13C12 7 7 4 3 4c0 5 3 9 9 9ZM12 13c0-5 4-8 9-8 0 5-3 8-9 8Z"/></svg>재배품목</div>
      <a class="navbtn nav-sub" href="cropStageStandard.html" data-go="standard">품목 · 품종 목록</a>
      <a class="navbtn nav-sub" href="cropStageStandard.html?view=standard-create" data-go="standard-create">품목 · 품종 등록</a>
    </div>
    <div class="navgroup" role="group" aria-label="온실">
      <div class="navhead nav-group-title"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/></svg>온실</div>
      <a class="navbtn nav-sub" href="environmentChangeList.html" data-go="env-list">온실 환경변화</a>
      <a class="navbtn nav-sub" href="environmentIssueList.html" data-go="issue-list">온실 환경 이슈</a>
      <a class="navbtn nav-sub" href="greenhouseList.html" data-go="gh-list">온실목록</a>
      <a class="navbtn nav-sub" href="greenhouseList.html?view=gh-create" data-go="gh-create">온실등록</a>
    </div>
    <div class="navgroup" role="group" aria-label="내정보">
      <div class="navhead nav-group-title"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>내정보</div>
      <a class="navbtn nav-sub" href="mypage.html" data-go="profile">농장정보</a>
      <a class="navbtn nav-sub" href="mypage.html?tab=cert" data-go="cert">농업경영체 인증</a>
      <a class="navbtn nav-sub" href="mypage.html?tab=pw" data-go="member">농민 회원정보</a>
    </div>
  </nav>
  <div class="sidebar-foot" id="sidebarFoot"></div>
</aside>`;

  const HEADER_HTML = `<header class="topbar">
  <div class="topbar-title">모두의 온실 재배관리</div>
  <div class="header-account" aria-label="로그인 사용자 정보">
    <span class="header-identity"><strong id="userName"></strong><span id="userCertification"></span></span>
    <a class="btn xs header-btn" href="mypage.html" id="myInfoButton">내정보</a>
    <button class="btn xs header-btn" type="button" id="logoutButton">로그아웃</button>
  </div>
</header>`;

  const FOOTER_HTML = `<footer class="site-footer">
  <strong>모두의온실</strong>
  <span>농민 누구나 쉽고 간편하게 쓰는 온실 재배관리</span>
</footer>`;

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

  if (document.getElementById('main') && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = '본문 바로가기';
    document.body.prepend(skip);
  }

  const ready = Promise.all([
    loadFragment('sidebarSlot', 'fragments/sidebar.html', SIDEBAR_HTML),
    loadFragment('headerSlot', 'fragments/header.html', HEADER_HTML),
    loadFragment('footerSlot', 'fragments/footer.html', FOOTER_HTML),
  ]);

  const accountKey = name => 'modoo-' + name + ':' + sampleData.meta.version;
  const signupKey = () => accountKey('signup-members');
  let toastTimer;

  function notify(message) {
    const notice = document.getElementById('toast');
    if (!notice) return;
    const announcement = document.getElementById('toastAnnouncement');
    notice.textContent = message;
    notice.classList.remove('hidden');
    if (announcement) announcement.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      notice.classList.add('hidden');
      if (announcement) announcement.textContent = '';
    }, 3400);
  }

  function loadMemberChanges() {
    try {
      return JSON.parse(localStorage.getItem(accountKey('cert-overrides')) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveProfilePatch(username, patch) {
    try {
      const changes = loadMemberChanges();
      changes[username] = { ...changes[username], ...patch };
      localStorage.setItem(accountKey('cert-overrides'), JSON.stringify(changes));
      return true;
    } catch {
      notify('브라우저에 변경 내용을 저장하지 못했습니다.');
      return false;
    }
  }

  function loadSignupMembers() {
    const members = JSON.parse(localStorage.getItem(signupKey()) || '[]');
    return Array.isArray(members) ? members : [];
  }

  function allMembers(registeredMembers) {
    if (!registeredMembers) {
      try { registeredMembers = loadSignupMembers(); } catch { registeredMembers = []; }
    }
    const changes = loadMemberChanges();
    return [...sampleData.members, ...registeredMembers].map(member => ({
      ...member,
      ...changes[member.username]
    }));
  }

  function saveAuthUser(username) {
    try {
      sessionStorage.setItem(accountKey('auth'), username);
      localStorage.setItem(accountKey('auth'), username);
    } catch {}
  }

  function loadAuthUser() {
    try {
      const key = accountKey('auth');
      return sessionStorage.getItem(key) || localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function logout() {
    try {
      const key = accountKey('auth');
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {}
    location.href = 'login.html';
  }

  function showAccount(member) {
    document.getElementById('userName').textContent = member.displayName;
    const certText = member.certification === '인증' ? '농업경영체 인증회원' : member.certification;
    document.getElementById('userCertification').textContent = certText ? ' (' + certText + ')' : '';
    const sidebarFoot = document.getElementById('sidebarFoot');
    if (sidebarFoot) sidebarFoot.textContent = member.farmName;
  }

  function bindAccount(onProfile) {
    const profile = document.getElementById('myInfoButton');
    if (profile) profile.addEventListener('click', event => {
      event.preventDefault();
      onProfile();
    });
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.addEventListener('click', logout);
  }

  function setCurrentMenu(entry) {
    let current;
    for (const link of document.querySelectorAll('#navigation [data-go]')) {
      if (link.dataset.go === entry) {
        current = link;
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
    return current;
  }

  const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch]);
  }

  // HTTP 응답 상태 확인 및 JSON 오류 메시지 추출 (CJPA 공통 응답 처리 기준)
  function checkResponse(response) {
    if (response.ok) return response;
    return response.json()
      .catch(() => null)
      .then(errorBody => {
        const message = errorBody && typeof errorBody.message === 'string'
          ? errorBody.message
          : 'HTTP ' + response.status;
        throw new Error(message);
      });
  }

  function fetchJson(url, options) {
    return fetch(url, options)
      .then(checkResponse)
      .then(response => response.json());
  }

  function setButtonsDisabled(buttons, disabled) {
    for (const button of buttons) {
      if (button) button.disabled = disabled;
    }
  }

  window.ModooCommon = {
    ready, notify, escapeHtml, checkResponse, fetchJson, setButtonsDisabled,
    signupKey, loadSignupMembers, allMembers, saveAuthUser, loadAuthUser,
    saveProfilePatch, showAccount, bindAccount, setCurrentMenu
  };
})();

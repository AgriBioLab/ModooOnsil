// 공통 레이아웃과 브라우저 계정 상태.
// HTTP(S) 환경에서는 fragments/*.html을 fetch하고, file:// 환경에서는 동일 마크업 폴백을 사용한다.
(function () {
  const SIDEBAR_HTML = `<aside class="sidebar" aria-label="서비스 탐색">
  <div class="brand" id="brand">모두의온실<small>재배 관리</small></div>
  <nav class="nav" id="navigation" aria-label="주 메뉴">
    <a class="navbtn" href="cultivationDiaryList.html" data-go="list">재배일지작업</a>
    <a class="navbtn" href="cultivationPlanList.html" data-go="cycle-list">작기계획</a>
    <div class="navgroup" role="group" aria-label="온실">
      <div class="navhead nav-group-title">온실</div>
      <a class="navbtn nav-sub" href="environmentChangeList.html" data-go="env-list">온실 환경변화</a>
      <a class="navbtn nav-sub" href="environmentIssueList.html" data-go="issue-list">온실 환경 이슈</a>
      <a class="navbtn nav-sub" href="greenhouseList.html" data-go="gh-list">온실 정보</a>
    </div>
    <a class="navbtn" href="mypage.html" data-go="profile">내정보</a>
    <a class="navbtn" href="mypage.html?tab=cert" data-go="cert">농업경영체 인증</a>
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

  const FOOTER_HTML = `<footer class="site-footer">
  <strong>모두의온실</strong>
  <span>화훼농민의 농장과 재배 기록을 연결합니다.</span>
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
    document.getElementById('userCertification').textContent = member.certification ? ' (' + member.certification + ')' : '';
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

  window.ModooCommon = {
    ready, notify, signupKey, loadSignupMembers, allMembers, saveAuthUser, loadAuthUser,
    saveProfilePatch, showAccount, bindAccount, setCurrentMenu
  };
})();

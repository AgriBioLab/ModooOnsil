// 공통 레이아웃과 서버 세션.
// HTTP(S) 환경에서는 fragments/*.html을 fetch하고, file:// 환경에서는 동일 마크업 폴백을 사용한다.
(() => {
  'use strict';

  const SIDEBAR_FALLBACK_HTML = `<aside class="sidebar" id="appSidebar" aria-label="서비스 탐색">
  <div class="sidebar-head">
    <a class="brand" id="brand" href="index.html" aria-label="모두의 온실 홈"><svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 228 48" aria-hidden="true"><g transform="translate(4,6)"><path d="M13 0C5.8 0 0 5.8 0 13v23h24V13C24 5.8 18.2 0 13 0z" fill="#FFFFFF"/><path d="M33 6c-6.6 0-12 5.4-12 12v18h24V18c0-6.6-5.4-12-12-12z" fill="#FFFFFF" fill-opacity="0.45"/><path d="M21 18v18h4V15.5c-2.2.6-4 1.4-4 2.5z" fill="#176B3A"/></g><text x="60" y="33" fill="#FFFFFF" font-family="'GmarketSansBold','Pretendard GOV','Malgun Gothic',sans-serif" font-size="25" font-weight="700" letter-spacing="-1">모두의 온실</text></svg></a>
    <button type="button" class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="전체메뉴 닫기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="sidebar-user-bar" id="sidebarUserBar" aria-label="로그인 계정 요약">
    <div class="sidebar-user-meta">
      <strong id="sidebarUserName"></strong>
      <span class="sidebar-cert-badge" id="sidebarUserCert"></span>
    </div>
    <div class="sidebar-user-farm" id="sidebarUserFarm"></div>
  </div>
  <nav class="nav" id="navigation" aria-label="주 메뉴">
    <a class="navbtn nav-home" href="index.html" data-go="home"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span>홈</span></a>
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

  const HEADER_FALLBACK_HTML = `<header class="topbar">
  <div class="topbar-start">
    <button type="button" class="mobile-menu-btn" id="menuToggleBtn" aria-label="전체메뉴 열기" aria-controls="appSidebar" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      <span>메뉴</span>
    </button>
    <a class="topbar-brand" href="index.html" aria-label="모두의 온실 홈">
      <svg class="topbar-brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 228 48" aria-hidden="true"><g transform="translate(4,6)"><path d="M13 0C5.8 0 0 5.8 0 13v23h24V13C24 5.8 18.2 0 13 0z" fill="#176B3A"/><path d="M33 6c-6.6 0-12 5.4-12 12v18h24V18c0-6.6-5.4-12-12-12z" fill="#176B3A" fill-opacity="0.45"/><path d="M21 18v18h4V15.5c-2.2.6-4 1.4-4 2.5z" fill="#FFFFFF"/></g><text x="60" y="33" fill="#13261B" font-family="'GmarketSansBold','Pretendard GOV','Malgun Gothic',sans-serif" font-size="25" font-weight="700" letter-spacing="-1">모두의 온실</text></svg>
    </a>
    <div class="topbar-title"></div>
  </div>
  <div class="header-account" aria-label="로그인 사용자 정보">
    <span class="header-identity"><strong id="userName"></strong><span id="userCertification"></span></span>
    <a class="btn xs header-btn" href="mypage.html" id="myInfoButton">내정보</a>
    <button class="btn xs header-btn" type="button" id="logoutButton">로그아웃</button>
  </div>
</header>`;

  const FOOTER_FALLBACK_HTML = `<footer class="site-footer">
  <strong>모두의온실</strong>
  <span>농민 누구나 쉽고 간편하게 쓰는 온실 재배관리</span>
</footer>`;

  const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  let toastTimer;

  function ensureSkipLink() {
    if (!document.getElementById('main') || document.querySelector('.skip-link')) return;
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#main';
    skipLink.textContent = '본문 바로가기';
    document.body.prepend(skipLink);
  }

  async function loadFragment(slotId, url, fallbackHtml) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    if (location.protocol.startsWith('http')) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          slot.outerHTML = await response.text();
          return;
        }
      } catch {}
    }
    slot.outerHTML = fallbackHtml;
  }

  function initMobileDrawer() {
    const sidebar = document.getElementById('appSidebar');
    const toggleBtn = document.getElementById('menuToggleBtn');
    if (!sidebar || !toggleBtn) return;

    const closeBtn = document.getElementById('sidebarCloseBtn');
    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.id = 'sidebarBackdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    const mobileQuery = window.matchMedia('(max-width: 1023px)');
    let isOpen = false;

    const getFocusableElements = () =>
      Array.from(
        sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(element => element.offsetParent !== null);

    const syncDrawerAccessibility = () => {
      if (mobileQuery.matches) {
        if (isOpen) {
          sidebar.removeAttribute('aria-hidden');
          sidebar.inert = false;
          sidebar.setAttribute('role', 'dialog');
          sidebar.setAttribute('aria-modal', 'true');
          sidebar.setAttribute('aria-label', '전체메뉴');
          return;
        }
        sidebar.setAttribute('aria-hidden', 'true');
        sidebar.inert = true;
        sidebar.removeAttribute('role');
        sidebar.removeAttribute('aria-modal');
        sidebar.setAttribute('aria-label', '서비스 탐색');
        return;
      }

      if (isOpen) {
        isOpen = false;
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      sidebar.removeAttribute('aria-hidden');
      sidebar.inert = false;
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      sidebar.setAttribute('aria-label', '서비스 탐색');
    };

    const openDrawer = () => {
      if (!mobileQuery.matches || isOpen) return;
      isOpen = true;
      sidebar.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.classList.add('drawer-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      syncDrawerAccessibility();
      void sidebar.offsetWidth;
      const focusTarget = closeBtn || getFocusableElements()[0];
      if (!focusTarget) return;
      focusTarget.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (isOpen && document.activeElement !== focusTarget) {
          focusTarget.focus({ preventScroll: true });
        }
      });
    };

    const closeDrawer = (restoreFocus = true) => {
      if (!isOpen) return;
      isOpen = false;
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      syncDrawerAccessibility();
      if (restoreFocus && mobileQuery.matches) {
        toggleBtn.focus({ preventScroll: true });
      }
    };

    toggleBtn.addEventListener('click', () => (isOpen ? closeDrawer(true) : openDrawer()));
    if (closeBtn) closeBtn.addEventListener('click', () => closeDrawer(true));
    backdrop.addEventListener('click', () => closeDrawer(true));

    sidebar.addEventListener('click', event => {
      if (isOpen && event.target.closest('a.navbtn, a.brand')) {
        closeDrawer(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncDrawerAccessibility);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncDrawerAccessibility);
    }

    syncDrawerAccessibility();
  }

  ensureSkipLink();

  const ready = Promise.all([
    loadFragment('sidebarSlot', 'fragments/sidebar.html', SIDEBAR_FALLBACK_HTML),
    loadFragment('headerSlot', 'fragments/header.html', HEADER_FALLBACK_HTML),
    loadFragment('footerSlot', 'fragments/footer.html', FOOTER_FALLBACK_HTML)
  ]).then(() => {
    initMobileDrawer();
  });

  const accountStorageKey = name => `modoo-${name}:${sampleData.meta.version}`;

  function notify(message) {
    const notice = document.getElementById('toast');
    if (!notice) return;
    notice.textContent = message;
    notice.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      notice.classList.add('hidden');
    }, 3400);
  }

  function loadMemberOverrides() {
    try {
      return JSON.parse(localStorage.getItem(accountStorageKey('cert-overrides')) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveCertificationRequest(username, patch) {
    try {
      const overrides = loadMemberOverrides();
      overrides[username] = { ...overrides[username], ...patch };
      localStorage.setItem(accountStorageKey('cert-overrides'), JSON.stringify(overrides));
      return true;
    } catch {
      notify('브라우저에 변경 내용을 저장하지 못했습니다.');
      return false;
    }
  }

  async function currentMember() {
    const response = await fetch('/api/auth/me', { headers: { Accept: 'application/json' } });
    if (response.status === 401) return null;
    const member = await (await checkResponse(response)).json();
    const localCertification = loadMemberOverrides()[member.username];
    if ((!member.certification || member.certification === '미인증') &&
        localCertification?.certification === '인증 대기중') {
      member.businessNumber = localCertification.businessNumber;
      member.certification = localCertification.certification;
    }
    return member;
  }

  async function logout() {
    try {
      const response = await fetch('/logout', { method: 'POST' });
      await checkResponse(response);
      location.replace('index.html');
    } catch {
      notify('로그아웃하지 못했습니다. 다시 시도하세요.');
    }
  }

  function resolveCertificationDisplay(certification) {
    const label = certification === '인증' ? '농업경영체 인증회원' : certification || '';
    if (!label) return { label: '', state: '' };
    if (certification === '인증') return { label, state: 'certified' };
    if (certification === '인증 대기중') return { label, state: 'pending' };
    return { label, state: 'none' };
  }

  function applyCertificationBadge(element, label, state) {
    if (!element) return;
    element.textContent = label;
    if (state) element.dataset.cert = state;
    else delete element.dataset.cert;
  }
  function showAccount(member) {
    const { label, state } = resolveCertificationDisplay(member.certification);
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = member.displayName;
    applyCertificationBadge(document.getElementById('userCertification'), label, state);

    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName) sidebarUserName.textContent = member.displayName || '';
    applyCertificationBadge(document.getElementById('sidebarUserCert'), label, state);

    const sidebarUserFarm = document.getElementById('sidebarUserFarm');
    if (sidebarUserFarm) sidebarUserFarm.textContent = member.farmName || '';

    const sidebarFoot = document.getElementById('sidebarFoot');
    if (sidebarFoot) sidebarFoot.textContent = member.farmName;
  }

  function bindAccount(onProfile) {
    const profileButton = document.getElementById('myInfoButton');
    if (profileButton) {
      profileButton.addEventListener('click', event => {
        event.preventDefault();
        onProfile();
      });
    }
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
  }

  function setCurrentMenu(entry) {
    let activeLink;
    for (const link of document.querySelectorAll('#navigation [data-go]')) {
      if (link.dataset.go === entry) {
        activeLink = link;
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
    return activeLink;
  }

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

  function showGuestHeader() {
    const headerAccount = document.querySelector('.header-account');
    if (headerAccount) {
      headerAccount.innerHTML =
        '<a class="btn xs header-btn" href="login.html">로그인</a>' +
        '<a class="btn xs header-btn" href="signup.html">회원가입</a>';
    }
    const sidebarFoot = document.getElementById('sidebarFoot');
    if (sidebarFoot) sidebarFoot.textContent = '로그인이 필요합니다';
  }

  function renderLoginGate(mainEl, sectionTitle = '서비스') {
    showGuestHeader();
    const crumb = document.getElementById('crumb');
    if (crumb) crumb.textContent = `홈 / ${sectionTitle}`;
    if (!mainEl) return;

    mainEl.innerHTML = `<section class="panel" aria-labelledby="loginGateTitle" style="max-width:460px;margin:28px auto;padding:32px 28px;text-align:center;">
      <h1 id="loginGateTitle" style="margin:0 0 8px;font-size:22px;">농민회원 로그인</h1>
      <p style="margin:0 0 22px;color:var(--muted,#4b5b51);font-size:14.5px;line-height:1.55;">
        로그인을 하시면 <strong>${escapeHtml(sectionTitle)}</strong> 서비스를 이용하실 수 있습니다.
      </p>
      <form id="inlineLoginForm" class="login-form" style="text-align:left;display:grid;gap:14px;">
        <div class="form-group">
          <label class="form-label" for="gateUsername">아이디</label>
          <input id="gateUsername" name="username" class="krds-input medium" type="text" maxlength="20" autocomplete="username" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="gatePassword">비밀번호</label>
          <div style="display:flex;gap:8px;">
            <input id="gatePassword" name="password" class="krds-input medium" type="password" maxlength="20" autocomplete="current-password" required style="flex:1;">
            <button type="button" class="krds-btn medium secondary" id="gatePwToggle">보기</button>
          </div>
        </div>
        <p id="gateError" class="auth-feedback" role="alert" style="margin:0;color:#c62828;font-size:13.5px;"></p>
        <button type="submit" class="krds-btn medium primary" style="width:100%;">로그인</button>
        <div style="display:flex;justify-content:center;gap:8px;font-size:13.5px;color:var(--muted,#4b5b51);">
          <span>처음이신가요?</span>
          <a href="signup.html">회원가입</a>
        </div>
      </form>
    </section>`;

    const form = document.getElementById('inlineLoginForm');
    const pw = document.getElementById('gatePassword');
    const toggle = document.getElementById('gatePwToggle');
    const feedback = document.getElementById('gateError');
    toggle?.addEventListener('click', () => {
      const reveal = pw.type === 'password';
      pw.type = reveal ? 'text' : 'password';
      toggle.textContent = reveal ? '숨기기' : '보기';
    });
    form?.addEventListener('input', () => {
      feedback.textContent = '';
    });
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      feedback.textContent = '';
      try {
        const body = new URLSearchParams({
          username: document.getElementById('gateUsername').value.trim(),
          password: pw.value
        });
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (res.ok && !new URL(res.url).searchParams.has('error')) {
          location.reload();
          return;
        }
        feedback.textContent = '아이디와 비밀번호를 확인하세요.';
      } catch {
        feedback.textContent = '로그인 요청 중 오류가 발생했습니다.';
      } finally {
        submit.disabled = false;
      }
    });
  }

  window.ModooCommon = {
    ready, notify, escapeHtml, checkResponse, fetchJson, setButtonsDisabled,
    currentMember, showGuestHeader, renderLoginGate,
    saveCertificationRequest, showAccount, bindAccount, setCurrentMenu
  };
})();

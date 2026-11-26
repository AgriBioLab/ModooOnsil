// 공통 레이아웃(Thymeleaf fragments)과 서버 세션.
(() => {
  'use strict';

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

  const ready = Promise.resolve().then(() => {
    initMobileDrawer();
  });

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

  async function currentMember() {
    const response = await fetch('/api/auth/me', { headers: { Accept: 'application/json' } });
    if (response.status === 401) return null;
    return (await checkResponse(response)).json();
  }

  async function logout() {
    try {
      const response = await fetch('/logout', { method: 'POST' });
      await checkResponse(response);
      location.replace('/login');
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

  window.ModooCommon = {
    ready, notify, escapeHtml, checkResponse, fetchJson, setButtonsDisabled,
    currentMember,
    showAccount, bindAccount, setCurrentMenu
  };
})();

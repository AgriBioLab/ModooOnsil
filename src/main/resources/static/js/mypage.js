(function () {
  'use strict';

  function createProfilePage(main, actions) {
    const get = id => main.querySelector('#' + id);
    const tabs = [...main.querySelectorAll('[data-profile-tab]')];
    const details = get('profileDetails');
    const editor = get('profileEditor');
    const farmForm = get('profileForm');
    const memberDetails = get('memberDetails');
    const memberEditor = get('memberEditor');
    const memberForm = get('memberForm');
    const certForm = get('certRequestForm');
    const passwordForm = get('passwordForm');
    const certNumber = get('certBusinessNumber');
    const address = get('profAddress');
    const farmFields = {
      farmName: 'profFarmName',
      address: 'profAddress',
      addressDetail: 'profAddressDetail',
      mainCrop: 'profMainCrop',
      description: 'profDesc'
    };
    const memberFields = {
      displayName: 'profDisplayName',
      email: 'profEmail',
      phone: 'profPhone'
    };
    let user;
    let editorVersion = 0;

    function showFieldError(input, message) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      get(input.id + '-error').textContent = message;
    }

    function clearErrors(form) {
      for (const input of form.querySelectorAll('[aria-invalid]')) {
        showFieldError(input, '');
      }
    }

    function bindForm(form, getErrors, save) {
      form.addEventListener('input', ({ target }) => {
        if (target.hasAttribute('aria-invalid')) showFieldError(target, '');
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        const errors = Object.entries(getErrors());
        for (const [id, message] of errors) showFieldError(get(id), message);
        const firstError = errors.find(([, message]) => message);
        if (firstError) get(firstError[0]).focus();
        else save();
      });
    }

    function updateProfileValues() {
      const rawCert = user.certification || '미인증';
      const certification = rawCert === '인증중' ? '인증 대기중' : rawCert;
      const complete = certification === '인증';
      const pending = certification === '인증 대기중';
      const values = {
        ...user,
        certification,
        createdAt: user.createdAt ? String(user.createdAt).slice(0, 10) : '',
        certifiedAt: user.certifiedAt ? String(user.certifiedAt).slice(0, 10) : '',
        farmAddress: [user.address, user.addressDetail].filter(Boolean).join(' ')
      };
      for (const item of main.querySelectorAll('[data-profile-value]')) {
        item.textContent = values[item.dataset.profileValue] || '—';
      }
      get('profileFarmTitle').textContent = user.farmName || '—';
      get('profileFarmSummary').textContent =
        (user.displayName || '—') + ' · ' + (user.mainCrop || '품목 미등록');
      get('profileCertLabel').textContent = certification;
      const badge = get('profileCertBadge');
      badge.classList.toggle('bg-light-success', complete);
      badge.classList.toggle('bg-light-information', pending);
      badge.classList.toggle('bg-light-gray', !complete && !pending);
      get('profileCertComplete').hidden = !complete;
      get('profileCertPending').hidden = !pending;
      certForm.hidden = complete || pending;
      certNumber.value = user.businessNumber || '';
    }

    function setEditing(editing) {
      editorVersion += 1;
      details.hidden = editing;
      editor.hidden = !editing;
      get('profileTitle').textContent = editing ? '내정보 수정' : '내정보';
      clearErrors(farmForm);
      if (editing) {
        for (const [key, id] of Object.entries(farmFields)) {
          get(id).value = user[key] || '';
        }
        address.readOnly = true;
      }
    }

    function setMemberEditing(editing) {
      memberDetails.hidden = editing;
      memberEditor.hidden = !editing;
      clearErrors(memberForm);
      if (editing) {
        get('profUsername').value = user.username || '';
        for (const [key, id] of Object.entries(memberFields)) {
          get(id).value = user[key] || '';
        }
      }
    }

    function show(member, selectedTab, focusId) {
      user = member;
      setEditing(false);
      setMemberEditing(false);
      passwordForm.reset();
      clearErrors(passwordForm);
      clearErrors(certForm);
      for (const tab of tabs) {
        const selected = tab.dataset.profileTab === selectedTab;
        tab.setAttribute('aria-selected', String(selected));
        get(tab.getAttribute('aria-controls')).hidden = !selected;
      }
      updateProfileValues();
      if (focusId) get(focusId).focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        if (tab.getAttribute('aria-selected') !== 'true') actions.openTab(tab.dataset.profileTab);
      });
      tab.addEventListener('keydown', event => {
        const destinations = {
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        const destination = destinations[event.key];
        if (!Number.isInteger(destination)) return;
        event.preventDefault();
        tabs[destination].focus();
      });
    });

    bindForm(certForm, () => ({
      certBusinessNumber: certNumber.value.trim() ? '' : '농업경영체 등록번호를 입력하세요.'
    }), async () => {
      const button = certForm.querySelector('button[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      try {
        const response = await fetch('/api/auth/me/certification', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessNumber: certNumber.value.trim() })
        });
        if (response.status === 401) {
          location.replace('login');
          return;
        }
        if (response.status === 409) {
          actions.notify('이미 신청했거나 인증된 회원입니다. 페이지를 새로고침해 주세요.');
          return;
        }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const saved = await response.json();
        user.businessNumber = saved.businessNumber;
        user.certification = saved.certification;
        actions.updateAccount();
        updateProfileValues();
        get('profileCertHeading').focus();
        actions.notify('농업경영체 인증을 요청했습니다. 현재 인증 대기중입니다.');
      } catch {
        actions.notify('인증 신청을 저장하지 못했습니다. 다시 시도하세요.');
      } finally {
        button.disabled = false;
      }
    });

    const current = get('curPw');
    const next = get('newPw');
    const confirmation = get('chkPw');
    bindForm(passwordForm, () => {
      return {
        curPw: current.value ? '' : '현재 비밀번호를 입력하세요.',
        newPw: next.value.length < 8 || next.value.length > 20 ? '새 비밀번호를 8~20자로 입력하세요.' : '',
        chkPw: confirmation.value ? (confirmation.value === next.value ? '' : '새 비밀번호와 일치하지 않습니다.') : '새 비밀번호를 한 번 더 입력하세요.'
      };
    }, async () => {
      const button = passwordForm.querySelector('button[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      try {
        const response = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: current.value, newPassword: next.value })
        });
        if (response.status === 401) {
          location.replace('login');
          return;
        }
        if (response.status === 409) {
          showFieldError(current, '현재 비밀번호가 일치하지 않습니다.');
          current.focus();
          return;
        }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        passwordForm.reset();
        actions.notify('비밀번호를 변경했습니다.');
      } catch {
        actions.notify('비밀번호를 변경하지 못했습니다. 다시 시도하세요.');
      } finally {
        button.disabled = false;
      }
    });

    function showFarmDetails() {
      setEditing(false);
      get('profileEditBtn').focus();
    }

    get('profileEditBtn').addEventListener('click', () => {
      setEditing(true);
      get('profFarmName').focus();
    });
    get('profileCancelBtn').addEventListener('click', showFarmDetails);

    const value = id => get(id).value.trim() || null;
    async function saveProfile(form, path, fields, showDetails, message) {
      const button = form.querySelector('button[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      try {
        const profile = Object.fromEntries(Object.entries(fields).map(([key, id]) => [key, value(id)]));
        const response = await fetch(path, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        if (response.status === 401) {
          location.replace('login');
          return;
        }
        if (response.status === 409 && form === memberForm) {
          const email = get('profEmail');
          showFieldError(email, '이미 사용 중인 이메일입니다.');
          email.focus();
          return;
        }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const saved = await response.json();
        for (const key of Object.keys(fields)) user[key] = saved[key];
        actions.updateAccount();
        updateProfileValues();
        if (!form.closest('[hidden]')) showDetails();
        actions.notify(message);
      } catch {
        actions.notify('프로필을 저장하지 못했습니다. 다시 시도하세요.');
      } finally {
        button.disabled = false;
      }
    }
    bindForm(farmForm, () => ({
      profFarmName: value('profFarmName') ? '' : '농장명을 입력하세요.'
    }), () => {
      return saveProfile(farmForm, '/api/auth/me/farm', farmFields, showFarmDetails, '농장정보를 저장했습니다.');
    });

    function showMemberDetails() {
      setMemberEditing(false);
      get('memberEditBtn').focus();
    }

    get('memberEditBtn').addEventListener('click', () => {
      setMemberEditing(true);
      get('profDisplayName').focus();
    });
    get('memberCancelBtn').addEventListener('click', showMemberDetails);

    bindForm(memberForm, () => ({
      profDisplayName: value('profDisplayName') ? '' : '대표자명을 입력하세요.',
      profEmail: get('profEmail').validity.typeMismatch ? '이메일 주소 형식을 확인하세요.' : ''
    }), () => {
      return saveProfile(memberForm, '/api/auth/me/profile', memberFields, showMemberDetails, '농민 회원정보를 저장했습니다.');
    });

    get('addrSearchBtn').addEventListener('click', () => {
      if (window.daum?.Postcode) {
        const version = editorVersion;
        new window.daum.Postcode({
          oncomplete: data => {
            if (editorVersion !== version) return;
            address.value = data.roadAddress || data.jibunAddress || '';
            get('profAddressDetail').focus();
          }
        }).open();
        return;
      }
      address.readOnly = false;
      address.focus();
      actions.notify('카카오 주소 API를 불러올 수 없어 직접 입력으로 전환했습니다.');
    });

    return { show };
  }

  async function init() {
    const common = window.ModooCommon;
    await common.ready;
    const memberData = document.getElementById('profileMemberData');
    const member = { ...memberData.dataset };

    const main = document.getElementById('main');
    const crumb = document.getElementById('crumb');
    const profile = createProfilePage(main, {
      notify: common.notify,
      updateAccount: () => common.showAccount(member),
      openTab
    });

    function showTab(tab, focusId) {
      const menuKey = tab === 'cert' ? 'cert' : tab === 'pw' ? 'member' : 'profile';
      common.setCurrentMenu(menuKey);
      crumb.textContent =
        tab === 'cert'
          ? '내정보 / 농업경영체 인증'
          : tab === 'pw'
            ? '내정보 / 농민 회원정보'
            : '내정보 / 농장정보';
      profile.show(member, tab, focusId);
    }

    common.showAccount(member);
    common.bindAccount(() => openTab('info'));
    for (const link of document.querySelectorAll(
      '#navigation [data-go="profile"], #navigation [data-go="cert"], #navigation [data-go="member"]'
    )) {
      link.addEventListener('click', event => {
        event.preventDefault();
        openTab(link.dataset.go === 'cert' ? 'cert' : link.dataset.go === 'member' ? 'pw' : 'info');
      });
    }

    function openTab(tab) {
      showTab(tab, 'profile-tab-' + tab);
    }

    const params = new URLSearchParams(location.search);
    const paramTab = params.get('tab') || params.get('view');
    showTab(paramTab === 'cert' ? 'cert' : paramTab === 'pw' ? 'pw' : 'info');
    main.inert = false;
    main.focus({ preventScroll: true });
  }

  init();
})();

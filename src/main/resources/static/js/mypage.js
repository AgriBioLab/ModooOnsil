(function () {
  'use strict';

  function createProfilePage(main, actions) {
    const get = id => main.querySelector('#' + id);
    const tabs = [...main.querySelectorAll('[data-profile-tab]')];
    const details = get('profileDetails');
    const editor = get('profileEditor');
    const farmForm = get('profileForm');
    const certForm = get('certRequestForm');
    const passwordForm = get('passwordForm');
    const certNumber = get('certBusinessNumber');
    const address = get('profAddress');
    const farmFields = {
      farmName: 'profFarmName', displayName: 'profDisplayName', email: 'profEmail',
      phone: 'profPhone', address: 'profAddress', addressDetail: 'profAddressDetail',
      mainCrop: 'profMainCrop', description: 'profDesc'
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
      const certification = user.certification || '미인증';
      const complete = certification === '인증';
      const pending = certification === '인증중';
      const values = {
        ...user,
        certification,
        farmAddress: [user.address, user.addressDetail].filter(Boolean).join(' ')
      };
      for (const item of main.querySelectorAll('[data-profile-value]')) {
        item.textContent = values[item.dataset.profileValue] || '—';
      }
      get('profileFarmTitle').textContent = user.farmName || '—';
      get('profileFarmSummary').textContent = (user.displayName || '—') + ' · ' + (user.mainCrop || '품목 미등록');
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

    function show(member, selectedTab, focusId) {
      user = member;
      setEditing(false);
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
    }), () => {
      const patch = { businessNumber: certNumber.value.trim(), certification: '인증중' };
      if (!actions.save(user.username, patch)) return;
      Object.assign(user, patch);
      actions.updateAccount();
      updateProfileValues();
      get('profileCertHeading').focus();
      actions.notify('농업경영체 인증을 요청했습니다. 현재 인증중입니다.');
    });

    const current = get('curPw');
    const next = get('newPw');
    const confirmation = get('chkPw');
    bindForm(passwordForm, () => {
      const expected = user.demoPassword || 'modoodemo01';
      const matches = [expected, 'modoodemo01', 'demo'].includes(current.value);
      return {
        curPw: current.value ? (matches ? '' : '현재 비밀번호가 일치하지 않습니다.') : '현재 비밀번호를 입력하세요.',
        newPw: next.value.length < 8 || next.value.length > 20 ? '새 비밀번호를 8~20자로 입력하세요.' : '',
        chkPw: confirmation.value ? (confirmation.value === next.value ? '' : '새 비밀번호와 일치하지 않습니다.') : '새 비밀번호를 한 번 더 입력하세요.'
      };
    }, () => {
      if (!actions.save(user.username, { demoPassword: next.value })) return;
      user.demoPassword = next.value;
      passwordForm.reset();
      actions.notify('비밀번호를 변경했습니다.');
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
    bindForm(farmForm, () => ({
      profFarmName: value('profFarmName') ? '' : '농장명을 입력하세요.',
      profDisplayName: value('profDisplayName') ? '' : '대표자명을 입력하세요.',
      profEmail: get('profEmail').validity.typeMismatch ? '이메일 주소 형식을 확인하세요.' : ''
    }), () => {
      const patch = Object.fromEntries(Object.entries(farmFields).map(([key, id]) => [key, value(id)]));
      if (!actions.save(user.username, patch)) return;
      Object.assign(user, patch);
      actions.updateAccount();
      updateProfileValues();
      showFarmDetails();
      actions.notify('내정보를 저장했습니다.');
    });

    get('addrSearchBtn').addEventListener('click', () => {
      if (window.daum?.Postcode) {
        const version = editorVersion;
        new window.daum.Postcode({ oncomplete: data => {
          if (editorVersion !== version) return;
          address.value = data.roadAddress || data.jibunAddress || '';
          get('profAddressDetail').focus();
        } }).open();
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
    const username = common.loadAuthUser();
    const member = common.allMembers().find(account => account.username === username);
    if (!member) {
      location.replace('login.html');
      return;
    }

    const main = document.getElementById('main');
    const crumb = document.getElementById('crumb');
    const profile = createProfilePage(main, {
      save: common.saveProfilePatch,
      notify: common.notify,
      updateAccount: () => common.showAccount(member),
      openTab
    });

    function showTab(tab, focusId) {
      const certification = tab === 'cert';
      common.setCurrentMenu(certification ? 'cert' : 'profile');
      crumb.textContent = certification ? '내정보 / 농업경영체 인증' : '내정보';
      profile.show(member, tab, focusId);
    }

    common.showAccount(member);
    common.bindAccount(() => openTab('info'));
    for (const link of document.querySelectorAll('#navigation [data-go="profile"], #navigation [data-go="cert"]')) {
      link.addEventListener('click', event => {
        event.preventDefault();
        openTab(link.dataset.go === 'cert' ? 'cert' : 'info');
      });
    }

    function openTab(tab) {
      showTab(tab, 'profile-tab-' + tab);
    }

    const params = new URLSearchParams(location.search);
    showTab(params.get('view') === 'cert' || params.get('tab') === 'cert' ? 'cert' : 'info');
    main.inert = false;
    main.focus();
  }

  init();
})();

(() => {
  'use strict';
  const { ready, notify: toast, escapeHtml, allMembers, loadSignupMembers, signupKey, saveAuthUser, loadAuthUser } = window.ModooCommon;
  const $ = (s, base = document) => base.querySelector(s);
  const $$ = (s, base = document) => [...base.querySelectorAll(s)];

  function setupLogin() {
    const form = $('#loginForm');
    if (!form) return;
    const username = $('#loginUsername');
    const password = $('#loginPassword');
    const toggle = $('#loginPasswordToggle');
    const feedback = $('#loginError');

    const defaults = (typeof sampleData !== 'undefined' ? sampleData?.authDefaults : null) || {};
    if (!username.value) username.value = loadAuthUser() || defaults.loginUsername || '';
    if (!password.value) password.value = defaults.loginPassword || '';

    toggle.addEventListener('click', () => {
      const reveal = password.type === 'password';
      password.type = reveal ? 'text' : 'password';
      toggle.textContent = reveal ? '비밀번호 숨기기' : '비밀번호 보기';
    });

    form.addEventListener('input', () => { feedback.textContent = ''; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const member = allMembers().find(row => row.username === username.value.trim());
      const pw = password.value;
      if (member && (pw === 'modoodemo01' || pw === 'demo' || pw === member.demoPassword)) {
        saveAuthUser(member.username);
        location.href = 'home.html';
        return;
      }
      feedback.textContent = '아이디와 비밀번호를 확인하세요.';
      feedback.focus();
    });
  }

  const signupStages = ['회원정보 입력', '농업경영체 인증', '완료'];
  const signupUsernamePattern = /^[a-z][a-z0-9]{5,19}$/;

  function signupProgress(step) {
    return `<ol class="krds-step-wrap" aria-label="회원가입 단계">
      ${signupStages.map((label, index) => {
        const number = index + 1;
        const state = number === step ? 'class="active" aria-current="step"' : number < step ? 'class="done"' : '';
        return `<li ${state}><span><span class="step">${number}단계</span><span class="step-tit">${label}</span></span></li>`;
      }).join('')}
    </ol>`;
  }

  function signupField(id, label, { type = 'text', required = false, attributes = '', hint = '', checkLabel = '' } = {}) {
    return `<div class="form-group">
      <label class="form-label" for="${id}">${label}${required ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
      <div class="${checkLabel ? 'auth-input-row' : 'form-conts'}">
        <input id="${id}" name="${id}" class="krds-input medium" type="${type}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-feedback" ${required ? 'required' : ''} ${attributes}>
        ${checkLabel ? `<button type="button" class="krds-btn medium secondary" data-check="${id}" aria-label="${checkLabel} 중복 확인">중복 확인</button>` : ''}
      </div>
      ${hint ? `<p id="${id}-hint" class="auth-hint">${hint}</p>` : ''}
      <p id="${id}-feedback" class="auth-feedback" aria-live="polite"></p>
    </div>`;
  }

  function signupFeedback(input, message, state = 'error') {
    const feedback = document.getElementById(input.id + '-feedback');
    const invalid = Boolean(message) && state === 'error';
    input.closest('.form-group').classList.toggle('is-error', invalid);
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    feedback.dataset.state = state;
    feedback.textContent = message;
  }

  function signupDuplicateMessage(members, key, value) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || !members.some(member => member[key]?.trim().toLowerCase() === normalized)) return '';
    return key === 'username' ? '이미 사용 중인 아이디입니다.' : '이미 사용 중인 이메일입니다.';
  }

  function setupSignup() {
    const mount = $('#signupStepMount');
    if (!mount) return;
    let step = 1;
    const defaults = (typeof sampleData !== 'undefined' ? sampleData?.authDefaults : null) || {};
    let draft = { ...(defaults.signup || {}) };
    let businessNumber = defaults.businessNumber || '';
    let certStatus = '미인증';
    let savedMember;

    function showStep(content, title = signupStages[step - 1]) {
      mount.innerHTML = signupProgress(step) + `<section class="panel signup-panel" aria-labelledby="signupStepTitle">
        <div class="panel-head"><h2 id="signupStepTitle" tabindex="-1">${title}</h2></div>
        <div class="panel-body">${content}</div>
      </section>`;
    }

    function focusStep() {
      $('#signupStepTitle', mount)?.focus();
    }

    function renderMemberForm(conflicts = {}) {
      step = 1;
      showStep(`<form id="signupForm" class="login-form" novalidate>
        <div class="signup-form-grid">
          ${signupField('signupFarmName', '농장명', { required: true, attributes: 'maxlength="100" autocomplete="organization"' })}
          ${signupField('signupRepresentativeName', '대표자명', { required: true, attributes: 'maxlength="50" autocomplete="name"' })}
          ${signupField('signupUsername', '아이디', {
            required: true, attributes: 'minlength="6" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false"',
            hint: '영문 소문자로 시작하는 영문 소문자·숫자 6~20자', checkLabel: '아이디'
          })}
          ${signupField('signupEmail', '이메일 (선택)', { type: 'email', attributes: 'maxlength="255" autocomplete="email"', checkLabel: '이메일' })}
          ${signupField('signupPassword', '비밀번호', {
            type: 'password', required: true, attributes: 'minlength="8" maxlength="20" autocomplete="new-password"', hint: '8~20자로 입력하세요.'
          })}
          ${signupField('signupPasswordConfirm', '비밀번호 확인', {
            type: 'password', required: true, attributes: 'minlength="8" maxlength="20" autocomplete="new-password"'
          })}
          ${signupField('signupPhone', '연락처 (선택)', { type: 'tel', attributes: 'maxlength="20" autocomplete="tel"' })}
          ${signupField('signupMainCrop', '주요 재배 품목 (선택)', { attributes: 'maxlength="100"' })}
          <div class="form-group">
            <label class="form-label" for="signupAddress">농장 주소 (선택)</label>
            <div class="auth-input-row">
              <input id="signupAddress" class="krds-input medium" type="text" maxlength="255" readonly aria-describedby="signupAddress-feedback">
              <button type="button" class="krds-btn medium secondary" id="signupAddrSearchBtn">주소 검색</button>
            </div>
            <p id="signupAddress-feedback" class="auth-feedback" aria-live="polite"></p>
          </div>
          ${signupField('signupAddressDetail', '상세 주소 (선택)', { attributes: 'maxlength="255" autocomplete="address-line2"' })}
          <div class="form-group signup-field-wide">
            <label class="form-label" for="signupDescription">농장 소개 (선택)</label>
            <div class="form-conts">
              <textarea id="signupDescription" class="krds-input medium signup-textarea" maxlength="500" aria-describedby="signupDescription-feedback"></textarea>
            </div>
            <p id="signupDescription-feedback" class="auth-feedback" aria-live="polite"></p>
          </div>
        </div>
        <div class="signup-actions"><button type="submit" class="krds-btn medium primary" id="signupNextBtn">다음</button></div>
      </form>`);

      const form = $('#signupForm', mount);
      const input = id => form.elements.namedItem(id);
      const value = id => input(id).value.trim();
      for (const [id, text] of Object.entries(draft)) {
        if (input(id)) input(id).value = text;
      }

      const fieldsToCheck = {
        signupUsername: {
          key: 'username', label: '아이디', empty: '아이디를 입력하세요.',
          validate: () => signupUsernamePattern.test(value('signupUsername')) ? '' : '아이디 형식을 확인하세요.'
        },
        signupEmail: {
          key: 'email', label: '이메일', empty: '이메일을 입력하세요.',
          validate: () => input('signupEmail').validity.typeMismatch ? '이메일 주소 형식을 확인하세요.' : ''
        }
      };

      const displayErrors = errors => {
        const entries = Object.entries(errors);
        for (const [id, message] of entries) signupFeedback(input(id), message);
        const firstError = entries.find(([, message]) => message);
        if (firstError) input(firstError[0]).focus();
        return Boolean(firstError);
      };

      form.addEventListener('input', ({ target }) => signupFeedback(target, ''));
      $('#signupAddrSearchBtn', form).onclick = () => {
        const addrInput = input('signupAddress');
        if (window.daum?.Postcode) {
          new window.daum.Postcode({
            oncomplete: data => {
              addrInput.value = data.roadAddress || data.jibunAddress || '';
              input('signupAddressDetail').focus();
            }
          }).open();
          return;
        }
        addrInput.readOnly = false;
        addrInput.focus();
        toast('주소 검색 서비스를 불러오지 못해 직접 입력으로 전환했습니다.');
      };
      for (const button of $$('[data-check]', form)) {
        const id = button.dataset.check;
        const field = fieldsToCheck[id];
        button.onclick = () => {
          const current = value(id);
          const message = !current ? field.empty :
            field.validate() || signupDuplicateMessage(allMembers(), field.key, current);
          signupFeedback(input(id), message || '사용할 수 있는 ' + field.label + '입니다.', message ? 'error' : 'success');
          if (message) input(id).focus();
        };
      }

      form.onsubmit = event => {
        event.preventDefault();
        const members = allMembers();
        const password = input('signupPassword').value;
        const confirmation = input('signupPasswordConfirm').value;
        const errors = {
          signupFarmName: value('signupFarmName') ? '' : '농장명을 입력하세요.',
          signupRepresentativeName: value('signupRepresentativeName') ? '' : '대표자명을 입력하세요.',
          signupUsername: !value('signupUsername') ? '아이디를 입력하세요.' : fieldsToCheck.signupUsername.validate() ||
            signupDuplicateMessage(members, 'username', value('signupUsername')),
          signupPassword: password.length >= 8 && password.length <= 20 ? '' : '비밀번호를 8~20자로 입력하세요.',
          signupPasswordConfirm: confirmation && confirmation === password ? '' : '비밀번호와 같은 값을 입력하세요.',
          signupEmail: fieldsToCheck.signupEmail.validate() || signupDuplicateMessage(members, 'email', value('signupEmail'))
        };
        if (displayErrors(errors)) return;
        draft = Object.fromEntries($$('input, textarea', form).map(field => [field.id, field.value]));
        renderCertificationForm();
        focusStep();
      };
      displayErrors(conflicts);
    }

    function renderCertificationForm() {
      step = 2;
      showStep(`<form id="signupCertificationForm" class="login-form">
        ${signupField('signupBusinessNumber', '농업경영체 등록번호 (선택)', { attributes: 'maxlength="20"', hint: '등록번호를 입력해 인증을 요청하시면 관리자 승인 후 인증이 완료됩니다.' })}
        <div class="signup-actions">
          <button type="button" class="krds-btn medium tertiary" id="signupPrevBtn">이전</button>
          <button type="button" class="krds-btn medium secondary" id="signupCertBtn">인증 요청</button>
          <button type="submit" class="krds-btn medium primary">가입하기</button>
        </div>
        <p class="auth-feedback" id="signupSaveError" role="alert" data-state="error"></p>
      </form>`);

      const form = $('#signupCertificationForm', mount);
      const input = $('#signupBusinessNumber', form);
      const submit = $('button[type="submit"]', form);
      input.value = businessNumber;

      function updateCertification() {
        certStatus = businessNumber ? '인증 대기중' : '미인증';
      }

      input.oninput = () => {
        signupFeedback(input, '');
        businessNumber = '';
        updateCertification();
      };
      $('#signupCertBtn', form).onclick = () => {
        businessNumber = input.value.trim();
        if (!businessNumber) {
          signupFeedback(input, '농업경영체 등록번호를 입력하세요.');
          input.focus();
          return;
        }
        updateCertification();
        signupFeedback(input, '인증 요청이 접수되었습니다. 관리자 승인 후 인증이 완료됩니다.', 'success');
        toast('인증 요청이 접수되었습니다. 관리자 승인 후 인증됩니다.');
      };
      $('#signupPrevBtn', form).onclick = () => {
        businessNumber = input.value.trim();
        updateCertification();
        renderMemberForm();
        focusStep();
      };
      form.onsubmit = event => {
        event.preventDefault();
        if (submit.disabled) return;
        businessNumber = input.value.trim();
        updateCertification();
        const newMember = {
          id: 'MEM-' + Date.now(),
          displayName: draft.signupRepresentativeName.trim(),
          role: '화훼농민',
          certification: certStatus,
          businessNumber: businessNumber || null,
          username: draft.signupUsername.trim(),
          demoPassword: draft.signupPassword,
          farmName: draft.signupFarmName.trim(),
          email: draft.signupEmail.trim() || null,
          phone: draft.signupPhone.trim() || null,
          address: draft.signupAddress?.trim() || null,
          addressDetail: draft.signupAddressDetail?.trim() || null,
          mainCrop: draft.signupMainCrop.trim() || null,
          description: draft.signupDescription?.trim() || null,
          createdAt: new Date().toISOString().slice(0, 10)
        };
        const members = allMembers();
        const conflicts = {
          signupUsername: signupDuplicateMessage(members, 'username', newMember.username),
          signupEmail: signupDuplicateMessage(members, 'email', newMember.email || '')
        };
        if (conflicts.signupUsername || conflicts.signupEmail) {
          renderMemberForm(conflicts);
          return;
        }
        submit.disabled = true;
        try {
          localStorage.setItem(signupKey, JSON.stringify([...loadSignupMembers(), newMember]));
        } catch {}
        saveAuthUser(newMember.username);
        savedMember = newMember;
        renderComplete();
        focusStep();
      };
    }

    function renderComplete() {
      step = 3;
      showStep(`<div class="login-form">
        <p class="signup-complete-copy">회원가입이 완료되었습니다.</p>
        <dl class="profile-facts">
          <dt>농장명</dt><dd>${escapeHtml(savedMember.farmName)}</dd>
          <dt>대표자명</dt><dd>${escapeHtml(savedMember.displayName)}</dd>
          <dt>아이디</dt><dd>${escapeHtml(savedMember.username)}</dd>
          <dt>농업경영체 인증</dt><dd>${escapeHtml(savedMember.certification)}</dd>
        </dl>
        <div class="signup-actions"><a class="krds-btn medium primary" href="login.html">로그인으로 이동</a></div>
      </div>`);
    }

    renderMemberForm();
  }

  async function init() {
    await ready;
    const page = document.body?.dataset?.page;
    if (page === 'login') setupLogin();
    else if (page === 'signup') setupSignup();
  }

  init();
})();

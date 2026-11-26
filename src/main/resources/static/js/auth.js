(() => {
  'use strict';
  const { ready, notify: toast, escapeHtml, fetchJson, currentMember } = window.ModooCommon;
  const $ = (s, base = document) => base.querySelector(s);
  const $$ = (s, base = document) => [...base.querySelectorAll(s)];

  // === 1. 로그인 화면 ===
  function setupLogin() {
    const form = $('#loginForm');
    if (!form) return;
    const password = $('#loginPassword');
    const toggle = $('#loginPasswordToggle');
    const feedback = $('#loginError');

    if (feedback.textContent.trim()) feedback.focus();

    toggle.addEventListener('click', () => {
      const reveal = password.type === 'password';
      password.type = reveal ? 'text' : 'password';
      toggle.textContent = reveal ? '비밀번호 숨기기' : '비밀번호 보기';
    });

    form.addEventListener('input', () => { feedback.textContent = ''; });
  }

  // === 2. 회원가입 다단계 폼 ===
  const signupUsernamePattern = /^[a-z][a-z0-9]{5,19}$/;

  function signupFeedback(input, message, state = 'error') {
    const feedback = document.getElementById(input.id + '-feedback');
    const invalid = Boolean(message) && state === 'error';
    input.closest('.form-group').classList.toggle('is-error', invalid);
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    feedback.dataset.state = state;
    feedback.textContent = message;
  }

  function setupSignup() {
    const mount = $('#signupStepMount');
    if (!mount) return;
    let step = 1;
    let draft = {};
    let businessNumber = '';
    let certStatus = '미인증';
    let savedMember;

    const stages = $$('[data-signup-stage]', mount);
    const title = $('#signupStepTitle', mount);
    const body = $('#signupStepBody', mount);

    function showStep(content) {
      for (const [index, stage] of stages.entries()) {
        const active = index === step - 1;
        stage.classList.toggle('active', active);
        if (active) stage.setAttribute('aria-current', 'step');
        else stage.removeAttribute('aria-current');
      }
      title.textContent = $('.step-tit', stages[step - 1]).textContent;
      if (typeof content === 'string') body.innerHTML = content;
      else if (step !== 1 || !body.querySelector('#signupForm')) body.replaceChildren(content);
    }

    function focusStep() {
      $('#signupStepTitle', mount)?.focus();
    }

    function renderMemberForm(conflicts = {}) {
      step = 1;
      showStep(document.getElementById('signupFormTemplate').content.cloneNode(true));

      const form = $('#signupForm', mount);
      const input = id => form.elements.namedItem(id);
      const value = id => input(id).value.trim();
      for (const [id, text] of Object.entries(draft)) {
        if (input(id)) input(id).value = text;
      }

      const fieldsToCheck = {
        signupUsername: {
          key: 'username',
          label: '아이디',
          empty: '아이디를 입력하세요.',
          validate: () =>
            signupUsernamePattern.test(value('signupUsername')) ? '' : '아이디 형식을 확인하세요.'
        },
        signupEmail: {
          key: 'email',
          label: '이메일',
          empty: '이메일을 입력하세요.',
          validate: () =>
            input('signupEmail').validity.typeMismatch ? '이메일 주소 형식을 확인하세요.' : ''
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
        button.onclick = async () => {
          const current = value(id);
          let message = !current ? field.empty : field.validate();
          if (!message) {
            try {
              const query = new URLSearchParams({ [field.key]: current });
              if (!await fetchJson('/api/members/availability?' + query)) {
                message = field.key === 'username' ? '이미 사용 중인 아이디입니다.' : '이미 사용 중인 이메일입니다.';
              }
            } catch {
              message = '중복 확인에 실패했습니다. 다시 시도하세요.';
            }
          }
          if (value(id) !== current) return;
          signupFeedback(input(id), message || '사용할 수 있는 ' + field.label + '입니다.', message ? 'error' : 'success');
          if (message) input(id).focus();
        };
      }

      form.onsubmit = event => {
        event.preventDefault();
        const password = input('signupPassword').value;
        const confirmation = input('signupPasswordConfirm').value;
        const errors = {
          signupFarmName: value('signupFarmName') ? '' : '농장명을 입력하세요.',
          signupRepresentativeName: value('signupRepresentativeName') ? '' : '대표자명을 입력하세요.',
          signupUsername: !value('signupUsername') ? '아이디를 입력하세요.' : fieldsToCheck.signupUsername.validate(),
          signupPassword: password.length >= 8 && password.length <= 20 ? '' : '비밀번호를 8~20자로 입력하세요.',
          signupPasswordConfirm: confirmation && confirmation === password ? '' : '비밀번호와 같은 값을 입력하세요.',
          signupEmail: fieldsToCheck.signupEmail.validate()
        };
        if (displayErrors(errors)) return;
        draft = Object.fromEntries(
          $$('input, textarea', form).map(field => [field.id, field.value])
        );
        renderCertificationForm();
        focusStep();
      };
      displayErrors(conflicts);
    }

    function renderCertificationForm() {
      step = 2;
      showStep(document.getElementById('signupCertificationFormTemplate').content.cloneNode(true));

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
        signupFeedback(
          input,
          '인증 요청이 접수되었습니다. 관리자 승인 후 인증이 완료됩니다.',
          'success'
        );
        toast('인증 요청이 접수되었습니다. 관리자 승인 후 인증됩니다.');
      };
      $('#signupPrevBtn', form).onclick = () => {
        businessNumber = input.value.trim();
        updateCertification();
        renderMemberForm();
        focusStep();
      };
      form.onsubmit = async event => {
        event.preventDefault();
        if (submit.disabled) return;
        businessNumber = input.value.trim();
        updateCertification();
        const registration = {
          displayName: draft.signupRepresentativeName.trim(),
          businessNumber: businessNumber || null,
          username: draft.signupUsername.trim(),
          farmName: draft.signupFarmName.trim(),
          email: draft.signupEmail.trim() || null,
          phone: draft.signupPhone.trim() || null,
          address: draft.signupAddress?.trim() || null,
          addressDetail: draft.signupAddressDetail?.trim() || null,
          mainCrop: draft.signupMainCrop.trim() || null,
          description: draft.signupDescription?.trim() || null,
        };
        submit.disabled = true;
        try {
          const response = await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...registration, password: draft.signupPassword })
          });
          if (response.status === 409) {
            renderMemberForm({ signupUsername: '이미 사용 중인 아이디 또는 이메일입니다.' });
            return;
          }
          if (!response.ok) throw new Error('HTTP ' + response.status);
          savedMember = { ...registration, certification: certStatus };
          draft = {};
          renderComplete();
          focusStep();
        } catch {
          $('#signupSaveError', form).textContent = '가입 정보를 저장하지 못했습니다. 다시 시도하세요.';
          submit.disabled = false;
        }
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
        <div class="signup-actions"><a class="krds-btn medium primary" href="login">로그인으로 이동</a></div>
      </div>`);
    }

    renderMemberForm();
  }

  // === 3. 페이지 초기화 ===
  async function init() {
    await ready;
    const page = document.body?.dataset?.page;
    if (page === 'login' || page === 'signup') {
      try {
        if (await currentMember()) {
          location.replace('/index.html');
          return;
        }
      } catch {
        // Fall through to render auth page when session lookup fails.
      }
    }
    if (page === 'login') setupLogin();
    else if (page === 'signup') setupSignup();
  }

  init();
})();

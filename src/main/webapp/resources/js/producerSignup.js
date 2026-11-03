'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const terms = $('#agreeTerms');
  const privacy = $('#agreePrivacy');
  const all = $('#agreeAll');
  const form = $('#producerSignupForm');
  const summary = $('#signupErrors');
  const fieldIds = ['signupName', 'signupId', 'signupPassword', 'signupPasswordConfirm', 'signupPhone'];

  function showStep(step) {
    for (let index = 1; index <= 4; index++) {
      $('#signupStep' + index).hidden = index !== step;
      const indicator = document.querySelector('[data-step-indicator="' + index + '"]');
      indicator.classList.toggle('is-done', index < step);
      if (index === step) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    }
    document.title = '모두의온실 - 생산자 회원가입 · ' + ['약관·개인정보 확인', '농업경영체 인증', '회원정보 입력', '회원정보 입력 완료'][step - 1];
    const heading = $(['#termsTitle', '#verificationTitle', '#accountTitle', '#completeTitle'][step - 1]);
    heading.focus({ preventScroll: true });
    $('.signup-steps').scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  function setError(id, text) {
    const input = $('#' + id);
    const error = $('#' + id + 'Error');
    error.textContent = text;
    error.hidden = !text;
    if (text) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function updateAllConsent() {
    all.checked = terms.checked && privacy.checked;
    all.indeterminate = terms.checked !== privacy.checked;
  }

  function validConsents() {
    const missing = [];
    [[terms, '#termsError', '서비스 이용약관 동의 여부를 확인해주세요.'], [privacy, '#privacyError', '개인정보 수집·이용 동의 여부를 확인해주세요.']].forEach(([checkbox, selector, text]) => {
      $(selector).hidden = checkbox.checked;
      $(selector).textContent = checkbox.checked ? '' : text;
      if (!checkbox.checked) { checkbox.setAttribute('aria-invalid', 'true'); missing.push(checkbox); }
      else checkbox.removeAttribute('aria-invalid');
    });
    if (missing.length) missing[0].focus();
    return missing.length === 0;
  }

  all.addEventListener('change', () => {
    terms.checked = all.checked;
    privacy.checked = all.checked;
    all.indeterminate = false;
    [terms, privacy].forEach(checkbox => {
      checkbox.removeAttribute('aria-invalid');
      $('#' + (checkbox === terms ? 'termsError' : 'privacyError')).hidden = true;
    });
  });
  [terms, privacy].forEach(checkbox => checkbox.addEventListener('change', () => {
    updateAllConsent();
    if (checkbox.checked) {
      checkbox.removeAttribute('aria-invalid');
      $('#' + (checkbox === terms ? 'termsError' : 'privacyError')).hidden = true;
    }
  }));
  $('#termsNext').addEventListener('click', () => { if (validConsents()) showStep(2); });
  $('#accountPrevious').addEventListener('click', () => showStep(2));
  $('#verificationPrevious').addEventListener('click', () => showStep(1));
  $('#verificationNext').addEventListener('click', () => { if (validConsents()) showStep(3); else showStep(1); });
  $('#verificationForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    $('#verificationStatus').textContent = '현재 인증을 진행할 수 없습니다.';
  });

  document.querySelectorAll('[data-toggle-password]').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.textContent = visible ? '숨기기' : '보기';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', (input.id === 'signupPassword' ? '비밀번호' : '비밀번호 확인') + (visible ? ' 숨기기' : ' 표시'));
  }));

  fieldIds.forEach(id => $('#' + id).addEventListener('input', () => {
    setError(id, '');
    summary.hidden = true;
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validConsents()) { showStep(1); return; }
    const errors = [];
    const add = (id, text) => { setError(id, text); errors.push({ id, text }); };
    fieldIds.forEach(id => setError(id, ''));
    const name = $('#signupName').value.trim();
    const userId = $('#signupId').value;
    const password = $('#signupPassword').value;
    const confirmation = $('#signupPasswordConfirm').value;
    const phone = $('#signupPhone').value.replace(/[\s-]/g, '');
    if (!name || name.length > 50) add('signupName', '이름을 1~50자로 입력해주세요.');
    if (!/^[a-z][a-z0-9]{5,19}$/.test(userId)) add('signupId', '아이디는 영문 소문자로 시작하는 6~20자의 영문 소문자·숫자로 입력해주세요.');
    if (!password.trim() || password.length < 10 || password.length > 64) add('signupPassword', '비밀번호는 공백만 사용하지 않고 10~64자로 입력해주세요.');
    if (!confirmation || password !== confirmation) add('signupPasswordConfirm', '입력한 비밀번호와 일치하지 않습니다.');
    if (!/^(?:010\d{8}|01[16789]\d{7,8})$/.test(phone)) add('signupPhone', '휴대전화번호 형식을 확인해주세요. 예: 010-0000-0000');
    if (errors.length) {
      summary.replaceChildren();
      const title = document.createElement('strong');
      title.textContent = '입력한 정보를 다시 확인해주세요.';
      const list = document.createElement('ul');
      errors.forEach(({ id, text }) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = text;
        link.addEventListener('click', event => { event.preventDefault(); $('#' + id).focus(); });
        item.append(link);
        list.append(item);
      });
      summary.append(title, list);
      summary.hidden = false;
      summary.focus();
      return;
    }
    $('#verificationForm').reset();
    // UI 체험만 완료합니다. 요청·계정 생성·브라우저 저장을 수행하지 않습니다.
    form.reset();
    document.querySelectorAll('[data-toggle-password]').forEach(button => {
      document.getElementById(button.dataset.togglePassword).type = 'password';
      button.textContent = '보기';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', (button.dataset.togglePassword === 'signupPassword' ? '비밀번호' : '비밀번호 확인') + ' 표시');
    });
    summary.hidden = true;
    showStep(4);
  });

  if (new URLSearchParams(location.search).get('view') === 'verification') showStep(2);

  $('#restartSignup').addEventListener('click', () => {
    form.reset();
    $('#verificationForm').reset();
    $('#verificationStatus').textContent = '미인증';
    terms.checked = false;
    privacy.checked = false;
    updateAllConsent();
    fieldIds.forEach(id => setError(id, ''));
    $('#termsError').hidden = true;
    $('#privacyError').hidden = true;
    summary.hidden = true;
    showStep(1);
  });
})();

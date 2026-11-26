// 온실 등록 · 수정 폼 처리 (표준 DOM + fetch + window.ModooCommon).
(() => {
  'use strict';

  const {
    ready,
    notify,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu
  } = window.ModooCommon;

  // === 1. 폼 상태 · 미리보기 유틸 ===

  function showFormError(message) {
    const errorBox = document.getElementById('ghErr');
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  }

  function clearFormError() {
    const errorBox = document.getElementById('ghErr');
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
  }

  function updatePhotoPreview(src) {
    const box = document.getElementById('ghPhotoPreview');
    const img = document.getElementById('ghPhotoPreviewImg');
    if (!box || !img) return;

    if (src) {
      img.src = src;
      box.classList.remove('hidden');
    } else {
      img.removeAttribute('src');
      box.classList.add('hidden');
    }
  }

  function readNullableNumber(id) {
    const raw = document.getElementById(id)?.value.trim() || '';
    if (raw === '') return null;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? NaN : parsed;
  }

  function populateForm(house) {
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value ?? '';
    };

    setValue('ghName', house.greenhouseName || house.name || '');
    setValue('ghType', house.greenhouseType || house.type || '');
    setValue('ghCover', house.coverType || house.coveringType || '');
    setValue('ghCount', house.buildingCount ?? house.houseCount ?? '');
    setValue('ghMedium', house.mediumType || '');
    setValue('ghSide', house.sideHeight ?? '');
    setValue('ghWidth', house.width ?? '');
    setValue('ghLength', house.length ?? '');
    setValue('ghArea', house.registeredArea ?? '');

    const imageUrl = house.greenhouseImageUrl || house.imageUrl || '';
    setValue('ghImageUrl', imageUrl);
    updatePhotoPreview(imageUrl);
  }

  // === 2. API 요청 · 폼 제출 ===

  async function loadExistingGreenhouse(greenhouseId) {
    if (!greenhouseId) {
      showFormError('잘못된 온실 경로입니다.');
      return;
    }

    try {
      const response = await fetch(`/api/greenhouses/${encodeURIComponent(greenhouseId)}`, {
        headers: { Accept: 'application/json' }
      });
      if (response.status === 401) {
        location.replace('/login');
        return;
      }
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.detail || '온실 정보를 불러오지 못했습니다.');
      }

      populateForm(await response.json());
    } catch (error) {
      showFormError(error.message || '온실 정보를 불러오지 못했습니다.');
    }
  }

  function collectPayload() {
    const greenhouseName = document.getElementById('ghName')?.value.trim() || '';
    if (!greenhouseName) {
      showFormError('온실명을 입력하세요.');
      return null;
    }

    const buildingCount = readNullableNumber('ghCount');
    if (buildingCount !== null && (Number.isNaN(buildingCount) || buildingCount < 1)) {
      showFormError('동 수는 1 이상이어야 합니다.');
      return null;
    }

    const sideHeight = readNullableNumber('ghSide');
    const width = readNullableNumber('ghWidth');
    const length = readNullableNumber('ghLength');
    const registeredArea = readNullableNumber('ghArea');
    for (const num of [sideHeight, width, length, registeredArea]) {
      if (num !== null && (Number.isNaN(num) || num < 0)) {
        showFormError('규격 및 면적은 0 이상의 숫자여야 합니다.');
        return null;
      }
    }

    return {
      greenhouseName,
      greenhouseType: document.getElementById('ghType')?.value || '',
      coverType: document.getElementById('ghCover')?.value || '',
      buildingCount,
      sideHeight,
      width,
      length,
      registeredArea,
      mediumType: document.getElementById('ghMedium')?.value || '',
      greenhouseImageUrl: document.getElementById('ghImageUrl')?.value.trim() || ''
    };
  }

  async function submitForm(isEdit, greenhouseId) {
    clearFormError();
    const payload = collectPayload();
    if (!payload) return;

    const submitBtn = document.getElementById('ghSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    const url = isEdit
      ? `/api/greenhouses/${encodeURIComponent(greenhouseId)}`
      : '/api/greenhouses';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        location.replace('/login');
        return;
      }
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.detail || '온실 정보를 저장하지 못했습니다.');
      }

      const saved = await response.json();
      const targetId = saved.greenhouseId ?? greenhouseId;
      notify(isEdit ? '온실 정보를 수정했습니다.' : '온실을 등록했습니다.');

      setTimeout(() => {
        location.href = targetId != null ? `/greenhouses/${encodeURIComponent(targetId)}` : '/greenhouses';
      }, 300);
    } catch (error) {
      if (submitBtn) submitBtn.disabled = false;
      showFormError(error.message || '온실 정보를 저장하지 못했습니다.');
    }
  }

  // === 3. 페이지 초기화 ===

  document.addEventListener('DOMContentLoaded', async () => {
    const member = await currentMember();
    if (!member) {
      location.replace('/login');
      return;
    }

    await ready;
    showAccount(member);
    bindAccount(() => {
      location.href = '/mypage';
    });

    const view = document.body.dataset.greenhouseView || 'create';
    const isEdit = view === 'edit';
    const greenhouseId = document.body.dataset.greenhouseId || '';
    setCurrentMenu(isEdit ? 'gh-list' : 'gh-create');

    if (isEdit) {
      await loadExistingGreenhouse(greenhouseId);
    }

    document.getElementById('ghImageUrl')?.addEventListener('input', event => {
      updatePhotoPreview(event.target.value.trim());
    });

    document.getElementById('ghForm')?.addEventListener('submit', event => {
      event.preventDefault();
      submitForm(isEdit, greenhouseId);
    });
  });
})();

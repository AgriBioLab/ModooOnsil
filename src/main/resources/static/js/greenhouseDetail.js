// 온실 상세 조회 · 삭제 처리 (표준 DOM + fetch + window.ModooCommon).
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

  // === 1. 상세 정보 렌더링 ===

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showDetailError(message) {
    const body = document.getElementById('ghDetailBody');
    const errorEl = document.getElementById('ghDetailError');
    const deleteBtn = document.getElementById('ghDelete');
    const editBtn = document.getElementById('ghToEdit');

    if (body) body.classList.add('hidden');
    if (deleteBtn) deleteBtn.disabled = true;
    if (editBtn) editBtn.classList.add('hidden');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function renderGreenhouseDetail(house) {
    const name = house.greenhouseName || house.name || '이름 없음';
    const type = house.greenhouseType || house.type || '';
    const cover = house.coverType || house.coveringType || '';
    const medium = house.mediumType || '';
    const count = house.buildingCount ?? house.houseCount;
    const imageUrl = house.greenhouseImageUrl || house.imageUrl || '';

    setText('ghDetailName', name);
    setText('ghDetailSummary', `${type || '유형 미지정'} · ${cover || '피복 미지정'}`);

    const badge = document.getElementById('ghDetailTypeBadge');
    if (badge) {
      if (type) {
        badge.textContent = type;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    const layout = document.getElementById('ghDetailLayout');
    const photoBox = document.getElementById('ghPhotoBox');
    const photo = document.getElementById('ghDetailPhoto');
    if (layout && photoBox && photo) {
      if (imageUrl) {
        layout.classList.add('gh-detail-layout');
        photoBox.classList.remove('hidden');
        photo.src = imageUrl;
        photo.alt = `${name} 사진`;
      } else {
        layout.classList.remove('gh-detail-layout');
        photoBox.classList.add('hidden');
      }
    }

    setText('ghDetailArea', house.registeredArea != null ? `${house.registeredArea} ㎡` : '—');
    setText('ghDetailCount', count != null ? `${count}동` : '—');
    setText('ghDetailCover', cover || '—');
    setText('ghDetailMedium', medium || '—');
    setText('ghDetailSideHeight', house.sideHeight != null ? `${house.sideHeight} m` : '—');
    setText('ghDetailWidth', house.width != null ? `${house.width} m` : '—');
    setText('ghDetailLength', house.length != null ? `${house.length} m` : '—');
    setText('ghDetailImageUrl', imageUrl || '—');
  }

  // === 2. API 호출 · 이벤트 바인딩 ===

  async function loadGreenhouseDetail(greenhouseId) {
    if (!greenhouseId) {
      showDetailError('잘못된 온실 경로입니다.');
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

      const house = await response.json();
      renderGreenhouseDetail(house);
    } catch (error) {
      showDetailError(error.message || '온실 정보를 불러오지 못했습니다.');
    }
  }

  async function deleteGreenhouse(greenhouseId) {
    const okBtn = document.getElementById('ghDeleteOk');
    if (okBtn) okBtn.disabled = true;

    try {
      const response = await fetch(`/api/greenhouses/${encodeURIComponent(greenhouseId)}`, {
        method: 'DELETE'
      });
      if (response.status === 401) {
        location.replace('/login');
        return;
      }
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.detail || '온실을 삭제하지 못했습니다.');
      }

      notify('온실을 삭제했습니다.');
      setTimeout(() => {
        location.href = '/greenhouses';
      }, 300);
    } catch (error) {
      if (okBtn) okBtn.disabled = false;
      notify(error.message || '온실을 삭제하지 못했습니다.');
    }
  }

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
    setCurrentMenu('gh-list');

    const greenhouseId = document.body.dataset.greenhouseId || '';
    await loadGreenhouseDetail(greenhouseId);

    const deleteConfirm = document.getElementById('ghDeleteConfirm');
    document.getElementById('ghDelete')?.addEventListener('click', () => {
      deleteConfirm?.classList.remove('hidden');
    });
    document.getElementById('ghDeleteCancel')?.addEventListener('click', () => {
      deleteConfirm?.classList.add('hidden');
    });
    document.getElementById('ghDeleteOk')?.addEventListener('click', () => {
      deleteGreenhouse(greenhouseId);
    });
  });
})();

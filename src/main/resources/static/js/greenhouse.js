// 온실 목록 조회 · 필터링 · 이벤트 바인딩 (표준 DOM + fetch + window.ModooCommon).
// TODO: 온실 상세·등록·수정·삭제 API(SCRUM-174) 연결 후 CRUD 기능 추가 예정.
(() => {
  'use strict';

  const {
    ready,
    notify,
    escapeHtml,
    currentMember,
    showAccount,
    bindAccount,
    setCurrentMenu
  } = window.ModooCommon;

  let allGreenhouses = [];

  // === 1. 카드 · 필터 렌더링 ===

  function setSelectOptions(select, values) {
    if (!select) return;
    const unique = [...new Set(values.filter(Boolean))];
    select.innerHTML = [
      '<option value="">전체</option>',
      ...unique.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    ].join('');
  }

  function renderGreenhouseCard(house) {
    const name = house.greenhouseName || house.name || '이름 없음';
    const type = house.greenhouseType || house.type || '';
    const cover = house.coveringType || house.coverType || '—';
    const medium = house.mediumType || '—';
    const count = house.houseCount ?? house.buildingCount;
    const area = house.registeredArea;

    const mediaHtml = house.imageUrl
      ? `<img src="${escapeHtml(house.imageUrl)}" alt="${escapeHtml(name)} 사진">`
      : '<div class="gh-card-placeholder"><span>등록된 사진 없음</span></div>';

    const typeBadge = type
      ? `<span class="krds-badge bg-light-success">${escapeHtml(type)}</span>`
      : '';

    return `
      <article class="gh-card">
        <div class="gh-card-media">${mediaHtml}</div>
        <div class="gh-card-body">
          <div class="gh-card-head">
            <span class="gh-card-title">${escapeHtml(name)}</span>
            ${typeBadge}
          </div>
          <dl class="gh-card-specs">
            <div><dt>피복형태</dt><dd>${escapeHtml(cover)}</dd></div>
            <div><dt>동 수</dt><dd>${count != null ? `${escapeHtml(String(count))}동` : '—'}</dd></div>
            <div><dt>등록 면적</dt><dd>${area != null ? `${escapeHtml(String(area))} ㎡` : '—'}</dd></div>
            <div><dt>배지형태</dt><dd>${escapeHtml(medium)}</dd></div>
          </dl>
        </div>
      </article>
    `;
  }

  function renderFilteredList() {
    const grid = document.getElementById('ghCardGrid');
    const totalEl = document.getElementById('ghTotal');
    if (!grid || !totalEl) return;

    const nameVal = document.getElementById('ghFilterName')?.value || '';
    const typeVal = document.getElementById('ghFilterType')?.value || '';
    const coverVal = document.getElementById('ghFilterCover')?.value || '';
    const mediumVal = document.getElementById('ghFilterMedium')?.value || '';

    const filtered = allGreenhouses.filter(house => {
      const name = house.greenhouseName || house.name || '';
      const type = house.greenhouseType || house.type || '';
      const cover = house.coveringType || house.coverType || '';
      const medium = house.mediumType || '';
      return (
        (!nameVal || name === nameVal) &&
        (!typeVal || type === typeVal) &&
        (!coverVal || cover === coverVal) &&
        (!mediumVal || medium === mediumVal)
      );
    });

    totalEl.textContent = String(filtered.length);
    grid.innerHTML = filtered.length
      ? filtered.map(renderGreenhouseCard).join('')
      : '<p class="empty">조건에 맞는 온실이 없습니다.</p>';
  }

  // === 2. 서버 데이터 조회 · 이벤트 바인딩 ===

  async function loadGreenhouses() {
    const grid = document.getElementById('ghCardGrid');
    try {
      const response = await fetch('/api/greenhouses', { headers: { Accept: 'application/json' } });
      if (response.status === 401) {
        location.replace('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('온실 목록을 불러오지 못했습니다.');
      }

      allGreenhouses = await response.json();
      setSelectOptions(
        document.getElementById('ghFilterName'),
        allGreenhouses.map(house => house.greenhouseName || house.name)
      );
      setSelectOptions(
        document.getElementById('ghFilterType'),
        allGreenhouses.map(house => house.greenhouseType || house.type)
      );
      setSelectOptions(
        document.getElementById('ghFilterCover'),
        allGreenhouses.map(house => house.coveringType || house.coverType)
      );
      setSelectOptions(
        document.getElementById('ghFilterMedium'),
        allGreenhouses.map(house => house.mediumType)
      );
      renderFilteredList();
    } catch (failure) {
      if (grid) {
        grid.innerHTML = `<p class="empty" role="alert">${escapeHtml(failure.message)}</p>`;
      }
    }
  }

  function bindEvents() {
    const form = document.getElementById('ghFilters');
    const resetBtn = document.getElementById('ghResetBtn');
    const createBtn = document.getElementById('ghCreateBtn');

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        renderFilteredList();
      });
    }

    if (resetBtn && form) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        renderFilteredList();
      });
    }

    if (createBtn) {
      createBtn.addEventListener('click', () => {
        notify('온실 등록 기능은 API 연동 후 동작합니다.');
      });
    }
  }

  // === 3. 페이지 진입점 ===

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
    bindEvents();
    await loadGreenhouses();
  });
})();

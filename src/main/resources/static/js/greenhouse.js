(() => {
  'use strict';

  const {
    state,
    config,
    pages,
    $,
    $$,
    escapeHtml,
    htmlText,
    toast,
    options,
    pageControls,
    bindPages,
    storeGreenhouseExtras,
    go,
    moduleHeading,
    bindModuleBack,
    unifiedListPanel,
    listFilterField
  } = window.ModooApp;

  const DEFAULT_FILTERS = { name: 'all', type: 'all', cover: 'all', medium: 'all' };
  let currentPage = 1;
  let filters = { ...DEFAULT_FILTERS };

  function renderGreenhouseCard(house) {
    const mediaHtml = house.imageUrl
      ? `<img src="${escapeHtml(house.imageUrl)}" alt="${htmlText(house.name)} 사진">`
      : '<div class="gh-card-placeholder"><span>등록된 사진 없음</span></div>';
    const typeBadge = house.type
      ? `<span class="krds-badge bg-light-success">${htmlText(house.type)}</span>`
      : '';

    return `<article class="gh-card">
      <button type="button" class="gh-card-media" data-gh-detail="${house.greenhouseId}" aria-label="${htmlText(house.name)} 상세 보기">
        ${mediaHtml}
      </button>
      <div class="gh-card-body">
        <div class="gh-card-head">
          <button type="button" class="linkbtn gh-card-title" data-gh-detail="${house.greenhouseId}">${htmlText(house.name)}</button>
          ${typeBadge}
        </div>
        <dl class="gh-card-specs">
          <div><dt>피복형태</dt><dd>${htmlText(house.coverType || '—')}</dd></div>
          <div><dt>동 수</dt><dd>${house.buildingCount != null ? `${house.buildingCount}동` : '—'}</dd></div>
          <div><dt>등록 면적</dt><dd>${house.registeredArea != null ? `${house.registeredArea} ㎡` : '—'}</dd></div>
          <div><dt>배지형태</dt><dd>${htmlText(house.mediumType || '—')}</dd></div>
        </dl>
      </div>
    </article>`;
  }

  function renderGreenhouseList() {
    const main = $('#main');
    const rows = config.greenhouses.filter(
      house =>
        (filters.name === 'all' || house.name === filters.name) &&
        (filters.type === 'all' || house.type === filters.type) &&
        (filters.cover === 'all' || house.coverType === filters.cover) &&
        (filters.medium === 'all' || house.mediumType === filters.medium)
    );

    const pageSize = Number(config.pagination?.pageSize) || 5;
    currentPage = Math.min(
      Math.max(1, currentPage),
      Math.max(1, Math.ceil(rows.length / pageSize))
    );
    const startIndex = (currentPage - 1) * pageSize;
    const pagedRows = rows.slice(startIndex, startIndex + pageSize);

    const filterHtml = [
      listFilterField(
        'ghFilterName',
        '온실명',
        `<select class="ctrl" id="ghFilterName">${options(
          [
            { value: 'all', label: '전체' },
            ...config.greenhouses.map(house => ({ value: house.name, label: house.name }))
          ],
          filters.name
        )}</select>`
      ),
      listFilterField(
        'ghFilterType',
        '유형',
        `<select class="ctrl" id="ghFilterType">${options(
          [
            { value: 'all', label: '전체' },
            { value: '단동', label: '단동' },
            { value: '연동', label: '연동' }
          ],
          filters.type
        )}</select>`
      ),
      listFilterField(
        'ghFilterCover',
        '피복형태',
        `<select class="ctrl" id="ghFilterCover">${options(
          [
            { value: 'all', label: '전체' },
            { value: '유리', label: '유리' },
            { value: '비닐', label: '비닐' }
          ],
          filters.cover
        )}</select>`
      ),
      listFilterField(
        'ghFilterMedium',
        '배지형태',
        `<select class="ctrl" id="ghFilterMedium">${options(
          [
            { value: 'all', label: '전체' },
            { value: '수태', label: '수태' },
            { value: '코코피트', label: '코코피트' }
          ],
          filters.medium
        )}</select>`
      ),
      `<div class="list-filter-actions">
        <button type="button" class="btn list-reset-btn" id="ghResetFilter">초기화</button>
        <button type="button" class="btn main list-search-btn" id="ghDoFilter">검색</button>
      </div>`
    ].join('');

    const bodyHtml = pagedRows.length
      ? `<div class="panel-body"><div class="gh-card-grid">${pagedRows.map(renderGreenhouseCard).join('')}</div></div>`
      : '<div class="panel-body"><p class="empty" style="padding:40px 12px;margin:0">등록된 온실이 없습니다.</p></div>';

    main.innerHTML =
      moduleHeading('온실 정보') +
      unifiedListPanel({
        title: '온실 정보',
        count: rows.length,
        actionHtml: '<button type="button" class="btn main xs" id="ghCreate">+ 온실 등록</button>',
        filterHtml,
        bodyHtml,
        footHtml: pageControls(rows.length, currentPage, pageSize, '온실 정보')
      });

    $('#ghResetFilter').onclick = () => {
      filters = { ...DEFAULT_FILTERS };
      currentPage = 1;
      renderGreenhouseList();
    };
    $('#ghDoFilter').onclick = () => {
      filters = {
        name: $('#ghFilterName').value,
        type: $('#ghFilterType').value,
        cover: $('#ghFilterCover').value,
        medium: $('#ghFilterMedium').value
      };
      currentPage = 1;
      renderGreenhouseList();
    };
    $('#ghCreate').onclick = () => go('gh-create');
    $$('[data-gh-detail]').forEach(button => {
      button.onclick = () => go('gh-detail', button.dataset.ghDetail);
    });
    bindPages(
      () => currentPage,
      value => {
        currentPage = value;
      },
      rows.length,
      pageSize,
      renderGreenhouseList
    );
  }

  function renderGreenhouseDetail() {
    const main = $('#main');
    const house =
      config.greenhouses.find(item => item.greenhouseId === state.selectedGhId) ||
      config.greenhouses[0];
    if (!house) {
      go('gh-list');
      return;
    }

    state.selectedGhId = house.greenhouseId;
    const linkedCycles = config.cycles.filter(cycle => cycle.greenhouseId === house.greenhouseId);
    const facts = [
      ['등록 면적', house.registeredArea != null ? `${house.registeredArea} ㎡` : '—'],
      ['동 수', house.buildingCount != null ? `${house.buildingCount}동` : '—'],
      ['피복형태', house.coverType || '—'],
      ['배지형태', house.mediumType || '—'],
      ['측고', house.sideHeight != null ? `${house.sideHeight} m` : '—'],
      ['폭', house.width != null ? `${house.width} m` : '—'],
      ['길이', house.length != null ? `${house.length} m` : '—'],
      ['온실 사진 URL', house.imageUrl || '—']
    ];

    const photoHtml = house.imageUrl
      ? `<div class="gh-photo-box"><img class="gh-detail-photo" src="${escapeHtml(house.imageUrl)}" alt="${htmlText(house.name)} 사진"></div>`
      : '';
    const factRows = facts
      .map(([label, value]) => `<dt>${htmlText(label)}</dt><dd>${htmlText(String(value))}</dd>`)
      .join('');

    main.innerHTML =
      moduleHeading('온실 정보 상세', '') +
      `<div class="module-scroll">
      <section class="panel">
        <div class="panel-head">
          <div class="panel-head-title">
            <h2>${htmlText(house.name)}</h2>
            ${house.type ? `<span class="krds-badge bg-light-success">${htmlText(house.type)}</span>` : ''}
          </div>
          <span class="counter">${htmlText(house.type || '유형 미지정')} · ${htmlText(house.coverType || '피복 미지정')}</span>
        </div>
        <div class="panel-body">
          <div class="${house.imageUrl ? 'gh-detail-layout' : ''}">
            ${photoHtml}
            <dl class="profile-facts facts-2col">${factRows}</dl>
          </div>
        </div>
      </section>
      <div class="hidden" id="ghDeleteConfirm" style="padding:10px 12px;border:1px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:flex-end;gap:8px">
        <span>이 온실을 삭제하시겠습니까?</span>
        <button type="button" class="btn" id="ghDeleteCancel">취소</button>
        <button type="button" class="btn main" id="ghDeleteOk">삭제 확인</button>
      </div>
      <div class="module-actions">
        <div class="module-actions-left"><button class="btn" id="ghToList">목록</button></div>
        <button class="btn" id="ghDelete">삭제</button>
        <button class="btn main" id="ghToEdit">수정</button>
      </div>
    </div>`;

    bindModuleBack();
    $('#ghToList').onclick = () => go('gh-list');
    $('#ghToEdit').onclick = () => go('gh-edit', house.greenhouseId);
    $('#ghDelete').onclick = () => {
      if (linkedCycles.length) {
        toast('연결된 작기가 있는 온실은 삭제할 수 없습니다.');
        return;
      }
      $('#ghDeleteConfirm').classList.remove('hidden');
    };
    $('#ghDeleteCancel').onclick = () => $('#ghDeleteConfirm').classList.add('hidden');
    $('#ghDeleteOk').onclick = () => {
      config.greenhouses = config.greenhouses.filter(
        item => item.greenhouseId !== house.greenhouseId
      );
      storeGreenhouseExtras();
      toast('온실을 삭제했습니다.');
      go('gh-list');
    };
  }

  function renderGreenhouseEditor(isEdit) {
    const main = $('#main');
    const existing = isEdit
      ? config.greenhouses.find(item => item.greenhouseId === state.selectedGhId) ||
        config.greenhouses[0]
      : null;
    if (isEdit && !existing) {
      go('gh-list');
      return;
    }

    const row = existing || {
      greenhouseId: '',
      name: '',
      type: '단동',
      coverType: '비닐',
      buildingCount: 1,
      sideHeight: '',
      width: '',
      length: '',
      registeredArea: '',
      mediumType: '수태',
      imageUrl: ''
    };

    main.innerHTML =
      moduleHeading(isEdit ? '온실 정보 수정' : '온실 정보 등록', '') +
      `<form class="module-form panel" id="ghForm" novalidate>
      <div class="panel-head">
        <h2>온실 정보</h2>
        <span class="counter">* 필수 입력</span>
      </div>
      <div class="module-form-scroll">
        <div class="module-input-grid">
          <div class="field wide">
            <label for="ghName">온실명 *</label>
            <input class="ctrl" id="ghName" maxlength="100" value="${htmlText(row.name)}" placeholder="예: E온실" required>
          </div>
          <div class="field">
            <label for="ghType">유형</label>
            <select class="ctrl" id="ghType">${options(
              [
                { value: '', label: '미선택' },
                { value: '단동', label: '단동' },
                { value: '연동', label: '연동' }
              ],
              row.type || ''
            )}</select>
          </div>
          <div class="field">
            <label for="ghCover">피복형태</label>
            <select class="ctrl" id="ghCover">${options(
              [
                { value: '', label: '미선택' },
                { value: '유리', label: '유리' },
                { value: '비닐', label: '비닐' }
              ],
              row.coverType || ''
            )}</select>
          </div>
          <div class="field">
            <label for="ghCount">동 수</label>
            <input class="ctrl" id="ghCount" type="number" min="1" value="${row.buildingCount ?? ''}">
          </div>
          <div class="field">
            <label for="ghMedium">배지형태</label>
            <select class="ctrl" id="ghMedium">${options(
              [
                { value: '', label: '미선택' },
                { value: '수태', label: '수태' },
                { value: '코코피트', label: '코코피트' }
              ],
              row.mediumType || ''
            )}</select>
          </div>
          <div class="field">
            <label for="ghSide">측고 (m)</label>
            <input class="ctrl" id="ghSide" type="number" step="0.01" min="0" value="${row.sideHeight ?? ''}">
          </div>
          <div class="field">
            <label for="ghWidth">폭 (m)</label>
            <input class="ctrl" id="ghWidth" type="number" step="0.01" min="0" value="${row.width ?? ''}">
          </div>
          <div class="field">
            <label for="ghLength">길이 (m)</label>
            <input class="ctrl" id="ghLength" type="number" step="0.01" min="0" value="${row.length ?? ''}">
          </div>
          <div class="field">
            <label for="ghArea">등록 면적 (㎡)</label>
            <input class="ctrl" id="ghArea" type="number" step="0.01" min="0" value="${row.registeredArea ?? ''}">
          </div>
          <div class="field wide">
            <label for="ghImageUrl">온실 사진 URL</label>
            <input class="ctrl" id="ghImageUrl" type="text" maxlength="500" value="${htmlText(row.imageUrl || '')}" placeholder="이미지 URL을 입력하세요 (예: https://... 또는 img/gh-a.jpg)">
            <div id="ghPhotoPreview" class="${row.imageUrl ? 'gh-photo-box' : 'gh-photo-box hidden'}" style="margin-top:10px">
              ${row.imageUrl ? `<img class="gh-detail-photo" src="${escapeHtml(row.imageUrl)}" alt="온실 사진 미리보기">` : ''}
            </div>
          </div>
        </div>
        <div class="errorbox hidden" id="ghErr" role="alert"></div>
      </div>
      <div class="module-actions">
        <button type="button" class="btn" id="ghCancel">취소</button>
        <button type="submit" class="btn main">${isEdit ? '수정 저장' : '등록'}</button>
      </div>
    </form>`;

    bindModuleBack();
    $('#ghCancel').onclick = () => go(isEdit ? 'gh-detail' : 'gh-list', existing?.greenhouseId);

    const updatePhotoPreview = src => {
      const box = $('#ghPhotoPreview');
      if (!box) return;
      if (src) {
        box.classList.remove('hidden');
        box.innerHTML = `<img class="gh-detail-photo" src="${escapeHtml(src)}" alt="온실 사진 미리보기">`;
      } else {
        box.classList.add('hidden');
        box.innerHTML = '';
      }
    };

    $('#ghImageUrl').oninput = event => updatePhotoPreview(event.target.value.trim());

    $('#ghForm').onsubmit = event => {
      event.preventDefault();
      const errorBox = $('#ghErr');
      const showValidationError = message => {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
      };

      const name = $('#ghName').value.trim();
      if (!name) {
        showValidationError('온실명을 입력하세요.');
        return;
      }

      const readNullableNumber = selector => {
        const raw = $(selector).value.trim();
        return raw === '' ? null : Number(raw);
      };

      const buildingCount = readNullableNumber('#ghCount');
      const sideHeight = readNullableNumber('#ghSide');
      const width = readNullableNumber('#ghWidth');
      const length = readNullableNumber('#ghLength');
      const registeredArea = readNullableNumber('#ghArea');

      if (buildingCount !== null && (!Number.isInteger(buildingCount) || buildingCount < 1)) {
        showValidationError('동 수는 1 이상의 정수를 입력하세요.');
        return;
      }
      if (
        [sideHeight, width, length, registeredArea].some(
          value => value !== null && (!Number.isFinite(value) || value <= 0)
        )
      ) {
        showValidationError('측고, 폭, 길이, 등록 면적은 0보다 큰 값을 입력하세요.');
        return;
      }

      const payload = {
        greenhouseId: existing ? existing.greenhouseId : `GH-NEW-${Date.now()}`,
        memberId: config.header.currentUser.id,
        name,
        type: $('#ghType').value || null,
        coverType: $('#ghCover').value || null,
        buildingCount,
        sideHeight,
        width,
        length,
        registeredArea,
        mediumType: $('#ghMedium').value || null,
        imageUrl: $('#ghImageUrl').value.trim() || null
      };

      if (existing) Object.assign(existing, payload);
      else config.greenhouses.unshift(payload);

      storeGreenhouseExtras();
      toast(isEdit ? '온실 정보를 수정했습니다.' : '온실을 등록했습니다.');
      go('gh-detail', payload.greenhouseId);
    };
  }

  pages.greenhouse = { renderGreenhouseList, renderGreenhouseDetail, renderGreenhouseEditor };
})();

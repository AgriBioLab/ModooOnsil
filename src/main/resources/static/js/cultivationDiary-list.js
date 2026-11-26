// 재배일지 목록 화면 (/cultivation-diaries).
(() => {
  'use strict';

  const {
    escapeHtml,
    request,
    initDiaryShell
  } = window.ModooDiaryCommon;
  const datePicker = window.ModooDatePicker || {};
  let listRequestSeq = 0;

  function buildFilterQuery(form) {
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (value) query.set(name, value);
    }
    const dateInput = document.getElementById('workDateFilter');
    if (dateInput?.value) {
      query.set('workedDate', dateInput.value);
    }
    return query;
  }

  function renderListRows(rows) {
    const totalEl = document.getElementById('diaryTotal');
    const tbody = document.getElementById('diaryRows');
    if (!totalEl || !tbody) return;

    totalEl.textContent = String(rows.length);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td class="empty" colspan="8">조회 결과가 없습니다.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map((diary, index) => {
        const detailHref = `/cultivation-diaries/${encodeURIComponent(diary.diaryId)}`;
        return `
          <tr>
            <td class="row-index">${rows.length - index}</td>
            <td><a class="linkbtn" href="${escapeHtml(detailHref)}">${escapeHtml(diary.workedAt?.slice(0, 10))}</a></td>
            <td>${escapeHtml(diary.greenhouseName)}</td>
            <td>${escapeHtml(diary.cropName)}</td>
            <td>${escapeHtml(diary.varietyName)}</td>
            <td>${escapeHtml(diary.planName)}</td>
            <td>${escapeHtml(diary.growthStage || '-')}</td>
            <td class="tnum">${escapeHtml(diary.taskCount)} / ${escapeHtml(diary.incompleteTaskCount)}</td>
          </tr>
        `;
      })
      .join('');
  }

  async function loadList(query) {
    const sequence = ++listRequestSeq;
    try {
      const rows = await request('?' + query);
      if (sequence === listRequestSeq) {
        renderListRows(rows);
      }
    } catch (failure) {
      if (sequence !== listRequestSeq) return;
      const totalEl = document.getElementById('diaryTotal');
      const tbody = document.getElementById('diaryRows');
      if (totalEl) totalEl.textContent = '0';
      if (tbody) {
        tbody.innerHTML = `<tr><td class="empty" colspan="8" role="alert">${escapeHtml(failure.message)}</td></tr>`;
      }
    }
  }

  function setFilterOptions(select, names, selected) {
    if (!select) return;
    const firstLabel = select.options[0]?.textContent || '전체';
    const sorted = [...new Set(names.filter(name => name?.trim()))]
      .sort((a, b) => a.localeCompare(b, 'ko'));

    renderSelectOptions(
      select,
      [{ value: '', label: firstLabel }, ...sorted.map(name => ({ value: name, label: name }))],
      selected || ''
    );
  }

  function initListPage() {
    const form = document.getElementById('diaryFilters');
    const cropSelect = document.getElementById('filterCrop');
    const varietySelect = document.getElementById('filterVariety');
    const dateBox = document.getElementById('diaryDateControl');
    const resetBtn = document.getElementById('filterReset');
    if (!form) return;

    const initial = new URLSearchParams(location.search);
    let crops = [];

    function updateVarieties(selected) {
      const choices = crops.filter(item => !cropSelect.value || item.cropName === cropSelect.value);
      setFilterOptions(varietySelect, choices.map(item => item.varietyName), selected);
    }

    const controls = [...form.querySelectorAll('select, button')];
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');

    Promise.allSettled([
      requestJson('/api/cultivation-plans').then(plans => {
        setFilterOptions(
          document.getElementById('filterCycle'),
          plans.map(plan => plan.planName),
          initial.get('planName')
        );
      }),
      requestJson('/api/greenhouses').then(greenhouses => {
        setFilterOptions(
          document.getElementById('filterGreenhouse'),
          greenhouses.map(item => item.greenhouseName),
          initial.get('greenhouseName')
        );
      }),
      requestJson('/api/crops').then(items => {
        crops = items;
        setFilterOptions(cropSelect, crops.map(item => item.cropName), initial.get('cropName'));
        updateVarieties(initial.get('varietyName'));
      })
    ]).then(results => {
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute('aria-busy');
      if (results.some(result => result.status === 'rejected')) {
        notify('일부 검색 선택지를 불러오지 못했습니다. 새로고침해서 다시 시도하세요.');
      }
    });

    if (cropSelect) {
      cropSelect.addEventListener('change', () => updateVarieties(varietySelect.value));
    }

    if (dateBox && datePicker.singleDateControl) {
      dateBox.innerHTML = datePicker.singleDateControl('workDateFilter', initial.get('workedDate') || '');
      datePicker.mountSingleDatePicker('workDateFilter');
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      loadList(buildFilterQuery(form));
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.querySelectorAll('select').forEach(select => { select.value = ''; });
        updateVarieties('');
        if (datePicker.setSingleDateValue) {
          datePicker.setSingleDateValue('workDateFilter', '');
        }
        loadList(buildFilterQuery(form));
      });
    }

    const initialQuery = new URLSearchParams();
    for (const key of ['planName', 'greenhouseName', 'cropName', 'varietyName', 'workedDate']) {
      const value = initial.get(key);
      if (value) initialQuery.set(key, value);
    }
    loadList(initialQuery);
  }


  document.addEventListener('DOMContentLoaded', async () => {
    if (await initDiaryShell('list')) {
      initListPage();
    }
  });
})();

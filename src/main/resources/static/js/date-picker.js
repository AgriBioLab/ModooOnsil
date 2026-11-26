// 날짜 범위/단일 날짜 선택 달력 UI 컴포넌트.
(() => {
  'use strict';

  const { escapeHtml } = window.ModooCommon;
  const $ = (selector, base = document) => base.querySelector(selector);

  // === 1. 상수 · 날짜 유틸 · 팝오버 공통 닫기 ===
  const CALENDAR_SVG =
    '<svg class="drp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
    '<path d="M16 2v4M8 2v4M3 10h18"/>' +
    '</svg>';

  const WEEKDAYS_HTML = ['일', '월', '화', '수', '목', '금', '토']
    .map(day => `<span>${day}</span>`)
    .join('');

  const pad2 = value => String(value).padStart(2, '0');
  const formatYearMonth = (year, month) => `${year}-${pad2(month + 1)}`;

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }

  function shiftYearMonth([year, month], delta) {
    const shifted = new Date(year, month + delta, 1);
    return [shifted.getFullYear(), shifted.getMonth()];
  }

  function closeAllDatePopovers() {
    document.querySelectorAll('.drp-popover').forEach(popover => popover.classList.add('hidden'));
    document
      .querySelectorAll('.drp-trigger')
      .forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  }

  function bindDatePopoverDismiss() {
    if (window.__drpDocClick) document.removeEventListener('click', window.__drpDocClick);
    window.__drpDocClick = event => {
      if (!event.target.closest('.drp-wrap')) closeAllDatePopovers();
    };
    document.addEventListener('click', window.__drpDocClick);

    if (window.__drpDocKey) document.removeEventListener('keydown', window.__drpDocKey);
    window.__drpDocKey = event => {
      if (event.key !== 'Escape') return;
      const openPopover = document.querySelector('.drp-popover:not(.hidden)');
      if (!openPopover) return;
      const activeTrigger = openPopover.closest('.drp-wrap')?.querySelector('.drp-trigger');
      closeAllDatePopovers();
      if (activeTrigger) activeTrigger.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', window.__drpDocKey);
  }

  // === 2. 기간 선택기 (Date Range Picker) ===
  function dateRangeControl(idPrefix, fromValue, toValue) {
    const hasValue = Boolean(fromValue || toValue);
    const label = hasValue
      ? `${fromValue || '시작일'} ~ ${toValue || '종료일'}`
      : '연도-월-일 ~ 연도-월-일';

    return `
      <div class="drp-wrap" id="${idPrefix}Wrap">
        <input type="hidden" id="${idPrefix}From" value="${escapeHtml(fromValue)}">
        <input type="hidden" id="${idPrefix}To" value="${escapeHtml(toValue)}">
        <button
          type="button"
          class="ctrl drp-trigger${hasValue ? '' : ' is-placeholder'}"
          id="${idPrefix}Trigger"
          aria-expanded="false">
          <span>${escapeHtml(label)}</span>${CALENDAR_SVG}
        </button>
        <div class="drp-popover hidden" id="${idPrefix}Pop" role="dialog" aria-label="기간 선택 달력"></div>
      </div>
    `;
  }

  function mountDateRangePicker(idPrefix) {
    const wrap = $(`#${idPrefix}Wrap`);
    const trigger = $(`#${idPrefix}Trigger`);
    const popover = $(`#${idPrefix}Pop`);
    const fromInput = $(`#${idPrefix}From`);
    const toInput = $(`#${idPrefix}To`);
    if (!wrap || !trigger || !popover || !fromInput || !toInput) return;

    let draftFrom = fromInput.value;
    let draftTo = toInput.value;
    const baseStart = draftFrom
      ? new Date(`${draftFrom}T00:00:00`)
      : new Date(`${today()}T00:00:00`);
    let startYM = [baseStart.getFullYear(), baseStart.getMonth()];
    let endYM = draftTo
      ? [new Date(`${draftTo}T00:00:00`).getFullYear(), new Date(`${draftTo}T00:00:00`).getMonth()]
      : shiftYearMonth(startYM, 1);

    const closePopover = () => {
      popover.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const buildCalendarPane = (title, [year, month], side) => {
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      let cells = '';

      for (let i = firstWeekday - 1; i >= 0; i -= 1) {
        cells += `<span class="drp-day is-out">${prevMonthDays - i}</span>`;
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const iso = `${formatYearMonth(year, month)}-${pad2(day)}`;
        const isEdge = iso === draftFrom || iso === draftTo;
        const isInRange = draftFrom && draftTo && iso > draftFrom && iso < draftTo;
        const stateClass = `${isEdge ? ' is-selected' : ''}${isInRange ? ' is-in-range' : ''}`;
        cells +=
          `<button type="button" class="drp-day${stateClass}"` +
          ` data-drp-pick="${side}" data-drp-date="${iso}">${day}</button>`;
      }
      const remainder = (firstWeekday + daysInMonth) % 7;
      if (remainder) {
        for (let day = 1; day <= 7 - remainder; day += 1) {
          cells += `<span class="drp-day is-out">${day}</span>`;
        }
      }

      return `
        <div class="drp-pane">
          <div class="drp-pane-title">${title}</div>
          <div class="drp-nav">
            <button type="button" class="drp-nav-btn" data-drp-nav="${side}:-1" aria-label="이전 달">‹</button>
            <strong>${year}년 ${month + 1}월</strong>
            <button type="button" class="drp-nav-btn" data-drp-nav="${side}:1" aria-label="다음 달">›</button>
          </div>
          <div class="drp-weekdays">${WEEKDAYS_HTML}</div>
          <div class="drp-days">${cells}</div>
          <div class="drp-pane-foot"><button type="button" class="btn xs" data-drp-today="${side}">오늘</button></div>
        </div>
      `;
    };

    const drawPopover = () => {
      popover.innerHTML = `
        <div class="drp-grid">
          ${buildCalendarPane('시작일', startYM, 'from')}
          ${buildCalendarPane('종료일', endYM, 'to')}
        </div>
        <div class="drp-foot">
          <button type="button" class="btn xs" data-drp-action="clear">초기화</button>
          <div class="drp-foot-right">
            <button type="button" class="btn xs" data-drp-action="close">닫기</button>
            <button type="button" class="btn main xs" data-drp-action="apply">선택완료</button>
          </div>
        </div>
      `;

      popover.querySelectorAll('[data-drp-nav]').forEach(button => {
        button.onclick = () => {
          const [side, delta] = button.dataset.drpNav.split(':');
          if (side === 'from') startYM = shiftYearMonth(startYM, Number(delta));
          else endYM = shiftYearMonth(endYM, Number(delta));
          drawPopover();
        };
      });

      popover.querySelectorAll('[data-drp-pick]').forEach(button => {
        button.onclick = () => {
          const side = button.dataset.drpPick;
          const date = button.dataset.drpDate;
          if (side === 'from') {
            draftFrom = date;
            if (draftTo && draftFrom > draftTo) draftTo = draftFrom;
          } else {
            draftTo = date;
            if (draftFrom && draftTo < draftFrom) draftFrom = draftTo;
          }
          drawPopover();
        };
      });

      popover.querySelectorAll('[data-drp-today]').forEach(button => {
        button.onclick = () => {
          const side = button.dataset.drpToday;
          const todayIso = today();
          const todayYM = [Number(todayIso.slice(0, 4)), Number(todayIso.slice(5, 7)) - 1];
          if (side === 'from') {
            draftFrom = todayIso;
            startYM = todayYM;
            if (draftTo && draftFrom > draftTo) draftTo = draftFrom;
          } else {
            draftTo = todayIso;
            endYM = todayYM;
            if (draftFrom && draftTo < draftFrom) draftFrom = draftTo;
          }
          drawPopover();
        };
      });

      popover.querySelector('[data-drp-action="clear"]').onclick = () => {
        draftFrom = '';
        draftTo = '';
        fromInput.value = '';
        toInput.value = '';
        trigger.classList.add('is-placeholder');
        trigger.querySelector('span').textContent = '연도-월-일 ~ 연도-월-일';
        closePopover();
      };

      popover.querySelector('[data-drp-action="close"]').onclick = closePopover;

      popover.querySelector('[data-drp-action="apply"]').onclick = () => {
        fromInput.value = draftFrom;
        toInput.value = draftTo;
        const hasValue = Boolean(draftFrom || draftTo);
        trigger.classList.toggle('is-placeholder', !hasValue);
        trigger.querySelector('span').textContent = hasValue
          ? `${draftFrom || '시작일'} ~ ${draftTo || '종료일'}`
          : '연도-월-일 ~ 연도-월-일';
        closePopover();
      };
    };

    popover.onclick = event => event.stopPropagation();
    trigger.onclick = event => {
      event.stopPropagation();
      const willOpen = popover.classList.contains('hidden');
      closeAllDatePopovers();
      if (!willOpen) return;
      draftFrom = fromInput.value;
      draftTo = toInput.value;
      drawPopover();
      popover.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    };

    bindDatePopoverDismiss();
  }

  // === 3. 단일 날짜 선택기 (Single Date Picker) ===
  function singleDateControl(id, value = '', opts = {}) {
    const currentValue = value || '';
    const hasValue = Boolean(currentValue);
    const placeholder = opts.placeholder || '연도-월-일';

    return `
      <div class="drp-wrap drp-single-wrap" id="${id}Wrap">
        <input
          type="hidden"
          id="${id}"
          value="${escapeHtml(currentValue)}"
          data-min="${escapeHtml(opts.min || '')}"
          data-max="${escapeHtml(opts.max || '')}"
          data-placeholder="${escapeHtml(placeholder)}"${opts.clearable === false ? ' data-clearable="0"' : ''}>
        <button
          type="button"
          class="ctrl drp-trigger${hasValue ? '' : ' is-placeholder'}"
          id="${id}Trigger"
          aria-expanded="false"${opts.disabled ? ' disabled' : ''}>
          <span>${escapeHtml(hasValue ? currentValue : placeholder)}</span>${CALENDAR_SVG}
        </button>
        <div class="drp-popover drp-single hidden" id="${id}Pop" role="dialog" aria-label="날짜 선택 달력"></div>
      </div>
    `;
  }

  function setSingleDateValue(id, value, opts = {}) {
    const input = $(`#${id}`);
    const trigger = $(`#${id}Trigger`);
    if (!input) return;
    const nextValue = value || '';
    input.value = nextValue;
    if (opts.min !== undefined) input.dataset.min = opts.min || '';
    if (opts.max !== undefined) input.dataset.max = opts.max || '';
    if (!trigger) return;
    const placeholder = input.dataset.placeholder || '연도-월-일';
    trigger.classList.toggle('is-placeholder', !nextValue);
    const labelSpan = trigger.querySelector('span');
    if (labelSpan) labelSpan.textContent = nextValue || placeholder;
  }

  function mountSingleDatePicker(id) {
    const wrap = $(`#${id}Wrap`);
    const trigger = $(`#${id}Trigger`);
    const popover = $(`#${id}Pop`);
    const input = $(`#${id}`);
    if (!wrap || !trigger || !popover || !input || trigger.disabled) return;

    let viewYM = null;

    const initViewMonth = () => {
      const baseDate = input.value
        ? new Date(`${input.value}T00:00:00`)
        : new Date(`${today()}T00:00:00`);
      viewYM = [baseDate.getFullYear(), baseDate.getMonth()];
    };

    const closePopover = () => {
      popover.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const pickDate = iso => {
      setSingleDateValue(id, iso);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      closePopover();
    };

    const drawPopover = () => {
      const [year, month] = viewYM;
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      const minDate = input.dataset.min || '';
      const maxDate = input.dataset.max || '';
      const selectedDate = input.value || '';
      const clearable = input.dataset.clearable !== '0';
      let cells = '';

      for (let i = firstWeekday - 1; i >= 0; i -= 1) {
        cells += `<span class="drp-day is-out">${prevMonthDays - i}</span>`;
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const iso = `${formatYearMonth(year, month)}-${pad2(day)}`;
        const disabled = (minDate && iso < minDate) || (maxDate && iso > maxDate);
        const selectedClass = iso === selectedDate ? ' is-selected' : '';
        cells +=
          `<button type="button" class="drp-day${selectedClass}"` +
          ` data-sdp-date="${iso}"${disabled ? ' disabled' : ''}>${day}</button>`;
      }
      const remainder = (firstWeekday + daysInMonth) % 7;
      if (remainder) {
        for (let day = 1; day <= 7 - remainder; day += 1) {
          cells += `<span class="drp-day is-out">${day}</span>`;
        }
      }

      const todayIso = today();
      const todayDisabled = (minDate && todayIso < minDate) || (maxDate && todayIso > maxDate);

      popover.innerHTML = `
        <div class="drp-pane">
          <div class="drp-nav">
            <button type="button" class="drp-nav-btn" data-sdp-nav="-1" aria-label="이전 달">‹</button>
            <strong>${year}년 ${month + 1}월</strong>
            <button type="button" class="drp-nav-btn" data-sdp-nav="1" aria-label="다음 달">›</button>
          </div>
          <div class="drp-weekdays">${WEEKDAYS_HTML}</div>
          <div class="drp-days">${cells}</div>
        </div>
        <div class="drp-foot">
          ${clearable ? '<button type="button" class="btn xs" data-sdp-action="clear">초기화</button>' : '<span></span>'}
          <div class="drp-foot-right">
            <button type="button" class="btn xs" data-sdp-action="today"${todayDisabled ? ' disabled' : ''}>오늘</button>
            <button type="button" class="btn xs" data-sdp-action="close">닫기</button>
          </div>
        </div>
      `;

      popover.querySelectorAll('[data-sdp-nav]').forEach(button => {
        button.onclick = () => {
          viewYM = shiftYearMonth(viewYM, Number(button.dataset.sdpNav));
          drawPopover();
        };
      });
      popover.querySelectorAll('[data-sdp-date]').forEach(button => {
        button.onclick = () => pickDate(button.dataset.sdpDate);
      });
      const clearButton = popover.querySelector('[data-sdp-action="clear"]');
      if (clearButton) clearButton.onclick = () => pickDate('');
      popover.querySelector('[data-sdp-action="today"]').onclick = () => pickDate(today());
      popover.querySelector('[data-sdp-action="close"]').onclick = closePopover;
    };

    popover.onclick = event => event.stopPropagation();
    trigger.onclick = event => {
      event.stopPropagation();
      const willOpen = popover.classList.contains('hidden');
      closeAllDatePopovers();
      if (!willOpen) return;
      initViewMonth();
      drawPopover();
      popover.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    };

    bindDatePopoverDismiss();
  }

  window.ModooDatePicker = {
    today,
    dateRangeControl,
    mountDateRangePicker,
    singleDateControl,
    setSingleDateValue,
    mountSingleDatePicker
  };
})();

// 재배일지 상세 화면 (/cultivation-diaries/{id}).
(() => {
  'use strict';

  const {
    notify,
    escapeHtml,
    timeOf,
    timeSort,
    toReason,
    request,
    setSummaryFacts,
    initDiaryShell
  } = window.ModooDiaryCommon;

  async function fetchDetail(id) {
    const { diary, tasks } = await request('/' + encodeURIComponent(id));
    return {
      ...diary,
      workDate: diary.workedAt.slice(0, 10),
      stageId: diary.growthStage || '',
      tasks: tasks.map(task => ({
        taskId: String(task.taskId),
        name: task.taskName,
        type: task.taskType,
        startedAt: task.taskTime,
        status: task.taskStatus,
        content: task.taskContent || ''
      }))
    };
  }

  function showDetailError(message) {
    const errorEl = document.getElementById('detailErrorMsg');
    const returnLink = document.getElementById('returnList');
    const shell = document.getElementById('detailShell');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    if (returnLink) returnLink.classList.remove('hidden');
    if (shell) shell.classList.add('hidden');
  }

  async function initDetailPage(diaryId) {
    if (!diaryId) {
      showDetailError('잘못된 재배일지 요청입니다.');
      return;
    }

    let diary;
    try {
      diary = await fetchDetail(diaryId);
    } catch (failure) {
      showDetailError(failure.message);
      return;
    }

    setSummaryFacts(diary, diary.workDate, diary.stageId);

    const reason = toReason(diary.stageChangeReason);
    if (reason) {
      const reasonBar = document.getElementById('detailReasonBar');
      const reasonText = document.getElementById('detailReasonText');
      if (reasonText) reasonText.textContent = reason;
      if (reasonBar) reasonBar.classList.remove('hidden');
    }

    const doneCount = diary.tasks.filter(task => task.status === '완료').length;
    const dateMeta = [
      diary.createdAt ? `등록일 ${diary.createdAt.slice(0, 10)}` : '',
      diary.updatedAt ? `수정일 ${diary.updatedAt.slice(0, 10)}` : ''
    ].filter(Boolean).join(' · ');

    const counterEl = document.getElementById('detailTaskCounter');
    if (counterEl) {
      counterEl.textContent =
        `${diary.tasks.length}건 · 완료 ${doneCount} / 미완료 ${diary.tasks.length - doneCount}${dateMeta ? ` · ${dateMeta}` : ''}`;
    }

    const taskListEl = document.getElementById('detailTaskList');
    if (taskListEl) {
      taskListEl.innerHTML = diary.tasks.length
        ? [...diary.tasks]
            .sort(timeSort)
            .map(
              task => `
                <article class="detail-task">
                  <div class="t-row">
                    <strong>${escapeHtml(task.name)}</strong>
                    <span>${escapeHtml(timeOf(task))}</span>
                    <span>${escapeHtml(task.type)}</span>
                    <span>${escapeHtml(task.status)}</span>
                  </div>
                  <div class="details-content">${escapeHtml(task.content || '—')}</div>
                </article>
              `
            )
            .join('')
        : '<p class="empty">등록된 작업내용이 없습니다.</p>';
    }

    const deleteBox = document.getElementById('detailDeleteConfirm');
    const deleteBtn = document.getElementById('detailDelete');
    const cancelBtn = document.getElementById('detailDeleteCancel');
    const confirmBtn = document.getElementById('detailDeleteOk');

    if (deleteBtn && deleteBox) {
      deleteBtn.addEventListener('click', () => deleteBox.classList.remove('hidden'));
    }
    if (cancelBtn && deleteBox) {
      cancelBtn.addEventListener('click', () => deleteBox.classList.add('hidden'));
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        try {
          await request('/' + diary.diaryId, 'DELETE');
          notify('재배일지작업을 삭제했습니다.');
          location.href = '/cultivation-diaries';
        } catch (failure) {
          notify(failure.message);
        } finally {
          confirmBtn.disabled = false;
        }
      });
    }
  }


  document.addEventListener('DOMContentLoaded', async () => {
    if (await initDiaryShell('list')) {
      await initDetailPage(document.body.dataset.diaryId || '');
    }
  });
})();

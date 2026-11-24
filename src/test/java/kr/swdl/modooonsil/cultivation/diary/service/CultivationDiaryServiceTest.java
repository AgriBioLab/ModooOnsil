package kr.swdl.modooonsil.cultivation.diary.service;

import kr.swdl.modooonsil.cultivation.diary.domain.CultivationDiary;
import kr.swdl.modooonsil.cultivation.diary.domain.DiaryPlan;
import kr.swdl.modooonsil.cultivation.diary.domain.FindCultivationDiaryDetailVO;
import kr.swdl.modooonsil.cultivation.diary.dto.CreateRequest;
import kr.swdl.modooonsil.cultivation.diary.dto.TaskInput;
import kr.swdl.modooonsil.cultivation.diary.repository.CultivationDiaryRepository;
import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import kr.swdl.modooonsil.cultivation.diary.task.repository.CultivationDiaryTaskRepository;
import kr.swdl.modooonsil.cultivation.diary.task.service.CultivationDiaryTaskService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CultivationDiaryServiceTest {
    private static final long MEMBER = 1L;
    private static final long PLAN = 2L;
    private static final long DIARY = 3L;
    private static final LocalDate DATE = LocalDate.of(2026, 1, 2);

    private final CultivationDiaryRepository diaries = mock(CultivationDiaryRepository.class);
    private final CultivationDiaryTaskRepository tasks = mock(CultivationDiaryTaskRepository.class);
    private final CultivationDiaryService service = new CultivationDiaryService(diaries, new CultivationDiaryTaskService(tasks));

    @Test
    void 단계_변경_사유와_작업을_함께_등록한다() {
        activePlan();
        doAnswer(call -> {
            call.<CultivationDiary>getArgument(1).setDiaryId(DIARY);
            return null;
        }).when(diaries).addDiary(eq(MEMBER), any());

        assertThat(service.create(MEMBER, new CreateRequest(PLAN, DATE, "꽃눈유도기", " 꽃눈 관찰 ",
                List.of(task(null))))).isEqualTo(DIARY);

        var diary = ArgumentCaptor.forClass(CultivationDiary.class);
        verify(diaries).addDiary(eq(MEMBER), diary.capture());
        assertThat(diary.getValue().getWorkedAt()).isEqualTo(DATE.atStartOfDay());
        assertThat(diary.getValue().getStageChangeReason()).isEqualTo("꽃눈 관찰");
        verify(tasks).addTasks(eq(DIARY), argThat(rows -> rows.size() == 1 && rows.getFirst().getTaskName().equals("관수 작업")));
    }

    @Test
    void 같은_작기의_같은_날짜에_일지를_두_번_등록할_수_없다() {
        activePlan();
        when(diaries.existsOnDate(PLAN, DATE)).thenReturn(true);

        assertThatThrownBy(() -> service.create(MEMBER, new CreateRequest(PLAN, DATE, "영양생장기", null, List.of())))
                .isInstanceOfSatisfying(ResponseStatusException.class, error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
        verify(diaries, never()).addDiary(any(), any());
        verifyNoInteractions(tasks);
    }

    @Test
    void 이후_일지가_있으면_과거_일지에서_단계를_앞당길_수_없다() {
        activePlan();
        when(diaries.existsAfterDate(PLAN, DATE)).thenReturn(true);

        assertThat(service.stageOptions(MEMBER, PLAN, DATE).getNextStage()).isNull();
        assertThatThrownBy(() -> service.create(MEMBER, new CreateRequest(PLAN, DATE, "꽃눈유도기", "꽃눈", List.of())))
                .isInstanceOf(ResponseStatusException.class);
        verify(diaries, never()).addDiary(any(), any());
    }

    @Test
    void 수정에서_신규_기존_삭제_작업을_반영한다() {
        editableDiary();
        when(tasks.findAllByDiaryId(MEMBER, DIARY)).thenReturn(List.of(
                CultivationDiaryTask.builder().taskId(4L).build(),
                CultivationDiaryTask.builder().taskId(5L).build()));

        service.updateTasks(MEMBER, DIARY, List.of(task(4L), task(null)));

        verify(tasks).deleteTasks(MEMBER, DIARY, List.of(5L));
        verify(tasks).updateTasks(eq(MEMBER), eq(DIARY), argThat(rows -> rows.getFirst().getTaskId().equals(4L)));
        verify(tasks).addTasks(eq(DIARY), argThat(rows -> rows.getFirst().getTaskId() == null));
        verify(diaries).touchDiary(DIARY);
    }

    @Test
    void 다른_일지의_작업_식별자를_수정에_사용할_수_없다() {
        editableDiary();

        assertThatThrownBy(() -> service.updateTasks(MEMBER, DIARY, List.of(task(99L))))
                .isInstanceOf(ResponseStatusException.class);
        verify(tasks).findAllByDiaryId(MEMBER, DIARY);
        verifyNoMoreInteractions(tasks);
        verify(diaries, never()).touchDiary(any());
    }

    @Test
    void 소유하지_않은_일지는_조회하거나_삭제할_수_없다() {
        assertThatThrownBy(() -> service.findDetail(MEMBER, DIARY)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.delete(MEMBER, DIARY)).isInstanceOf(ResponseStatusException.class);
        verify(diaries, never()).deleteDiaryById(any(), any());
        verifyNoInteractions(tasks);
    }

    private void activePlan() {
        when(diaries.lockActivePlan(MEMBER, PLAN)).thenReturn(PLAN);
        when(diaries.findActivePlans(MEMBER)).thenReturn(List.of(
                new DiaryPlan(PLAN, "딸기 작기", "1번 온실", "딸기", "설향", DATE.minusDays(1).atStartOfDay())));
    }

    private void editableDiary() {
        var diary = new FindCultivationDiaryDetailVO();
        diary.setWorkedAt(DATE.atStartOfDay());
        when(diaries.lockDiary(MEMBER, DIARY)).thenReturn(DIARY);
        when(diaries.findByMemberIdAndDiaryId(MEMBER, DIARY)).thenReturn(diary);
    }

    private TaskInput task(Long id) {
        return new TaskInput(id, "관수 작업", "관수", DATE.atTime(9, 30), "완료", "");
    }
}

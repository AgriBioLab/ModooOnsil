package kr.swdl.modooonsil.cultivation.diary.service;

import kr.swdl.modooonsil.cultivation.diary.domain.CultivationDiary;
import kr.swdl.modooonsil.cultivation.diary.domain.DiaryPlan;
import kr.swdl.modooonsil.cultivation.diary.dto.CreateRequest;
import kr.swdl.modooonsil.cultivation.diary.dto.DiaryDetailResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.StageOptionsResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.TaskInput;
import kr.swdl.modooonsil.cultivation.diary.repository.CultivationDiaryRepository;
import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.repository.CultivationPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

@SpringBootTest
@Transactional
class CultivationDiaryServiceTest {
    private static final long MEMBER_ID = 940001L;
    private static final long OTHER_MEMBER_ID = 940002L;
    private static final long GREENHOUSE_ID = 940001L;
    private static final long STANDARD_ID = 940001L;

    @Autowired
    private CultivationDiaryService service;

    @Autowired
    private CultivationPlanRepository plans;

    @Autowired
    private CultivationDiaryRepository diaries;

    private Long planId;
    private LocalDate workDate;

    @BeforeEach
    void 진행_중인_테스트_작기를_준비한다() {
        workDate = LocalDate.now();
        planId = createActivePlan("재배일지 서비스 테스트 작기");
    }

    @Test
    void 단계_변경_사유와_작업을_함께_등록한다() {
        Long diaryId = service.create(MEMBER_ID, new CreateRequest(planId, workDate,
                "꽃눈유도기", " 꽃눈 관찰 ", List.of(task(null, "관수 작업", 9))));

        DiaryDetailResponse saved = service.findDetail(MEMBER_ID, diaryId);
        assertThat(saved.getDiary().getWorkedAt()).isEqualTo(workDate.atStartOfDay());
        assertThat(saved.getDiary().getGrowthStage()).isEqualTo("꽃눈유도기");
        assertThat(saved.getDiary().getStageChangeReason()).isEqualTo("꽃눈 관찰");
        assertThat(saved.getTasks()).extracting(CultivationDiaryTask::getTaskName, CultivationDiaryTask::getTaskTime)
                .containsExactly(tuple("관수 작업", workDate.atTime(9, 30)));
    }

    @Test
    void 같은_작기의_같은_날짜에_일지를_두_번_등록할_수_없다() {
        CreateRequest request = new CreateRequest(planId, workDate, "영양생장기", null, List.of());
        Long diaryId = service.create(MEMBER_ID, request);

        assertThatThrownBy(() -> service.create(MEMBER_ID, request))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        assertThat(service.findAll(MEMBER_ID, "재배일지 서비스 테스트 작기", null, null, workDate, null))
                .hasSize(1);
        assertThat(service.findDetail(MEMBER_ID, diaryId).getTasks()).isEmpty();
    }

    @Test
    void 이후_일지가_있으면_과거_일지에서_단계를_앞당길_수_없다() {
        CultivationDiary laterDiary = CultivationDiary.builder()
                .planId(planId).workedAt(workDate.plusDays(1).atStartOfDay())
                .growthStage("영양생장기").build();
        diaries.addDiary(MEMBER_ID, laterDiary);

        StageOptionsResponse options = service.stageOptions(MEMBER_ID, planId, workDate);
        assertThat(options.isDuplicate()).isFalse();
        assertThat(options.getNextStage()).isNull();
        assertThatThrownBy(() -> service.create(MEMBER_ID, new CreateRequest(planId, workDate,
                "꽃눈유도기", "꽃눈 관찰", List.of())))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        assertThat(service.stageOptions(MEMBER_ID, planId, workDate).isDuplicate()).isFalse();
    }

    @Test
    void 수정에서_신규_기존_삭제_작업을_반영한다() {
        Long diaryId = createDiary(List.of(task(null, "기존 작업", 8), task(null, "삭제할 작업", 9)));
        Long existingId = service.findDetail(MEMBER_ID, diaryId).getTasks().getFirst().getTaskId();

        service.updateTasks(MEMBER_ID, diaryId,
                List.of(task(existingId, "수정한 작업", 10), task(null, "새 작업", 11)));

        DiaryDetailResponse saved = service.findDetail(MEMBER_ID, diaryId);
        assertThat(saved.getTasks()).extracting(CultivationDiaryTask::getTaskName)
                .containsExactly("수정한 작업", "새 작업");
        assertThat(saved.getTasks().getFirst().getTaskId()).isEqualTo(existingId);
        assertThat(saved.getDiary().getUpdatedAt()).isAfterOrEqualTo(saved.getDiary().getCreatedAt());
    }

    @Test
    void 다른_일지의_작업_식별자를_수정에_사용할_수_없다() {
        Long diaryId = createDiary(List.of(task(null, "기존 작업", 8)));
        Long otherPlanId = createActivePlan("다른 일지의 작기");
        Long otherDiaryId = service.create(MEMBER_ID, new CreateRequest(otherPlanId, workDate, "영양생장기", null,
                List.of(task(null, "다른 일지 작업", 9))));
        Long otherTaskId = service.findDetail(MEMBER_ID, otherDiaryId).getTasks().getFirst().getTaskId();

        assertThatThrownBy(() -> service.updateTasks(MEMBER_ID, diaryId, List.of(task(otherTaskId, "변경 시도", 9))))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        assertThat(service.findDetail(MEMBER_ID, diaryId).getTasks()).extracting(CultivationDiaryTask::getTaskName)
                .containsExactly("기존 작업");
        assertThat(service.findDetail(MEMBER_ID, otherDiaryId).getTasks()).extracting(CultivationDiaryTask::getTaskName)
                .containsExactly("다른 일지 작업");
    }

    @Test
    void 소유하지_않은_일지는_조회하거나_삭제할_수_없다() {
        Long diaryId = createDiary(List.of());

        assertThatThrownBy(() -> service.findDetail(OTHER_MEMBER_ID, diaryId))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        assertThatThrownBy(() -> service.delete(OTHER_MEMBER_ID, diaryId))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        assertThat(service.findDetail(MEMBER_ID, diaryId).getDiary().getDiaryId()).isEqualTo(diaryId);
    }

    @Test
    void 작업_검증에_실패하면_등록한_일지도_롤백된다() {
        // 테스트 트랜잭션을 끝내고 서비스가 자체 트랜잭션을 시작하도록 한다.
        TestTransaction.end();
        Long existingPlanId = 940001L;
        DiaryPlan existingPlan = service.findActivePlans(MEMBER_ID).stream()
                .filter(plan -> plan.getPlanId().equals(existingPlanId))
                .findFirst()
                .orElseThrow();
        LocalDate availableDate = existingPlan.getActualStartDate().toLocalDate().datesUntil(workDate.plusDays(1))
                .filter(date -> !diaries.existsOnDate(existingPlanId, date))
                .findFirst()
                .orElseThrow();
        String growthStage = service.stageOptions(MEMBER_ID, existingPlanId, availableDate).getCurrentStage();
        TaskInput invalidTask = new TaskInput(null, "관수 작업", "관수",
                availableDate.plusDays(1).atTime(9, 30), "완료", "");
        CreateRequest request = new CreateRequest(existingPlanId, availableDate, growthStage, null, List.of(invalidTask));

        assertThatThrownBy(() -> service.create(MEMBER_ID, request))
                .isInstanceOfSatisfying(ResponseStatusException.class, error -> {
                    assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(error.getReason()).isEqualTo("작업시간이 실제 작업일과 일치하지 않습니다.");
                });

        assertThat(diaries.existsOnDate(existingPlanId, availableDate)).isFalse();
    }

    @Test
    void 수정에서_빈_작업_목록을_보내면_기존_작업을_모두_삭제한다() {
        Long diaryId = createDiary(List.of(task(null, "관수 작업", 8), task(null, "두 번째 관수", 9)));

        service.updateTasks(MEMBER_ID, diaryId, List.of());

        assertThat(service.findDetail(MEMBER_ID, diaryId).getTasks()).isEmpty();
    }

    @Test
    void 수정에서_작업_목록이_null이면_거절하고_기존_작업을_유지한다() {
        Long diaryId = createDiary(List.of(task(null, "기존 작업", 8)));
        Long taskId = service.findDetail(MEMBER_ID, diaryId).getTasks().getFirst().getTaskId();

        assertThatThrownBy(() -> service.updateTasks(MEMBER_ID, diaryId, null))
                .isInstanceOfSatisfying(ResponseStatusException.class, error -> {
                    assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(error.getReason()).isEqualTo("작업 목록을 입력하세요.");
                });

        assertThat(service.findDetail(MEMBER_ID, diaryId).getTasks())
                .extracting(CultivationDiaryTask::getTaskId, CultivationDiaryTask::getTaskName)
                .containsExactly(tuple(taskId, "기존 작업"));
    }

    private Long createActivePlan(String planName) {
        CultivationPlan plan = CultivationPlan.builder()
                                              .memberId(MEMBER_ID).greenhouseId(GREENHOUSE_ID).standardId(STANDARD_ID)
                                              .planName(planName)
                                              .plannedStartDate(workDate.atStartOfDay())
                                              .plannedEndDate(workDate.plusMonths(1).atStartOfDay())
                                              .build();
        plans.addCultivationPlan(plan);
        plans.updateCultivationPlanStart(MEMBER_ID, plan.getPlanId());
        return plan.getPlanId();
    }

    private Long createDiary(List<TaskInput> tasks) {
        return service.create(MEMBER_ID, new CreateRequest(planId, workDate, "영양생장기", null, tasks));
    }

    private TaskInput task(Long id, String name, int hour) {
        return new TaskInput(id, name, "관수", workDate.atTime(hour, 30), "완료", "");
    }
}

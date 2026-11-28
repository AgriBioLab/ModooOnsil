package kr.swdl.modooonsil.cultivation.diary.service;

import com.github.pagehelper.PageHelper;
import kr.swdl.modooonsil.common.dto.PageRequest;
import kr.swdl.modooonsil.common.dto.PageResponse;
import kr.swdl.modooonsil.cultivation.diary.domain.CultivationDiary;
import kr.swdl.modooonsil.cultivation.diary.domain.DiaryPlan;
import kr.swdl.modooonsil.cultivation.diary.domain.FindAllCultivationDiaryVO;
import kr.swdl.modooonsil.cultivation.diary.domain.FindCultivationDiaryDetailVO;
import kr.swdl.modooonsil.cultivation.diary.dto.CreateRequest;
import kr.swdl.modooonsil.cultivation.diary.dto.DiaryDetailResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.StageOptionsResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.TaskInput;
import kr.swdl.modooonsil.cultivation.diary.repository.CultivationDiaryRepository;
import kr.swdl.modooonsil.cultivation.diary.task.service.CultivationDiaryTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CultivationDiaryService {
    private static final List<String> STAGES = List.of("영양생장기", "꽃눈유도기", "생식생장기");
    private final CultivationDiaryRepository repository;
    private final CultivationDiaryTaskService taskService;

    public List<FindAllCultivationDiaryVO> findAll(Long memberId, String planName, String cropName,
                                                   String varietyName, LocalDate workedDate, String greenhouseName) {
        return repository.findAll(memberId, planName, cropName, varietyName, workedDate, greenhouseName);
    }

    public PageResponse<FindAllCultivationDiaryVO> findPage(Long memberId, String planName, String cropName,
            String varietyName, LocalDate workedDate, String greenhouseName, PageRequest page) {
        return PageResponse.from(PageHelper.<FindAllCultivationDiaryVO>startPage(page.getPage(), page.getSize())
                .doSelectPageInfo(() -> repository.findAll(memberId, planName, cropName, varietyName,
                        workedDate, greenhouseName)));
    }

    public List<DiaryPlan> findActivePlans(Long memberId) {
        return repository.findActivePlans(memberId);
    }

    public DiaryDetailResponse findDetail(Long memberId, Long diaryId) {
        return new DiaryDetailResponse(requireDiary(memberId, diaryId), taskService.findAll(memberId, diaryId));
    }

    public StageOptionsResponse stageOptions(Long memberId, Long planId, LocalDate workedDate) {
        DiaryPlan plan = findActivePlans(memberId).stream().filter(row -> row.getPlanId().equals(planId))
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 중인 작기를 찾을 수 없습니다."));
        if (workedDate == null || workedDate.isBefore(plan.getActualStartDate().toLocalDate())
                || workedDate.isAfter(LocalDate.now())) {
            throw invalid("실제 작업일을 확인하세요.");
        }

        boolean duplicate = repository.existsOnDate(planId, workedDate);
        String previousStage = repository.findStageAtDate(planId, workedDate);
        String currentStage = previousStage == null ? STAGES.getFirst() : previousStage;
        int nextIndex = STAGES.indexOf(currentStage) + 1;
        String nextStage = !duplicate && nextIndex > 0 && nextIndex < STAGES.size()
                && !repository.existsAfterDate(planId, workedDate)
                ? STAGES.get(nextIndex) : null;
        return new StageOptionsResponse(currentStage, nextStage, duplicate);
    }

    @Transactional
    public Long create(Long memberId, CreateRequest request) {
        if (request.getPlanId() == null || repository.lockActivePlan(memberId, request.getPlanId()) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 중인 작기를 찾을 수 없습니다.");
        }
        StageOptionsResponse options = stageOptions(memberId, request.getPlanId(), request.getWorkedDate());
        if (options.isDuplicate()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "해당 날짜에 이미 재배일지가 등록되어 있습니다.");
        }
        String reason = null;
        if (!options.getCurrentStage().equals(request.getGrowthStage())) {
            if (options.getNextStage() == null || !options.getNextStage().equals(request.getGrowthStage())) {
                throw invalid("선택한 날짜에 적용할 수 있는 생육단계를 확인하세요.");
            }
            reason = request.getStageChangeReason();
            if (reason == null || reason.isBlank() || reason.strip().length() > 500) {
                throw invalid("생육단계 변경 사유를 500자 이내로 입력하세요.");
            }
            reason = reason.strip();
        }
        CultivationDiary diary = CultivationDiary.builder().planId(request.getPlanId())
                .workedAt(request.getWorkedDate().atStartOfDay()).growthStage(request.getGrowthStage())
                .stageChangeReason(reason).build();
        repository.addDiary(memberId, diary);
        if (diary.getDiaryId() == null) {
            throw new IllegalStateException("재배일지 등록 후 식별자를 받지 못했습니다.");
        }
        taskService.save(memberId, diary.getDiaryId(), request.getWorkedDate(), request.getTasks(), false);
        return diary.getDiaryId();
    }

    @Transactional
    public void updateTasks(Long memberId, Long diaryId, List<TaskInput> tasks) {
        lockDiary(memberId, diaryId);
        LocalDate workedDate = requireDiary(memberId, diaryId).getWorkedAt().toLocalDate();
        taskService.save(memberId, diaryId, workedDate, tasks, true);
        repository.touchDiary(diaryId);
    }

    @Transactional
    public void delete(Long memberId, Long diaryId) {
        lockDiary(memberId, diaryId);
        requireDiary(memberId, diaryId);
        repository.deleteDiaryById(memberId, diaryId);
    }

    private FindCultivationDiaryDetailVO requireDiary(Long memberId, Long diaryId) {
        FindCultivationDiaryDetailVO diary = repository.findByMemberIdAndDiaryId(memberId, diaryId);
        if (diary == null) throw missingDiary();
        return diary;
    }

    private void lockDiary(Long memberId, Long diaryId) {
        if (repository.lockDiary(memberId, diaryId) == null) throw missingDiary();
    }

    private ResponseStatusException missingDiary() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "재배일지를 찾을 수 없습니다.");
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}

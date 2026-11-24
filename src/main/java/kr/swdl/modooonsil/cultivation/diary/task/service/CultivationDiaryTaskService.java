package kr.swdl.modooonsil.cultivation.diary.task.service;

import kr.swdl.modooonsil.cultivation.diary.dto.TaskInput;
import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import kr.swdl.modooonsil.cultivation.diary.task.repository.CultivationDiaryTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CultivationDiaryTaskService {
    private static final Set<String> TYPES = Set.of("관수", "방제", "환경 조절", "생육 관리", "기타");
    private static final Set<String> STATUSES = Set.of("완료", "미완료");
    private final CultivationDiaryTaskRepository repository;

    public List<CultivationDiaryTask> findAll(Long memberId, Long diaryId) {
        return repository.findAllByDiaryId(memberId, diaryId);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void save(Long memberId, Long diaryId, LocalDate workedDate, List<TaskInput> tasks, boolean editing) {
        if (tasks == null) {
            throw invalid("작업 목록을 입력하세요.");
        }
        Set<Long> removedIds = new HashSet<>();
        if (editing) {
            findAll(memberId, diaryId).forEach(task -> removedIds.add(task.getTaskId()));
        }

        List<CultivationDiaryTask> added = new ArrayList<>();
        List<CultivationDiaryTask> updated = new ArrayList<>();
        for (TaskInput input : tasks) {
            CultivationDiaryTask task = validate(input, workedDate);
            if (task.getTaskId() == null) {
                added.add(task);
            } else if (removedIds.remove(task.getTaskId())) {
                updated.add(task);
            } else {
                throw invalid("작업 식별자가 중복되었거나 이 일지에 속하지 않습니다.");
            }
        }

        if (!removedIds.isEmpty()) repository.deleteTasks(memberId, diaryId, List.copyOf(removedIds));
        if (!updated.isEmpty()) repository.updateTasks(memberId, diaryId, updated);
        if (!added.isEmpty()) repository.addTasks(diaryId, added);
    }

    private CultivationDiaryTask validate(TaskInput input, LocalDate workedDate) {
        if (input == null || input.getTaskName() == null || input.getTaskName().isBlank()
                || input.getTaskName().strip().length() > 100 || input.getTaskType() == null
                || !TYPES.contains(input.getTaskType()) || input.getTaskStatus() == null
                || !STATUSES.contains(input.getTaskStatus()) || input.getTaskTime() == null) {
            throw invalid("모든 작업의 작업명·유형·시간·상태를 확인하세요.");
        }
        if (!input.getTaskTime().toLocalDate().equals(workedDate)) {
            throw invalid("작업시간이 실제 작업일과 일치하지 않습니다.");
        }
        return CultivationDiaryTask.builder()
                .taskId(input.getTaskId()).taskName(input.getTaskName().strip()).taskType(input.getTaskType())
                .taskTime(input.getTaskTime()).taskStatus(input.getTaskStatus()).taskContent(input.getTaskContent())
                .build();
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}

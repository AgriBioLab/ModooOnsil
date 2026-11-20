package kr.swdl.modooonsil.cultivation.diary.task.repository;

import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
class CultivationDiaryTaskRepositoryTest {
    private static final long MEMBER_ID = 940001L;
    private static final long DIARY_ID = 940001L;

    @Autowired
    private CultivationDiaryTaskRepository taskRepository;

    @Test
    void 재배일지_작업_일괄_등록() {
        CultivationDiaryTask watering = CultivationDiaryTask.builder()
                .taskName("오전 관수")
                .taskType("관수")
                .taskTime(LocalDateTime.of(2026, 10, 2, 9, 0))
                .taskStatus("완료")
                .taskContent("배지 수분 확인 후 관수")
                .build();
        CultivationDiaryTask inspection = CultivationDiaryTask.builder()
                .taskName("잎 상태 확인")
                .taskType("생육 관리")
                .taskTime(LocalDateTime.of(2026, 10, 2, 11, 20))
                .taskStatus("미완료")
                .taskContent("잎과 줄기 상태 확인 예정")
                .build();

        int beforeCount = taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID).size();

        taskRepository.addTasks(DIARY_ID, List.of(watering, inspection));

        assertThat(taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID))
                .hasSize(beforeCount + 2);
    }

    @Test
    void 재배일지_작업_일괄_수정() {
        CultivationDiaryTask watering = CultivationDiaryTask.builder()
                .taskId(940001L)
                .taskName("수정된 작업명1")
                .taskType("생육관리")
                .taskTime(LocalDateTime.of(2026, 10, 2, 9, 30))
                .taskStatus("완료")
                .taskContent("수정된 작업내용1")
                .build();
        CultivationDiaryTask inspection = CultivationDiaryTask.builder()
                .taskId(940002L)
                .taskName("수정된 작업명2")
                .taskType("관수")
                .taskTime(LocalDateTime.of(2026, 10, 2, 10, 30))
                .taskStatus("완료")
                .taskContent("수정된 작업내용2")
                .build();

        taskRepository.updateTasks(MEMBER_ID, DIARY_ID, List.of(watering, inspection));
        List<CultivationDiaryTask> updatedTasks = taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID);

        for (CultivationDiaryTask expected : List.of(watering, inspection)) {
            CultivationDiaryTask updatedTask = updatedTasks.stream()
                    .filter(task -> task.getTaskId().equals(expected.getTaskId()))
                    .findFirst()
                    .orElseThrow();

            assertEquals(expected.getTaskName(), updatedTask.getTaskName());
            assertEquals(expected.getTaskType(), updatedTask.getTaskType());
            assertEquals(expected.getTaskTime(), updatedTask.getTaskTime());
            assertEquals(expected.getTaskStatus(), updatedTask.getTaskStatus());
            assertEquals(expected.getTaskContent(), updatedTask.getTaskContent());
            assertNotNull(updatedTask.getUpdatedAt());
        }
    }


    @Test
    void 일지_작업목록을_시간순_조회() {
        assertThat(taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID)).isNotEmpty();
        assertThat(taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID)).hasSize(6);
    }

    @Test
    void 재배일지_작업을_일괄_삭제한다() {
        List<Long> taskIds = List.of(940001L, 940002L);
        int beforeCount = taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID).size();

        taskRepository.deleteTasks(MEMBER_ID, DIARY_ID, taskIds);
        int deletedCount = taskRepository.findAllByDiaryId(MEMBER_ID, DIARY_ID).size();

        assertEquals(2, beforeCount - deletedCount);
    }


}

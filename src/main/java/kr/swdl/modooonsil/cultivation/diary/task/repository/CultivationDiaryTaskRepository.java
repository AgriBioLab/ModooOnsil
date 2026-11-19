package kr.swdl.modooonsil.cultivation.diary.task.repository;

import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CultivationDiaryTaskRepository {
    List<CultivationDiaryTask> findAllByDiaryId(Long memberId, Long diaryId);

    void addTasks(Long diaryId, List<CultivationDiaryTask> tasks);

    void updateTasks(Long memberId, Long diaryId, List<CultivationDiaryTask> tasks);

    void deleteTasks(Long memberId, Long diaryId, List<Long> taskIds);

}

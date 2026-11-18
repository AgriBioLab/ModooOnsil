package kr.swdl.modooonsil.cultivation.diary.task.repository;

import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import org.apache.ibatis.annotations.Mapper;

import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CultivationDiaryTaskRepository {
    List<CultivationDiaryTask> findAllByDiaryId(Long memberId, Long diaryId);

    void insertTasks(Long diaryId, List<CultivationDiaryTask> tasks);

}

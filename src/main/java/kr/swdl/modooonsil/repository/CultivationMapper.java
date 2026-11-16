package kr.swdl.modooonsil.repository;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CultivationMapper {
    List<Map<String, Object>> plans(Map<String, Object> parameters);

    Map<String, Object> plan(Map<String, Object> parameters);

    Map<String, Object> lockPlan(Map<String, Object> parameters);

    Map<String, Object> lockDevicePlan(Map<String, Object> parameters);

    int activeInGreenhouse(Map<String, Object> parameters);

    int insertPlan(Map<String, Object> parameters);

    int updatePlan(Map<String, Object> parameters);

    int startPlan(Map<String, Object> parameters);

    int endPlan(Map<String, Object> parameters);

    int operationsAfterDate(Map<String, Object> parameters);

    int deletePlan(Map<String, Object> parameters);

    List<Map<String, Object>> diaries(Map<String, Object> parameters);

    Map<String, Object> diary(Map<String, Object> parameters);

    Map<String, Object> lockDiary(Map<String, Object> parameters);

    int countDiaryDate(Map<String, Object> parameters);

    List<Map<String, Object>> neighborDiaries(Map<String, Object> parameters);

    int insertDiary(Map<String, Object> parameters);

    int touchDiary(Map<String, Object> parameters);

    int deleteDiary(Map<String, Object> parameters);

    List<Map<String, Object>> diaryTasks(Map<String, Object> parameters);

    int insertTask(Map<String, Object> parameters);

    int updateTask(Map<String, Object> parameters);

    int deleteTask(Map<String, Object> parameters);
}

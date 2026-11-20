package kr.swdl.modooonsil.cultivation.diary.repository;

import kr.swdl.modooonsil.cultivation.diary.domain.CultivationDiary;
import kr.swdl.modooonsil.cultivation.diary.domain.FindAllCultivationDiaryVO;
import kr.swdl.modooonsil.cultivation.diary.domain.FindCultivationDiaryDetailVO;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CultivationDiaryRepository {
    List<FindAllCultivationDiaryVO> findAll(Long memberId, String planName, String cropName, String varietyName, LocalDate workedDate, String greenhouseName);

    List<String> findStartedPlanNames(Long memberId);

    List<String> findCropNames();

    List<String> findVarietyNames(String cropName);

    List<String> findGreenhouseNames(Long memberId);

    FindCultivationDiaryDetailVO findByMemberIdAndDiaryId(Long memberId, Long diaryId);

    String findPreviousDiaryGrowthStage(Long memberId, Long planId, LocalDate workedDate);

    String findNextDiaryGrowthStage(Long memberId, Long planId, LocalDate workedDate);

    void addDiary(Long memberId, CultivationDiary diary);

    void deleteDiaryById(Long memberId, Long diaryId);
}

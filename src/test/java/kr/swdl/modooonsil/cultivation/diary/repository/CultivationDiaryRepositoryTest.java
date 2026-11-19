package kr.swdl.modooonsil.cultivation.diary.repository;

import kr.swdl.modooonsil.cultivation.diary.domain.CultivationDiary;
import kr.swdl.modooonsil.cultivation.diary.domain.FindCultivationDiaryDetailVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class CultivationDiaryRepositoryTest {
    private static final long MEMBER_ID = 940001L;
    private static final long OTHER_MEMBER_ID = 940002L;
    private static final String PLAN_NAME = "장미 가을 작기 · 환경 및 이슈 시연";
    private static final String GREENHOUSE_NAME = "시연 1온실 (단동·유리·수태)";

    @Autowired
    private CultivationDiaryRepository cultivationDiaryRepository;

    @Test
    void 재배일지_등록() {
        CultivationDiary diary = CultivationDiary.builder()
                .planId(940001L)
                .workedAt(LocalDateTime.of(2026, 11, 10, 0, 0))
                .growthStage("꽃눈유도기")
                .stageChangeReason("꽃눈 형성을 확인함")
                .build();

        cultivationDiaryRepository.addDiary(MEMBER_ID, diary);
        assertThat(diary.getDiaryId()).isNotNull();

        FindCultivationDiaryDetailVO saved = cultivationDiaryRepository.findByMemberIdAndDiaryId(MEMBER_ID, diary.getDiaryId());
        assertThat(saved).isNotNull();
        assertThat(saved.getPlanName()).isEqualTo(PLAN_NAME);
        assertThat(saved.getWorkedAt()).isEqualTo(diary.getWorkedAt());
        assertThat(saved.getGrowthStage()).isEqualTo(diary.getGrowthStage());
        assertThat(saved.getStageChangeReason()).isEqualTo(diary.getStageChangeReason());
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void 재배일지_목록_조회_최신순() {
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, null, null, null, null)).isNotEmpty();
    }

    @Test
    void 작기명과_온실명으로_검색() {
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, PLAN_NAME, null, null, null, null)).isNotEmpty();
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, null, null, null, GREENHOUSE_NAME)).isNotEmpty();
    }

    @Test
    void 품목과_품종으로_검색() {
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, "장미", null, null, null)).isNotEmpty();
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, "장미", "레드나오미", null, null)).isNotEmpty();
    }

    @Test
    void 실제_작업일로_검색() {
        LocalDate workedDate = LocalDate.of(2026, 11, 12);

        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, null, null, workedDate, null)).isNotEmpty();
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, PLAN_NAME, "장미", "레드나오미", workedDate, GREENHOUSE_NAME)).isNotEmpty();
    }

    @Test
    void 다른_회원의_재배일지목록은_조회_불가() {
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, PLAN_NAME, null, null, null, null)).isNotEmpty();
        assertThat(cultivationDiaryRepository.findAll(OTHER_MEMBER_ID, PLAN_NAME, null, null, null, null)).isEmpty();
    }

    @Test
    void 논리_삭제된_일지는_조회와_집계에서_제외() {
        assertThat(cultivationDiaryRepository.findAll(MEMBER_ID, null, null, null, null, null)).hasSize(8);
    }

    @Test
    void 진행_중인_작기의_이름_조회() {
        assertThat(cultivationDiaryRepository.findStartedPlanNames(MEMBER_ID))
                .hasSize(2);
    }

    @Test
    void 품목_선택지_조회() {
        assertThat(cultivationDiaryRepository.findCropNames()).hasSize(3);
    }

    @Test
    void 품종_선택지_조회() {
        assertThat(cultivationDiaryRepository.findVarietyNames(null)).hasSize(4);
        assertThat(cultivationDiaryRepository.findVarietyNames("장미")).hasSize(1);
    }

    @Test
    void 회원의_온실_선택지_조회() {
        assertThat(cultivationDiaryRepository.findGreenhouseNames(MEMBER_ID)).hasSize(2);
    }

    @Test
    void 재배일지_기본정보_상세_조회() {
        assertThat(cultivationDiaryRepository.findByMemberIdAndDiaryId(MEMBER_ID, OTHER_MEMBER_ID)).isNotNull();
    }

    @Test
    void 기준일_이전의_가장_최근_일지의_생육단계_조회() {
        String growthStage = cultivationDiaryRepository.findPreviousDiaryGrowthStage(
                MEMBER_ID, 940001L, LocalDate.of(2026, 11, 10));

        assertThat(growthStage).isEqualTo("생식생장기");
    }

    @Test
    void 기준일_이후_가장_가까운_일지의_생육단계_조회() {
        String growthStage = cultivationDiaryRepository.findNextDiaryGrowthStage(
                MEMBER_ID, 940001L, LocalDate.of(2026, 10, 2));

        System.out.println(growthStage);
        assertThat(growthStage).isEqualTo("꽃눈유도기");
    }

    @Test
    void 기준일_당일_일지만_있으면_다음_생육단계는_조회_불가() {
        assertThat(cultivationDiaryRepository.findNextDiaryGrowthStage(
                MEMBER_ID, 940001L, LocalDate.of(2026, 11, 12)))
                .isNull();
    }

    @Test
    void 재배일지_논리_삭제() {
        long diaryId = 940004L;

        assertThat(cultivationDiaryRepository.findByMemberIdAndDiaryId(MEMBER_ID, diaryId))
                .isNotNull();

        cultivationDiaryRepository.deleteDiaryById(MEMBER_ID, diaryId);

        assertThat(cultivationDiaryRepository
                .findByMemberIdAndDiaryId(MEMBER_ID, diaryId))
                .isNull();
    }

}

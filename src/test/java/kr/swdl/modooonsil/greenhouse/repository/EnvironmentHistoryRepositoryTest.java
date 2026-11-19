package kr.swdl.modooonsil.greenhouse.repository;

import kr.swdl.modooonsil.greenhouse.domain.EnvironmentHistory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EnvironmentHistoryRepositoryTest {

    @Autowired
    EnvironmentHistoryRepository environmentHistoryRepository;

    @Test
    void 최신_환경_측정_정보_조회() {
        Long testPlanId = 940001L;

        EnvironmentHistory environmentHistory = environmentHistoryRepository.findCurrentEnvironmentByPlanId(testPlanId);

        assertNotNull(environmentHistory);
        assertEquals(testPlanId, environmentHistory.getPlanId());
    }

    @Test
    void 환경_측정_이력_조회() {
        Long testPlanId = 940001L;

        List<EnvironmentHistory> environmentHistoryList = environmentHistoryRepository.findEnvironmentsByPlanId(testPlanId, null, null);

        assertFalse(environmentHistoryList.isEmpty());
        for (EnvironmentHistory eh : environmentHistoryList) {
            assertEquals(testPlanId, eh.getPlanId());
        }
        if (environmentHistoryList.size() >= 2)
            assertTrue(environmentHistoryList.get(0).getMeasuredAt().isAfter(environmentHistoryList.get(1).getMeasuredAt()));
    }

    @Test
    void 기간별_환경_측정_이력_조회() {
        Long testPlanId = 940001L;
        LocalDateTime testStartDate = LocalDateTime.of(2026, 10, 1, 0, 0);
        LocalDateTime testEndDate = LocalDateTime.of(2026, 10, 4, 0, 0);

        List<EnvironmentHistory> environmentHistoryList = environmentHistoryRepository.findEnvironmentsByPlanId(testPlanId, testStartDate, testEndDate);

        assertFalse(environmentHistoryList.isEmpty());
        for (EnvironmentHistory eh : environmentHistoryList) {
            assertEquals(testPlanId, eh.getPlanId());
            assertTrue(eh.getMeasuredAt().isAfter(testStartDate.minusDays(1)));
            assertTrue(eh.getMeasuredAt().isBefore(testEndDate.plusDays(1)));
        }
    }

    @Test
    void 온실_환경변화_등록() {
        Long testPlanId = 940001L;

        EnvironmentHistory newEnvironmentHistory = EnvironmentHistory.builder()
                .planId(testPlanId)
                .measuredAt(LocalDateTime.now().withNano(0))
                .temperature(25.5)
                .humidity(65.2)
                .co2(450.0)
                .radiation(300.0)
                .light(12000.0)
                .soilTemperature(22.5)
                .soilMoisture(35.0)
                .soilEc(1.8)
                .soilPh(6.5)
                .build();

        environmentHistoryRepository.addEnvironmentHistory(newEnvironmentHistory);

        EnvironmentHistory curEnvironmentHistory = environmentHistoryRepository.findCurrentEnvironmentByPlanId(testPlanId);

        assertThat(curEnvironmentHistory)
                .usingRecursiveComparison()
                .ignoringFields("environmentHistoryId")
                .isEqualTo(newEnvironmentHistory);
    }

}
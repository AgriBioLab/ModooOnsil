package kr.swdl.modooonsil.cultivation.plan.repository;

import kr.swdl.modooonsil.cultivation.plan.domain.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.FindCultivationPlanDetailVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CultivationPlanRepositoryTest {

    @Autowired
    CultivationPlanRepository cultivationPlanRepository;

    @Test
    void 작기계획_목록_조건없는_조회() {
        Long memberId = 940001L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(memberId)
                .build();

        List<FindAllCultivationPlanVO> list = cultivationPlanRepository.findAll(vo);
        assertFalse(list.isEmpty());
    }

    @Test
    void 작기계획_목록_조건없는_없음() {
        Long memberId = -1L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(memberId)
                .build();

        List<FindAllCultivationPlanVO> list = cultivationPlanRepository.findAll(vo);
        assertTrue(list.isEmpty());
    }

    @Test
    void 작기계획_목록_온실명_조회() {
        Long memberId = 940001L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(memberId)
                .greenhouseName("온실")
                .build();

        List<FindAllCultivationPlanVO> list = cultivationPlanRepository.findAll(vo);
        assertFalse(list.isEmpty());
        for (FindAllCultivationPlanVO plan : list)
            assertTrue(plan.getGreenhouseName().contains("온실"));
    }

    @Test
    void 작기계획_목록_품목명_조회() {
        Long memberId = 940001L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(memberId)
                .cropName("장미")
                .build();

        List<FindAllCultivationPlanVO> list = cultivationPlanRepository.findAll(vo);
        assertFalse(list.isEmpty());
        for (FindAllCultivationPlanVO plan : list)
            assertTrue(plan.getCropName().contains("장미"));
    }

    @Test
    void 작기계획_목록_작기계획상태_조회() {
        Long memberId = 940001L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(memberId)
                .planStatus("진행")
                .build();

        List<FindAllCultivationPlanVO> list = cultivationPlanRepository.findAll(vo);
        assertFalse(list.isEmpty());
        for (FindAllCultivationPlanVO plan : list)
            assertTrue(plan.getPlanStatus().contains("진행"));
    }

    @Test
    void 작기계획_상세조회() {
        Long memberId = 940001L;
        Long planId = 940001L;

        FindCultivationPlanDetailVO vo = cultivationPlanRepository.findByMemberIdAndPlanId(memberId, planId);
        assertNotNull(vo);
        assertEquals(planId, vo.getPlanId());
        assertEquals("장미 가을 작기 · 환경 및 이슈 시연", vo.getPlanName());
    }

    @Test
    void 작기계획_등록() {
        CultivationPlan newCultivationPlan = CultivationPlan.builder()
                .greenhouseId(940001L)
                .memberId(940001L)
                .standardId(940001L)
                .planName("테스트 작기계획")
                .planStatus("미진행")
                .plannedStartDate(LocalDateTime.of(2026, 11, 17, 0, 0, 0))
                .plannedEndDate(LocalDateTime.of(2027, 11, 17, 0, 0, 0))
                .build();

        cultivationPlanRepository.addCultivationPlan(newCultivationPlan);

        FindCultivationPlanDetailVO getCultivationPlan = cultivationPlanRepository.findByMemberIdAndPlanId(newCultivationPlan.getMemberId(), newCultivationPlan.getPlanId());
        assertEquals(newCultivationPlan.getPlanName(), getCultivationPlan.getPlanName());
        assertEquals(newCultivationPlan.getPlannedStartDate(), getCultivationPlan.getPlannedStartDate());
    }

    @Test
    void 작기계획_수정() {
        CultivationPlan updateCultivationPlan = CultivationPlan.builder()
                .planId(940001L)
                .memberId(940001L)
                .planName("테스트 작기계획")
                .plannedStartDate(LocalDateTime.of(2026, 11, 17, 0, 0, 0))
                .plannedEndDate(LocalDateTime.of(2027, 11, 17, 0, 0, 0))
                .build();

        cultivationPlanRepository.updateCultivationPlan(updateCultivationPlan);

        FindCultivationPlanDetailVO getCultivationPlan = cultivationPlanRepository.findByMemberIdAndPlanId(updateCultivationPlan.getMemberId(), updateCultivationPlan.getPlanId());
        assertEquals(updateCultivationPlan.getPlanId(), getCultivationPlan.getPlanId());
        assertEquals(updateCultivationPlan.getPlanName(), getCultivationPlan.getPlanName());
        assertEquals(updateCultivationPlan.getPlannedStartDate(), getCultivationPlan.getPlannedStartDate());
    }

    @Test
    void 작기계획_시작상태_변경() {
        Long memberId = 940001L;
        Long planId = 940001L;
        cultivationPlanRepository.updateCultivationPlanStart(memberId, planId);

        FindCultivationPlanDetailVO getCultivationPlan = cultivationPlanRepository.findByMemberIdAndPlanId(memberId, planId);
        assertEquals(planId, getCultivationPlan.getPlanId());
        assertEquals("진행", getCultivationPlan.getPlanStatus());
        assertNotNull(getCultivationPlan.getActualStartDate());
    }

    @Test
    void 작기계획_종료상태_변경() {
        Long testMemberId = 940001L;
        Long testPlanId = 940001L;
        String testEndReason = "테스트 종료";

        CultivationPlan endCultivationPlan = CultivationPlan.builder()
                .memberId(testMemberId)
                .planId(testPlanId)
                .endReason(testEndReason)
                .build();

        cultivationPlanRepository.updateCultivationPlanEnd(endCultivationPlan);

        FindCultivationPlanDetailVO getCultivationPlan = cultivationPlanRepository.findByMemberIdAndPlanId(testMemberId, testPlanId);
        assertEquals(testPlanId, getCultivationPlan.getPlanId());
        assertEquals("종료", getCultivationPlan.getPlanStatus());
        assertEquals(testEndReason, getCultivationPlan.getEndReason());
        assertNotNull(getCultivationPlan.getActualStartDate());
    }

    @Test
    void 미진행_작기계획_삭제() {
        Long testMemberId = 940001L;
        Long testPlanId = 940003L;

        cultivationPlanRepository.deleteCultivationPlan(testMemberId, testPlanId);
        FindCultivationPlanDetailVO getCultivationPlan = cultivationPlanRepository.findByMemberIdAndPlanId(testMemberId, testPlanId);
        System.out.println(getCultivationPlan);
        assertEquals(testPlanId, getCultivationPlan.getPlanId());
        assertEquals("미진행", getCultivationPlan.getPlanStatus());
        assertNotNull(getCultivationPlan.getDeletedAt());
    }
}
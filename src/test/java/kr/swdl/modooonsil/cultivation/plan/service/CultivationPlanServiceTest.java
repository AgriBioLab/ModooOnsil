package kr.swdl.modooonsil.cultivation.plan.service;

import kr.swdl.modooonsil.cultivation.plan.domain.vo.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.UpdateCultivationPlan;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CultivationPlanServiceTest {

    @Autowired
    CultivationPlanService planService;

    private static final Long MEMBER_ID = 940001L;

    /*
     * 테스트용 작기 ID
     *
     * 940001 : 진행
     * 940002 : 종료
     * 940003 : 미진행
     */

    private static final Long RUNNING_PLAN_ID = 940001L;
    private static final Long ENDED_PLAN_ID = 940002L;
    private static final Long WAITING_PLAN_ID = 940003L;

    /*
     * 공통 예외 상태 검증
     */
    private void assertExceptionStatus(HttpStatus expectedStatus, Runnable action) {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, action::run);

        assertEquals(expectedStatus, exception.getStatusCode());
    }

    // =========================================================
    // 1. 작기 목록 조회
    // =========================================================

    @Test
    void 작기_조건_없는_목록_조회_성공() {
        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(MEMBER_ID)
                .build();

        List<FindAllCultivationPlanVO> resultList = planService.findAll(vo);

        assertNotNull(resultList);
        assertFalse(resultList.isEmpty());

        for (FindAllCultivationPlanVO result : resultList) {
            assertEquals(MEMBER_ID, result.getMemberId());
            assertNotNull(result.getPlanId());
            assertNotNull(result.getPlanName());
        }
    }

    @Test
    void 작기_조건_있는_목록_조회_성공() {
        String searchPlanName = "장미";

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(MEMBER_ID)
                .planName(searchPlanName)
                .build();

        List<FindAllCultivationPlanVO> resultList = planService.findAll(vo);

        assertFalse(resultList.isEmpty());

        for (FindAllCultivationPlanVO result : resultList) {
            assertEquals(MEMBER_ID, result.getMemberId());
            assertNotNull(result.getPlanId());
            assertTrue(result.getPlanName().contains(searchPlanName));
        }
    }

    @Test
    void 작기_조건_없는_목록_조회_빈목록() {
        // 940003 회원은 샘플 데이터에 작기가 없음
        Long emptyMemberId = 940003L;

        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder()
                .memberId(emptyMemberId)
                .build();

        List<FindAllCultivationPlanVO> resultList = planService.findAll(vo);

        assertNotNull(resultList);
        assertTrue(resultList.isEmpty());
    }

    @Test
    void 작기_조건_없는_목록_조회_Null_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.findAll(null));
    }

    @Test
    void 작기_조건_없는_목록_조회_MemberId미존재_예외처리() {
        FindAllCultivationPlanVO vo = FindAllCultivationPlanVO.builder().memberId(999999L).build();

        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.findAll(vo));
    }

    // =========================================================
    // 2. 작기 상세 조회
    // =========================================================

    @Test
    void 작기_상세_조회_성공() {
        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(MEMBER_ID, RUNNING_PLAN_ID);

        assertNotNull(result);
        assertEquals(RUNNING_PLAN_ID, result.getPlanId());
        assertNotNull(result.getPlanName());
        assertEquals("진행", result.getPlanStatus());
    }

    @Test
    void 작기_상세_조회_MemberId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.findByMemberIdAndPlanId(999999L, RUNNING_PLAN_ID));
    }

    @Test
    void 작기_상세_조회_PlanId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.findByMemberIdAndPlanId(MEMBER_ID, 0L));
    }

    @Test
    void 작기_상세_조회_결과_Null_예외처리() {
        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.findByMemberIdAndPlanId(MEMBER_ID, 999999L));
    }

    // =========================================================
    // 3. 삭제된 작기 상세 조회
    // =========================================================

    @Test
    void 삭제된_작기_상세_조회_성공() {
        LocalDateTime startDate = LocalDateTime.now().withNano(0);
        LocalDateTime endDate = startDate.plusMonths(3);

        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("삭제 조회 테스트 작기")
                .plannedStartDate(startDate)
                .plannedEndDate(endDate)
                .build();

        // 생성
        Long createdPlanId = planService.addCultivationPlan(newPlan);

        assertNotNull(createdPlanId);

        // 논리 삭제
        planService.deleteCultivationPlan(MEMBER_ID, createdPlanId);

        // 삭제된 작기 조회
        FindCultivationPlanDetailVO result = planService.findDeletedByMemberIdAndPlanId(MEMBER_ID, createdPlanId);

        assertNotNull(result);
        assertEquals(createdPlanId, result.getPlanId());
        assertEquals("삭제 조회 테스트 작기", result.getPlanName());
        assertNotNull(result.getDeletedAt());
    }

    @Test
    void 삭제된_작기_상세_조회_MemberId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.findDeletedByMemberIdAndPlanId(999999L, RUNNING_PLAN_ID));
    }

    @Test
    void 삭제된_작기_상세_조회_PlanId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.findDeletedByMemberIdAndPlanId(MEMBER_ID, 0L));
    }

    @Test
    void 삭제된_작기_상세_조회_결과_Null_예외처리() {
        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.findDeletedByMemberIdAndPlanId(MEMBER_ID, 999999L));
    }

    // =========================================================
    // 4. 작기 생성
    // =========================================================

    @Test
    void 작기_등록_성공() {
        String testPlanName = "서비스 테스트 작기";

        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        LocalDateTime endDate = startDate.plusMonths(6);

        CultivationPlan newPlan = CultivationPlan.builder()
                .greenhouseId(940001L)
                .memberId(MEMBER_ID)
                .standardId(940001L)
                .planName(testPlanName)
                .plannedStartDate(startDate)
                .plannedEndDate(endDate)
                .build();

        // Repository는 void지만 MyBatis GeneratedKey로 planId가 설정됨
        Long createdPlanId = planService.addCultivationPlan(newPlan);

        assertNotNull(createdPlanId);
        assertEquals(createdPlanId, newPlan.getPlanId());

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(MEMBER_ID, createdPlanId);

        assertNotNull(result);
        assertEquals(createdPlanId, result.getPlanId());
        assertEquals(testPlanName, result.getPlanName());
        assertEquals("미진행", result.getPlanStatus());
        assertEquals(startDate, result.getPlannedStartDate());
        assertEquals(endDate, result.getPlannedEndDate());
    }

    @Test
    void 작기_등록_Null_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(null));
    }

    @Test
    void 작기_등록_MemberId미존재_예외처리() {
        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(999999L)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("회원 없음 테스트")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(LocalDateTime.now().plusMonths(3))
                .build();

        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_GreenhouseId미존재_예외처리() {
        // 현재 Service는 온실 ID의 양수 여부만 검증함
        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(0L)
                .standardId(940001L)
                .planName("온실 ID 테스트")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(LocalDateTime.now().plusMonths(3))
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_StandardId미존재_예외처리() {
        // 현재 Service는 재배 기준 ID의 양수 여부만 검증함
        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(0L)
                .planName("재배 기준 ID 테스트")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(LocalDateTime.now().plusMonths(3))
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_시작일누락_예외처리() {
        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("시작일 누락 테스트")
                .plannedStartDate(null)
                .plannedEndDate(LocalDateTime.now().plusMonths(3))
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_종료일누락_예외처리() {
        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("종료일 누락 테스트")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(null)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_시작일이종료일보다늦음_예외처리() {
        LocalDateTime startDate = LocalDateTime.now().plusMonths(3);

        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("날짜 오류 테스트")
                .plannedStartDate(startDate)
                .plannedEndDate(startDate.minusDays(1))
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    @Test
    void 작기_등록_시작일과종료일이같음_예외처리() {
        LocalDateTime sameDate = LocalDateTime.now();

        CultivationPlan newPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .greenhouseId(940001L)
                .standardId(940001L)
                .planName("동일 날짜 테스트")
                .plannedStartDate(sameDate)
                .plannedEndDate(sameDate)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.addCultivationPlan(newPlan));
    }

    // =========================================================
    // 5. 작기 수정
    // =========================================================

    @Test
    void 작기_작기명_수정_성공() {
        LocalDateTime beforeUpdate = LocalDateTime.now().minusSeconds(2);

        LocalDateTime afterUpdate = LocalDateTime.now().plusSeconds(2);

        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .planName("테스트 수정 작기명")
                .build();

        // Service와 Repository 모두 void 반환
        planService.updateCultivationPlan(updatePlan);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(updatePlan.getMemberId(), updatePlan.getPlanId());

        assertNotNull(result);
        assertEquals("미진행", result.getPlanStatus());
        assertEquals(updatePlan.getPlanId(), result.getPlanId());
        assertEquals(updatePlan.getPlanName(), result.getPlanName());
        assertNotNull(result.getUpdatedAt());

        assertFalse(result.getUpdatedAt().isBefore(beforeUpdate));
        assertFalse(result.getUpdatedAt().isAfter(afterUpdate));
    }

    @Test
    void 작기_수정_Null_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(null));
    }

    @Test
    void 작기_수정_MemberId미존재_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(999999L)
                .planId(WAITING_PLAN_ID)
                .planName("회원 없음 테스트")
                .build();

        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_PlanId미존재_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(0L)
                .planName("잘못된 작기 ID 테스트")
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_조회결과Null_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(999999L)
                .planName("존재하지 않는 작기")
                .build();

        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_변경할필드없음_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_진행중인작기_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(RUNNING_PLAN_ID)
                .planName("진행 중 수정 테스트")
                .build();

        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_종료된작기_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(ENDED_PLAN_ID)
                .planName("종료 작기 수정 테스트")
                .build();

        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_잘못된GreenhouseId_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .greenhouseId(0L)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_잘못된StandardId_예외처리() {
        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .standardId(-1L)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(updatePlan));
    }

    @Test
    void 작기_수정_시작일이종료일보다늦음_예외처리() {
        // 샘플 데이터 940003의 종료 예정일은 2027-01-20
        LocalDateTime invalidStartDate = LocalDateTime.of(2027, 2, 1, 0, 0);

        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .plannedStartDate(invalidStartDate)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlan(updatePlan));
    }

    // =========================================================
    // 6. 작기 시작
    // =========================================================

    @Test
    void 작기_시작_성공() {

        // given
        Long memberId = 940002L;
        Long planId = 940006L;

        LocalDateTime beforeUpdate = LocalDateTime.now().minusSeconds(2);

        planService.updateCultivationPlanStart(memberId, planId);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);
        
        LocalDateTime afterUpdate = LocalDateTime.now().plusSeconds(2);
        assertEquals("진행", result.getPlanStatus());
        assertNotNull(result.getActualStartDate());
        assertFalse(result.getActualStartDate().isBefore(beforeUpdate));
        assertFalse(result.getActualStartDate().isAfter(afterUpdate));
    }

    @Test
    void 작기_시작_동일온실에_진행중인_작기_존재_예외처리() {
        Long memberId = 940001L;
        Long planId = 940003L;

        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlanStart(memberId, planId));

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);
        assertEquals("미진행", result.getPlanStatus());
        assertNull(result.getActualStartDate());
    }

    @Test
    void 작기_시작_MemberId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.updateCultivationPlanStart(999999L, WAITING_PLAN_ID));
    }

    @Test
    void 작기_시작_PlanId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlanStart(MEMBER_ID, 0L));
    }

    @Test
    void 작기_시작_조회결과Null_예외처리() {
        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.updateCultivationPlanStart(MEMBER_ID, 999999L));
    }

    @Test
    void 작기_시작_이미진행중인작기_예외처리() {
        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlanStart(MEMBER_ID, RUNNING_PLAN_ID));
    }

    @Test
    void 작기_시작_이미종료된작기_예외처리() {
        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlanStart(MEMBER_ID, ENDED_PLAN_ID));
    }

    // =========================================================
    // 7. 작기 종료
    // =========================================================

    @Test
    void 작기_종료상태변경_성공() {
        String endReason = "테스트 작기 종료";

        LocalDateTime beforeUpdate = LocalDateTime.now().minusSeconds(2);

        LocalDateTime afterUpdate = LocalDateTime.now().plusSeconds(2);

        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(RUNNING_PLAN_ID)
                .endReason(endReason)
                .build();

        planService.updateCultivationPlanEnd(endPlan);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(MEMBER_ID, RUNNING_PLAN_ID);

        assertNotNull(result);
        assertEquals(RUNNING_PLAN_ID, result.getPlanId());
        assertEquals("종료", result.getPlanStatus());
        assertEquals(endReason, result.getEndReason());
        assertNotNull(result.getActualStartDate());
        assertNotNull(result.getActualEndDate());
        assertNotNull(result.getUpdatedAt());

        assertFalse(result.getActualEndDate().isBefore(beforeUpdate));
        assertFalse(result.getActualEndDate().isAfter(afterUpdate));
    }

    @Test
    void 작기_종료_Null_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlanEnd(null));
    }

    @Test
    void 작기_종료_MemberId미존재_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(999999L)
                .planId(RUNNING_PLAN_ID)
                .endReason("회원 없음 테스트")
                .build();

        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_PlanId미존재_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(0L)
                .endReason("잘못된 작기 ID 테스트")
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_조회결과Null_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(999999L)
                .endReason("없는 작기 종료 테스트")
                .build();

        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_종료사유누락_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(RUNNING_PLAN_ID)
                .endReason(null)
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_종료사유공백_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(RUNNING_PLAN_ID)
                .endReason("   ")
                .build();

        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_미진행작기_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(WAITING_PLAN_ID)
                .endReason("미진행 작기 종료 테스트")
                .build();

        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    @Test
    void 작기_종료_이미종료된작기_예외처리() {
        CultivationPlan endPlan = CultivationPlan.builder()
                .memberId(MEMBER_ID)
                .planId(ENDED_PLAN_ID)
                .endReason("중복 종료 테스트")
                .build();

        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.updateCultivationPlanEnd(endPlan));
    }

    // =========================================================
    // 8. 작기 논리 삭제
    // =========================================================

    @Test
    void 미진행_작기_논리삭제_성공() {
        planService.deleteCultivationPlan(MEMBER_ID, WAITING_PLAN_ID);

        FindCultivationPlanDetailVO result = planService.findDeletedByMemberIdAndPlanId(MEMBER_ID, WAITING_PLAN_ID);

        assertNotNull(result);
        assertEquals(WAITING_PLAN_ID, result.getPlanId());
        assertEquals("미진행", result.getPlanStatus());
        assertNotNull(result.getDeletedAt());
    }

    @Test
    void 작기_삭제_MemberId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.UNAUTHORIZED, () -> planService.deleteCultivationPlan(999999L, WAITING_PLAN_ID));
    }

    @Test
    void 작기_삭제_PlanId미존재_예외처리() {
        assertExceptionStatus(HttpStatus.BAD_REQUEST, () -> planService.deleteCultivationPlan(MEMBER_ID, 0L));
    }

    @Test
    void 작기_삭제_조회결과Null_예외처리() {
        assertExceptionStatus(HttpStatus.NOT_FOUND, () -> planService.deleteCultivationPlan(MEMBER_ID, 999999L));
    }

    @Test
    void 진행중인_작기_삭제_예외처리() {
        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.deleteCultivationPlan(MEMBER_ID, RUNNING_PLAN_ID));
    }

    @Test
    void 종료된_작기_삭제_예외처리() {
        assertExceptionStatus(HttpStatus.CONFLICT, () -> planService.deleteCultivationPlan(MEMBER_ID, ENDED_PLAN_ID));
    }
}

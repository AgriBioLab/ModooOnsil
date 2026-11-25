
package kr.swdl.modooonsil.cultivation.plan.controller;

import jakarta.validation.ConstraintViolationException;

import kr.swdl.modooonsil.cultivation.plan.domain.dto.CreateCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.EndCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.FindAllCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.UpdateCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.service.CultivationPlanService;
import kr.swdl.modooonsil.member.domain.Member;
import kr.swdl.modooonsil.member.security.CustomUserDetails;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CultivationPlanRestControllerTest {

    @Autowired
    CultivationPlanRestController planController;

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
     * 테스트용 로그인 회원 생성
     */
    private CustomUserDetails createUserDetails(Long memberId) {
        Member member = Member.builder()
                              .memberId(memberId)
                              .username("testUser")
                              .password("testPassword")
                              .build();

        return new CustomUserDetails(member);
    }

    /*
     * 작기 생성 API에서 Location 헤더를 만들기 위한 요청 정보 설정
     */
    private void setCurrentRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8080);
        request.setRequestURI("/api/cultivation-plans");
        request.setContextPath("");

        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(request)
        );
    }

    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    /*
     * 공통 예외 상태 검증
     *
     * ResponseStatusException:
     *   서비스 또는 컨트롤러에서 직접 발생시킨 HTTP 예외
     *
     * ConstraintViolationException:
     *   @Validated, @NotNull, @Positive, @AssertTrue 등의
     *   메서드 및 DTO 검증 실패
     */
    private void assertExceptionStatus(
            HttpStatus expectedStatus,
            Runnable action
    ) {
        Exception exception = assertThrows(
                Exception.class,
                action::run
        );

        if (exception instanceof ResponseStatusException responseException) {
            assertEquals(
                    expectedStatus,
                    responseException.getStatusCode()
            );
            return;
        }

        if (exception instanceof ConstraintViolationException violationException) {
            assertEquals(
                    HttpStatus.BAD_REQUEST,
                    expectedStatus,
                    "ConstraintViolationException은 400 검증 오류여야 합니다."
            );

            assertFalse(
                    violationException.getConstraintViolations().isEmpty(),
                    "검증 실패 내역이 존재해야 합니다."
            );
            return;
        }

        fail(
                "예상하지 못한 예외 타입입니다: "
                        + exception.getClass().getName(),
                exception
        );
    }

    /*
     * 유효한 작기 생성 DTO
     */
    private CreateCultivationPlanRequest validCreateRequest() {
        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        return CreateCultivationPlanRequest.builder()
                                           .planName("테스트 작기")
                                           .greenhouseId(940001L)
                                           .standardId(940001L)
                                           .plannedStartDate(startDate)
                                           .plannedEndDate(startDate.plusMonths(3))
                                           .build();
    }

    /*
     * 유효한 작기 수정 DTO
     */
    private UpdateCultivationPlanRequest validUpdateRequest() {
        return UpdateCultivationPlanRequest.builder()
                                           .planName("테스트 수정 작기")
                                           .build();
    }

    /*
     * 유효한 작기 종료 DTO
     */
    private EndCultivationPlanRequest validEndRequest() {
        return EndCultivationPlanRequest.builder()
                                        .endReason("테스트 작기 종료")
                                        .build();
    }

    // =========================================================
    // 1. 작기 목록 조회
    // =========================================================

    @Test
    void 작기_조건_없는_목록_조회_성공() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        FindAllCultivationPlanRequest request =
                FindAllCultivationPlanRequest.builder()
                                             .build();

        ResponseEntity<List<FindAllCultivationPlanVO>> response =
                planController.findAll(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<FindAllCultivationPlanVO> resultList = response.getBody();

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
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        FindAllCultivationPlanRequest request =
                FindAllCultivationPlanRequest.builder()
                                             .planName("장미")
                                             .build();

        ResponseEntity<List<FindAllCultivationPlanVO>> response =
                planController.findAll(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<FindAllCultivationPlanVO> resultList = response.getBody();

        assertNotNull(resultList);
        assertFalse(resultList.isEmpty());

        for (FindAllCultivationPlanVO result : resultList) {
            assertEquals(MEMBER_ID, result.getMemberId());
            assertNotNull(result.getPlanId());
            assertTrue(result.getPlanName().contains("장미"));
        }
    }

    @Test
    void 작기_조건_없는_목록_조회_빈목록() {
        CustomUserDetails userDetails = createUserDetails(940003L);

        FindAllCultivationPlanRequest request =
                FindAllCultivationPlanRequest.builder()
                                             .build();

        ResponseEntity<List<FindAllCultivationPlanVO>> response =
                planController.findAll(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<FindAllCultivationPlanVO> resultList = response.getBody();

        assertNotNull(resultList);
        assertTrue(resultList.isEmpty());
    }

    @Test
    void 작기_목록_조회_로그인정보없음_예외처리() {
        FindAllCultivationPlanRequest request =
                FindAllCultivationPlanRequest.builder()
                                             .build();

        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.findAll(null, request)
        );
    }

    // =========================================================
    // 2. 작기 상세 조회
    // =========================================================

    @Test
    void 작기_상세_조회_성공() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        ResponseEntity<FindCultivationPlanDetailVO> response =
                planController.findByPlanId(
                        userDetails,
                        RUNNING_PLAN_ID
                );

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        FindCultivationPlanDetailVO result = response.getBody();

        assertNotNull(result);
        assertEquals(RUNNING_PLAN_ID, result.getPlanId());
        assertNotNull(result.getPlanName());
        assertEquals("진행", result.getPlanStatus());
    }

    @Test
    void 작기_상세_조회_로그인정보없음_예외처리() {
        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.findByPlanId(null, RUNNING_PLAN_ID)
        );
    }

    @Test
    void 작기_상세_조회_PlanId미존재_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.findByPlanId(userDetails, 0L)
        );
    }

    @Test
    void 작기_상세_조회_결과없음_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.NOT_FOUND,
                () -> planController.findByPlanId(userDetails, 999999L)
        );
    }

    // =========================================================
    // 3. 작기 생성
    // =========================================================

    @Test
    void 작기_등록_성공() {
        setCurrentRequest();

        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        LocalDateTime startDate = LocalDateTime.now().withNano(0);
        LocalDateTime endDate = startDate.plusMonths(6);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("Controller 테스트 작기")
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(startDate)
                                            .plannedEndDate(endDate)
                                            .build();

        ResponseEntity<FindCultivationPlanDetailVO> response =
                planController.addCultivationPlan(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getHeaders().getLocation());

        FindCultivationPlanDetailVO result = response.getBody();

        assertNotNull(result);
        assertNotNull(result.getPlanId());
        assertEquals("Controller 테스트 작기", result.getPlanName());
        assertEquals("미진행", result.getPlanStatus());
        assertEquals(startDate, result.getPlannedStartDate());
        assertEquals(endDate, result.getPlannedEndDate());

        assertTrue(
                response.getHeaders()
                        .getLocation()
                        .toString()
                        .endsWith("/" + result.getPlanId())
        );
    }

    @Test
    void 작기_등록_로그인정보없음_예외처리() {
        // 로그인 검사 전에 DTO 검증에 걸리지 않도록 유효한 DTO 사용
        CreateCultivationPlanRequest request = validCreateRequest();

        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.addCultivationPlan(null, request)
        );
    }

    @Test
    void 작기_등록_작기명누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName(null)
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(startDate)
                                            .plannedEndDate(startDate.plusMonths(3))
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_온실ID누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("온실 ID 누락 테스트")
                                            .greenhouseId(null)
                                            .standardId(940001L)
                                            .plannedStartDate(startDate)
                                            .plannedEndDate(startDate.plusMonths(3))
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_재배기준ID누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("재배 기준 ID 누락 테스트")
                                            .greenhouseId(940001L)
                                            .standardId(null)
                                            .plannedStartDate(startDate)
                                            .plannedEndDate(startDate.plusMonths(3))
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_시작일누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("시작일 누락 테스트")
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(null)
                                            .plannedEndDate(LocalDateTime.now().plusMonths(3))
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_종료일누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("종료일 누락 테스트")
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(LocalDateTime.now())
                                            .plannedEndDate(null)
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_시작일이_종료일보다_늦은경우_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        LocalDateTime startDate = LocalDateTime.now().withNano(0);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("날짜 역전 테스트")
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(startDate.plusMonths(3))
                                            .plannedEndDate(startDate)
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    @Test
    void 작기_등록_시작일과_종료일이_같은경우_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        LocalDateTime sameDate = LocalDateTime.now().withNano(0);

        CreateCultivationPlanRequest request =
                CreateCultivationPlanRequest.builder()
                                            .planName("동일 날짜 테스트")
                                            .greenhouseId(940001L)
                                            .standardId(940001L)
                                            .plannedStartDate(sameDate)
                                            .plannedEndDate(sameDate)
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.addCultivationPlan(userDetails, request)
        );
    }

    // =========================================================
    // 4. 작기 정보 변경
    // =========================================================

    @Test
    void 작기_작기명_수정_성공() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        UpdateCultivationPlanRequest request =
                UpdateCultivationPlanRequest.builder()
                                            .planName("Controller 수정 테스트 작기")
                                            .build();

        ResponseEntity<FindCultivationPlanDetailVO> response =
                planController.updateCultivationPlan(
                        userDetails,
                        WAITING_PLAN_ID,
                        request
                );

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        FindCultivationPlanDetailVO result = response.getBody();

        assertNotNull(result);
        assertEquals(WAITING_PLAN_ID, result.getPlanId());
        assertEquals("Controller 수정 테스트 작기", result.getPlanName());
        assertEquals("미진행", result.getPlanStatus());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void 작기_수정_로그인정보없음_예외처리() {
        UpdateCultivationPlanRequest request = validUpdateRequest();

        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.updateCultivationPlan(
                        null,
                        WAITING_PLAN_ID,
                        request
                )
        );
    }

    @Test
    void 작기_수정_PlanId미존재_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        UpdateCultivationPlanRequest request = validUpdateRequest();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.updateCultivationPlan(
                        userDetails,
                        0L,
                        request
                )
        );
    }

    @Test
    void 작기_수정_변경할필드없음_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        UpdateCultivationPlanRequest request =
                UpdateCultivationPlanRequest.builder()
                                            .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.updateCultivationPlan(
                        userDetails,
                        WAITING_PLAN_ID,
                        request
                )
        );
    }

    @Test
    void 진행중인_작기_수정_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        UpdateCultivationPlanRequest request =
                UpdateCultivationPlanRequest.builder()
                                            .planName("진행 중 수정 테스트")
                                            .build();

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.updateCultivationPlan(
                        userDetails,
                        RUNNING_PLAN_ID,
                        request
                )
        );
    }

    // =========================================================
    // 5. 작기 시작
    // =========================================================

    @Test
    void 작기_시작_성공() {
        // Service 테스트와 동일한 시작 가능 샘플 데이터
        Long memberId = 940002L;
        Long planId = 940006L;

        CustomUserDetails userDetails = createUserDetails(memberId);

        ResponseEntity<FindCultivationPlanDetailVO> response =
                planController.startCultivationPlan(userDetails, planId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        FindCultivationPlanDetailVO result = response.getBody();

        assertNotNull(result);
        assertEquals(planId, result.getPlanId());
        assertEquals("진행", result.getPlanStatus());
        assertNotNull(result.getActualStartDate());
    }

    @Test
    void 작기_시작_로그인정보없음_예외처리() {
        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.startCultivationPlan(
                        null,
                        WAITING_PLAN_ID
                )
        );
    }

    @Test
    void 작기_시작_PlanId미존재_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.startCultivationPlan(userDetails, 0L)
        );
    }

    @Test
    void 작기_시작_이미진행중인작기_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.startCultivationPlan(
                        userDetails,
                        RUNNING_PLAN_ID
                )
        );
    }

    @Test
    void 작기_시작_이미종료된작기_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.startCultivationPlan(
                        userDetails,
                        ENDED_PLAN_ID
                )
        );
    }

    // =========================================================
    // 6. 작기 종료
    // =========================================================

    @Test
    void 작기_종료_성공() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        EndCultivationPlanRequest request =
                EndCultivationPlanRequest.builder()
                                         .endReason("Controller 테스트 작기 종료")
                                         .build();

        ResponseEntity<FindCultivationPlanDetailVO> response =
                planController.endCultivationPlan(
                        userDetails,
                        RUNNING_PLAN_ID,
                        request
                );

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        FindCultivationPlanDetailVO result = response.getBody();

        assertNotNull(result);
        assertEquals(RUNNING_PLAN_ID, result.getPlanId());
        assertEquals("종료", result.getPlanStatus());
        assertEquals("Controller 테스트 작기 종료", result.getEndReason());
        assertNotNull(result.getActualStartDate());
        assertNotNull(result.getActualEndDate());
    }

    @Test
    void 작기_종료_로그인정보없음_예외처리() {
        EndCultivationPlanRequest request = validEndRequest();

        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.endCultivationPlan(
                        null,
                        RUNNING_PLAN_ID,
                        request
                )
        );
    }

    @Test
    void 작기_종료_PlanId미존재_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);
        EndCultivationPlanRequest request = validEndRequest();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.endCultivationPlan(
                        userDetails,
                        0L,
                        request
                )
        );
    }

    @Test
    void 작기_종료_종료사유누락_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        EndCultivationPlanRequest request =
                EndCultivationPlanRequest.builder()
                                         .endReason(null)
                                         .build();

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.endCultivationPlan(
                        userDetails,
                        RUNNING_PLAN_ID,
                        request
                )
        );
    }

    @Test
    void 미진행_작기_종료_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        EndCultivationPlanRequest request =
                EndCultivationPlanRequest.builder()
                                         .endReason("미진행 작기 종료 테스트")
                                         .build();

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.endCultivationPlan(
                        userDetails,
                        WAITING_PLAN_ID,
                        request
                )
        );
    }

    @Test
    void 이미종료된_작기_종료_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        EndCultivationPlanRequest request =
                EndCultivationPlanRequest.builder()
                                         .endReason("중복 종료 테스트")
                                         .build();

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.endCultivationPlan(
                        userDetails,
                        ENDED_PLAN_ID,
                        request
                )
        );
    }

    // =========================================================
    // 7. 작기 논리 삭제
    // =========================================================

    @Test
    void 미진행_작기_논리삭제_성공() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        ResponseEntity<Void> response =
                planController.deleteCultivationPlan(
                        userDetails,
                        WAITING_PLAN_ID
                );

        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());

        // 논리 삭제 여부 확인
        FindCultivationPlanDetailVO result =
                planService.findDeletedByMemberIdAndPlanId(
                        MEMBER_ID,
                        WAITING_PLAN_ID
                );

        assertNotNull(result);
        assertEquals(WAITING_PLAN_ID, result.getPlanId());
        assertNotNull(result.getDeletedAt());
    }

    @Test
    void 작기_삭제_로그인정보없음_예외처리() {
        assertExceptionStatus(
                HttpStatus.UNAUTHORIZED,
                () -> planController.deleteCultivationPlan(
                        null,
                        WAITING_PLAN_ID
                )
        );
    }

    @Test
    void 작기_삭제_PlanId미존재_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.BAD_REQUEST,
                () -> planController.deleteCultivationPlan(
                        userDetails,
                        0L
                )
        );
    }

    @Test
    void 진행중인_작기_삭제_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.deleteCultivationPlan(
                        userDetails,
                        RUNNING_PLAN_ID
                )
        );
    }

    @Test
    void 종료된_작기_삭제_예외처리() {
        CustomUserDetails userDetails = createUserDetails(MEMBER_ID);

        assertExceptionStatus(
                HttpStatus.CONFLICT,
                () -> planController.deleteCultivationPlan(
                        userDetails,
                        ENDED_PLAN_ID
                )
        );
    }
}

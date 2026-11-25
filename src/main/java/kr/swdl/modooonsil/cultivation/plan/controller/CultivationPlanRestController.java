package kr.swdl.modooonsil.cultivation.plan.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import kr.swdl.modooonsil.cultivation.plan.domain.dto.CreateCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.EndCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.FindAllCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.dto.UpdateCultivationPlanRequest;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.domain.vo.UpdateCultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.service.CultivationPlanService;
import kr.swdl.modooonsil.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cultivation-plans")
@Validated
public class CultivationPlanRestController {

    private final CultivationPlanService planService;

    /*
     * 1. 작기 목록 조회
     * GET /api/cultivation-plans
     */
    @GetMapping
    public ResponseEntity<List<FindAllCultivationPlanVO>> findAll(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                  @ModelAttribute FindAllCultivationPlanRequest request) {
        Long memberId = requireMemberId(userDetails);

        FindAllCultivationPlanVO searchCondition = FindAllCultivationPlanVO.builder()
                                                                           .memberId(memberId)
                                                                           .planName(request.getPlanName())
                                                                           .greenhouseName(request.getGreenhouseName())
                                                                           .cropName(request.getCropName())
                                                                           .varietyName(request.getVarietyName())
                                                                           .planStatus(request.getPlanStatus())
                                                                           .build();

        List<FindAllCultivationPlanVO> result = planService.findAll(searchCondition);

        return ResponseEntity.ok(result);
    }

    /*
     * 2. 작기 상세 조회
     * GET /api/cultivation-plans/{planId}
     */
    @GetMapping("/{planId}")
    public ResponseEntity<FindCultivationPlanDetailVO> findByPlanId(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                    @PathVariable @Positive Long planId) {
        Long memberId = requireMemberId(userDetails);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);

        return ResponseEntity.ok(result);
    }

    /*
     * 3. 작기 생성
     * POST /api/cultivation-plans
     */
    @PostMapping
    public ResponseEntity<FindCultivationPlanDetailVO> addCultivationPlan(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                          @Valid @RequestBody CreateCultivationPlanRequest request) {
        Long memberId = requireMemberId(userDetails);

        CultivationPlan newPlan = CultivationPlan.builder().memberId(memberId).planName(request.getPlanName())
                                                 .greenhouseId(request.getGreenhouseId())
                                                 .standardId(request.getStandardId())
                                                 .plannedStartDate(request.getPlannedStartDate())
                                                 .plannedEndDate(request.getPlannedEndDate()).build();

        Long planId = planService.addCultivationPlan(newPlan);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);
        
        return ResponseEntity.ok().body(result);
    }

    /*
     * 4. 작기 정보 변경
     * PATCH /api/cultivation-plans/{planId}
     */
    @PatchMapping("/{planId}")
    public ResponseEntity<FindCultivationPlanDetailVO> updateCultivationPlan(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                             @PathVariable @Positive Long planId,
                                                                             @Valid @RequestBody UpdateCultivationPlanRequest request) {
        Long memberId = requireMemberId(userDetails);

        UpdateCultivationPlan updatePlan = UpdateCultivationPlan.builder().memberId(memberId).planId(planId)
                                                                .planName(request.getPlanName())
                                                                .greenhouseId(request.getGreenhouseId())
                                                                .standardId(request.getStandardId())
                                                                .plannedStartDate(request.getPlannedStartDate())
                                                                .plannedEndDate(request.getPlannedEndDate()).build();

        planService.updateCultivationPlan(updatePlan);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);

        return ResponseEntity.ok(result);
    }

    /*
     * 5. 작기 시작
     * POST /api/cultivation-plans/{planId}/start
     */
    @PostMapping("/{planId}/start")
    public ResponseEntity<FindCultivationPlanDetailVO> startCultivationPlan(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable @Positive Long planId) {
        Long memberId = requireMemberId(userDetails);

        planService.updateCultivationPlanStart(memberId, planId);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);

        return ResponseEntity.ok(result);
    }

    /*
     * 6. 작기 종료
     * POST /api/cultivation-plans/{planId}/end
     */
    @PostMapping("/{planId}/end")
    public ResponseEntity<FindCultivationPlanDetailVO> endCultivationPlan(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                          @PathVariable @Positive Long planId,
                                                                          @Valid @RequestBody EndCultivationPlanRequest request) {
        Long memberId = requireMemberId(userDetails);

        CultivationPlan endPlan = CultivationPlan.builder().memberId(memberId).planId(planId)
                                                 .endReason(request.getEndReason()).build();

        planService.updateCultivationPlanEnd(endPlan);

        FindCultivationPlanDetailVO result = planService.findByMemberIdAndPlanId(memberId, planId);

        return ResponseEntity.ok(result);
    }

    /*
     * 7. 작기 논리 삭제
     * DELETE /api/cultivation-plans/{planId}
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deleteCultivationPlan(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                      @PathVariable @Positive Long planId) {
        Long memberId = requireMemberId(userDetails);

        planService.deleteCultivationPlan(memberId, planId);

        return ResponseEntity.noContent().build();
    }

    /*
     * 로그인 회원 ID 조회
     */
    private Long requireMemberId(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getMemberId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보가 없습니다.");
        }

        return userDetails.getMemberId();
    }
}

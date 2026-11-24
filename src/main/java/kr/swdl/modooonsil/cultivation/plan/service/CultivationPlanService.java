package kr.swdl.modooonsil.cultivation.plan.service;

import kr.swdl.modooonsil.cultivation.plan.domain.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.domain.UpdateCultivationPlan;

import kr.swdl.modooonsil.cultivation.plan.repository.CultivationPlanRepository;
import kr.swdl.modooonsil.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CultivationPlanService {

    private final CultivationPlanRepository planRepository;
    private final MemberRepository memberRepository;

    /*
     * 1. 작기 목록 조회
     */
    public List<FindAllCultivationPlanVO> findAll(FindAllCultivationPlanVO vo) {
        if (vo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색 조건이 올바르지 않습니다.");
        }

        existsMemberId(vo.getMemberId());

        return planRepository.findAll(vo);
    }

    /*
     * 2. 작기 상세 조회
     */
    public FindCultivationPlanDetailVO findByMemberIdAndPlanId(Long memberId, Long planId) {
        existsMemberId(memberId);
        validatePlanId(planId);

        FindCultivationPlanDetailVO result = planRepository.findByMemberIdAndPlanId(memberId, planId);

        if (result == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "작기 정보를 찾을 수 없습니다.");
        }

        return result;
    }

    /*
     * 3. 삭제된 작기 조회
     */
    public FindCultivationPlanDetailVO findDeletedByMemberIdAndPlanId(Long memberId, Long planId) {
        existsMemberId(memberId);
        validatePlanId(planId);

        FindCultivationPlanDetailVO result = planRepository.findDeletedByMemberIdAndPlanId(memberId, planId);

        if (result == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제된 작기 정보를 찾을 수 없습니다.");
        }

        return result;
    }

    /*
     * 4. 작기 생성
     */
    @Transactional
    public Long addCultivationPlan(CultivationPlan newCultivationPlan) {
        if (newCultivationPlan == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 생성 정보가 없습니다.");
        }

        existsMemberId(newCultivationPlan.getMemberId());

        validatePlanDates(newCultivationPlan.getPlannedStartDate(), newCultivationPlan.getPlannedEndDate());

        validatePositiveId(newCultivationPlan.getGreenhouseId(), "온실 ID가 올바르지 않습니다.");

        validatePositiveId(newCultivationPlan.getStandardId(), "재배 기준 ID가 올바르지 않습니다.");

        planRepository.addCultivationPlan(newCultivationPlan);

        if (newCultivationPlan.getPlanId() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "작기 생성에 실패했습니다.");
        }

        return newCultivationPlan.getPlanId();
    }

    /*
     * 5. 작기 정보 변경
     */
    @Transactional
    public void updateCultivationPlan(UpdateCultivationPlan updateCultivationPlan) {
        if (updateCultivationPlan == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 수정 정보가 없습니다.");
        }

        existsMemberId(updateCultivationPlan.getMemberId());

        validatePlanId(updateCultivationPlan.getPlanId());

        // 변경할 필드가 하나도 없는 경우
        if (updateCultivationPlan.getPlanName() == null && updateCultivationPlan.getGreenhouseId() == null &&
                updateCultivationPlan.getStandardId() == null && updateCultivationPlan.getPlannedStartDate() == null && updateCultivationPlan.getPlannedEndDate() == null) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 정보가 없습니다.");
        }

        FindCultivationPlanDetailVO current = findByMemberIdAndPlanId(updateCultivationPlan.getMemberId(), updateCultivationPlan.getPlanId());

        // 미진행 상태에서만 수정 허용
        if (!"미진행".equals(current.getPlanStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "미진행 상태의 작기만 수정할 수 있습니다.");
        }

        // 예정일 변경 시 기존 값을 활용
        LocalDateTime startDate = updateCultivationPlan.getPlannedStartDate() != null ? updateCultivationPlan.getPlannedStartDate() : current.getPlannedStartDate();

        LocalDateTime endDate = updateCultivationPlan.getPlannedEndDate() != null ? updateCultivationPlan.getPlannedEndDate() : current.getPlannedEndDate();

        validatePlanDates(startDate, endDate);

        if (updateCultivationPlan.getGreenhouseId() != null) {
            validatePositiveId(updateCultivationPlan.getGreenhouseId(), "온실 ID가 올바르지 않습니다.");
        }

        if (updateCultivationPlan.getStandardId() != null) {
            validatePositiveId(updateCultivationPlan.getStandardId(), "재배 기준 ID가 올바르지 않습니다.");
        }

        planRepository.updateCultivationPlan(updateCultivationPlan);
    }

    /*
     * 6. 작기 시작
     */
    @Transactional
    public void updateCultivationPlanStart(Long memberId, Long planId) {
        existsMemberId(memberId);
        validatePlanId(planId);

        FindCultivationPlanDetailVO current = findByMemberIdAndPlanId(memberId, planId);

        if (!"미진행".equals(current.getPlanStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "미진행 상태의 작기만 시작할 수 있습니다.");
        }

        planRepository.updateCultivationPlanStart(memberId, planId);
    }

    /*
     * 7. 작기 종료
     */
    @Transactional
    public void updateCultivationPlanEnd(CultivationPlan endCultivationPlan) {
        if (endCultivationPlan == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 종료 정보가 없습니다.");
        }

        existsMemberId(endCultivationPlan.getMemberId());

        validatePlanId(endCultivationPlan.getPlanId());

        if (endCultivationPlan.getEndReason() == null || endCultivationPlan.getEndReason().isBlank()) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 종료 사유를 입력해야 합니다.");
        }

        FindCultivationPlanDetailVO current = findByMemberIdAndPlanId(endCultivationPlan.getMemberId(), endCultivationPlan.getPlanId());

        if (!"진행".equals(current.getPlanStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 작기만 종료할 수 있습니다.");
        }

        planRepository.updateCultivationPlanEnd(endCultivationPlan);
    }

    /*
     * 8. 작기 논리 삭제
     */
    @Transactional
    public void deleteCultivationPlan(Long memberId, Long planId) {
        existsMemberId(memberId);
        validatePlanId(planId);

        FindCultivationPlanDetailVO current = findByMemberIdAndPlanId(memberId, planId);

        if (!"미진행".equals(current.getPlanStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "미진행 상태의 작기만 삭제할 수 있습니다.");
        }

        planRepository.deleteCultivationPlan(memberId, planId);
    }

    /*
     * 공통 검증
     */
    private void existsMemberId(Long memberId) {
        if (memberId == null || memberRepository.findMemberByMemberId(memberId) == null) {

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자 인증 정보가 올바르지 않습니다.");
        }
    }

    private void validatePlanId(Long planId) {
        validatePositiveId(planId, "작기 ID가 올바르지 않습니다.");
    }

    private void validatePositiveId(Long id, String message) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private void validatePlanDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 예정 시작일과 종료일은 필수입니다.");
        }

        if (!startDate.isBefore(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작기 예정 종료일은 시작일보다 늦어야 합니다.");
        }
    }
}

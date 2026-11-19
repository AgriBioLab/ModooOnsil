package kr.swdl.modooonsil.cultivation.plan.repository;

import kr.swdl.modooonsil.cultivation.plan.domain.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.domain.UpdateCultivationPlan;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CultivationPlanRepository {
    List<FindAllCultivationPlanVO> findAll(FindAllCultivationPlanVO vo);
    FindCultivationPlanDetailVO findByMemberIdAndPlanId(Long memberId, Long planId);
    FindCultivationPlanDetailVO findDeletedByMemberIdAndPlanId(Long memberId, Long planId);
    void addCultivationPlan(CultivationPlan newCultivationPlan);
    void updateCultivationPlan(UpdateCultivationPlan updateCultivationPlan);
    void updateCultivationPlanStart(Long memberId, Long planId);
    void updateCultivationPlanEnd(CultivationPlan endCultivationPlan);
    void deleteCultivationPlan(Long memberId, Long planId);
}

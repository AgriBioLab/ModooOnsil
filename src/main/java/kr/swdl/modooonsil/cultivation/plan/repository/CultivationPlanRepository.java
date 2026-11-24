package kr.swdl.modooonsil.cultivation.plan.repository;

import kr.swdl.modooonsil.cultivation.plan.domain.CultivationPlan;
import kr.swdl.modooonsil.cultivation.plan.domain.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.domain.UpdateCultivationPlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CultivationPlanRepository {
    List<FindAllCultivationPlanVO> findAll(FindAllCultivationPlanVO vo);

    FindCultivationPlanDetailVO findByMemberIdAndPlanId(@Param("memberId") Long memberId, @Param("planId") Long planId);

    FindCultivationPlanDetailVO findDeletedByMemberIdAndPlanId(@Param("memberId") Long memberId, @Param("planId") Long planId);

    void addCultivationPlan(CultivationPlan newCultivationPlan);

    void updateCultivationPlan(UpdateCultivationPlan updateCultivationPlan);

    void updateCultivationPlanStart(@Param("memberId") Long memberId, @Param("planId") Long planId);

    void updateCultivationPlanEnd(CultivationPlan endCultivationPlan);

    void deleteCultivationPlan(@Param("memberId") Long memberId, @Param("planId") Long planId);

    boolean existsOngoingPlanInSameGreenhouse(@Param("memberId") Long memberId, @Param("planId") Long planId);
}

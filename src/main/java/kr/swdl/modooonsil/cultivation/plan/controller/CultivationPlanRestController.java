package kr.swdl.modooonsil.cultivation.plan.controller;

import kr.swdl.modooonsil.cultivation.plan.domain.FindAllCultivationPlanVO;
import kr.swdl.modooonsil.cultivation.plan.domain.FindCultivationPlanDetailVO;
import kr.swdl.modooonsil.cultivation.plan.service.CultivationPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cultivation-plans")
public class CultivationPlanRestController {

    private final CultivationPlanService planService;

    @GetMapping("/")
    public ResponseEntity<List<FindAllCultivationPlanVO>> findAll(@RequestBody FindAllCultivationPlanVO vo) {
        List<FindAllCultivationPlanVO> list = planService.findAll(vo);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<FindCultivationPlanDetailVO> cultivationPlanDetail(Long memberId, @RequestParam("planId") Long planId) {
        FindCultivationPlanDetailVO detail = planService.findByMemberIdAndPlanId(memberId, planId);
        return ResponseEntity.ok(detail);
    }
}

package kr.swdl.modooonsil.cultivation.plan.domain.vo;

import kr.swdl.modooonsil.common.BaseEntity;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FindCultivationPlanDetailVO extends BaseEntity {
    private Long planId;
    private String planName;
    private String greenhouseName;
    private String cropName;
    private String varietyName;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private String planStatus;
    private String endReason;
}

package kr.swdl.modooonsil.cultivation.plan.domain.vo;

import kr.swdl.modooonsil.common.BaseEntity;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CultivationPlan extends BaseEntity {
    private Long planId;
    private Long greenhouseId;
    private Long memberId;
    private Long standardId;
    private String planName;
    private String planStatus;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private String endReason;
}

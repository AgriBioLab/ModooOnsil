package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CultivationPlan {
    private Long planId;
    private Long greenhouseId;
    private Long memberId;
    private Long standardId;
    private String planName;
    private String planStatus;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private LocalDateTime createdAt;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private String endReason;
}

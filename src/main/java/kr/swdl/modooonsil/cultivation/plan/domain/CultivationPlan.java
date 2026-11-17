package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CultivationPlan {
    Long planId;
    Long greenhouseId;
    Long memberId;
    Long standardId;
    String planName;
    String planStatus;
    LocalDateTime plannedStartDate;
    LocalDateTime plannedEndDate;
    LocalDateTime createdAt;
    LocalDateTime actualStartDate;
    LocalDateTime actualEndDate;
    String endReason;
}

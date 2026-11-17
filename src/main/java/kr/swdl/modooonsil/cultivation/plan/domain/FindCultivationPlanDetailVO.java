package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FindCultivationPlanDetailVO {
    Long planId;
    String planName;
    String greenhouseName;
    String cropName;
    String varietyName;
    LocalDateTime plannedStartDate;
    LocalDateTime plannedEndDate;
    LocalDateTime actualStartDate;
    LocalDateTime actualEndDate;
    String planStatus;
    String endReason;
}

package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCultivationPlan {
    private Long memberId;
    private Long planId;
    private Long greenhouseId;
    private Long standardId;
    private String planName;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private LocalDateTime updatedAt;
}

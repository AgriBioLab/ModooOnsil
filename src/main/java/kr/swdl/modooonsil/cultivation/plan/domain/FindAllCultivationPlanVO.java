package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FindAllCultivationPlanVO {
    private Long memberId;
    private Long planId;
    private String planName;
    private String greenhouseName ;
    private String cropName ;
    private String varietyName ;
    private String planStatus ;
    private LocalDateTime plannedStartDate ;
    private LocalDateTime plannedEndDate;
}

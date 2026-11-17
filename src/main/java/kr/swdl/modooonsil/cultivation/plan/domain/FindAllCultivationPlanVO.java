package kr.swdl.modooonsil.cultivation.plan.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FindAllCultivationPlanVO {
    Long memberId;
    Long planId;
    String planName;
    String greenhouseName ;
    String cropName ;
    String varietyName ;
    String planStatus ;
    LocalDateTime plannedStartDate ;
    LocalDateTime plannedEndDate;
}

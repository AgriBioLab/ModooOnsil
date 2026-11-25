package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FindAllCultivationPlanRequest {

    private String planName;

    private String greenhouseName;

    private String cropName;

    private String varietyName;

    private String planStatus;
}
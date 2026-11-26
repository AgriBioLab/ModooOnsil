package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
public class FindAllCultivationPlanRequest {

    private final String planName;

    private final String greenhouseName;

    private final String cropName;

    private final String varietyName;

    private final String planStatus;
}

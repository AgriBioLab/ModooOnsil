package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FindAllCultivationPlanRequest {

    private String planName;

    private String greenhouseName;

    private String cropName;

    private String varietyName;

    private String planStatus;
}
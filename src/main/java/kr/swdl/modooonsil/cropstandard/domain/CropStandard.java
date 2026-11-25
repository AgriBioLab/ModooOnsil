package kr.swdl.modooonsil.cropstandard.domain;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CropStandard {
    private Long cropId;
    public String cropName;
    public String varietyName;
    private Long standardId;
    private String growthStage;
    private Integer stageOrder;
    private Integer stageDurationDays;
    private Double dayTempMin;
    private Double dayTempMax;
    private Double nightTempMin;
    private Double nightTempMax;
    private Double humidityMin;
    private Double humidityMax;
    private Double co2Min;
    private Double co2Max;
    private Double radiationMin;
    private Double radiationMax;
    private Double lightMin;
    private Double lightMax;
    private Double soilTempMin;
    private Double soilTempMax;
    private Double soilMoistureMin;
    private Double soilMoistureMax;
    private Double soilEcMin;
    private Double soilEcMax;
    private Double soilPhMin;
    private Double soilPhMax;
}

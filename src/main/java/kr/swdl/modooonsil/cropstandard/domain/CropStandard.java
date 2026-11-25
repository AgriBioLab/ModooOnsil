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
    private BigDecimal dayTempMin;
    private BigDecimal dayTempMax;
    private BigDecimal nightTempMin;
    private BigDecimal nightTempMax;
    private BigDecimal humidityMin;
    private BigDecimal humidityMax;
    private BigDecimal co2Min;
    private BigDecimal co2Max;
    private BigDecimal radiationMin;
    private BigDecimal radiationMax;
    private BigDecimal lightMin;
    private BigDecimal lightMax;
    private BigDecimal soilTempMin;
    private BigDecimal soilTempMax;
    private BigDecimal soilMoistureMin;
    private BigDecimal soilMoistureMax;
    private BigDecimal soilEcMin;
    private BigDecimal soilEcMax;
    private BigDecimal soilPhMin;
    private BigDecimal soilPhMax;
}

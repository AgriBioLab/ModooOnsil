package kr.swdl.modooonsil.greenhouse.domain;

import kr.swdl.modooonsil.common.BaseEntity;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentHistory {
    private Long environmentHistoryId;
    private Long planId;
    private LocalDateTime measuredAt;
    private Double temperature;
    private Double humidity;
    private Double co2;
    private Double radiation;
    private Double light;
    private Double soilTemperature;
    private Double soilMoisture;
    private Double soilEc;
    private Double soilPh;
}

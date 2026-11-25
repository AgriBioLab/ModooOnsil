package kr.swdl.modooonsil.greenhouse.domain;

import kr.swdl.modooonsil.common.BaseEntity;
import lombok.*;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Greenhouse extends BaseEntity {
    private Long greenhouseId;
    private Long memberId;
    private String greenhouseName;
    private String greenhouseType;
    private String coverType;
    private Integer buildingCount;
    private Double sideHeight;
    private Double width;
    private Double length;
    private Double registeredArea;
    private String mediumType;
    private String greenhouseImageUrl;
}

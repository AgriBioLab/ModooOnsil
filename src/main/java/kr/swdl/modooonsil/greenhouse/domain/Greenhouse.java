package kr.swdl.modooonsil.greenhouse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Greenhouse {
    public Long greenhouseId;
    public Long memberId;
    public String greenhouseName;
    public LocalDateTime createdAt;
    public String greenhouseType;
    public String coverType;
    public Integer buildingCount;
    public Double sideHeight;
    public Double width;
    public Double length;
    public Double registeredArea;
    public String mediumType;
    public String greenhouseImageUrl;
    public LocalDateTime updatedAt;
}

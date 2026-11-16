package kr.swdl.modooonsil.greenhouse.domain;

import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@ToString
public class Greenhouse {
    public Long greenhouseId;
    public Long memberId;
    public String greenhouseName;
    public LocalDateTime createdAt;
    public String greenhouseType;
    public String coverType;
    public Integer buildingCount;
    public BigDecimal sideHeight;
    public BigDecimal width;
    public BigDecimal length;
    public BigDecimal registeredArea;
    public String mediumType;
    public String greenhouseImageUrl;
    public LocalDateTime updatedAt;
}

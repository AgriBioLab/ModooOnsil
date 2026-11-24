package kr.swdl.modooonsil.member.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {
    private final String id;
    private final String username;
    private final String displayName;
    private final String farmName;
    private final String certification;
    private final String businessNumber;
    private final String email;
    private final String phone;
    private final String address;
    private final String addressDetail;
    private final String mainCrop;
    private final String description;
    private final LocalDateTime createdAt;
}

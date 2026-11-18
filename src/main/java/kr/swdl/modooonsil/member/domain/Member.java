package kr.swdl.modooonsil.member.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    private Long memberId;
    private String farmName;
    private String representativeName;
    private String username;
    private String password;
    private LocalDateTime createdAt;
    private String phoneNumber;
    private String email;
    private String farmAddress;
    private String farmAddressDetail;
    private String mainCrop;
    private String farmDescription;
    private LocalDateTime certifiedAt;
    private LocalDateTime updatedAt;
    private String farmBusinessNumber;
    private String certificationStatus;
    private LocalDateTime deletedAt;
}

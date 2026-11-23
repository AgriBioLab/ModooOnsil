package kr.swdl.modooonsil.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberRegistrationRequest {
    @NotBlank
    @Size(max = 100)
    private String farmName;
    @NotBlank
    @Size(max = 50)
    private String displayName;
    @NotBlank
    @Pattern(regexp = "[a-z][a-z0-9]{5,19}")
    private String username;
    @NotBlank
    @Size(min = 8, max = 20)
    private String password;
    @Email
    @Size(max = 255)
    private String email;
    @Size(max = 20)
    private String phone;
    @Size(max = 255)
    private String address;
    @Size(max = 255)
    private String addressDetail;
    @Size(max = 100)
    private String mainCrop;
    @Size(max = 500)
    private String description;
    @Size(max = 20)
    private String businessNumber;
}

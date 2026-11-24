package kr.swdl.modooonsil.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberPasswordChangeRequest {
    @NotBlank
    @Size(max = 20)
    private String currentPassword;

    @NotBlank
    @Size(min = 8, max = 20)
    private String newPassword;
}

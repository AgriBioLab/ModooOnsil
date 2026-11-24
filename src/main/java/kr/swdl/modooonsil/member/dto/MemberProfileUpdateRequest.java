package kr.swdl.modooonsil.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberProfileUpdateRequest {
    @NotBlank
    @Size(max = 50)
    private String displayName;

    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 20)
    private String phone;
}

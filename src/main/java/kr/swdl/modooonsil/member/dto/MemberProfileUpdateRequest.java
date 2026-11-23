package kr.swdl.modooonsil.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberProfileUpdateRequest(
        @NotBlank @Size(max = 50) String displayName,
        @Email @Size(max = 255) String email,
        @Size(max = 20) String phone
) {}

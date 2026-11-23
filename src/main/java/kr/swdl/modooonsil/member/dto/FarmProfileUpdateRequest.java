package kr.swdl.modooonsil.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FarmProfileUpdateRequest(
        @NotBlank @Size(max = 100) String farmName,
        @Size(max = 255) String address,
        @Size(max = 255) String addressDetail,
        @Size(max = 100) String mainCrop,
        @Size(max = 500) String description
) {}

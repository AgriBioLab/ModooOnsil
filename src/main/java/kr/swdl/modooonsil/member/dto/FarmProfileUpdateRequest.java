package kr.swdl.modooonsil.member.dto;

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
public class FarmProfileUpdateRequest {
    @NotBlank
    @Size(max = 100)
    private String farmName;

    @Size(max = 255)
    private String address;

    @Size(max = 255)
    private String addressDetail;

    @Size(max = 100)
    private String mainCrop;

    @Size(max = 500)
    private String description;
}

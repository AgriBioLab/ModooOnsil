package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EndCultivationPlanRequest {

    @NotBlank(message = "작기 종료 사유를 입력해야 합니다.")
    @Size(max = 1000, message = "작기 종료 사유는 1000자 이하여야 합니다.")
    private String endReason;
}
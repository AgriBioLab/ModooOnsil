package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCultivationPlanRequest {

    @Pattern(
            regexp = ".*\\S.*",
            message = "작기명은 공백만 입력할 수 없습니다."
    )
    @Size(max = 100, message = "작기명은 100자 이하여야 합니다.")
    private String planName;

    @Positive(message = "온실 ID는 양수여야 합니다.")
    private Long greenhouseId;

    @Positive(message = "재배 기준 ID는 양수여야 합니다.")
    private Long standardId;

    private LocalDateTime plannedStartDate;

    private LocalDateTime plannedEndDate;

    @AssertTrue(message = "변경할 정보를 하나 이상 입력해야 합니다.")
    public boolean isAtLeastOneFieldProvided() {
        return planName != null
                || greenhouseId != null
                || standardId != null
                || plannedStartDate != null
                || plannedEndDate != null;
    }
}
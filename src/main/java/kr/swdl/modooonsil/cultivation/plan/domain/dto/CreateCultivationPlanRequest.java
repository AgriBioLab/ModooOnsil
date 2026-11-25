package kr.swdl.modooonsil.cultivation.plan.domain.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateCultivationPlanRequest {

    @NotBlank(message = "작기명을 입력해야 합니다.")
    @Size(max = 100, message = "작기명은 100자 이하여야 합니다.")
    private String planName;

    @NotNull(message = "온실 ID를 입력해야 합니다.")
    @Positive(message = "온실 ID는 양수여야 합니다.")
    private Long greenhouseId;

    @NotNull(message = "재배 기준 ID를 입력해야 합니다.")
    @Positive(message = "재배 기준 ID는 양수여야 합니다.")
    private Long standardId;

    @NotNull(message = "예정 시작일을 입력해야 합니다.")
    private LocalDateTime plannedStartDate;

    @NotNull(message = "예정 종료일을 입력해야 합니다.")
    private LocalDateTime plannedEndDate;

    @AssertTrue(message = "예정 종료일은 예정 시작일보다 늦어야 합니다.")
    public boolean isValidPlanDateRange() {
        if (plannedStartDate == null || plannedEndDate == null) {
            return true;
        }

        return plannedStartDate.isBefore(plannedEndDate);
    }
}
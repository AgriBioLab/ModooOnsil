package kr.swdl.modooonsil.cultivation.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequest {
    private Long planId;
    private LocalDate workedDate;
    private String growthStage;
    private String stageChangeReason;
    private List<TaskInput> tasks;
}

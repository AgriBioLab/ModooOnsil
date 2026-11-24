package kr.swdl.modooonsil.cultivation.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskInput {
    private Long taskId;
    private String taskName;
    private String taskType;
    private LocalDateTime taskTime;
    private String taskStatus;
    private String taskContent;
}

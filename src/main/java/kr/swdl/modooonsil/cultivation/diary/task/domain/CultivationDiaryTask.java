package kr.swdl.modooonsil.cultivation.diary.task.domain;

import kr.swdl.modooonsil.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CultivationDiaryTask extends BaseEntity {
    private Long taskId;
    private Long diaryId;
    private String taskType;
    private String taskName;
    private LocalDateTime taskTime;
    private String taskStatus;
    private String taskContent;
}

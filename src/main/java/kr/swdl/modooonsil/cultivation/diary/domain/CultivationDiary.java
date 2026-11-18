package kr.swdl.modooonsil.cultivation.diary.domain;

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
public class CultivationDiary extends BaseEntity {
    private Long diaryId;
    private Long planId;
    private LocalDateTime workedAt;
    private String growthStage;
    private String stageChangeReason;
}

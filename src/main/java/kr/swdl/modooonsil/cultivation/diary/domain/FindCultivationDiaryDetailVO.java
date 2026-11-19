package kr.swdl.modooonsil.cultivation.diary.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class FindCultivationDiaryDetailVO {
    private Long diaryId;
    private String planName;
    private String cropName;
    private String varietyName;
    private String greenhouseName;
    private LocalDateTime workedAt;
    private String growthStage;
    private String stageChangeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

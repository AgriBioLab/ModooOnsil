package kr.swdl.modooonsil.cultivation.diary.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class FindAllCultivationDiaryVO {
    private Long diaryId;
    private LocalDateTime workedAt;
    private String cropName;
    private String varietyName;
    private String planName;
    private String greenhouseName;
    private String growthStage;
    private int taskCount;
    private int incompleteTaskCount;
}

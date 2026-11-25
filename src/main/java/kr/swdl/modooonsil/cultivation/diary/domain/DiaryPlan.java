package kr.swdl.modooonsil.cultivation.diary.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaryPlan {
    private Long planId;
    private String planName;
    private String greenhouseName;
    private String cropName;
    private String varietyName;
    private LocalDateTime actualStartDate;
}

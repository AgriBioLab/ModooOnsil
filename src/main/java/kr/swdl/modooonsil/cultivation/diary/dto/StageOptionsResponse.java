package kr.swdl.modooonsil.cultivation.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StageOptionsResponse {
    private final String currentStage;
    private final String nextStage;
    private final boolean duplicate;
}

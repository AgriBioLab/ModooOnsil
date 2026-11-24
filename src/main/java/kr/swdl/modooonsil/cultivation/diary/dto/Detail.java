package kr.swdl.modooonsil.cultivation.diary.dto;

import kr.swdl.modooonsil.cultivation.diary.domain.FindCultivationDiaryDetailVO;
import kr.swdl.modooonsil.cultivation.diary.task.domain.CultivationDiaryTask;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class Detail {
    private final FindCultivationDiaryDetailVO diary;
    private final List<CultivationDiaryTask> tasks;
}

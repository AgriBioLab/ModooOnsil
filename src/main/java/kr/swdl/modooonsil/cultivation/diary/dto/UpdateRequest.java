package kr.swdl.modooonsil.cultivation.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRequest {
    private List<TaskInput> tasks;
}

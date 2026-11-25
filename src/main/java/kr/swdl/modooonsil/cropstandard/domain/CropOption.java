package kr.swdl.modooonsil.cropstandard.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public final class CropOption {
    private final Long cropId;
    private final String cropName;
    private final String varietyName;
}

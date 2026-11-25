package kr.swdl.modooonsil.cropstandard.service;

import kr.swdl.modooonsil.cropstandard.domain.CropOption;
import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import kr.swdl.modooonsil.cropstandard.repository.CropStandardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CropStandardService {

    private final CropStandardRepository cropStandardRepository;

    public List<CropOption> findCrops() {
        return cropStandardRepository.findCrops();
    }

    public List<CropStandard> findCropStandardByCropId(Long cropId) {
        return cropStandardRepository.findCropStandardByCropId(cropId);
    }
}

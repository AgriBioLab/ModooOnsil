package kr.swdl.modooonsil.cropstandard.service;

import kr.swdl.modooonsil.cropstandard.domain.CropOption;
import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class CropStandardServiceTest {

    private static final Long ROSE_CROP_ID = 940001L;

    @Autowired
    private CropStandardService service;

    @Test
    void 품목과_품종_선택_목록을_조회한다() {
        CropOption crop = service.findCrops().stream()
                .filter(option -> ROSE_CROP_ID.equals(option.getCropId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Expected crop ID " + ROSE_CROP_ID));

        assertEquals("장미", crop.getCropName());
        assertEquals("레드나오미", crop.getVarietyName());
    }

    @Test
    void 선택한_품목의_환경기준을_생육단계_순서대로_조회한다() {
        List<CropStandard> standards = service.findCropStandardByCropId(ROSE_CROP_ID);
        List<Integer> stageOrders = standards.stream().map(CropStandard::getStageOrder).toList();

        assertEquals(3, standards.size());
        assertTrue(standards.stream().allMatch(standard -> ROSE_CROP_ID.equals(standard.getCropId())));
        assertEquals(stageOrders.stream().sorted(Comparator.nullsLast(Comparator.naturalOrder())).toList(),
                stageOrders);
    }

    @Test
    void 존재하지_않는_품목의_환경기준을_조회하면_빈_목록을_반환한다() {
        assertTrue(service.findCropStandardByCropId(-1L).isEmpty());
    }
}

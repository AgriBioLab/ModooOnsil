package kr.swdl.modooonsil.cropstandard.repository;

import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CropStandardRepositoryTest {

    @Autowired
    CropStandardRepository cropStandardRepository;

    @Test
    void 환경기준_조회_성공() {
        Long cropId = 940001L;

        List<CropStandard> cropStandardList =  cropStandardRepository.findCropStandardByCropId(cropId);

        assertFalse(cropStandardList.isEmpty());
        assertEquals(3, cropStandardList.size());

        for (CropStandard cropStandard : cropStandardList) {
            assertEquals("장미", cropStandard.getCropName());
            assertEquals("레드나오미", cropStandard.getVarietyName());
        }
    }
}
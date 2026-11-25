package kr.swdl.modooonsil.cropstandard.repository;

import kr.swdl.modooonsil.cropstandard.domain.CropOption;
import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CropStandardRepository {
    List<CropOption> findCrops();

    List<CropStandard> findCropStandardByCropId(@Param("cropId") Long cropId);
}

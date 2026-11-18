package kr.swdl.modooonsil.cropstandard.repository;

import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CropStandardRepository {
    List<CropStandard> findCropStandardByCropId(Long cropId);
}

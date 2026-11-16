package kr.swdl.modooonsil.repository;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FarmMapper {
    Map<String, Object> profile(Map<String, Object> parameters);

    Map<String, Object> credentials(Map<String, Object> parameters);

    Map<String, Object> passwordByMember(Map<String, Object> parameters);

    int countUsername(Map<String, Object> parameters);

    int countEmail(Map<String, Object> parameters);

    int insertMember(Map<String, Object> parameters);

    int updateMember(Map<String, Object> parameters);

    int updatePassword(Map<String, Object> parameters);

    List<Map<String, Object>> greenhouses(Map<String, Object> parameters);

    Map<String, Object> greenhouse(Map<String, Object> parameters);

    Long lockGreenhouse(Map<String, Object> parameters);

    int insertGreenhouse(Map<String, Object> parameters);

    int updateGreenhouse(Map<String, Object> parameters);

    int deleteGreenhouse(Map<String, Object> parameters);

    List<Map<String, Object>> crops(Map<String, Object> parameters);

    Map<String, Object> crop(Map<String, Object> parameters);

    Long lockCrop(Map<String, Object> parameters);

    int insertCrop(Map<String, Object> parameters);

    int updateCrop(Map<String, Object> parameters);

    int deleteCrop(Map<String, Object> parameters);

    List<Map<String, Object>> standards(Map<String, Object> parameters);

    Map<String, Object> standard(Map<String, Object> parameters);

    Map<String, Object> lockStandard(Map<String, Object> parameters);

    int countStageOrder(Map<String, Object> parameters);

    int countStageName(Map<String, Object> parameters);

    int insertStandard(Map<String, Object> parameters);

    int updateStandard(Map<String, Object> parameters);

    int deleteStandard(Map<String, Object> parameters);
}

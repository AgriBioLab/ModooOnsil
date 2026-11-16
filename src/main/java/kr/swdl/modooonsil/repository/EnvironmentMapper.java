package kr.swdl.modooonsil.repository;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EnvironmentMapper {
    List<Map<String, Object>> readings(Map<String, Object> parameters);

    Map<String, Object> reading(Map<String, Object> parameters);

    List<Map<String, Object>> issues(Map<String, Object> parameters);

    Map<String, Object> issue(Map<String, Object> parameters);

    int insertReading(Map<String, Object> parameters);

    int insertIssue(Map<String, Object> parameters);

    Map<String, Object> existingDeviceReading(Map<String, Object> parameters);

    int startIssue(Map<String, Object> parameters);

    int finishIssue(Map<String, Object> parameters);

    int updateAction(Map<String, Object> parameters);
}

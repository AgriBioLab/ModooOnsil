package kr.swdl.modooonsil.greenhouse.repository;

import kr.swdl.modooonsil.greenhouse.domain.EnvironmentHistory;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface EnvironmentHistoryRepository {
    List<EnvironmentHistory> findEnvironmentsByPlanId(Long planId, LocalDateTime startDate, LocalDateTime endDate);
    EnvironmentHistory findCurrentEnvironmentByPlanId(Long planId);
    void addEnvironmentHistory(EnvironmentHistory environmentHistory);
}

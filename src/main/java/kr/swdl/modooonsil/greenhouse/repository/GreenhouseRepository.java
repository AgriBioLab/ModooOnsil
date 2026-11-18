package kr.swdl.modooonsil.greenhouse.repository;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GreenhouseRepository {
    List<Greenhouse> findAll(Long memberId, String greenhouseName, String greenhouseType, String coverType, String mediumType);

    Greenhouse findById(Long memberId, Long greenhouseId);

    void addGreenhouse(Greenhouse greenhouse);

    void updateGreenhouse(Greenhouse greenhouse);

    void deleteGreenhouseById(Long memberId, Long greenhouseId);
}

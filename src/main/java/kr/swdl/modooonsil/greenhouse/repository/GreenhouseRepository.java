
package kr.swdl.modooonsil.greenhouse.repository;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GreenhouseRepository {

    List<Greenhouse> findAll(
            @Param("memberId") Long memberId,
            @Param("greenhouseName") String greenhouseName,
            @Param("greenhouseType") String greenhouseType,
            @Param("coverType") String coverType,
            @Param("mediumType") String mediumType
    );

    Greenhouse findById(
            @Param("memberId") Long memberId,
            @Param("greenhouseId") Long greenhouseId
    );

    void addGreenhouse(Greenhouse greenhouse);

    void updateGreenhouse(Greenhouse greenhouse);

    void deleteGreenhouseById(
            @Param("memberId") Long memberId,
            @Param("greenhouseId") Long greenhouseId
    );
}

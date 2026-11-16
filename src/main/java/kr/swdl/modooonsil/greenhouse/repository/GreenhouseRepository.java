package kr.swdl.modooonsil.greenhouse.repository;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface GreenhouseRepository {
    List<Greenhouse> findAll(long memberId);
}

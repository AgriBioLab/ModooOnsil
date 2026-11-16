package kr.swdl.modooonsil.repository;

import kr.swdl.modooonsil.greenhouse.repository.GreenhouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class GreenhouseRepositoryTest {

    @Autowired
    GreenhouseRepository repository;

    long memberId = 940001L;

    @Test
    void 온실_목록_조회() {
        System.out.println(repository.findAll(memberId));
    }
}

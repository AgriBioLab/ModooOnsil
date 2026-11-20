package kr.swdl.modooonsil.greenhouse;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import kr.swdl.modooonsil.greenhouse.repository.GreenhouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class GreenhouseRepositoryTest {

    @Autowired
    GreenhouseRepository repository;

    Greenhouse greenhouse = Greenhouse.builder()
            .memberId(940001L)
            .greenhouseId(940002L)
            .greenhouseName("시연 1온실")
            .greenhouseType("단동")
            .coverType("비닐")
            .mediumType("코코")
            .buildingCount(3)
            .sideHeight(4.50)
            .width(24.00)
            .length(50.00)
            .registeredArea(1200.00)
            .mediumType("코코피트")
            .build();

    @Test
    void 온실_목록_조회_성공() {
        assertThat(repository.findAll(greenhouse.getMemberId(), null, null, null, null)).isNotEmpty();
        assertThat(repository.findAll(greenhouse.getMemberId(), greenhouse.getGreenhouseName(), null, null, null)).isNotEmpty();
        assertThat(repository.findAll(greenhouse.getMemberId(), null, greenhouse.getGreenhouseType(), null, null)).isNotEmpty();
        assertThat(repository.findAll(greenhouse.getMemberId(), null, null, greenhouse.getCoverType(), null)).isNotEmpty();
        assertThat(repository.findAll(greenhouse.getMemberId(), null, null, null, greenhouse.getMediumType())).isNotEmpty();
    }

    @Test
    void 존재하지_않는_회원의_온실목록은_조회할_수_없다() {
        assertThat(repository.findAll(1L, null, null, null, null)).isEmpty();
    }


    @Test
    void 온실_상세_조회_성공() {
        assertThat(repository.findById(greenhouse.getMemberId(), greenhouse.getGreenhouseId())).isNotNull();
    }

    @Test
    void 존재하지_않는_회원의_온실상세는_조회할_수_없다() {
        assertThat(repository.findById(1L, 2L)).isNull();
    }

    @Test
    @Transactional
    void 온실_정보_등록() {
        Greenhouse newGreenhouse = Greenhouse.builder()
                .memberId(940001L)
                .greenhouseName("등록 테스트 2온실")
                .greenhouseType("단동")
                .coverType("유리")
                .buildingCount(2)
                .sideHeight(3.80)
                .width(12.00)
                .length(35.00)
                .registeredArea(840.00)
                .mediumType("수태")
                .build();

        repository.addGreenhouse(newGreenhouse);
        Long generatedId = newGreenhouse.getGreenhouseId();
        Greenhouse saved = repository.findById(newGreenhouse.getMemberId(), generatedId);

        assertThat(saved).isNotNull();
        assertThat(saved.getGreenhouseId()).isEqualTo(generatedId);
    }

    @Test
    @Transactional
    void 존재하지_않는_회원의_온실은_등록할_수_없다() {
        Greenhouse newGreenhouse = Greenhouse.builder()
                .memberId(-1L)
                .greenhouseName("등록 실패 테스트 온실")
                .greenhouseType("단동")
                .coverType("유리")
                .buildingCount(2)
                .sideHeight(3.80)
                .width(12.00)
                .length(35.00)
                .registeredArea(840.00)
                .mediumType("수태")
                .build();


        assertThrows(
                DataIntegrityViolationException.class,
                () -> repository.addGreenhouse(newGreenhouse)
        );

    }

    @Test
    @Transactional
    void 온실_정보_수정() {
        greenhouse.setGreenhouseName("수정 후 온실");
        greenhouse.setCoverType("유리");

        repository.updateGreenhouse(greenhouse);

        Greenhouse saved = repository.findById(
                greenhouse.getMemberId(),
                greenhouse.getGreenhouseId()
        );

        assertThat(saved).isNotNull();
        assertThat(saved.getGreenhouseName()).isEqualTo("수정 후 온실");
        assertThat(saved.getCoverType()).isEqualTo("유리");
    }

    @Test
    @Transactional
    void 다른_회원의_온실은_수정할_수_없다() {
        Long ownerId = greenhouse.getMemberId();
        Long greenhouseId = greenhouse.getGreenhouseId();
        Long otherMemberId = 940002L;

        Greenhouse updateRequest = repository.findById(ownerId, greenhouseId);

        String originalName = updateRequest.getGreenhouseName();
        String originalCoverType = updateRequest.getCoverType();

        updateRequest.setMemberId(otherMemberId);
        updateRequest.setGreenhouseName(originalName + " 수정 시도");
        updateRequest.setCoverType("유리".equals(originalCoverType) ? "비닐" : "유리");

        repository.updateGreenhouse(updateRequest);

        Greenhouse saved = repository.findById(ownerId, greenhouseId);
        assertThat(saved.getGreenhouseName()).isEqualTo(originalName);
        assertThat(saved.getCoverType()).isEqualTo(originalCoverType);
    }

    @Test
    @Transactional
    void 온실_논리_삭제() {
        repository.deleteGreenhouseById(greenhouse.getMemberId(), greenhouse.getGreenhouseId());

        Greenhouse deleted = repository.findById(greenhouse.getMemberId(), greenhouse.getGreenhouseId());
        assertThat(deleted.getDeletedAt()).isNotNull();
    }

    @Test
    @Transactional
    void 다른_회원은_온실을_논리_삭제할_수_없다() {
        Long ownerId = greenhouse.getMemberId();
        Long greenhouseId = greenhouse.getGreenhouseId();
        Long otherMemberId = 940002L;

        repository.deleteGreenhouseById(otherMemberId, greenhouseId);

        Greenhouse after = repository.findById(ownerId, greenhouseId);
        assertThat(after.getDeletedAt()).isNull();
    }
}

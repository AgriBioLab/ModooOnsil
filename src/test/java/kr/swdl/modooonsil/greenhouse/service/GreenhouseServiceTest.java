
package kr.swdl.modooonsil.greenhouse.service;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import kr.swdl.modooonsil.greenhouse.repository.GreenhouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class GreenhouseServiceTest {

    @Autowired
    GreenhouseService greenhouseService;

    @Autowired
    GreenhouseRepository greenhouseRepository;

    private final Long memberId = 940001L;

    private final Long greenhouseId = 940001L;

    /*
     * 테스트용 온실 객체 생성
     */
    private Greenhouse createGreenhouse() {
        return Greenhouse.builder()
                         .greenhouseId(greenhouseId)
                         .memberId(memberId)
                         .greenhouseName("시연 1온실 (단동·유리·수태)")
                         .greenhouseType("단동")
                         .coverType("유리")
                         .buildingCount(1)
                         .sideHeight(4.5)
                         .width(8.0)
                         .length(40.0)
                         .registeredArea(320.0)
                         .mediumType("수태")
                         .greenhouseImageUrl("/images/greenhouses/seed-rose-01.jpg")
                         .build();
    }

    /*
     * 온실 목록 조회 성공
     */
    @Test
    void 온실_목록_조회_성공() {

        List<Greenhouse> result = greenhouseService.findAll(
                memberId,
                null,
                null,
                null,
                null
        );

        assertThat(result).isNotEmpty();
    }

    /*
     * 온실 검색 조건 조회 성공
     */
    @Test
    void 온실_검색_조건_조회_성공() {

        Greenhouse greenhouse = createGreenhouse();

        List<Greenhouse> result = greenhouseService.findAll(
                memberId,
                greenhouse.getGreenhouseName(),
                greenhouse.getGreenhouseType(),
                greenhouse.getCoverType(),
                greenhouse.getMediumType()
        );

        assertThat(result).isNotEmpty();
        assertThat(result)
                .extracting(Greenhouse::getGreenhouseId)
                .contains(greenhouseId);
    }

    /*
     * 온실 목록 조회 결과가 없는 경우
     */
    @Test
    void 온실이_없는_회원의_목록은_빈_목록을_반환한다() {

        List<Greenhouse> result = greenhouseService.findAll(
                940003L,
                null,
                null,
                null,
                null
        );

        assertThat(result).isEmpty();
    }

    /*
     * 존재하지 않는 회원의 온실 목록 조회 실패
     */
    @Test
    void 존재하지_않는_회원은_온실_목록을_조회할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.findAll(
                        1L,
                        null,
                        null,
                        null,
                        null
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.UNAUTHORIZED)
                );
    }

    /*
     * 온실 상세 조회 성공
     */
    @Test
    void 온실_상세_조회_성공() {

        Greenhouse result = greenhouseService.findById(
                memberId,
                greenhouseId
        );

        assertThat(result).isNotNull();
        assertThat(result.getGreenhouseId()).isEqualTo(greenhouseId);
        assertThat(result.getMemberId()).isEqualTo(memberId);
        assertThat(result.getGreenhouseName())
                .isEqualTo("시연 1온실 (단동·유리·수태)");
    }

    /*
     * 존재하지 않는 회원의 온실 상세 조회 실패
     */
    @Test
    void 존재하지_않는_회원은_온실_상세를_조회할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.findById(1L, greenhouseId)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.UNAUTHORIZED)
                );
    }

    /*
     * 존재하지 않는 온실 상세 조회 실패
     */
    @Test
    void 존재하지_않는_온실은_상세_조회할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.findById(memberId, 999999L)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 다른 회원의 온실 상세 조회 실패
     */
    @Test
    void 다른_회원의_온실은_상세_조회할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.findById(940002L, greenhouseId)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 잘못된 온실 ID로 상세 조회 실패
     */
    @Test
    void 잘못된_온실_ID로_상세_조회할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.findById(memberId, -1L)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 온실 등록 성공
     */
    @Test
    void 온실_등록_성공() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("서비스 등록 테스트 온실")
                                       .greenhouseType("단동")
                                       .coverType("유리")
                                       .buildingCount(2)
                                       .sideHeight(3.8)
                                       .width(12.0)
                                       .length(35.0)
                                       .registeredArea(840.0)
                                       .mediumType("수태")
                                       .greenhouseImageUrl("test-greenhouse.jpg")
                                       .build();

        Greenhouse result = greenhouseService.addGreenhouse(
                memberId,
                request
        );

        assertThat(result).isNotNull();
        assertThat(result.getGreenhouseId()).isNotNull();
        assertThat(result.getMemberId()).isEqualTo(memberId);
        assertThat(result.getGreenhouseName())
                .isEqualTo("서비스 등록 테스트 온실");

        Greenhouse saved = greenhouseRepository.findById(
                memberId,
                result.getGreenhouseId()
        );

        assertThat(saved).isNotNull();
        assertThat(saved.getGreenhouseName())
                .isEqualTo("서비스 등록 테스트 온실");
    }

    /*
     * 존재하지 않는 회원의 온실 등록 실패
     */
    @Test
    void 존재하지_않는_회원은_온실을_등록할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("등록 실패 테스트 온실")
                                       .greenhouseType("단동")
                                       .coverType("유리")
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(1L, request)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.UNAUTHORIZED)
                );
    }

    /*
     * 온실 등록 정보가 없는 경우 실패
     */
    @Test
    void 온실_등록_정보가_없으면_등록할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(memberId, null)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 온실명이 없는 경우 등록 실패
     */
    @Test
    void 온실명이_없으면_등록할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseType("단동")
                                       .coverType("유리")
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(memberId, request)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 온실명이 100자를 초과하는 경우 등록 실패
     */
    @Test
    void 온실명이_100자를_초과하면_등록할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("가".repeat(101))
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(memberId, request)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 잘못된 동 수로 등록 실패
     */
    @Test
    void 동_수가_1보다_작으면_등록할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("등록 테스트 온실")
                                       .buildingCount(0)
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(memberId, request)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 음수 면적으로 등록 실패
     */
    @Test
    void 음수_면적으로_온실을_등록할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("등록 테스트 온실")
                                       .registeredArea(-100.0)
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.addGreenhouse(memberId, request)
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 온실 정보 수정 성공
     */
    @Test
    void 온실_정보_수정_성공() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("수정 후 온실")
                                       .greenhouseType("연동")
                                       .coverType("비닐")
                                       .buildingCount(3)
                                       .sideHeight(5.0)
                                       .width(24.0)
                                       .length(50.0)
                                       .registeredArea(1200.0)
                                       .mediumType("코코피트")
                                       .greenhouseImageUrl("updated-greenhouse.jpg")
                                       .build();

        Greenhouse result = greenhouseService.updateGreenhouse(
                memberId,
                greenhouseId,
                request
        );

        assertThat(result).isNotNull();
        assertThat(result.getGreenhouseId()).isEqualTo(greenhouseId);
        assertThat(result.getMemberId()).isEqualTo(memberId);
        assertThat(result.getGreenhouseName()).isEqualTo("수정 후 온실");
        assertThat(result.getGreenhouseType()).isEqualTo("연동");
        assertThat(result.getCoverType()).isEqualTo("비닐");
    }

    /*
     * 존재하지 않는 온실 수정 실패
     */
    @Test
    void 존재하지_않는_온실은_수정할_수_없다() {

        Greenhouse request = createGreenhouse();

        assertThatThrownBy(() ->
                greenhouseService.updateGreenhouse(
                        memberId,
                        999999L,
                        request
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 다른 회원의 온실 수정 실패
     */
    @Test
    void 다른_회원의_온실은_수정할_수_없다() {

        Greenhouse request = Greenhouse.builder()
                                       .greenhouseName("다른 회원 수정 시도")
                                       .greenhouseType("연동")
                                       .coverType("비닐")
                                       .buildingCount(3)
                                       .sideHeight(5.0)
                                       .width(24.0)
                                       .length(50.0)
                                       .registeredArea(1200.0)
                                       .mediumType("코코피트")
                                       .build();

        assertThatThrownBy(() ->
                greenhouseService.updateGreenhouse(
                        940002L,
                        greenhouseId,
                        request
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 수정 정보가 없는 경우 실패
     */
    @Test
    void 수정할_온실_정보가_없으면_수정할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.updateGreenhouse(
                        memberId,
                        greenhouseId,
                        null
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 잘못된 온실 ID로 수정 실패
     */
    @Test
    void 잘못된_온실_ID로_수정할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.updateGreenhouse(
                        memberId,
                        -1L,
                        createGreenhouse()
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }

    /*
     * 온실 논리 삭제 성공
     */
    @Test
    void 온실_논리_삭제_성공() {

        greenhouseService.deleteGreenhouseById(
                memberId,
                greenhouseId
        );

        Greenhouse deleted = greenhouseRepository.findById(
                memberId,
                greenhouseId
        );

        assertThat(deleted).isNotNull();
        assertThat(deleted.getDeletedAt()).isNotNull();
    }

    /*
     * 삭제된 온실은 다시 삭제할 수 없음
     */
    @Test
    void 삭제된_온실은_다시_삭제할_수_없다() {

        greenhouseService.deleteGreenhouseById(
                memberId,
                greenhouseId
        );

        assertThatThrownBy(() ->
                greenhouseService.deleteGreenhouseById(
                        memberId,
                        greenhouseId
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 존재하지 않는 온실 삭제 실패
     */
    @Test
    void 존재하지_않는_온실은_삭제할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.deleteGreenhouseById(
                        memberId,
                        999999L
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
     * 다른 회원의 온실 삭제 실패
     */
    @Test
    void 다른_회원은_온실을_삭제할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.deleteGreenhouseById(
                        940002L,
                        greenhouseId
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND)
                );
    }

    /*
`     * 잘못된 온실 ID로 삭제 실패
     */
    @Test
    void 잘못된_온실_ID로_삭제할_수_없다() {

        assertThatThrownBy(() ->
                greenhouseService.deleteGreenhouseById(
                        memberId,
                        -1L
                )
        )
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST)
                );
    }
}

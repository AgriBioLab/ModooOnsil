package kr.swdl.modooonsil.greenhouse.service;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import kr.swdl.modooonsil.greenhouse.repository.GreenhouseRepository;
import kr.swdl.modooonsil.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GreenhouseService {

    private final GreenhouseRepository greenhouseRepository;
    private final MemberRepository memberRepository;

    /*
     * 온실 목록 조회
     */
    public List<Greenhouse> findAll(Long memberId, String greenhouseName, String greenhouseType, String coverType, String mediumType) {

        validateMember(memberId);

        return greenhouseRepository.findAll(memberId, greenhouseName, greenhouseType, coverType, mediumType);
    }

    /*
     * 온실 상세 조회
     */
    public Greenhouse findById(Long memberId, Long greenhouseId) {

        validateMember(memberId);
        validatePositiveId(greenhouseId, "온실 ID가 올바르지 않습니다.");

        return requireGreenhouse(memberId, greenhouseId);
    }

    /*
     * 온실 등록
     */
    @Transactional
    public Greenhouse addGreenhouse(Long memberId, Greenhouse request) {

        validateMember(memberId);
        validateGreenhouse(request);

        // Builder 패턴으로 온실 객체 생성
        // memberId는 요청값이 아닌 인증된 회원 ID 사용
        Greenhouse greenhouse = Greenhouse.builder().memberId(memberId)
                                          .greenhouseName(request.getGreenhouseName().strip())
                                          .greenhouseType(request.getGreenhouseType()).coverType(request.getCoverType())
                                          .buildingCount(request.getBuildingCount()).sideHeight(request.getSideHeight())
                                          .width(request.getWidth()).length(request.getLength())
                                          .registeredArea(request.getRegisteredArea())
                                          .mediumType(request.getMediumType())
                                          .greenhouseImageUrl(request.getGreenhouseImageUrl()).build();

        greenhouseRepository.addGreenhouse(greenhouse);

        if (greenhouse.getGreenhouseId() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "온실 등록에 실패했습니다.");
        }

        return requireGreenhouse(memberId, greenhouse.getGreenhouseId());
    }

    /*
     * 온실 정보 수정
     */
    @Transactional
    public Greenhouse updateGreenhouse(Long memberId, Long greenhouseId, Greenhouse request) {

        validateMember(memberId);
        validatePositiveId(greenhouseId, "온실 ID가 올바르지 않습니다.");

        if (request == null) {
            throw badRequest("온실 수정 정보가 없습니다.");
        }

        // 해당 회원의 온실인지 확인
        requireGreenhouse(memberId, greenhouseId);

        validateGreenhouse(request);

        // Builder 패턴으로 수정할 온실 객체 생성
        // greenhouseId와 memberId는 서버에서 지정
        Greenhouse greenhouse = Greenhouse.builder().greenhouseId(greenhouseId).memberId(memberId)
                                          .greenhouseName(request.getGreenhouseName().strip())
                                          .greenhouseType(request.getGreenhouseType()).coverType(request.getCoverType())
                                          .buildingCount(request.getBuildingCount()).sideHeight(request.getSideHeight())
                                          .width(request.getWidth()).length(request.getLength())
                                          .registeredArea(request.getRegisteredArea())
                                          .mediumType(request.getMediumType())
                                          .greenhouseImageUrl(request.getGreenhouseImageUrl()).build();

        greenhouseRepository.updateGreenhouse(greenhouse);

        return requireGreenhouse(memberId, greenhouseId);
    }

    /*
     * 온실 논리 삭제
     */
    @Transactional
    public void deleteGreenhouseById(Long memberId, Long greenhouseId) {

        validateMember(memberId);
        validatePositiveId(greenhouseId, "온실 ID가 올바르지 않습니다.");

        // 온실 존재 여부 및 소유권 확인
        requireGreenhouse(memberId, greenhouseId);

        greenhouseRepository.deleteGreenhouseById(memberId, greenhouseId);
    }

    /*
     * 온실 존재 여부 및 소유권 확인
     */
    private Greenhouse requireGreenhouse(Long memberId, Long greenhouseId) {

        Greenhouse greenhouse = greenhouseRepository.findById(memberId, greenhouseId);

        if (greenhouse == null || greenhouse.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "온실 정보를 찾을 수 없습니다.");
        }

        return greenhouse;
    }

    /*
     * 회원 존재 여부 확인
     */
    private void validateMember(Long memberId) {

        if (memberId == null || memberId <= 0 || memberRepository.findMemberByMemberId(memberId) == null) {

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자 인증 정보가 올바르지 않습니다.");
        }
    }

    /*
     * 온실 입력값 검증
     */
    private void validateGreenhouse(Greenhouse greenhouse) {

        if (greenhouse == null) {
            throw badRequest("온실 등록 정보가 없습니다.");
        }

        if (greenhouse.getGreenhouseName() == null || greenhouse.getGreenhouseName()
                                                                .isBlank() || greenhouse.getGreenhouseName().strip()
                                                                                        .length() > 100) {

            throw badRequest("온실명은 필수이며 100자 이내로 입력해야 합니다.");
        }

        validateTextLength(greenhouse.getGreenhouseType(), 30, "온실 유형은 30자 이내로 입력해야 합니다.");

        validateTextLength(greenhouse.getCoverType(), 30, "피복 형태는 30자 이내로 입력해야 합니다.");

        validateTextLength(greenhouse.getMediumType(), 30, "배지 형태는 30자 이내로 입력해야 합니다.");

        validateTextLength(greenhouse.getGreenhouseImageUrl(), 500, "온실 사진 URL은 500자 이내로 입력해야 합니다.");

        Integer buildingCount = greenhouse.getBuildingCount();

        if (buildingCount != null && buildingCount < 1) {
            throw badRequest("동 수는 1 이상의 정수로 입력해야 합니다.");
        }

        validatePositiveNumber(greenhouse.getSideHeight(), "측고는 0보다 큰 값이어야 합니다.");

        validatePositiveNumber(greenhouse.getWidth(), "폭은 0보다 큰 값이어야 합니다.");

        validatePositiveNumber(greenhouse.getLength(), "길이는 0보다 큰 값이어야 합니다.");

        validatePositiveNumber(greenhouse.getRegisteredArea(), "등록 면적은 0보다 큰 값이어야 합니다.");
    }

    /*
     * 문자열 길이 검증
     */
    private void validateTextLength(String value, int maxLength, String message) {

        if (value != null && value.length() > maxLength) {
            throw badRequest(message);
        }
    }

    /*
     * 양수 검증
     */
    private void validatePositiveNumber(Double value, String message) {

        if (value != null && (!Double.isFinite(value) || value <= 0)) {

            throw badRequest(message);
        }
    }

    /*
     * ID 검증
     */
    private void validatePositiveId(Long id, String message) {

        if (id == null || id <= 0) {
            throw badRequest(message);
        }
    }

    /*
     * 400 Bad Request 예외 생성
     */
    private ResponseStatusException badRequest(String message) {

        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
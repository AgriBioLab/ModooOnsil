package kr.swdl.modooonsil.greenhouse.controller;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import kr.swdl.modooonsil.greenhouse.service.GreenhouseService;
import kr.swdl.modooonsil.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.constraints.Positive;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/greenhouses")
@Validated
public class GreenhouseRestController {

    private final GreenhouseService greenhouseService;

    /*
     * 1. 온실 목록 조회
     * GET /api/greenhouses
     */
    @GetMapping
    public ResponseEntity<List<Greenhouse>> findAll(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                         @RequestParam(required = false) String greenhouseName,
                                                         @RequestParam(required = false) String greenhouseType,
                                                         @RequestParam(required = false) String coverType,
                                                         @RequestParam(required = false) String mediumType) {
        Long memberId = requireMemberId(userDetails);

        List<Greenhouse> result = greenhouseService.findAll(memberId, greenhouseName, greenhouseType, coverType, mediumType);

        return ResponseEntity.ok(result);
    }

    /*
     * 2. 온실 상세 조회
     * GET /api/greenhouses/{greenhouseId}
     */
    @GetMapping("/{greenhouseId}")
    public ResponseEntity<Greenhouse> findById(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable @Positive Long greenhouseId) {
        Long memberId = requireMemberId(userDetails);

        Greenhouse result = greenhouseService.findById(memberId, greenhouseId);

        return ResponseEntity.ok(result);
    }

    /*
     * 3. 온실 등록
     * POST /api/greenhouses
     */
    @PostMapping
    public ResponseEntity<Greenhouse> addGreenhouse(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Greenhouse request) {
        Long memberId = requireMemberId(userDetails);

        Greenhouse result = greenhouseService.addGreenhouse(memberId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /*
     * 4. 온실 정보 수정
     * PATCH /api/greenhouses/{greenhouseId}
     */
    @PatchMapping("/{greenhouseId}")
    public ResponseEntity<Greenhouse> updateGreenhouse(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable @Positive Long greenhouseId, @RequestBody Greenhouse request) {
        Long memberId = requireMemberId(userDetails);

        // 기존 온실 정보 조회 및 소유권 확인
        Greenhouse existing = greenhouseService.findById(memberId, greenhouseId);

        // 전달받은 필드만 변경하고 나머지는 기존 값 유지
        Greenhouse updateRequest = Greenhouse.builder()
                                             .greenhouseName(request.getGreenhouseName() != null ? request.getGreenhouseName() : existing.getGreenhouseName())
                                             .greenhouseType(request.getGreenhouseType() != null ? request.getGreenhouseType() : existing.getGreenhouseType())
                                             .coverType(request.getCoverType() != null ? request.getCoverType() : existing.getCoverType())
                                             .buildingCount(request.getBuildingCount() != null ? request.getBuildingCount() : existing.getBuildingCount())
                                             .sideHeight(request.getSideHeight() != null ? request.getSideHeight() : existing.getSideHeight())
                                             .width(request.getWidth() != null ? request.getWidth() : existing.getWidth())
                                             .length(request.getLength() != null ? request.getLength() : existing.getLength())
                                             .registeredArea(request.getRegisteredArea() != null ? request.getRegisteredArea() : existing.getRegisteredArea())
                                             .mediumType(request.getMediumType() != null ? request.getMediumType() : existing.getMediumType())
                                             .greenhouseImageUrl(request.getGreenhouseImageUrl() != null ? request.getGreenhouseImageUrl() : existing.getGreenhouseImageUrl())
                                             .build();

        Greenhouse result = greenhouseService.updateGreenhouse(memberId, greenhouseId, updateRequest);

        return ResponseEntity.ok(result);
    }

    /*
     * 5. 온실 논리 삭제
     * DELETE /api/greenhouses/{greenhouseId}
     */
    @DeleteMapping("/{greenhouseId}")
    public ResponseEntity<Void> deleteGreenhouse(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable @Positive Long greenhouseId) {
        Long memberId = requireMemberId(userDetails);

        greenhouseService.deleteGreenhouseById(memberId, greenhouseId);

        return ResponseEntity.noContent().build();
    }


    /*
     * 로그인 회원 ID 조회
     */
    private Long requireMemberId(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getMemberId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보가 없습니다.");
        }

        return userDetails.getMemberId();
    }
}

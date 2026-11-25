package kr.swdl.modooonsil.member.controller;

import jakarta.validation.Valid;
import kr.swdl.modooonsil.member.dto.CertificationRequest;
import kr.swdl.modooonsil.member.dto.FarmProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberPasswordChangeRequest;
import kr.swdl.modooonsil.member.dto.MemberProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberRegistrationRequest;
import kr.swdl.modooonsil.member.dto.MemberResponse;
import kr.swdl.modooonsil.security.CustomUserDetails;
import kr.swdl.modooonsil.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class MemberRestController {
    private final MemberService memberService;

    @GetMapping("/api/auth/me")
    public ResponseEntity<MemberResponse> currentMember(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(memberService.getCurrentMember(requireMemberId(userDetails)));
    }

    @GetMapping("/api/members/availability")
    public ResponseEntity<Boolean> availability(@RequestParam(required = false) String username,
                                                @RequestParam(required = false) String email) {
        return ResponseEntity.ok(memberService.isAvailable(username, email));
    }

    @PutMapping("/api/auth/me/farm")
    public ResponseEntity<MemberResponse> updateFarmProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FarmProfileUpdateRequest request) {
        return ResponseEntity.ok(memberService.updateFarmProfile(requireMemberId(userDetails), request));
    }

    @PutMapping("/api/auth/me/profile")
    public ResponseEntity<MemberResponse> updateMemberProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MemberProfileUpdateRequest request) {
        return ResponseEntity.ok(memberService.updateMemberProfile(requireMemberId(userDetails), request));
    }

    @PutMapping("/api/auth/me/certification")
    public ResponseEntity<MemberResponse> requestCertification(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(memberService.requestCertification(requireMemberId(userDetails), request.getBusinessNumber()));
    }

    @PostMapping("/api/auth/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal CustomUserDetails userDetails,
                                               @Valid @RequestBody MemberPasswordChangeRequest request) {
        if (!memberService.changePassword(requireMemberId(userDetails), request)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "현재 비밀번호가 일치하지 않습니다.");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/members")
    public ResponseEntity<Void> register(@Valid @RequestBody MemberRegistrationRequest request) {
        memberService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private Long requireMemberId(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userDetails.getMemberId();
    }
}

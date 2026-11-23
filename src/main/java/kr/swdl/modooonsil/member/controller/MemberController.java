package kr.swdl.modooonsil.member.controller;

import jakarta.validation.Valid;
import kr.swdl.modooonsil.member.dto.MemberPasswordChangeRequest;
import kr.swdl.modooonsil.member.dto.MemberRegistrationRequest;
import kr.swdl.modooonsil.member.dto.MemberResponse;
import kr.swdl.modooonsil.member.security.CustomUserDetails;
import kr.swdl.modooonsil.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/api/auth/me")
    public ResponseEntity<MemberResponse> currentMember(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        try {
            return ResponseEntity.ok(memberService.getCurrentMember(userDetails.getMemberId()));
        } catch (UsernameNotFoundException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/api/members/availability")
    public ResponseEntity<Boolean> availability(@RequestParam(required = false) String username,
                                                @RequestParam(required = false) String email) {
        return ResponseEntity.ok(memberService.isAvailable(username, email));
    }

    @PostMapping("/api/auth/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal CustomUserDetails userDetails,
                                               @Valid @RequestBody MemberPasswordChangeRequest request) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        try {
            if (!memberService.changePassword(userDetails.getMemberId(), request)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "현재 비밀번호가 일치하지 않습니다.");
            }
        } catch (UsernameNotFoundException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/members")
    public ResponseEntity<Void> register(@Valid @RequestBody MemberRegistrationRequest request) {
        try {
            memberService.register(request);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디 또는 이메일입니다.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}

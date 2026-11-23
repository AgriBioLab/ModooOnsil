package kr.swdl.modooonsil.member.service;

import kr.swdl.modooonsil.member.domain.Member;
import kr.swdl.modooonsil.member.dto.FarmProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberPasswordChangeRequest;
import kr.swdl.modooonsil.member.dto.MemberProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberRegistrationRequest;
import kr.swdl.modooonsil.member.dto.MemberResponse;
import kr.swdl.modooonsil.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository repository;
    private final PasswordEncoder passwordEncoder;

    public MemberResponse getCurrentMember(Long memberId) {
        Member member = requireMember(memberId);
        return MemberResponse.builder()
                .id(member.getMemberId().toString())
                .username(member.getUsername())
                .displayName(member.getRepresentativeName())
                .farmName(member.getFarmName())
                .certification(member.getCertificationStatus())
                .businessNumber(member.getFarmBusinessNumber())
                .email(member.getEmail())
                .phone(member.getPhoneNumber())
                .address(member.getFarmAddress())
                .addressDetail(member.getFarmAddressDetail())
                .mainCrop(member.getMainCrop())
                .description(member.getFarmDescription())
                .createdAt(member.getCreatedAt())
                .build();
    }

    @Transactional
    public MemberResponse updateFarmProfile(Long memberId, FarmProfileUpdateRequest request) {
        repository.updateFarmProfile(Member.builder()
                .memberId(memberId)
                .farmName(request.farmName())
                .farmAddress(request.address())
                .farmAddressDetail(request.addressDetail())
                .mainCrop(request.mainCrop())
                .farmDescription(request.description())
                .build());
        return getCurrentMember(memberId);
    }

    @Transactional
    public MemberResponse updateMemberProfile(Long memberId, MemberProfileUpdateRequest request) {
        Member current = requireMember(memberId);
        String email = request.email() == null || request.email().isBlank() ? null : request.email();
        if (email != null && !email.equalsIgnoreCase(current.getEmail()) && repository.existsByEmail(email)) {
            throw new DuplicateKeyException("이미 사용 중인 이메일입니다.");
        }
        repository.updateMemberProfile(Member.builder()
                .memberId(memberId)
                .representativeName(request.displayName())
                .email(email)
                .phoneNumber(request.phone())
                .build());
        return getCurrentMember(memberId);
    }

    private Member requireMember(Long memberId) {
        Member member = repository.findMemberByMemberId(memberId);
        if (member == null) {
            throw new UsernameNotFoundException("회원을 찾을 수 없습니다.");
        }
        return member;
    }

    public boolean isAvailable(String username, String email) {
        return (username == null || !repository.existsByUsername(username))
                && (email == null || !repository.existsByEmail(email));
    }

    @Transactional
    public void register(MemberRegistrationRequest request) {
        if (!isAvailable(request.getUsername(), request.getEmail())) {
            throw new DuplicateKeyException("이미 사용 중인 아이디 또는 이메일입니다.");
        }
        String businessNumber = request.getBusinessNumber();
        Member member = Member.builder()
                .farmName(request.getFarmName())
                .representativeName(request.getDisplayName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .farmAddress(request.getAddress())
                .farmAddressDetail(request.getAddressDetail())
                .mainCrop(request.getMainCrop())
                .farmDescription(request.getDescription())
                .farmBusinessNumber(businessNumber)
                .certificationStatus(businessNumber == null || businessNumber.isBlank() ? "미인증" : "인증 대기중")
                .build();
        repository.addMember(member);
    }

    @Transactional
    public boolean changePassword(Long memberId, MemberPasswordChangeRequest request) {
        Member member = repository.findMemberByMemberId(memberId);
        if (member == null || member.getPassword() == null) {
            throw new UsernameNotFoundException("회원을 찾을 수 없습니다.");
        }
        String oldHash = member.getPassword();
        if (!passwordEncoder.matches(request.getCurrentPassword(), oldHash)) {
            return false;
        }
        return repository.updatePassword(memberId, oldHash,
                passwordEncoder.encode(request.getNewPassword())) == 1;
    }
}

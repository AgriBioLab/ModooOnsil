package kr.swdl.modooonsil.member.service;

import kr.swdl.modooonsil.member.domain.Member;
import kr.swdl.modooonsil.member.dto.FarmProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberPasswordChangeRequest;
import kr.swdl.modooonsil.member.dto.MemberProfileUpdateRequest;
import kr.swdl.modooonsil.member.dto.MemberRegistrationRequest;
import kr.swdl.modooonsil.member.dto.MemberResponse;
import kr.swdl.modooonsil.member.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class MemberServiceTest {
    private static final long MISSING_MEMBER_ID = -1L;
    private static final String CURRENT_PASSWORD = "current-password";
    private static final String NEW_PASSWORD = "new-password";

    @Autowired
    private MemberService service;

    @Autowired
    private MemberRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MemberRegistrationRequest registration;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        registration = new MemberRegistrationRequest();
        registration.setUsername("grower" + suffix);
        registration.setEmail("grower" + suffix + "@example.com");
        registration.setPassword(CURRENT_PASSWORD);
        registration.setFarmName("장미 농장");
        registration.setDisplayName("김농부");
    }

    @Test
    void 회원가입_시_비밀번호를_해시하고_미인증으로_저장() {
        Member saved = registerAndFindMember();

        assertThat(saved.getUsername()).isEqualTo(registration.getUsername());
        assertThat(saved.getEmail()).isEqualTo(registration.getEmail());
        assertThat(saved.getFarmName()).isEqualTo("장미 농장");
        assertThat(saved.getRepresentativeName()).isEqualTo("김농부");
        assertThat(saved.getCertificationStatus()).isEqualTo("미인증");
        assertThat(saved.getPassword()).isNotEqualTo(CURRENT_PASSWORD);
        assertThat(passwordEncoder.matches(CURRENT_PASSWORD, saved.getPassword())).isTrue();
    }

    @Test
    void 농업경영체_등록번호가_있으면_인증_대기중으로_저장() {
        registration.setBusinessNumber("1234567890");

        Member saved = registerAndFindMember();

        assertThat(saved.getFarmBusinessNumber()).isEqualTo("1234567890");
        assertThat(saved.getCertificationStatus()).isEqualTo("인증 대기중");
    }

    @Test
    void 중복되지_않은_아이디와_이메일은_사용_가능() {
        assertThat(service.isAvailable(registration.getUsername(), registration.getEmail())).isTrue();
        assertThat(service.isAvailable(registration.getUsername(), null)).isTrue();
        assertThat(service.isAvailable(null, registration.getEmail())).isTrue();
    }

    @Test
    void 중복된_아이디는_가입_불가() {
        service.register(registration);
        registration.setEmail("other-" + registration.getEmail());

        assertThat(service.isAvailable(registration.getUsername(), null)).isFalse();
        assertThatThrownBy(() -> service.register(registration)).isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void 중복된_이메일은_가입_불가() {
        service.register(registration);
        registration.setUsername("a" + registration.getUsername());

        assertThat(service.isAvailable(null, registration.getEmail())).isFalse();
        assertThatThrownBy(() -> service.register(registration)).isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void 저장된_회원_정보를_응답에_매핑() {
        Member saved = registerAndFindMember();

        MemberResponse response = service.getCurrentMember(saved.getMemberId());

        assertThat(response.getId()).isEqualTo(saved.getMemberId().toString());
        assertThat(response.getUsername()).isEqualTo(registration.getUsername());
        assertThat(response.getDisplayName()).isEqualTo(registration.getDisplayName());
        assertThat(response.getFarmName()).isEqualTo(registration.getFarmName());
        assertThat(response.getEmail()).isEqualTo(registration.getEmail());
        assertThat(response.getCertification()).isEqualTo("미인증");
        assertThat(response.getCreatedAt()).isEqualTo(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void 존재하지_않는_회원의_정보를_조회하면_예외가_발생() {
        assertThatThrownBy(() -> service.getCurrentMember(MISSING_MEMBER_ID))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void 현재_비밀번호가_맞으면_새_비밀번호를_해시하여_저장() {
        Member saved = registerAndFindMember();

        assertThat(service.changePassword(saved.getMemberId(), passwordChange(CURRENT_PASSWORD))).isTrue();

        Member updated = repository.findMemberByMemberId(saved.getMemberId());
        assertThat(updated.getPassword()).isNotEqualTo(saved.getPassword()).isNotEqualTo(NEW_PASSWORD);
        assertThat(passwordEncoder.matches(NEW_PASSWORD, updated.getPassword())).isTrue();
    }

    @Test
    void 현재_비밀번호가_틀리면_비밀번호_변경_불가() {
        Member saved = registerAndFindMember();

        assertThat(service.changePassword(saved.getMemberId(), passwordChange("wrong-password"))).isFalse();

        Member unchanged = repository.findMemberByMemberId(saved.getMemberId());
        assertThat(unchanged.getPassword()).isEqualTo(saved.getPassword());
    }

    @Test
    void 회원이_없으면_비밀번호_변경_불가() {
        assertThatThrownBy(() -> service.changePassword(MISSING_MEMBER_ID, passwordChange(CURRENT_PASSWORD)))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void 농장정보를_저장하고_선택_항목_지우기_가능() {
        registration.setAddressDetail("기존 상세 주소");
        Member saved = registerAndFindMember();

        service.updateFarmProfile(saved.getMemberId(),
                new FarmProfileUpdateRequest("새 농장", "새 주소", null, "장미", "새 소개"));

        Member updated = repository.findMemberByMemberId(saved.getMemberId());
        assertThat(updated.getFarmName()).isEqualTo("새 농장");
        assertThat(updated.getFarmAddress()).isEqualTo("새 주소");
        assertThat(updated.getFarmAddressDetail()).isNull();
        assertThat(updated.getMainCrop()).isEqualTo("장미");
        assertThat(updated.getFarmDescription()).isEqualTo("새 소개");
        assertThat(updated.getEmail()).isEqualTo(saved.getEmail());
    }

    @Test
    void 회원_프로필을_저장하고_현재_이메일_유지_가능() {
        Member saved = registerAndFindMember();

        MemberResponse response = service.updateMemberProfile(saved.getMemberId(),
                new MemberProfileUpdateRequest("새 대표자", saved.getEmail(), "010-1234-5678"));
        assertThat(response.getDisplayName()).isEqualTo("새 대표자");
        assertThat(response.getEmail()).isEqualTo(saved.getEmail());

        String newEmail = "new-" + saved.getEmail();
        service.updateMemberProfile(saved.getMemberId(),
                new MemberProfileUpdateRequest("새 대표자", newEmail, null));
        Member updated = repository.findMemberByMemberId(saved.getMemberId());
        assertThat(updated.getEmail()).isEqualTo(newEmail);
        assertThat(updated.getPhoneNumber()).isNull();
        assertThat(updated.getFarmName()).isEqualTo(saved.getFarmName());
    }

    @Test
    void 다른_회원의_이메일로_프로필_수정_불가() {
        Member saved = registerAndFindMember();
        registration.setUsername("b" + registration.getUsername());
        registration.setEmail("other-" + registration.getEmail());
        Member other = registerAndFindMember();

        assertThatThrownBy(() -> service.updateMemberProfile(saved.getMemberId(),
                new MemberProfileUpdateRequest("새 대표자", other.getEmail(), null)))
                .isInstanceOf(DuplicateKeyException.class);
        assertThat(repository.findMemberByMemberId(saved.getMemberId()).getEmail()).isEqualTo(saved.getEmail());
    }

    private Member registerAndFindMember() {
        service.register(registration);
        Member loginMember = repository.findActiveMemberByUsername(registration.getUsername());
        assertThat(loginMember).isNotNull();
        Member saved = repository.findMemberByMemberId(loginMember.getMemberId());
        assertThat(saved).isNotNull();
        return saved;
    }

    private MemberPasswordChangeRequest passwordChange(String currentPassword) {
        MemberPasswordChangeRequest request = new MemberPasswordChangeRequest();
        request.setCurrentPassword(currentPassword);
        request.setNewPassword(NEW_PASSWORD);
        return request;
    }
}

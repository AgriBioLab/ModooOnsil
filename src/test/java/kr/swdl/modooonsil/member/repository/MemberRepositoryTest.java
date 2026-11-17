package kr.swdl.modooonsil.member.repository;

import kr.swdl.modooonsil.member.domain.Member;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Test
    void 내정보_조회_완료() {
        Long testMemberId = 940001L;

        Member member = memberRepository.findMemberByMemberId(testMemberId);

        assertNotNull(member);
        assertEquals(940001L, member.getMemberId());
        assertEquals("모두의 장미농장", member.getFarmName());
        assertEquals("김시연", member.getRepresentativeName());
    }

    @Test
    void 내정보_조회_회원없는경우() {
        Long testUsername = -1L;

        Member member = memberRepository.findMemberByMemberId(testUsername);

        assertNull(member);
    }

    @Test
    void 회원가입_아이디_중복() {
        String testUsername = "seed_workflow_rose";

        boolean result = memberRepository.existsByUsername(testUsername);

        assertTrue(result);
    }

    @Test
    void 회원가입_아이디_중복아님() {
        String testUsername = "newTestUsername";

        boolean result = memberRepository.existsByUsername(testUsername);

        assertFalse(result);
    }

    @Test
    void 회원가입_이메일_중복() {
        String testEmail = "seed-workflow-rose@example.test";

        boolean result = memberRepository.existsByEmail(testEmail);

        assertTrue(result);
    }

    @Test
    void 회원가입_이메일_중복아님() {
        String testEmail = "newTestEmail@email.com";

        boolean result = memberRepository.existsByEmail(testEmail);

        assertFalse(result);
    }

    @Transactional
    @Rollback
    @Test
    void 회원가입_성공() {
        Member newMember = Member.builder()
                .farmName("행복한 농장")
                .representativeName("홍길동")
                .username("farmuser1")
                .password("encoded_password")
                .phoneNumber("010-1234-5678")
                .email("farmuser@example.com")
                .farmAddress("서울특별시 중구 세종대로 110")
                .farmAddressDetail("101호")
                .mainCrop("장미")
                .farmDescription("장미를 재배하는 농장입니다.")
                .farmBusinessNumber("123-45-67890")
                .certificationStatus("미인증")
                .build();

        memberRepository.addMember(newMember);

        Member getMember = memberRepository.findMemberByMemberId(newMember.getMemberId());
        assertNotNull(getMember);
        assertEquals(newMember.getUsername(), getMember.getUsername());
        assertEquals(newMember.getEmail(), getMember.getEmail());
    }

    @Transactional
    @Rollback
    @Test
    void 회원정보_수정() {
        Member updateMember = Member.builder()
                .memberId(940001L)
                .representativeName("홍길동")
                .phoneNumber("010-2727-7356")
                .farmAddress("인천 광역시")
                .farmAddressDetail("서구")
                .mainCrop("사과")
                .farmDescription("변경된 농장소개1")
                .build();

        memberRepository.updateMember(updateMember);

        Member getMember = memberRepository.findMemberByMemberId(updateMember.getMemberId());
        assertNotNull(getMember);
        assertEquals(updateMember.getRepresentativeName(), getMember.getRepresentativeName());
        assertEquals(updateMember.getPhoneNumber(), getMember.getPhoneNumber());
        assertEquals(updateMember.getMainCrop(), getMember.getMainCrop());
    }
}
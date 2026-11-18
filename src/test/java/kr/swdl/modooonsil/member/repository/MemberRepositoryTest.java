package kr.swdl.modooonsil.member.repository;

import kr.swdl.modooonsil.member.domain.Member;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    private Member testMember;

    @BeforeEach
    void setUp() {
        testMember = Member.builder()
                .farmName("테스트 농장")
                .representativeName("테스트 대표자")
                .username("test1")
                .password("test1234")
                .phoneNumber("010-1111-2222")
                .email("test1@test.com")
                .farmAddress("테스트 주소")
                .farmAddressDetail("테스트 상세 주소")
                .mainCrop("테스트품목")
                .farmDescription("테스트용 농장입니다.")
                .farmBusinessNumber("111-11-1111")
                .certificationStatus("미인증")
                .build();

        memberRepository.addMember(testMember);
    }

    @Test
    void 내정보_조회_완료() {
        Member member = memberRepository.findMemberByMemberId(testMember.getMemberId());

        assertNotNull(member);
        assertEquals(testMember.getMemberId(), member.getMemberId());
        assertEquals(testMember.getFarmName(), member.getFarmName());
        assertEquals(testMember.getRepresentativeName(), member.getRepresentativeName());
    }

    @Test
    void 내정보_조회_회원없는경우() {
        Member member = memberRepository.findMemberByMemberId(99999L);
        assertNull(member);
    }

    @Test
    void 회원가입_아이디_중복() {
        boolean result = memberRepository.existsByUsername(testMember.getUsername());
        assertTrue(result);
    }

    @Test
    void 회원가입_아이디_중복아님() {
        boolean result = memberRepository.existsByUsername("newTestUsername");
        assertFalse(result);
    }

    @Test
    void 회원가입_이메일_중복() {
        boolean result = memberRepository.existsByEmail(testMember.getEmail());
        assertTrue(result);
    }

    @Test
    void 회원가입_이메일_중복아님() {
        boolean result = memberRepository.existsByEmail("newTestEmail");
        assertFalse(result);
    }

    @Test
    void 회원가입_성공() {
        Member newMember = Member.builder()
                .farmName("테스트 농장")
                .representativeName("테스트")
                .username("test1")
                .password("test1")
                .phoneNumber("010-9999-9999")
                .email("test1@test.com")
                .farmAddress("테스트 주소")
                .farmAddressDetail("테스트호")
                .mainCrop("테스트 품목")
                .farmDescription("테스트를 재배하는 농장입니다.")
                .farmBusinessNumber("999-99-9999")
                .certificationStatus("미인증")
                .build();

        memberRepository.addMember(newMember);

        Member getMember = memberRepository.findMemberByMemberId(newMember.getMemberId());
        assertNotNull(getMember);
        assertEquals(newMember.getUsername(), getMember.getUsername());
        assertEquals(newMember.getEmail(), getMember.getEmail());
    }

    @Test
    void 회원정보_수정() {
        Member updateMember = Member.builder()
                .memberId(testMember.getMemberId())
                .representativeName("홍길동")
                .phoneNumber("010-2727-7356")
                .farmAddress("인천광역시")
                .farmAddressDetail("서구")
                .mainCrop("사과")
                .farmDescription("변경된 농장소개")
                .build();

        memberRepository.updateMember(updateMember);

        Member getMember = memberRepository.findMemberByMemberId(
                testMember.getMemberId()
        );

        assertNotNull(getMember);
        assertEquals("홍길동", getMember.getRepresentativeName());
        assertEquals("010-2727-7356", getMember.getPhoneNumber());
        assertEquals("사과", getMember.getMainCrop());
    }
}
package kr.swdl.modooonsil.member.repository;

import kr.swdl.modooonsil.member.domain.Member;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberRepository {
    Member findMemberByMemberId(Long memberId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    void addMember(Member newMember);

    void updateMember(Member upDateMember);
}

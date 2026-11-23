package kr.swdl.modooonsil.member.repository;

import kr.swdl.modooonsil.member.domain.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberRepository {
    Member findMemberByMemberId(Long memberId);

    Member findActiveMemberByUsername(String username);

    int updatePassword(@Param("memberId") Long memberId, @Param("oldHash") String oldHash,
                       @Param("newHash") String newHash);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    void addMember(Member newMember);

    void updateMember(Member upDateMember);
}

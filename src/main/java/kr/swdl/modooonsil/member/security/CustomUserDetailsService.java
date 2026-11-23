package kr.swdl.modooonsil.member.security;

import kr.swdl.modooonsil.member.domain.Member;
import kr.swdl.modooonsil.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final MemberRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Member member = repository.findActiveMemberByUsername(username);
        if (member == null || member.getPassword() == null || member.getPassword().isBlank()) {
            throw new UsernameNotFoundException("회원을 찾을 수 없습니다.");
        }
        return new CustomUserDetails(member);
    }
}

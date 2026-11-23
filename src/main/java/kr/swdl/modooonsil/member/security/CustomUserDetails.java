package kr.swdl.modooonsil.member.security;

import kr.swdl.modooonsil.member.domain.Member;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class CustomUserDetails implements UserDetails {
    private final Long memberId;
    private final String username;
    private String password;

    public CustomUserDetails(Member member) {
        this.memberId = member.getMemberId();
        this.username = member.getUsername();
        this.password = member.getPassword();
    }

    public Long getMemberId() {
        return memberId;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return List.of();
    }

}

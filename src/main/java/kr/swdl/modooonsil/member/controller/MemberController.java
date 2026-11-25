package kr.swdl.modooonsil.member.controller;

import kr.swdl.modooonsil.security.CustomUserDetails;
import kr.swdl.modooonsil.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/login.html")
    public String login() {
        return "login";
    }

    @GetMapping("/signup.html")
    public String signup() {
        return "signup";
    }

    @GetMapping("/mypage.html")
    public String mypage(@AuthenticationPrincipal CustomUserDetails user, Model model) {
        if (user == null) {
            return "redirect:/login.html";
        }
        model.addAttribute("member", memberService.getCurrentMember(user.getMemberId()));
        return "mypage";
    }
}

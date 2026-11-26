package kr.swdl.modooonsil.common.controller;

import kr.swdl.modooonsil.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping({"/", "/index.html"})
    public String home(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getMemberId() == null) {
            return "redirect:/landing.html";
        }
        return "index";
    }
}

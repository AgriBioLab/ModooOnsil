package kr.swdl.modooonsil.greenhouse.controller;

import kr.swdl.modooonsil.greenhouse.domain.Greenhouse;
import kr.swdl.modooonsil.greenhouse.service.GreenhouseService;
import kr.swdl.modooonsil.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GreenhouseController {
    private final GreenhouseService greenhouseService;

    @GetMapping("/api/greenhouses")
    public List<Greenhouse> findAll(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return greenhouseService.findAll(user.getMemberId(), null, null, null, null);
    }
}

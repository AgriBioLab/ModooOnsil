package kr.swdl.modooonsil.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {
    @GetMapping({"/", "/index.html"})
    public String index() {
        return "index";
    }

    @GetMapping("/greenhouseList.html")
    public String greenhouseList() {
        return "greenhouseList";
    }

    @GetMapping("/greenhouses/{greenhouseId}")
    public String greenhouseDetail(@PathVariable Long greenhouseId, Model model) {
        model.addAttribute("greenhouseId", greenhouseId);
        return "greenhouseDetail";
    }

    @GetMapping("/cultivationPlanList.html")
    public String cultivationPlanList() {
        return "cultivationPlanList";
    }

    @GetMapping("/environmentChangeList.html")
    public String environmentChangeList() {
        return "environmentChangeList";
    }

    @GetMapping("/environmentIssueList.html")
    public String environmentIssueList() {
        return "environmentIssueList";
    }
}

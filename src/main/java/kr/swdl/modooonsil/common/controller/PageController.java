package kr.swdl.modooonsil.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/cultivationPlanList.html")
    public String cultivationPlanList(@RequestParam(required = false) String view,
                                      @RequestParam(required = false) Long id) {
        if ("cycle-create".equals(view)) {
            return "redirect:/cultivation-plans/new";
        }
        if ("cycle-detail".equals(view) && id != null && id > 0) {
            return "redirect:/cultivation-plans/" + id;
        }
        return "redirect:/cultivation-plans";
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

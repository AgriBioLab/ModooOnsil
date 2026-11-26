package kr.swdl.modooonsil.cultivation.plan.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cultivation-plans")
public class CultivationPlanController {
    @GetMapping
    public String list(Model model) {
        model.addAttribute("planView", "list");
        return "cultivationPlanList";
    }

    @GetMapping("/new")
    public String create(Model model) {
        model.addAttribute("planView", "create");
        return "cultivationPlanList";
    }

    @GetMapping("/{planId}")
    public String detail(@PathVariable Long planId, Model model) {
        model.addAttribute("planView", "detail");
        model.addAttribute("planId", planId);
        return "cultivationPlanList";
    }

    @GetMapping("/{planId}/edit")
    public String edit(@PathVariable Long planId, Model model) {
        model.addAttribute("planView", "edit");
        model.addAttribute("planId", planId);
        return "cultivationPlanList";
    }
}

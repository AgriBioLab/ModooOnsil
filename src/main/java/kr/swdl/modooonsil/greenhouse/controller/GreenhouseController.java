package kr.swdl.modooonsil.greenhouse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/greenhouses")
public class GreenhouseController {
    @GetMapping
    public String list(Model model) {
        model.addAttribute("greenhouseView", "list");
        return "greenhouseList";
    }

    @GetMapping("/new")
    public String createForm(Model model) {
        model.addAttribute("greenhouseView", "create");
        return "greenhouseForm";
    }

    @GetMapping("/{greenhouseId}")
    public String detail(@PathVariable Long greenhouseId, Model model) {
        model.addAttribute("greenhouseView", "detail");
        model.addAttribute("greenhouseId", greenhouseId);
        return "greenhouseDetail";
    }

    @GetMapping("/{greenhouseId}/edit")
    public String editForm(@PathVariable Long greenhouseId, Model model) {
        model.addAttribute("greenhouseView", "edit");
        model.addAttribute("greenhouseId", greenhouseId);
        return "greenhouseForm";
    }
}

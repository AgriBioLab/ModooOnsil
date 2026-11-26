package kr.swdl.modooonsil.cultivation.diary.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class CultivationDiaryController {
    @GetMapping("/cultivation-diaries")
    public String list(Model model) {
        model.addAttribute("diaryView", "list");
        return "cultivationDiaryList";
    }

    @GetMapping("/cultivation-diaries/new")
    public String createForm(Model model) {
        model.addAttribute("diaryView", "create");
        return "cultivationDiaryForm";
    }

    @GetMapping("/cultivation-diaries/{diaryId}")
    public String detail(@PathVariable Long diaryId, Model model) {
        model.addAttribute("diaryView", "detail");
        model.addAttribute("diaryId", diaryId);
        return "cultivationDiaryDetail";
    }

    @GetMapping("/cultivation-diaries/{diaryId}/edit")
    public String editForm(@PathVariable Long diaryId, Model model) {
        model.addAttribute("diaryView", "edit");
        model.addAttribute("diaryId", diaryId);
        return "cultivationDiaryForm";
    }
}

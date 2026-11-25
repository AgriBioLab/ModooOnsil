package kr.swdl.modooonsil.cultivation.diary.controller;

import kr.swdl.modooonsil.cultivation.diary.domain.FindAllCultivationDiaryVO;
import kr.swdl.modooonsil.cultivation.diary.service.CultivationDiaryService;
import kr.swdl.modooonsil.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.text.Collator;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.function.Function;

@Controller
@RequiredArgsConstructor
public class CultivationDiaryController {
    private final CultivationDiaryService service;

    @GetMapping("/cultivationDiaryList.html")
    public String list(@AuthenticationPrincipal CustomUserDetails user,
                       @RequestParam(defaultValue = "list") String view,
                       @RequestParam(defaultValue = "false") boolean fragment,
                       @RequestParam(required = false) String planName,
                       @RequestParam(required = false) String greenhouseName,
                       @RequestParam(required = false) String cropName,
                       @RequestParam(required = false) String varietyName,
                       @RequestParam(required = false) LocalDate workedDate, Model model) {
        model.addAttribute("listView", fragment || "list".equals(view));
        if (!fragment && !"list".equals(view)) {
            return "cultivationDiaryList";
        }

        if (user == null) {
            return "redirect:/login.html";
        }

        Long memberId = user.getMemberId();
        List<FindAllCultivationDiaryVO> allRows = service.findAll(memberId, null, null, null, null, null);
        List<FindAllCultivationDiaryVO> rows = planName == null && greenhouseName == null && cropName == null
                && varietyName == null && workedDate == null
                ? allRows : service.findAll(memberId, planName, cropName, varietyName, workedDate, greenhouseName);
        model.addAttribute("diaries", rows);
        model.addAttribute("totalRows", rows.size());
        model.addAttribute("plans", options(allRows, FindAllCultivationDiaryVO::getPlanName));
        model.addAttribute("greenhouses", options(allRows, FindAllCultivationDiaryVO::getGreenhouseName));
        model.addAttribute("crops", options(allRows, FindAllCultivationDiaryVO::getCropName));
        model.addAttribute("varieties", allRows.stream()
                .filter(row -> row.getVarietyName() != null && !row.getVarietyName().isBlank())
                .map(row -> new VarietyOption(row.getCropName(), row.getVarietyName()))
                .distinct()
                .sorted((first, second) -> koreanOrder().compare(first.name(), second.name()))
                .toList());
        model.addAttribute("planName", planName);
        model.addAttribute("greenhouseName", greenhouseName);
        model.addAttribute("cropName", cropName);
        model.addAttribute("varietyName", varietyName);
        model.addAttribute("workedDate", workedDate);
        return fragment ? "diary-list :: diaryList" : "cultivationDiaryList";
    }

    private List<String> options(List<FindAllCultivationDiaryVO> rows,
                                 Function<FindAllCultivationDiaryVO, String> field) {
        return rows.stream().map(field).filter(Objects::nonNull).filter(value -> !value.isBlank())
                .distinct().sorted(koreanOrder()).toList();
    }

    private Collator koreanOrder() {
        return Collator.getInstance(Locale.KOREAN);
    }

    public record VarietyOption(String crop, String name) {}
}

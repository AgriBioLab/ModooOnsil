package kr.swdl.modooonsil.cultivation.diary.controller;

import kr.swdl.modooonsil.common.dto.PageRequest;
import kr.swdl.modooonsil.common.dto.PageResponse;
import kr.swdl.modooonsil.cultivation.diary.domain.DiaryPlan;
import kr.swdl.modooonsil.cultivation.diary.domain.FindAllCultivationDiaryVO;
import kr.swdl.modooonsil.cultivation.diary.dto.CreateRequest;
import kr.swdl.modooonsil.cultivation.diary.dto.CreateDiaryResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.DiaryDetailResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.StageOptionsResponse;
import kr.swdl.modooonsil.cultivation.diary.dto.UpdateRequest;
import kr.swdl.modooonsil.cultivation.diary.service.CultivationDiaryService;
import kr.swdl.modooonsil.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cultivation-diaries")
public class CultivationDiaryRestController {
    private final CultivationDiaryService service;

    @GetMapping
    public List<FindAllCultivationDiaryVO> list(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String planName,
            @RequestParam(required = false) String cropName,
            @RequestParam(required = false) String varietyName,
            @RequestParam(required = false) LocalDate workedDate,
            @RequestParam(required = false) String greenhouseName) {
        return service.findAll(user.getMemberId(), planName, cropName, varietyName, workedDate, greenhouseName);
    }

    @GetMapping("/page")
    public PageResponse<FindAllCultivationDiaryVO> listPage(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String planName,
            @RequestParam(required = false) String cropName,
            @RequestParam(required = false) String varietyName,
            @RequestParam(required = false) LocalDate workedDate,
            @RequestParam(required = false) String greenhouseName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size) {
        return service.findPage(user.getMemberId(), planName, cropName, varietyName, workedDate, greenhouseName,
                new PageRequest(page, size));
    }

    @GetMapping("/plans")
    public List<DiaryPlan> plans(@AuthenticationPrincipal CustomUserDetails user) {
        return service.findActivePlans(user.getMemberId());
    }

    @GetMapping("/plans/{planId}/stages")
    public StageOptionsResponse stages(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long planId,
                               @RequestParam LocalDate workedDate) {
        return service.stageOptions(user.getMemberId(), planId, workedDate);
    }

    @GetMapping("/{diaryId}")
    public DiaryDetailResponse detail(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long diaryId) {
        return service.findDetail(user.getMemberId(), diaryId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateDiaryResponse create(@AuthenticationPrincipal CustomUserDetails user, @RequestBody CreateRequest request) {
        return new CreateDiaryResponse(service.create(user.getMemberId(), request));
    }

    @PutMapping("/{diaryId}/tasks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateTasks(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long diaryId,
                            @RequestBody UpdateRequest request) {
        service.updateTasks(user.getMemberId(), diaryId, request.getTasks());
    }

    @DeleteMapping("/{diaryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long diaryId) {
        service.delete(user.getMemberId(), diaryId);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleStatus(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(exception.getBody());
    }
}

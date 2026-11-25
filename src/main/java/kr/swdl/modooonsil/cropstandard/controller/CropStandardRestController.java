package kr.swdl.modooonsil.cropstandard.controller;

import kr.swdl.modooonsil.cropstandard.domain.CropOption;
import kr.swdl.modooonsil.cropstandard.domain.CropStandard;
import kr.swdl.modooonsil.cropstandard.service.CropStandardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crops")
public class CropStandardRestController {

    private final CropStandardService cropStandardService;

    @GetMapping
    public ResponseEntity<List<CropOption>> findCrops() {
        return ResponseEntity.ok(cropStandardService.findCrops());
    }

    @GetMapping("/{cropId}/standards")
    public ResponseEntity<List<CropStandard>> findStandards(@PathVariable("cropId") Long cropId) {
        return ResponseEntity.ok(cropStandardService.findCropStandardByCropId(cropId));
    }
}

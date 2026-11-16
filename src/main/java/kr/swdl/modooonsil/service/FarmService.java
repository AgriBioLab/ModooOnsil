package kr.swdl.modooonsil.service;

import static kr.swdl.modooonsil.service.Values.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;

import kr.swdl.modooonsil.repository.FarmMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FarmService {
    private static final Set<String> GREENHOUSE_TYPES = Set.of("단동", "연동");
    private static final Set<String> COVERS = Set.of("유리", "비닐");
    private static final Set<String> MEDIA = Set.of("수태", "코코피트");
    private static final List<String> RANGES = List.of(
        "dayTemp", "nightTemp", "humidity", "co2", "radiation", "light",
        "soilTemp", "soilMoisture", "soilEc", "soilPh");

    private final FarmMapper farms;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public long authenticate(Map<String, Object> body) {
        var row = farms.credentials(params("username", required(body, "username", 50)));
        if (row == null || !encoder.matches(password(body, "password"), (String) row.get("password"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디와 비밀번호를 확인하세요.");
        }
        return id(row, "memberId");
    }

    public synchronized long register(Map<String, Object> body) {
        var values = params("farmName", required(body, "farmName", 100),
            "representativeName", required(body, "representativeName", 50),
            "username", required(body, "username", 50), "email", optional(body, "email", 255));
        if (farms.countUsername(values) > 0) throw conflict("이미 사용 중인 아이디입니다.");
        checkEmail(values.get("email"), 0L);
        values.put("password", encoder.encode(password(body, "password")));
        farms.insertMember(values);
        return id(values, "memberId");
    }

    public boolean usernameAvailable(String username) {
        return farms.countUsername(params("username", required(params("username", username), "username", 50))) == 0;
    }

    public boolean emailAvailable(String email, long memberId) {
        return farms.countEmail(params("email", required(params("email", email), "email", 255),
            "memberId", memberId)) == 0;
    }

    private void checkEmail(Object email, long memberId) {
        if (email != null && !emailAvailable(email.toString(), memberId)) {
            throw conflict("이미 사용 중인 이메일입니다.");
        }
    }

    public Map<String, Object> profile(long memberId) {
        return found(farms.profile(params("memberId", memberId)));
    }

    public synchronized Map<String, Object> updateProfile(long memberId, Map<String, Object> body) {
        var values = params("memberId", memberId, "farmName", required(body, "farmName", 100),
            "representativeName", required(body, "representativeName", 50),
            "email", optional(body, "email", 255), "phoneNumber", optional(body, "phoneNumber", 20),
            "farmAddress", optional(body, "farmAddress", 255),
            "farmAddressDetail", optional(body, "farmAddressDetail", 255),
            "mainCrop", optional(body, "mainCrop", 100),
            "farmDescription", optional(body, "farmDescription", 16000));
        checkEmail(values.get("email"), memberId);
        farms.updateMember(values);
        return profile(memberId);
    }

    public void changePassword(long memberId, Map<String, Object> body) {
        var row = found(farms.passwordByMember(params("memberId", memberId)));
        String previous = (String) row.get("password");
        if (!encoder.matches(password(body, "currentPassword"), previous)) {
            throw bad("현재 비밀번호가 일치하지 않습니다.");
        }
        var values = params("memberId", memberId, "previous", previous,
            "password", encoder.encode(password(body, "newPassword")));
        if (farms.updatePassword(values) != 1) throw conflict("비밀번호 확인을 다시 시도하세요.");
    }

    private String password(Map<String, Object> body, String key) {
        if (!(body.get(key) instanceof String value) || value.isBlank()
                || value.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw bad("비밀번호 입력을 확인하세요.");
        }
        return value;
    }

    public List<Map<String, Object>> greenhouses(long memberId, String name, String type, String cover, String medium) {
        singleFilter(name, type, cover, medium);
        return farms.greenhouses(params("memberId", memberId, "name", name, "type", type,
            "cover", cover, "medium", medium));
    }

    public Map<String, Object> greenhouse(long memberId, long greenhouseId) {
        return found(farms.greenhouse(params("memberId", memberId, "greenhouseId", greenhouseId)));
    }

    public Map<String, Object> saveGreenhouse(long memberId, Long greenhouseId, Map<String, Object> body) {
        var values = params("memberId", memberId, "greenhouseId", greenhouseId,
            "greenhouseName", required(body, "greenhouseName", 100),
            "greenhouseType", choice(body, "greenhouseType", GREENHOUSE_TYPES, false),
            "coverType", choice(body, "coverType", COVERS, false),
            "mediumType", choice(body, "mediumType", MEDIA, false),
            "buildingCount", positiveInt(body, "buildingCount", false),
            "sideHeight", nonnegative(body, "sideHeight", 6),
            "width", nonnegative(body, "width", 8), "length", nonnegative(body, "length", 8),
            "registeredArea", nonnegative(body, "registeredArea", 12),
            "greenhouseImageUrl", optional(body, "greenhouseImageUrl", 500));
        if (greenhouseId == null) farms.insertGreenhouse(values);
        else farms.updateGreenhouse(values);
        return greenhouse(memberId, id(values, "greenhouseId"));
    }

    private BigDecimal nonnegative(Map<String, Object> body, String key, int precision) {
        BigDecimal value = decimal(body, key, precision, 2);
        if (value != null && value.signum() < 0) throw bad(key + " 값은 0 이상이어야 합니다.");
        return value;
    }

    public void deleteGreenhouse(long memberId, long greenhouseId) {
        greenhouse(memberId, greenhouseId);
        if (farms.deleteGreenhouse(params("memberId", memberId, "greenhouseId", greenhouseId)) != 1) {
            throw conflict("연결된 작기가 있는 온실은 삭제할 수 없습니다.");
        }
    }

    public List<Map<String, Object>> crops(String name, String variety) {
        singleFilter(name, variety);
        return farms.crops(params("name", name, "variety", variety));
    }

    public Map<String, Object> crop(long cropId) {
        return found(farms.crop(params("cropId", cropId)));
    }

    public Map<String, Object> saveCrop(Long cropId, Map<String, Object> body) {
        var values = params("cropId", cropId, "cropName", required(body, "cropName", 100),
            "varietyName", required(body, "varietyName", 100));
        if (cropId == null) farms.insertCrop(values);
        else farms.updateCrop(values);
        return crop(id(values, "cropId"));
    }

    public void deleteCrop(long cropId) {
        crop(cropId);
        if (farms.deleteCrop(params("cropId", cropId)) != 1) {
            throw conflict("환경기준이 연결된 품목은 삭제할 수 없습니다.");
        }
    }

    public List<Map<String, Object>> standards(long cropId) {
        crop(cropId);
        return farms.standards(params("cropId", cropId));
    }

    public Map<String, Object> standard(long cropId, long standardId) {
        return found(farms.standard(params("cropId", cropId, "standardId", standardId)));
    }

    @Transactional
    public Map<String, Object> saveStandard(long cropId, Long standardId, Map<String, Object> body) {
        exists(farms.lockCrop(params("cropId", cropId)));
        var values = params("cropId", cropId, "standardId", standardId == null ? 0L : standardId,
            "growthStage", required(body, "growthStage", 30),
            "stageDurationDays", positiveInt(body, "stageDurationDays", true),
            "stageOrder", positiveInt(body, "stageOrder", true));
        if (farms.countStageOrder(values) > 0) throw conflict("이 품목에 같은 단계 순서가 있습니다.");
        if (farms.countStageName(values) > 0) throw conflict("이 품목에 같은 생육단계가 있습니다.");
        for (String metric : RANGES) {
            int precision = switch (metric) {
                case "radiation", "light" -> 10;
                case "co2", "soilEc" -> 8;
                case "soilPh" -> 4;
                default -> 5;
            };
            int scale = "soilEc".equals(metric) ? 3 : 2;
            BigDecimal lo = decimal(body, metric + "Min", precision, scale);
            BigDecimal hi = decimal(body, metric + "Max", precision, scale);
            if (lo != null && hi != null && lo.compareTo(hi) > 0) {
                throw bad(metric + " 최솟값이 최댓값보다 큽니다.");
            }
            values.put(metric + "Min", lo);
            values.put(metric + "Max", hi);
        }
        if (standardId == null) {
            farms.insertStandard(values);
        } else {
            standard(cropId, standardId);
            if (farms.updateStandard(values) != 1) {
                throw conflict("진행·종료 작기에서 사용하는 환경기준은 수정할 수 없습니다.");
            }
        }
        return standard(cropId, id(values, "standardId"));
    }

    public void deleteStandard(long cropId, long standardId) {
        standard(cropId, standardId);
        if (farms.deleteStandard(params("cropId", cropId, "standardId", standardId)) != 1) {
            throw conflict("작기에서 사용하는 환경기준은 삭제할 수 없습니다.");
        }
    }
}

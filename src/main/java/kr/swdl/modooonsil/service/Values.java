package kr.swdl.modooonsil.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Values {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private Values() {}

    static Map<String, Object> params(Object... pairs) {
        Map<String, Object> result = new HashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            result.put((String) pairs[i], pairs[i + 1]);
        }
        return result;
    }

    static String optional(Map<String, Object> body, String name, int max) {
        Object value = body.get(name);
        if (value == null) return null;
        if (!(value instanceof String raw)) throw bad(name + " 입력 형식을 확인하세요.");
        String text = raw.trim();
        if (text.length() > max) throw bad(name + " 입력 길이를 확인하세요.");
        return text.isEmpty() ? null : text;
    }

    static String required(Map<String, Object> body, String name, int max) {
        String value = optional(body, name, max);
        if (value == null) throw bad(name + " 값을 입력하세요.");
        return value;
    }

    static String choice(Map<String, Object> body, String name, Set<String> allowed, boolean required) {
        String value = required ? required(body, name, 30) : optional(body, name, 30);
        if (value != null && !allowed.contains(value)) throw bad(name + " 선택값을 확인하세요.");
        return value;
    }

    static long id(Map<String, Object> body, String key) {
        Long id = integer(body, key);
        if (id == null || id <= 0) throw bad(key + " 식별번호를 확인하세요.");
        return id;
    }

    static Long integer(Map<String, Object> body, String key) {
        Object raw = body.get(key);
        if (raw == null || raw.toString().isBlank()) return null;
        try {
            return new BigDecimal(raw.toString()).longValueExact();
        } catch (IllegalArgumentException | ArithmeticException e) {
            throw bad(key + "에는 정수를 입력하세요.");
        }
    }

    static Integer positiveInt(Map<String, Object> body, String key, boolean required) {
        Long value = integer(body, key);
        if (value == null && !required) return null;
        if (value == null || value < 1 || value > Integer.MAX_VALUE) {
            throw bad(key + "에는 양의 정수를 입력하세요.");
        }
        return value.intValue();
    }

    static BigDecimal decimal(Map<String, Object> body, String key, int precision, int scale) {
        Object raw = body.get(key);
        if (raw == null || raw.toString().isBlank()) return null;
        try {
            BigDecimal value = new BigDecimal(raw.toString()).stripTrailingZeros();
            if (value.scale() > scale || value.precision() - value.scale() > precision - scale) {
                throw new NumberFormatException();
            }
            return value;
        } catch (NumberFormatException e) {
            throw bad(key + " 측정값의 범위를 확인하세요.");
        }
    }

    static LocalDate date(Map<String, Object> body, String key) {
        try {
            return LocalDate.parse(required(body, key, 10));
        } catch (java.time.DateTimeException e) {
            throw bad(key + " 날짜를 확인하세요.");
        }
    }

    static LocalDateTime dateTime(Map<String, Object> body, String key) {
        try {
            LocalDateTime value = LocalDateTime.parse(required(body, key, 25));
            if (value.getNano() != 0) throw bad(key + " 초 단위로 입력하세요.");
            return value;
        } catch (java.time.DateTimeException e) {
            throw bad(key + " 일시를 확인하세요.");
        }
    }

    static void range(Map<String, Object> args, LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) throw bad("시작일이 종료일보다 늦습니다.");
        args.put("from", from == null ? null : from.atStartOfDay());
        args.put("to", to == null ? null : to.plusDays(1).atStartOfDay());
    }

    static void singleFilter(Object... filters) {
        int selected = 0;
        for (Object filter : filters) {
            if (filter != null && !filter.toString().isBlank()) selected++;
        }
        if (selected > 1) throw bad("검색 조건은 한 가지를 선택하세요.");
    }

    static LocalDate today() { return LocalDate.now(SEOUL); }

    static LocalDate dbDate(Object value) {
        return value == null ? null : LocalDate.parse(value.toString().substring(0, 10));
    }

    static Map<String, Object> found(Map<String, Object> row) {
        if (row == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "대상 기록을 찾을 수 없습니다.");
        return row;
    }

    static void exists(Object id) {
        if (id == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "대상 기록을 찾을 수 없습니다.");
    }

    static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}

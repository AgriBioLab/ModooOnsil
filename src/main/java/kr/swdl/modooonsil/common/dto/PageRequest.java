package kr.swdl.modooonsil.common.dto;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Getter
public final class PageRequest {
    private final int page;
    private final int size;

    public PageRequest(int page, int size) {
        if (page < 1 || size < 1 || size > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "페이지는 1 이상, 페이지 크기는 1~100이어야 합니다.");
        }
        this.page = page;
        this.size = size;
    }
}

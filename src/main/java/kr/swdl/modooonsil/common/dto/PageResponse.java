package kr.swdl.modooonsil.common.dto;

import com.github.pagehelper.PageInfo;
import lombok.Value;

import java.util.List;

@Value
public class PageResponse<T> {
    List<T> items;
    int page;
    int size;
    long total;
    int totalPages;

    public static <T> PageResponse<T> from(PageInfo<T> result) {
        return new PageResponse<>(result.getList(), result.getPageNum(), result.getPageSize(),
                result.getTotal(), result.getPages());
    }
}

package kr.swdl.modooonsil.common;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public abstract class BaseEntity {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

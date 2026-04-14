package com.springboot.domain;

import java.time.LocalDateTime;
import lombok.Data; // 롬복 사용 시

@Data
public class Reply {
    private Long replyNum;
    private Long postNum;
    private String authorId;
    private String content;
    private LocalDateTime regDate;
}
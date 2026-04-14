package com.springboot.domain;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class Post {
    private Long postNum;
    private String category;
    private String title;
    private String content;
    private Long authorId;
    private String authorName; // 이 필드를 추가하세요!
    private int viewCount;
    private int replyCount;
    private boolean isNotice;
    private LocalDateTime regDate;

    // Getter, Setter 추가
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    private String authorNickname; // 👈 [추가] DB에서 JOIN으로 가져올 닉네임
}
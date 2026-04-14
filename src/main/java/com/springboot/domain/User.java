package com.springboot.domain;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long userId;        // 고유 식별자
    private String username;    // 로그인 아이디
    private String password;    // 비밀번호
    private String nickname;    // 사용자 닉네임
    private String role;        // 권한 (ADMIN, USER)
    private String bio;         // 마이페이지 자기소개
    private String language;    // 선호 언어
    
    // 🔥 [추가된 부분] 어학 실력 (초급, 중급, 고급)
    private String level;       
    
    @Column(length = 500) // 토큰이 꽤 깁니다
    private String fcmToken;

    // ✅ 토큰 업데이트용 메소드 (Setter 대신 사용 추천)
    public void updateFcmToken(String token) {
        this.fcmToken = token;
    }
}
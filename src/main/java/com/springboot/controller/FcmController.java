package com.springboot.controller; // ✅ 1번 줄에 이거 추가

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.domain.User;
import com.springboot.service.GlobarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fcm")
@RequiredArgsConstructor
public class FcmController {

    private final GlobarService globarservice; // 유저 정보를 수정해야 하니까요

    @PostMapping("/token")
    public ResponseEntity<String> saveToken(@RequestBody Map<String, String> request,
                                            @AuthenticationPrincipal User currentUser) {
        // 수정: Spring Security로부터 인증된 사용자를 직접 주입받음
        if (currentUser == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다");
        }

        // 프론트에서 { "token": "..." } 이렇게 보낼 겁니다.
        String token = request.get("token");

        // 수정: 하드코딩된 ID 제거, 현재 로그인한 사용자의 ID 사용
        Long currentUserId = currentUser.getUserId();

        globarservice.updateFcmToken(currentUserId, token);

        return ResponseEntity.ok("토큰 저장 완료");
    }
}
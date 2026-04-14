package com.springboot.controller; // ✅ 1번 줄에 이거 추가

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.service.GlobarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fcm")
@RequiredArgsConstructor
public class FcmController {

    private final GlobarService globarservice; // 유저 정보를 수정해야 하니까요

    @PostMapping("/token")
    public ResponseEntity<String> saveToken(@RequestBody Map<String, String> request) {
        // 프론트에서 { "token": "..." } 이렇게 보낼 겁니다.
        String token = request.get("token");
        
        // ⚠️ 중요: 실제로는 '현재 로그인한 유저'의 ID를 가져와야 합니다.
        // 시큐리티를 쓰고 계시다면 @AuthenticationPrincipal 등을 사용하세요.
        // 여기서는 예시로 ID가 1번인 유저라고 가정하고 코드를 짭니다.
        Long currentUserId = 1L; 

        globarservice.updateFcmToken(currentUserId, token);

        return ResponseEntity.ok("토큰 저장 완료");
    }
}
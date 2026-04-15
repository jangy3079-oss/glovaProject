package com.springboot.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource; // 👈 이거 임포트 필수!
// 수정: @Slf4j 추가 - System.out.println과 e.printStackTrace() 대신 SLF4J 로거 사용
import lombok.extern.slf4j.Slf4j;

import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            // ⚠️ [수정됨] "src/main/resources/..." 같은 경로는 서버에서 못 씁니다.
            // 대신 ClassPathResource를 쓰면 JAR 파일 안에 있는 파일을 꺼내올 수 있습니다.
            InputStream serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                // 수정: System.out.println → log.info() 전환
                log.info("[Firebase] 설정 성공");
            }
        } catch (Exception e) {
            // 수정: e.printStackTrace() + System.out.println → log.error() 전환
            log.error("[Firebase] 설정 실패 (파일을 찾을 수 없거나 키값 오류)", e);
        }
    }
}
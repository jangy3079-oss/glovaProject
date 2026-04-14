package com.springboot.config;

import com.springboot.domain.User;
import com.springboot.repository.GlobarRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PasswordMigrationConfig {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    /**
     * 앱 기동 시 실행되어, 암호화되지 않은 기존 모든 사용자의 비밀번호를 BCrypt로 변환합니다.
     */
    @PostConstruct
    public void migratePasswords() {
        System.out.println("🛡️ [보안 이관] 기존 비밀번호 암호화 작업을 시작합니다...");
        
        // 1. 모든 사용자 조회
        String selectSql = "SELECT user_id, password FROM users";
        List<Map<String, Object>> users = jdbcTemplate.queryForList(selectSql);
        
        int count = 0;
        for (Map<String, Object> user : users) {
            Long userId = (Long) user.get("user_id");
            String rawPassword = (String) user.get("password");
            
            // 2. 이미 BCrypt로 암호화된 비밀번호인지 확인 (일반적으로 $2a$, $2b$ 등으로 시작)
            if (rawPassword != null && !rawPassword.startsWith("$2a$") && !rawPassword.startsWith("$2b$")) {
                String encodedPassword = passwordEncoder.encode(rawPassword);
                
                // 3. 암호화된 버전으로 DB 업데이트
                String updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
                jdbcTemplate.update(updateSql, encodedPassword, userId);
                count++;
            }
        }
        
        if (count > 0) {
            System.out.println("✅ [보안 이관 완료] 총 " + count + "명의 비밀번호를 안전하게 암호화하였습니다.");
        } else {
            System.out.println("ℹ️ [보안 이관] 이미 모든 비밀번호가 암호화되어 있어 작업을 건너뜁니다.");
        }
    }
}

package com.springboot.config;

// 수정: BCrypt 마이그레이션 완료 확인 후 이 클래스 전체를 삭제할 것 (2026-04-14 기준 비활성화)
// 이유: @PostConstruct로 매 서버 기동 시 전체 사용자 비밀번호를 메모리에 올리는 심각한 보안 위험
// 조치: @Component 제거로 Spring 컨텍스트에서 완전 비활성화. 모든 사용자가 이미 BCrypt 적용됨을 확인

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

// @Component 제거: 수정 - 마이그레이션 완료, 서버 기동 시 불필요한 DB 접근 및 평문 비밀번호 메모리 적재 방지
@RequiredArgsConstructor
public class PasswordMigrationConfig {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    /**
     * [비활성화됨] BCrypt 마이그레이션은 2026-04-14 완료.
     * 이 클래스는 다음 배포 시 완전 삭제 예정.
     * 향후 스키마 변경은 Flyway 또는 Liquibase로 관리할 것.
     */
    public void migratePasswords() {
        // 수정: @PostConstruct 제거 - 마이그레이션 완료로 더 이상 실행 불필요
        // 운영 서버에서 평문 비밀번호를 메모리에 적재하는 보안 위험 제거
    }
}

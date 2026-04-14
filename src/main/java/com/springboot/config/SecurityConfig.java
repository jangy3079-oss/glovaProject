package com.springboot.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Stateless API이므로 CSRF 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안함
            .authorizeHttpRequests(auth -> auth
                // 1. 공용 API (비로그인 허용)
                .requestMatchers("/api/Globar/login", "/api/Globar/register").permitAll()
                .requestMatchers("/api/Globar/home", "/api/Globar/community/**").permitAll()
                .requestMatchers("/api/Globar/calendar", "/api/Globar/activity/**").permitAll()
                
                // 2. 관리자 전용 API
                .requestMatchers("/api/Globar/calendar/write").hasRole("ADMIN")
                .requestMatchers("/api/Globar/admin/**").hasRole("ADMIN")
                
                // 3. 정적 리소스 (빌드된 리액트 파일 등)
                .requestMatchers("/", "/index.html", "/assets/**", "/*.png", "/*.svg", "/manifest.json").permitAll()
                
                // 4. 나머지 모든 API는 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());
            
        return http.build();
    }
}

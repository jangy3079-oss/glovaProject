package com.springboot.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.springboot.domain.User;
import com.springboot.service.GlobarService;
import com.springboot.repository.GlobarRepository;
import com.springboot.util.JwtUtil;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private GlobarRepository globarRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // CORS 프리플라이트(OPTIONS) 요청은 통과시킴
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String token = null;

        // 1. 헤더에서 추출 (주로 리액트 연동 시 사용)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 2. 헤더에 없으면 쿠키에서 추출 확인
        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            String username = jwtUtil.validateAndGetUsername(token);
            if (username != null) {
                // 토큰이 유효하면 DB에서 유저 조회해서 세션 대신 request attribute에 담음
                User loginUser = globarRepository.findByUsername(username);
                if (loginUser != null) {
                    request.setAttribute("loginUser", loginUser);
                    return true;
                }
            }
        }

        // 유효한 토큰이 없으면 401 Unauthorized 에러 응답 (뷰 리다이렉트 안함 -> REST API 방식)
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"로그인이 필요합니다.\"}");
        return false;
    }
}

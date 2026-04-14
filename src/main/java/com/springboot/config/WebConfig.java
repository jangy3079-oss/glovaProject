package com.springboot.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.springboot.interceptor.AuthInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/Globar/**") // Globar 내의 모든 경로 검사
                .excludePathPatterns("/api/Globar/login", "/api/Globar/register", "/api/Globar/community", "/api/Globar/community/**"); // 로그인 등 인증 필요없는 곳은 예외. 단, 댓글 작성등은 안에서 잡아주거나 세분화.
                // 커뮤니티 조회는 비회원도 볼 수 있게 열어둡니다. (만약 다 막으시려면 커뮤니티도 빼주세요)
    }

    // React 연동을 위한 CORS 글로벌 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://glova.cloud", "https://www.glova.cloud", "http://localhost:5173", "http://127.0.0.1:5173") // 운영 도메인 및 리액트 개발포트 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // 쿠키 포함 전송 허용
                .maxAge(3600);
    }

    // 모든 비-API 경로를 React index.html로 리다이렉트 (SPA 라우팅 지원)
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{path:[^\\.]*}/**")
                .setViewName("forward:/index.html");
    }

    // 정적 리소스(assets) 경로 명시적 매핑
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
    }
}

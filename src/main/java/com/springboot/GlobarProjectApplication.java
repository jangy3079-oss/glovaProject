package com.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
// 수정: @Slf4j 추가 - System.out.println 대신 SLF4J 로거 사용
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootApplication
@EntityScan(basePackages = "com.springboot") // 👈 "여기서 테이블(Entity) 찾아!"
@EnableJpaRepositories(basePackages = "com.springboot")
public class GlobarProjectApplication {

	public static void main(String[] args) {
		// 수정: System.out.println → log.info() 전환
		log.info("[서버 시작] Globar Server 배포됨");
		SpringApplication.run(GlobarProjectApplication.class, args);
	}

}

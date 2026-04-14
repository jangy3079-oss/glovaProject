package com.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.springboot") // 👈 "여기서 테이블(Entity) 찾아!"
@EnableJpaRepositories(basePackages = "com.springboot")
public class GlobarProjectApplication {

	public static void main(String[] args) {
		System.out.println("\n\n🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩\n🚀🚀 Globar Server REDEPLOYED - APR 11 🚀🚀\n🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩🚩\n\n");
		SpringApplication.run(GlobarProjectApplication.class, args);
	}

}

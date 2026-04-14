package com.springboot.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    private Long actNum;
    private String title;
    private LocalDateTime eventDate;
    private int maxParticipants;
    private int currentParticipants;
    private String location;
    private String description; // 🛠️ 이제 도메인에 포함되었습니다.
}
package com.springboot.domain;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Attendance {
    private Long attId;
    private Long actNum;
    private String userId;
    private LocalDateTime attDate;
    private String nickname;
}
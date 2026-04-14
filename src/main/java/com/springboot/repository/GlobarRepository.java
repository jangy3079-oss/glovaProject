package com.springboot.repository;

import com.springboot.domain.User;
import com.springboot.domain.Post;
import com.springboot.domain.Reply;
import com.springboot.domain.Activity;
import com.springboot.domain.Attendance;
import com.springboot.domain.AttendeeDto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

public interface GlobarRepository {
    // User 관련
    User findByUsername(String username);
    User findByNickname(String nickname);
    int saveUser(User user);
    void updateFcmToken(Long userId, String token);
    String findFcmTokenByUserId(Long userId);
    void updatePassword(String username, String encodedPassword);

    // Community 관련
    List<Post> findPostsByCategory(String category);
    Post findPostByNum(Long postNum);
    int insertPost(Post post);
    List<Reply> getRepliesByPostNum(Long postNum);
    void saveReply(Reply reply);
    void incrementViewCount(Long postNum);
    
    // Calendar 관련
    List<Activity> findAllActivities();
    Activity findActivityByNum(Long actNum);
    int updateActivityCount(Long actNum); // 신청 시 인원수 증가
    void insertActivity(Activity activity);
    List<Activity> findActivitiesByDateRange(LocalDateTime start, LocalDateTime end);
    
    //출석체크
    void saveAttendance(Long actNum, Long userId);
    void incrementParticipantCount(Long actNum);
    boolean isAttended(Long actNum, Long userId);
    List<Attendance> findAttendanceListByActNum(Long actNum);
    Activity getNextWeekActivity();
    List<AttendeeDto> getAttendeesForSeat(Long actNum);
	List<String> findAllFcmTokens();
    
    void deleteFcmToken(String token);
}
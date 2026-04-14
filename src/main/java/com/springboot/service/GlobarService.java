package com.springboot.service;

import com.springboot.domain.User;
import com.springboot.domain.Post;
import com.springboot.domain.Reply;
import com.springboot.domain.Activity;
import com.springboot.domain.Attendance;
import com.springboot.domain.AttendeeDto;

import java.util.List;

public interface GlobarService {
    User login(String username, String password);
    List<Post> getPostsByCategory(String category);
    void addPost(Post post, User user);
    boolean applyActivity(Long actNum, Long userId);
    void addActivity(Activity activity);
    void register(User user);
    Post getPostDetail(Long postNum);
    List<Activity> getWeeklyActivities();
    Activity getActivityDetail(Long actNum);
    Activity getActivityByNum(Long actNum);
    Activity getNextWeekActivity();
    Post getPostByNum(Long postNum);
    List<Activity> getAllActivities();
    List<Activity> getMonthlyActivities();
    List<Reply> getReplies(Long postNum);
    void addReply(Reply reply);
    void checkAttendance(Long actNum, Long userId);
    void checkAttendance(Long userId);
    List<Attendance> getAttendanceList(Long actNum);
    
    // 🔥 [추가/수정됨] 토큰 갱신, 자리배정, 조회수 증가
    void updateFcmToken(Long userId, String token);
    List<AttendeeDto> getAttendeesForSeat(Long actNum);
    void incrementViewCount(Long postNum);

    // 아이디 찾기 및 비밀번호 재설정
    String findIdByNickname(String nickname);
    boolean resetPassword(String username, String nickname, String newPassword);
}
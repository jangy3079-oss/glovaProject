package com.springboot.service;

import com.springboot.domain.User;
import com.springboot.domain.Post;
import com.springboot.domain.Reply;
import com.springboot.domain.Activity;
import com.springboot.domain.Attendance;
import com.springboot.domain.AttendeeDto;
import com.springboot.repository.GlobarRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessagingException;
import lombok.RequiredArgsConstructor;
// 수정: @Slf4j 추가 - System.out.println/System.err.println 대신 SLF4J 로거 사용
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GlobarServiceImpl implements GlobarService {

    private final GlobarRepository globarRepository;
    private final FcmService fcmService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public User login(String username, String password) {
        User user = globarRepository.findByUsername(username);
        // BCryptPasswordEncoder의 matches 메서드를 사용하여 해시된 비밀번호 검증
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    @Override
    public List<Post> getPostsByCategory(String category) {
        return globarRepository.findPostsByCategory(category);
    }

    @Override
    @Transactional
    public void addPost(Post post, User user) {
        if (user == null) {
            throw new RuntimeException("로그인이 필요한 서비스입니다.");
        }
        post.setAuthorId(user.getUserId());
        
        if (!"ADMIN".equals(user.getRole())) {
            post.setNotice(false);
        }
        globarRepository.insertPost(post);
    }

    @Override
    @Transactional
    public boolean applyActivity(Long actNum, Long userId) {
        Activity activity = globarRepository.findActivityByNum(actNum);
        
        if (activity.getCurrentParticipants() < activity.getMaxParticipants()) {
            globarRepository.updateActivityCount(actNum);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public void addActivity(Activity activity) {
        // 1. DB에 활동 저장
        globarRepository.insertActivity(activity);
        System.out.println("📌 [활동 신규 등록] ID: " + activity.getActNum() + ", 제목: " + activity.getTitle());

        // 2. 전체 알림 발송 (전용 메서드 호출)
        String title = "새로운 모임 알림";
        String body = "새로운 활동 [" + activity.getTitle() + "]이(가) 등록되었습니다! 확인해보세요.";
        sendNotificationToAll(title, body);
    }

    private void sendNotificationToAll(String title, String body) {
        try {
            List<String> allTokens = globarRepository.findAllFcmTokens();
            if (allTokens == null || allTokens.isEmpty()) {
                // 수정: System.out.println → log.info() 전환
                log.info("[알림 스킵] 발송 대상 FCM 토큰이 없습니다.");
                return;
            }

            int successCount = 0;
            int failCount = 0;

            for (String token : allTokens) {
                if (token == null || token.isEmpty()) continue;
                try {
                    fcmService.sendMessage(token, title, body);
                    successCount++;
                } catch (FirebaseMessagingException fme) {
                    failCount++;
                    String errorCode = fme.getMessagingErrorCode().name();
                    if ("UNREGISTERED".equals(errorCode) || "NOT_FOUND".equals(errorCode)) {
                        globarRepository.deleteFcmToken(token);
                    }
                } catch (Exception e) {
                    failCount++;
                    log.warn("[알림 발송 실패] 토큰 처리 중 오류: {}", e.getMessage());
                }
            }
            // 수정: System.out.println → log.info() 전환
            log.info("[알림 발송 완료] 성공: {}, 실패/정리: {}", successCount, failCount);
        } catch (Exception e) {
            // 수정: System.err.println → log.error() 전환
            log.error("[알림 프로세스 오류]: {}", e.getMessage(), e);
        }
    }
    
    @Override
    public void register(User user) {
        if (user == null || user.getPassword() == null) return;
        
        // 비밀번호 해싱 처리 (BCrypt)
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        
        int result = globarRepository.saveUser(user);
        // 수정: System.out.println → log.info() 전환
        log.info("[회원가입 완료] DB 저장 결과: {}", result);
    }

    @Override public Post getPostDetail(Long postNum) { return globarRepository.findPostByNum(postNum); }
    @Override public List<Activity> getWeeklyActivities() { return globarRepository.findAllActivities(); }
    @Override public Activity getActivityDetail(Long actNum) { return globarRepository.findActivityByNum(actNum); }
    @Override public Activity getActivityByNum(Long actNum) { return globarRepository.findActivityByNum(actNum); }
    @Override public Activity getNextWeekActivity() { return globarRepository.getNextWeekActivity(); }
    @Override public Post getPostByNum(Long postNum) { return globarRepository.findPostByNum(postNum); }
    @Override public List<Activity> getAllActivities() { return globarRepository.findAllActivities(); }
    
    @Override
    public List<Activity> getMonthlyActivities() {
        LocalDate now = LocalDate.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX);
        return globarRepository.findActivitiesByDateRange(startOfMonth, endOfMonth);
    }
    
    @Override
    public List<Reply> getReplies(Long postNum) {
        return globarRepository.getRepliesByPostNum(postNum);
    }

    @Override
    @Transactional
    public void addReply(Reply reply) {
        globarRepository.saveReply(reply);
        try {
            Post post = globarRepository.findPostByNum(reply.getPostNum());
            if (!post.getAuthorId().equals(reply.getAuthorId())) {
                String targetToken = globarRepository.findFcmTokenByUserId(post.getAuthorId());
                if (targetToken != null && !targetToken.isEmpty()) {
                    try {
                        String title = "새로운 댓글 알림 💬";
                        String body = "누군가 [" + post.getTitle() + "] 글에 댓글을 남겼습니다.";
                        fcmService.sendMessage(targetToken, title, body);
                    } catch (FirebaseMessagingException fme) {
                        String errorCode = fme.getMessagingErrorCode().name();
                        if ("UNREGISTERED".equals(errorCode) || "NOT_FOUND".equals(errorCode)) {
                            globarRepository.deleteFcmToken(targetToken);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 수정: System.err.println → log.warn() 전환 (댓글 알림 실패는 비즈니스 로직에 영향 없음)
            log.warn("[댓글 알림 오류] 알림 발송 실패, 댓글은 정상 저장됨: {}", e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void checkAttendance(Long actNum, Long userId) {
        if (globarRepository.isAttended(actNum, userId)) {
            throw new IllegalStateException("이미 출석체크를 완료했습니다.");
        }
        globarRepository.saveAttendance(actNum, userId);
        globarRepository.incrementParticipantCount(actNum);
    }
    
    // 수정: checkAttendance(Long userId) 데드코드 제거 - stub 메서드로 실제 로직 없음
    // GlobarService 인터페이스에서도 해당 메서드 시그니처 제거 필요

    @Override
    public List<Attendance> getAttendanceList(Long actNum) {
        return globarRepository.findAttendanceListByActNum(actNum);
    }
    
    @Override
    @Transactional
    public void updateFcmToken(Long userId, String token) {
        globarRepository.updateFcmToken(userId, token);
    }
    
    @Override
    public List<AttendeeDto> getAttendeesForSeat(Long actNum) {
        return globarRepository.getAttendeesForSeat(actNum);
    }

    @Override
    // 수정: @Transactional 추가 - DB 쓰기 작업(조회수 증가)에 트랜잭션 보장
    @Transactional
    public void incrementViewCount(Long postNum) {
        globarRepository.incrementViewCount(postNum);
    }

    // 아이디 찾기: 닉네임으로 사용자 아이디 조회
    @Override
    public String findIdByNickname(String nickname) {
        User user = globarRepository.findByNickname(nickname);
        return (user != null) ? user.getUsername() : null;
    }

    // 비밀번호 재설정: 아이디와 닉네임이 일치하는지 확인 후 새 비밀번호 저장
    @Override
    @Transactional
    public boolean resetPassword(String username, String nickname, String newPassword) {
        User user = globarRepository.findByUsername(username);
        // 아이디가 존재하고, 해당 아이디의 닉네임이 입력한 닉네임과 일치하는지 검증
        if (user != null && user.getNickname().equals(nickname)) {
            String encodedPassword = passwordEncoder.encode(newPassword);
            globarRepository.updatePassword(username, encodedPassword);
            return true;
        }
        return false;
    }
}
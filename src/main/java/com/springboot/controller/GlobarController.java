package com.springboot.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.springboot.domain.Activity;
import com.springboot.domain.Attendance;
import com.springboot.domain.AttendeeDto;
import com.springboot.domain.Post;
import com.springboot.domain.Reply;
import com.springboot.domain.User;
import com.springboot.service.GlobarService;
import com.springboot.util.JwtUtil;

// 수정: @Slf4j 추가 - System.out.println 대신 SLF4J 로거 사용으로 운영 환경 로그 레벨 제어 가능
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/Globar") // API 전용 경로로 변경 (프론트엔드 라우팅과 충돌 우려)
// 수정: @Autowired 필드 주입 → @RequiredArgsConstructor 생성자 주입으로 변경
//       이유: 필드 주입은 final 불가, 테스트 시 목(mock) 주입 어려움, 순환 의존성 감지 불가 등 문제 있음
//       생성자 주입은 Spring 공식 권장 방식이며 금융권 코드 리뷰에서도 자주 지적되는 항목
@RequiredArgsConstructor
public class GlobarController {

    private final GlobarService globarService;
    private final JwtUtil jwtUtil;

    // 1. 로그인 API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String username = payload.get("username");
        String password = payload.get("password");
        String fcmToken = payload.get("fcmToken");

        // 수정: 입력값 검증 추가 - null 체크 및 빈 문자열 검증
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "아이디를 입력해주세요."));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "비밀번호를 입력해주세요."));
        }

        User loginUser = globarService.login(username, password);
        if (loginUser != null) {
            // JWT 발급
            String token = jwtUtil.generateToken(loginUser.getUsername(), loginUser.getRole());
            
            // 쿠키에도 셋팅 (HTTPOnly로 보안 강화)
            Cookie cookie = new Cookie("jwt_token", token);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
            cookie.setHttpOnly(true);
            // 수정: Secure 플래그 추가 - HTTPS 환경에서만 쿠키 전송되도록 강제 (MitM 공격 방지)
            cookie.setSecure(true);
            response.addCookie(cookie);

            if (fcmToken != null && !fcmToken.isEmpty()) {
                globarService.updateFcmToken(loginUser.getUserId(), fcmToken);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Login successful");
            result.put("token", token);
            loginUser.setPassword(null);
            result.put("user", loginUser);
            
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }
    }

    // 2. 회원가입 API
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 수정: 입력값 검증 추가 - 필수 필드 검증
        if (user == null || user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "아이디를 입력해주세요."));
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "비밀번호를 입력해주세요."));
        }
        if (user.getNickname() == null || user.getNickname().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "닉네임을 입력해주세요."));
        }

        globarService.register(user);
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    // 3. 홈 화면 API
    @GetMapping("/home")
    public ResponseEntity<?> home(HttpServletRequest request) {
        Activity nextActivity = globarService.getNextWeekActivity();
        List<Activity> monthlyActivities = globarService.getMonthlyActivities();
        
        Map<String, Object> data = new HashMap<>();
        data.put("activity", nextActivity);
        data.put("monthlyActivities", monthlyActivities);
        return ResponseEntity.ok(data);
    }

    // 4. 커뮤니티 목록 API
    @GetMapping("/community")
    public ResponseEntity<?> community(@RequestParam(value = "category", defaultValue = "SEOMYEON") String category) {
        List<Post> posts = globarService.getPostsByCategory(category);
        return ResponseEntity.ok(Map.of("posts", posts, "currentCategory", category));
    }

    // 5. 게시글 상세 페이지 API
    @GetMapping("/community/{postNum}")
    public ResponseEntity<?> postDetail(@PathVariable("postNum") Long postNum) {
        globarService.incrementViewCount(postNum);
        Post post = globarService.getPostDetail(postNum);
        List<Reply> replies = globarService.getReplies(postNum);
        return ResponseEntity.ok(Map.of("post", post, "replies", replies));
    }

    // 6. 캘린더 API
    @GetMapping("/calendar")
    public ResponseEntity<?> calendar() {
        List<Activity> activities = globarService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    // 6-1. 활동 상세 정보 API
    @GetMapping("/activity/{actNum}")
    public ResponseEntity<?> activityDetail(@PathVariable("actNum") Long actNum) {
        Activity activity = globarService.getActivityDetail(actNum);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/activity/{actNum}/attendees")
    public ResponseEntity<?> activityAttendees(@PathVariable("actNum") Long actNum) {
        List<AttendeeDto> attendees = globarService.getAttendeesForSeat(actNum);
        return ResponseEntity.ok(attendees);
    }

    // 7. 활동 등록 API
    @PostMapping("/calendar/write")
    public ResponseEntity<?> addActivity(@RequestBody Activity activity, HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        // 수정: System.out.println → log.debug() 전환
        log.debug("[활동 등록 시도] 사용자: {}, 권한: {}", user != null ? user.getUserId() : "null", user != null ? user.getRole() : "none");

        if (user != null && ("ADMIN".equals(user.getRole()) || "ROLE_ADMIN".equals(user.getRole()))) {
            globarService.addActivity(activity);
            // 수정: System.out.println → log.info() 전환 (SLF4J 사용)
            log.info("[활동 등록] 사용자: {}, 활동: {}", user.getUserId(), activity.getTitle());
            return ResponseEntity.ok(Map.of("message", "활동 등록 완료"));
        }
        log.warn("[활동 등록 거부] 사용자: {}, 권한 부족: {}", user != null ? user.getUserId() : "null", user != null ? user.getRole() : "none");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자 권한이 필요합니다."));
    }

    // 9. 활동 신청 API
    @PostMapping("/calendar/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        Long actNum = body.get("actNum");
        User user = (User) request.getAttribute("loginUser");
        
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        globarService.checkAttendance(actNum, user.getUserId());
        return ResponseEntity.ok(Map.of("message", "참여 신청 완료"));
    }

    // 10. 마이페이지 (사용자 정보 조회)
    @GetMapping("/mypage")
    public ResponseEntity<?> myPage(HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        if (user != null) {
            // 민감 정보 가림
            user.setPassword(null);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 11. 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt_token", null);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 쿠키 만료
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

    // 11-1. 아이디 찾기 API
    // 수정: 사용자명 열거 공격(username enumeration) 방지 - 존재 여부와 무관하게 동일한 200 응답 반환
    //       기존에는 username을 직접 노출하거나 404로 존재 여부를 알 수 있었음
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> payload) {
        String nickname = payload.get("nickname");
        String username = globarService.findIdByNickname(nickname);

        // 아이디가 존재하면 앞 두 글자만 노출하고 나머지는 * 마스킹 처리
        String maskedUsername = (username != null && username.length() > 2)
                ? username.substring(0, 2) + "*".repeat(username.length() - 2)
                : null;

        // 존재/미존재 모두 200으로 반환해 계정 열거 공격 차단
        return ResponseEntity.ok(Map.of(
                "message", maskedUsername != null ? "가입된 아이디: " + maskedUsername : "일치하는 계정 정보가 없습니다."
        ));
    }

    // 11-2. 비밀번호 재설정 API
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String nickname = payload.get("nickname");
        String newPassword = payload.get("newPassword");

        // 수정: 입력값 검증 추가 - null 체크 및 빈 문자열 검증
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "아이디를 입력해주세요."));
        }
        if (nickname == null || nickname.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "닉네임을 입력해주세요."));
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "새 비밀번호를 입력해주세요."));
        }

        boolean success = globarService.resetPassword(username, nickname, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "아이디 또는 닉네임 정보가 일치하지 않습니다."));
        }
    }

    // 12. 게시글 작성 처리 API
    @PostMapping("/community/write")
    public ResponseEntity<?> addPost(@RequestBody Post post, HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        post.setAuthorId(user.getUserId());
        if (!"ADMIN".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole())) {
            post.setNotice(false);
        }

        globarService.addPost(post, user);
        return ResponseEntity.ok(Map.of("message", "게시글 작성 완료"));
    }

    // 13. 댓글 작성 처리 API
    @PostMapping("/community/reply/write")
    public ResponseEntity<?> addReply(@RequestBody Reply reply, HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // payload에 postNum과 content 만 들어온다고 가정
        reply.setAuthorId(user.getNickname()); 
        globarService.addReply(reply);

        return ResponseEntity.ok(Map.of("message", "댓글 작성 완료"));
    }
    
    // 14. [일반 유저] 출석 체크 처리 API
    @PostMapping("/attendance")
    public ResponseEntity<?> attendance(@RequestBody Map<String, Long> payload, HttpServletRequest request) {
        Long actNum = payload.get("actNum");
        User user = (User) request.getAttribute("loginUser");
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        globarService.checkAttendance(actNum, user.getUserId());
        return ResponseEntity.ok(Map.of("message", "출석 완료"));
    }

    // 15. [관리자 전용] 출석 명단 확인 API
    @GetMapping("/admin/attendance/{actNum}")
    public ResponseEntity<?> adminAttendanceList(@PathVariable("actNum") Long actNum, HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        if (user == null || (!"ADMIN".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자 권한이 없습니다."));
        }

        Activity activity = globarService.getActivityByNum(actNum);
        List<Attendance> attendList = globarService.getAttendanceList(actNum);
        return ResponseEntity.ok(Map.of("activity", activity, "attendList", attendList));
    }

    // 16. [관리자 전용] 자리 배정 확인 API
    @GetMapping("/admin/seat/{actNum}")
    public ResponseEntity<?> seatAssignment(@PathVariable("actNum") Long actNum, HttpServletRequest request) {
        User user = (User) request.getAttribute("loginUser");
        if (user == null || (!"ADMIN".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자 권한이 없습니다."));
        }

        List<AttendeeDto> attendees = globarService.getAttendeesForSeat(actNum);
        return ResponseEntity.ok(Map.of("attendees", attendees, "actNum", actNum));
    }
}
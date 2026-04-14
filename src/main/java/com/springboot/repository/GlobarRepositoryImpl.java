package com.springboot.repository;

import com.springboot.domain.User;
import com.springboot.domain.Post;
import com.springboot.domain.Reply;
import com.springboot.domain.Activity;
import com.springboot.domain.Attendance;
import com.springboot.domain.AttendeeDto;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import lombok.RequiredArgsConstructor;
// 수정: @Slf4j 추가 - System.out.println/System.err.println 대신 SLF4J 로거 사용
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class GlobarRepositoryImpl implements GlobarRepository {

    private final JdbcTemplate jdbcTemplate;

    // DB 결과셋(ResultSet)을 자바 User 객체로 변환하는 매퍼입니다.
 // DB 결과셋(ResultSet)을 자바 User 객체로 변환하는 매퍼입니다.
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setUserId(rs.getLong("user_id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        user.setNickname(rs.getString("nickname"));
        user.setRole(rs.getString("role"));
        user.setBio(rs.getString("bio"));
        user.setLanguage(rs.getString("language"));
        
        // 🔥 [방어적 추가] 컬럼이 없을 경우를 대비하여 try-catch 또는 체크 로직 적용 가능
        // 여기서는 간단하게 존재 여부 확인 없이 시도하되, 개별 필드 오류가 전체 객체 생성을 막지 않도록 함
        try { user.setLevel(rs.getString("level")); } catch (Exception e) {}
        try { user.setFcmToken(rs.getString("fcm_token")); } catch (Exception e) {}
        
        return user;
    };

    // 사용자 아이디(username)로 회원 정보를 조회합니다.
    @Override
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        try {
            return jdbcTemplate.queryForObject(sql, userRowMapper, username);
        } catch (EmptyResultDataAccessException e) {
            return null; 
        } catch (Exception e) {
            // 수정: System.err.println → log.error() 전환
            log.error("[유저 조회 오류] username={}: {}", username, e.getMessage());
            return null;
        }
    }

    // 닉네임으로 사용자 정보를 조회합니다. (아이디 찾기용)
    @Override
    public User findByNickname(String nickname) {
        String sql = "SELECT * FROM users WHERE nickname = ?";
        try {
            return jdbcTemplate.queryForObject(sql, userRowMapper, nickname);
        } catch (EmptyResultDataAccessException e) {
            return null; // 해당 닉네임 사용자가 없음
        } catch (Exception e) {
            // 수정: System.err.println → log.error() 전환
            log.error("[닉네임 조회 오류] nickname={}: {}", nickname, e.getMessage());
            return null;
        }
    }

    // 비밀번호를 새 해시값으로 업데이트합니다.
    @Override
    public void updatePassword(String username, String encodedPassword) {
        String sql = "UPDATE users SET password = ? WHERE username = ?";
        jdbcTemplate.update(sql, encodedPassword, username);
    }

    // 카테고리별 게시글 목록을 최신순으로 조회하며, 작성자 닉네임도 함께 가져옵니다.
 // 1. 게시글 목록 가져올 때 댓글 수(replyCount)도 같이 계산해서 가져오기
    @Override
    public List<Post> findPostsByCategory(String category) {
        String sql = "SELECT p.*, u.nickname as authorName, " +
                     "(SELECT COUNT(*) FROM reply r WHERE r.post_num = p.post_num) as replyCount " +
                     "FROM posts p " +
                     "JOIN users u ON p.author_id = u.user_id " +
                     "WHERE p.category = ? ORDER BY p.reg_date DESC";
                     
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Post post = new Post();
            post.setPostNum(rs.getLong("post_num"));
            post.setCategory(rs.getString("category"));
            post.setTitle(rs.getString("title"));
            post.setContent(rs.getString("content"));
            post.setAuthorId(rs.getLong("author_id"));
            post.setAuthorName(rs.getString("authorName"));
            post.setNotice(rs.getBoolean("is_notice"));
            post.setRegDate(rs.getTimestamp("reg_date").toLocalDateTime());
            
            // 🔥 [추가] 조회수와 댓글 수 맵핑
            post.setViewCount(rs.getInt("view_count"));
            post.setReplyCount(rs.getInt("replyCount"));
            return post;
        }, category);
    }
    
    // 현재 시간 이후 가장 가까운 활동 1개를 조회합니다.
    @Override
    public Activity getNextWeekActivity() {
        String sql = "SELECT * FROM activities " +
                     "WHERE event_date >= NOW() " +
                     "ORDER BY event_date ASC LIMIT 1";
        try {
            return jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Activity.class));
        } catch (EmptyResultDataAccessException e) {
            return null; // 예정된 활동이 없으면 null 반환
        }
    }

    // 활동 번호로 해당 활동의 상세 정보를 조회합니다.
    @Override
    public Activity findActivityByNum(Long actNum) {
        String sql = "SELECT act_num, title, event_date, max_participants, current_participants, location, description " +
                     "FROM activities WHERE act_num = ?";
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Activity act = new Activity();
            act.setActNum(rs.getLong("act_num"));
            act.setTitle(rs.getString("title"));
            if (rs.getTimestamp("event_date") != null) {
                act.setEventDate(rs.getTimestamp("event_date").toLocalDateTime());
            }
            act.setMaxParticipants(rs.getInt("max_participants"));
            act.setCurrentParticipants(rs.getInt("current_participants"));
            act.setLocation(rs.getString("location"));
            act.setDescription(rs.getString("description"));
            return act;
        }, actNum);
    }
    
    // 새로운 활동을 DB에 등록합니다.
    @Override
    public void insertActivity(Activity activity) {
        String sql = "INSERT INTO activities (title, event_date, max_participants, current_participants, location, description) " +
                     "VALUES (?, ?, ?, 0, ?, ?)";
        jdbcTemplate.update(sql, 
            activity.getTitle(), 
            activity.getEventDate(), 
            activity.getMaxParticipants(), 
            activity.getLocation(), 
            activity.getDescription()
        );
    }

    // 회원가입 정보를 DB에 저장합니다.
    @Override
    public int saveUser(User user) {
        String sql = "INSERT INTO users (username, password, nickname, role, bio, language) " +
                     "VALUES (?, ?, ?, 'ROLE_USER', ?, ?)";
        try {
            return jdbcTemplate.update(sql, 
                user.getUsername(), 
                user.getPassword(), 
                user.getNickname(), 
                user.getBio(), 
                user.getLanguage()
            );
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    
    // 게시글 번호로 상세 내용을 조회하며, 작성자 닉네임도 함께 가져옵니다.
    @Override
    public Post findPostByNum(Long postNum) {
        String sql = "SELECT p.*, u.nickname as authorName, " +
                     "(SELECT COUNT(*) FROM reply r WHERE r.post_num = p.post_num) as replyCount " +
                     "FROM posts p " +
                     "JOIN users u ON p.author_id = u.user_id " +
                     "WHERE p.post_num = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Post post = new Post();
                post.setPostNum(rs.getLong("post_num"));
                post.setCategory(rs.getString("category"));
                post.setTitle(rs.getString("title"));
                post.setContent(rs.getString("content"));
                post.setAuthorId(rs.getLong("author_id"));
                post.setAuthorName(rs.getString("authorName"));
                post.setNotice(rs.getBoolean("is_notice"));
                post.setRegDate(rs.getTimestamp("reg_date").toLocalDateTime());
                
                // 🔥 [추가] 조회수와 댓글 수 맵핑
                post.setViewCount(rs.getInt("view_count"));
                post.setReplyCount(rs.getInt("replyCount"));
                return post;
            }, postNum);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    // 3. 🔥 [새로 추가] 조회수를 1 증가시키는 메서드
    @Override
    public void incrementViewCount(Long postNum) {
        String sql = "UPDATE posts SET view_count = view_count + 1 WHERE post_num = ?";
        jdbcTemplate.update(sql, postNum);
    }

    // 새로운 게시글을 DB에 저장합니다.
    @Override
    public int insertPost(Post post) {
        String sql = "INSERT INTO posts (category, title, content, author_id, is_notice, reg_date) " +
                     "VALUES (?, ?, ?, ?, ?, NOW())";
        return jdbcTemplate.update(sql, 
            post.getCategory(), 
            post.getTitle(), 
            post.getContent(), 
            post.getAuthorId(), 
            post.isNotice()
        );
    }

    // 등록된 모든 활동 목록을 날짜순으로 조회합니다.
    @Override
    public List<Activity> findAllActivities() {
        String sql = "SELECT act_num, title, event_date, max_participants, current_participants, location, description " +
                     "FROM activities ORDER BY event_date ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Activity act = new Activity();
            act.setActNum(rs.getLong("act_num"));
            act.setTitle(rs.getString("title"));
            if (rs.getTimestamp("event_date") != null) {
                act.setEventDate(rs.getTimestamp("event_date").toLocalDateTime());
            }
            act.setMaxParticipants(rs.getInt("max_participants"));
            act.setCurrentParticipants(rs.getInt("current_participants"));
            act.setLocation(rs.getString("location"));
            act.setDescription(rs.getString("description"));
            return act;
        });
    }

    // 활동 참가 신청 시 현재 인원수를 1 증가시킵니다.
    @Override
    public int updateActivityCount(Long actNum) {
        String sql = "UPDATE activities SET current_participants = current_participants + 1 WHERE act_num = ?";
        return jdbcTemplate.update(sql, actNum);
    }
    
    // 특정 날짜 범위에 속하는 활동들을 조회합니다.
    @Override
    public List<Activity> findActivitiesByDateRange(LocalDateTime start, LocalDateTime end) {
        String sql = "SELECT * FROM activities " +
                     "WHERE event_date BETWEEN ? AND ? " +
                     "ORDER BY event_date ASC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Activity.class), start, end);
    }
    
    // 특정 게시글에 달린 모든 댓글을 조회합니다.
    @Override
    public List<Reply> getRepliesByPostNum(Long postNum) {
        String sql = "SELECT * FROM reply WHERE post_num = ? ORDER BY reply_num ASC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Reply.class), postNum);
    }

    // 새로운 댓글을 DB에 저장합니다.
    @Override
    public void saveReply(Reply reply) {
        String sql = "INSERT INTO reply (post_num, author_id, content, reg_date) VALUES (?, ?, ?, NOW())";
        jdbcTemplate.update(sql, reply.getPostNum(), reply.getAuthorId(), reply.getContent());
    }
    
    // 출석체크 정보를 DB에 저장합니다. (Long 타입 userId 사용)
    @Override
    public void saveAttendance(Long actNum, Long userId) {
        String sql = "INSERT INTO attendance (act_num, user_id, att_date) VALUES (?, ?, NOW())";
        jdbcTemplate.update(sql, actNum, userId);
        // System.out.println("💾 [DB 저장 성공] 활동번호: " + actNum + ", 사용자ID: " + userId + " (attendance 테이블)");
    }

    // 활동의 참여 인원수를 1 증가시킵니다. (출석 체크 시 사용)
    @Override
    public void incrementParticipantCount(Long actNum) {
        String sql = "UPDATE activities SET current_participants = current_participants + 1 WHERE act_num = ?";
        jdbcTemplate.update(sql, actNum);
    }

    // 특정 회원이 이미 해당 활동에 출석했는지 확인합니다. (중복 방지)
    @Override
    public boolean isAttended(Long actNum, Long userId) {
        String sql = "SELECT COUNT(*) FROM attendance WHERE act_num = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, actNum, userId);
        return count != null && count > 0;
    }

 // (관리자용) 특정 활동의 전체 출석 명단을 최신순으로 조회합니다. (닉네임 포함)
    @Override
    public List<Attendance> findAttendanceListByActNum(Long actNum) {
        // 🔥 JOIN을 사용해서 users 테이블의 nickname을 같이 가져옵니다.
        String sql = "SELECT a.*, u.nickname " +
                     "FROM attendance a " +
                     "JOIN users u ON a.user_id = u.user_id " +
                     "WHERE a.act_num = ? ORDER BY a.att_date DESC";
                     
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Attendance.class), actNum);
    }
    @Override
    public void updateFcmToken(Long userId, String token) {
        // users 테이블의 fcm_token 컬럼을 업데이트합니다.
        String sql = "UPDATE users SET fcm_token = ? WHERE user_id = ?";
        int updated = jdbcTemplate.update(sql, token, userId);
        // 수정: System.out.println → log.info() 전환
        log.info("[FCM 토큰 업데이트] 사용자 ID: {}, 결과: {}", userId, updated > 0 ? "성공" : "실패(사용자 없음)");
    }
    
 // [추가] 특정 유저의 FCM 토큰만 쏙 꺼내오는 기능
    @Override
    public String findFcmTokenByUserId(Long userId) {
        String sql = "SELECT fcm_token FROM users WHERE user_id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, userId);
        } catch (EmptyResultDataAccessException e) {
            return null; // 토큰이 없으면 null 반환
        }
    }
    
    @Override
    public List<String> findAllFcmTokens() {
        // 조건 없이 토큰 있는 사람 전부 다 조회 (나 포함)
        String sql = "SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL";
        return jdbcTemplate.queryForList(sql, String.class);
    }
    
    @Override
    public void deleteFcmToken(String token) {
        String sql = "UPDATE users SET fcm_token = NULL WHERE fcm_token = ?";
        int updated = jdbcTemplate.update(sql, token);
        // 수정: System.out.println → log.info() 전환
        log.info("[FCM 토큰 삭제] 유효하지 않은 토큰(UNREGISTERED) 정리 완료: {}건", updated);
    }
    
 // 자리 배정을 위해 해당 활동(actNum)에 참여한 유저의 닉네임과 레벨을 조인해서 가져옵니다.
    public List<AttendeeDto> getAttendeesForSeat(Long actNum) {
        // System.out.println("🔍 [리포지토리 조회 시작] 요청된 활동번호: " + actNum + " (Type: Long)");
        String sql = "SELECT u.nickname, u.level " +
                     "FROM attendance a " +
                     "LEFT JOIN users u ON a.user_id = u.user_id " +
                     "WHERE a.act_num = ?";
                     
        List<AttendeeDto> attendees = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AttendeeDto dto = new AttendeeDto();
            dto.setNickname(rs.getString("nickname"));
            dto.setLevel(rs.getString("level"));
            return dto;
        }, actNum);
        
        // System.out.println("📊 [명단 조회 결과] 활동번호: " + actNum + ", 참여 인원: " + (attendees != null ? attendees.size() : 0) + "명");
        return attendees;
    }
}
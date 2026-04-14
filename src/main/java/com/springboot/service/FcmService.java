package com.springboot.service;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Service
public class FcmService {
    public void sendMessage(String targetToken, String title, String body) throws FirebaseMessagingException {
        Message message = Message.builder()
            .setToken(targetToken) // 프론트에서 받은 사용자별 고유 토큰
            .setNotification(Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build())
            .build();

        FirebaseMessaging.getInstance().send(message);
    }
}
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB93YYPWNzeGwRS0XH2d1oth127kspQ0E4",
  authDomain: "glova-2aa96.firebaseapp.com",
  projectId: "glova-2aa96",
  storageBucket: "glova-2aa96.firebasestorage.app",
  messagingSenderId: "83102862549",
  appId: "1:83102862549:web:83f33a0fd5a26e291aa65c",
  measurementId: "G-46KX2HEMYX"
};

/**
 * FCM 초기화 및 토큰 획득/갱신을 처리하는 유틸리티
 * @param {Function} setStatus 상태 메시지 업데이트 콜백
 * @returns {Promise<string|null>} 활성화된 FCM 토큰
 */
export const getSecureFcmToken = async (setStatus = () => {}) => {
  try {
    const supported = await isSupported();
    if (!supported) {
      setStatus('지원 안 함');
      return null;
    }

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    
    // 1. 권한 확인 및 요청
    let permission = Notification.permission;
    if (permission === 'default') {
      setStatus('권한 요청 중...');
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      setStatus('권한 거부됨');
      return null;
    }

    setStatus('토큰 초기화 중...');
    
    // 2. 서비스 워커 등록
    const registration = await navigator.serviceWorker.register('/Globar/firebase-messaging-sw.js', {
      scope: '/Globar/'
    });

    // ⚠️ 기존 토큰 강제 삭제 (신선도 유지)
    try { 
      await deleteToken(messaging); 
    } catch(e) {
      console.warn("FCM reset skipped.");
    }

    setStatus('새 토큰 발급 중...');
    
    // 3. 최신 토큰 가져오기
    const token = await getToken(messaging, { 
      vapidKey: 'BP6Q3kXbv9jrCps595aBwpYc-6pvam5oLtw1AnlW1qR_xix0TFcmep-SJwAmy9vDOdBxDhSc1AnkvzrKqzkaovA',
      serviceWorkerRegistration: registration
    });

    if (token) {
      setStatus('연결 완료');
      return token;
    } else {
      setStatus('토큰 없음');
      return null;
    }
  } catch (err) {
    setStatus('연결 오류');
    console.error("FCM Utility Error:", err);
    return null;
  }
};

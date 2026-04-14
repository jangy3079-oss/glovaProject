import axios from 'axios';

const api = axios.create({
  baseURL: '/api/Globar',
  withCredentials: true,
});

// 혹시 토큰이 쿠키뿐만 아니라 헤더에 세팅되어 있다면 헤더도 삽입
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401(권한 없음) 발생 시 로그인 페이지로 강제 이동
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ 세션 만료 또는 권한 없음. 로그인 페이지로 이동합니다.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

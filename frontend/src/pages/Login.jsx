import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { getSecureFcmToken } from '../utils/fcm';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fcmStatus, setFcmStatus] = useState('준비 중...');
  const [fcmToken, setFcmToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initFcm = async () => {
      const token = await getSecureFcmToken(setFcmStatus);
      if (token) setFcmToken(token);
    };
    initFcm();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/login', { username, password, fcmToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex justify-center items-center p-5">
      <div className="w-full max-w-[430px] bg-white rounded-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] px-6 py-8 flex flex-col items-center">
        <div className="w-full text-left mb-6 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Globar/glovaLogo.png" alt="GLOVA Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-[2.2rem] font-extrabold text-[#47a432] tracking-tight leading-none">GLOVA</h1>
            </div>
            <div className={`text-[11px] font-bold px-2 py-1 rounded-full ${fcmStatus === '연결 완료' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
              알림: {fcmStatus}
            </div>
          </div>
          <p className="text-[0.85rem] text-light font-medium mt-2 leading-[1.4]">
            다양한 언어 교환의 시작,<br />글로바에서 만나요
          </p>
        </div>

        <div className="w-full">
          {error && (
            <div className="bg-[#F0FDF4] text-deep-green inline-flex items-center gap-1.5 p-3 rounded-lg text-sm font-semibold mb-5 w-full">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] font-semibold text-toss-grey ml-0.5">아이디</label>
              <input 
                type="text" 
                placeholder="아이디 입력" 
                className="w-full h-[54px] px-5 bg-toss-bg border-none rounded-[16px] text-[1rem] outline-none focus:bg-[#e8ebed] transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] font-semibold text-toss-grey ml-0.5">비밀번호</label>
              <input 
                type="password" 
                placeholder="비밀번호 입력" 
                className="w-full h-[54px] px-5 bg-toss-bg border-none rounded-[16px] text-[1rem] outline-none focus:bg-[#e8ebed] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-[54px] bg-[#47a432] hover:brightness-110 text-white font-bold rounded-[16px] text-[1.1rem] transition-colors mt-2"
            >
              로그인
            </button>
          </form>

          <div className="mt-5 flex justify-center items-center gap-3 text-[0.85rem] text-light">
            <Link to="/find-account" className="hover:text-toss-grey transition-colors">아이디/비밀번호 찾기</Link>
            <span className="w-[1px] h-3 bg-slate-200"></span>
            <Link to="/register" className="hover:text-toss-grey transition-colors">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

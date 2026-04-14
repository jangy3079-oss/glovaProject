import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const MyPage = () => {
  const navigate = useNavigate();
  const user = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (e) {
      return {};
    }
  })();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout failed:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user.username) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-10 text-center animate-in fade-in">
        <div className="text-[40px] mb-5 text-[#d1d6db]">🔒</div>
        <p className="text-toss-grey mb-8 font-medium">로그인이 필요한 서비스입니다.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#F0FDF4]0 text-white px-10 py-4 rounded-[16px] font-bold shadow-md"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-toss-bg animate-in fade-in duration-500">
      {/* 프로필 섹션 */}
      <section className="bg-white px-6 py-8 mb-3 flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-toss-bg rounded-full flex items-center justify-center text-[28px]">👤</div>
        <div className="flex flex-col gap-1">
          <div className="text-[22px] font-bold text-[#191f28]">{user.nickname}</div>
          <button 
            className="text-[13px] text-deep-green font-semibold mt-1 text-left"
            onClick={() => alert('정보 수정 기능 준비 중입니다.')}
          >
            내 정보 수정 ›
          </button>
        </div>
      </section>

      {/* 계정 정보 섹션 */}
      <section className="bg-white mb-3 shadow-sm">
        <h3 className="text-[18px] font-bold text-[#191f28] px-6 pt-6 pb-2.5">계정 정보</h3>
        <div className="flex flex-col">
          <div className="flex justify-between items-center px-6 py-4.5 border-b border-toss-bg">
            <span className="text-[16px] font-medium text-[#191f28]">아이디</span>
            <span className="text-[15px] text-light">{user.username}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4.5 border-b border-toss-bg">
            <span className="text-[16px] font-medium text-[#191f28]">활동 지역</span>
            <span className="text-[15px] text-light">{user.language || '정보 없음'}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4.5">
            <span className="text-[16px] font-medium text-[#191f28]">회원 권한</span>
            <span className="text-[15px] text-light font-semibold">
              {user.role === 'ADMIN' ? '운영진 👑' : '일반회원'}
            </span>
          </div>
        </div>
      </section>

      {/* 자기소개 섹션 */}
      <section className="bg-white shadow-sm mb-3">
        <h3 className="text-[18px] font-bold text-[#191f28] px-6 pt-6 pb-2.5">자기소개</h3>
        <div className="px-6 pb-6 text-[15px] text-toss-grey leading-[1.5] min-h-[60px]">
          {user.bio || '아직 자기소개가 없습니다. 멋진 소개를 남겨보세요! 👋'}
        </div>
      </section>

      {/* 로그아웃 버튼 */}
      <div className="text-center py-10">
        <button 
          onClick={handleLogout}
          className="text-light text-[14px] underline hover:text-toss-grey transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default MyPage;

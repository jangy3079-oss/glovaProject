import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const ActivityWrite = () => {
  const navigate = useNavigate();
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (e) {
      return {};
    }
  })();
  
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    location: '',
    maxParticipants: 20,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 데이터 포맷팅
    const submitData = {
      ...formData,
      currentParticipants: 0
    };

    try {
      await axios.post('/calendar/write', submitData);
      alert('새로운 일정이 성공적으로 등록되었습니다! 🎉');
      navigate('/calendar');
    } catch (error) {
      console.error('일정 등록 실패:', error);
      const errorMsg = error.response?.status === 403 
        ? '관리자 권한이 없습니다. 로그아웃 후 다시 로그인해 주세요!' 
        : '일정 등록 중 오류가 발생했습니다.';
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] pb-24 animate-in slide-in-from-bottom duration-500">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-toss-bg">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="ml-2 font-bold text-lg text-[#191f28]">새 일정 추가</span>
      </header>

      <div className="max-w-xl mx-auto p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">활동 제목</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: 강남역 언어 교환 모임"
              className="w-full text-[18px] font-bold text-[#333d4b] border-none outline-none placeholder:text-slate-200"
              required
            />
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">날짜 및 시간</label>
              <input 
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full text-[16px] font-bold text-[#333d4b] border-none outline-none cursor-pointer"
                required
              />
            </div>

            <div className="h-[1px] bg-slate-50 w-full" />

            <div>
              <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">모임 장소</label>
              <input 
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="장소 이름을 입력하세요"
                className="w-full text-[16px] font-bold text-[#333d4b] border-none outline-none placeholder:text-slate-200"
                required
              />
            </div>

            <div className="h-[1px] bg-slate-50 w-full" />

            <div>
              <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">최대 정원 (명)</label>
              <input 
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full text-[16px] font-bold text-[#333d4b] border-none outline-none"
                required
                min="1"
              />
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">상세 설명</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="활동에 대한 상세한 내용을 입력해주세요."
              className="w-full text-[16px] font-medium text-[#4e5968] border-none outline-none min-h-[150px] resize-none leading-relaxed"
              required
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-[#47a432] text-white rounded-[20px] font-bold text-lg shadow-lg shadow-blue-100 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              일정 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityWrite;

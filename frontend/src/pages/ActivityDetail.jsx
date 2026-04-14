import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const ActivityDetail = () => {
  const { actNum } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendees, setAttendees] = useState([]);
  
  // 사용자 정보 파싱 안전화
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (e) {
      console.error('사용자 정보 파싱 에러:', e);
      return {};
    }
  })();
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN';

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`/activity/${actNum}`);
        setActivity(response.data);
      } catch (err) {
        setError('활동 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [actNum]);

  const fetchAttendees = () => {
    navigate(`/activity/${actNum}/admin/attendance`);
  };

  const handleApply = async () => {
    if (!currentUser.userId) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    try {
      // ⚠️ actNum을 숫자로 명시적 변환하여 서버 데이터 타입(Long)과 일치시킴
      const response = await axios.post('/calendar/apply', { actNum: Number(actNum) });
      alert(response.data.message || '활동 신청이 완료되었습니다! 🎉');
      
      const refresh = await axios.get(`/activity/${actNum}`);
      setActivity(refresh.data);
      
      // ✅ 신청 성공 즉시 명단 업데이트
      await fetchAttendees();
    } catch (error) {
      console.error('신청 오류:', error);
      const errorMsg = error.response?.data?.error || '신청 중 오류가 발생했습니다.';
      alert(errorMsg);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f2f4f6]">
      <div className="animate-pulse text-[#47a432] font-medium text-base italic">GLOVA 일정을 불러오는 중...</div>
    </div>
  );

  if (error || !activity) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f4f6] p-6 text-center">
      <div className="text-3xl mb-4">🏜️</div>
      <div className="text-lg font-bold text-[#191f28] mb-4">앗! 정보를 찾을 수 없어요.</div>
      <button 
        onClick={() => navigate('/calendar')}
        className="bg-[#47a432] text-white px-7 py-3.5 rounded-[20px] font-bold shadow-lg active:scale-95"
      >
        달력으로 돌아가기
      </button>
    </div>
  );

  const isFull = activity.currentParticipants >= activity.maxParticipants;

  return (
    <div className="min-h-screen bg-[#f2f4f6] pb-52 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-5 py-3.5 flex items-center border-b border-[#f2f4f6]">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 rounded-full">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="ml-2 font-bold text-[16px] text-[#191f28]">활동 상세</span>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        <div className="bg-white rounded-[28px] p-7 shadow-sm border border-white">
          <div className="inline-block bg-[#F0FDF4] text-[#47a432] text-[14px] font-bold px-3 py-1 rounded-full mb-5 border border-[#47a432]/10">
            모집 중
          </div>
          
          <h1 className="text-[28px] font-black text-[#47a432] leading-[1.3] mb-8 animate-in slide-in-from-left duration-700">
            {activity.title}
          </h1>

          <div className="space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[#f9fafb] rounded-xl flex items-center justify-center shrink-0 border border-[#f2f4f6]">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <span className="block text-[12px] font-bold text-slate-400 mb-0.5">모임 일시</span>
                <span className="text-[15px] font-bold text-[#4e5968]">
                  {activity.eventDate ? formatDateTime(activity.eventDate) : '일정 미정'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[#f9fafb] rounded-xl flex items-center justify-center shrink-0 border border-[#f2f4f6]">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <span className="block text-[12px] font-bold text-slate-400 mb-0.5">모임 장소</span>
                <span className="text-[15px] font-bold text-[#4e5968]">{activity.location || '장소 미정'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[#f9fafb] rounded-xl flex items-center justify-center shrink-0 border border-[#f2f4f6]">
                <span className="text-xl">👥</span>
              </div>
              <div className="flex-1">
                <span className="block text-[12px] font-bold text-slate-400 mb-0.5">참가 신청 현황</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-black text-[#191f28]">
                      {activity.currentParticipants} / {activity.maxParticipants}명
                    </span>
                    <span className={`text-[14px] font-black px-2 py-0.5 rounded-md ${isFull ? "bg-red-50 text-red-500" : "bg-[#F0FDF4] text-[#47a432]"}`}>
                      {isFull ? "마감" : "신청 가능"}
                    </span>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={fetchAttendees}
                      className="text-[12px] text-[#47a432] font-bold hover:underline"
                    >
                      참가자 명단 ›
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-7 shadow-sm min-h-[200px] border border-white">
          <h2 className="text-[17px] font-black text-[#191f28] mb-5">이 모임은 어떤 활동인가요?</h2>
          <p className="text-[15px] leading-[1.6] text-[#4e5968] whitespace-pre-wrap font-medium">
            {activity.description || "상세 내용이 작성되지 않았습니다."}
          </p>
        </div>
      </div>

      {/* 하단 신청 버튼 영역 */}
      <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-4 pb-4 pt-10 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <button 
            onClick={handleApply}
            disabled={isFull}
            className={`w-full py-4 rounded-[20px] font-black text-[16px] transition-all active:scale-[0.98] shadow-[0_8px_25px_rgba(71,164,50,0.25)] ${isFull ? "bg-[#e5e8eb] text-[#adb5bd] cursor-not-allowed shadow-none" : "bg-[#47a432] text-white hover:brightness-105"}`}
          >
            {isFull ? '다음에 만나요 (모집 마감)' : '지금 바로 신청하기'}
          </button>
        </div>
      </div>


    </div>
  );
};

export default ActivityDetail;

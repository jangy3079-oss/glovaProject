import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const Home = () => {
  const [data, setData] = useState({ activity: null, monthlyActivities: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/home');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-full bg-white-garden">
       <div className="w-10 h-10 border-4 border-[#47a432] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { activity, monthlyActivities } = data;

  return (
    <div className="flex flex-col bg-white-garden min-h-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 상단 웰컴 섹션 */}
      <header className="px-6 pt-10 pb-6 bg-white rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-toss-bg">
        <div className="flex justify-between items-end mb-8">
           <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/Globar/glovaLogo.png" alt="GLOVA Logo" className="w-8 h-8 object-contain" />
                <h1 className="text-[36px] font-black text-[#47a432] tracking-tighter leading-none">GLOVA</h1>
              </div>
              <p className="text-[14px] text-[#8b95a1] font-bold">글로벌 언어 교환의 즐거움</p>
           </div>
        </div>

        {/* 메인 활동 카드 (Glassmorphism) */}
        {activity ? (
          <div 
            onClick={() => navigate(`/activity/${activity.actNum}`)}
            className="relative overflow-hidden bg-[#47a432] rounded-[30px] p-8 text-white shadow-[0_20px_50px_rgba(71,164,50,0.3)] group active:scale-[0.98] transition-all cursor-pointer border border-white/20"
          >
            <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl opacity-40"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold mb-4">📍 NEXT MEETUP</span>
              <h2 className="text-2xl font-black mb-1 leading-tight">{activity.title}</h2>
              <p className="text-white/80 font-medium mb-6">{activity.location}</p>
              
              <div className="flex justify-between items-center bg-black/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Schedule</span>
                  <span className="font-bold text-[15px]">
                    {new Date(activity.eventDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}  {new Date(activity.eventDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <div className="flex flex-col items-end">
                  <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Participants</span>
                  <span className="font-bold text-[15px]">{activity.currentParticipants} / {activity.maxParticipants}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-toss-bg rounded-[30px] p-10 text-center">
            <span className="text-4xl mb-3 block">🏜️</span>
            <p className="text-light font-bold">아직 예정된 모임이 없어요</p>
          </div>
        )}
      </header>

      {/* 일정 미리보기 리스트 */}
      <main className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-[20px] font-black text-[#191f28]">📅 {new Date().getMonth() + 1}월 일정</h3>
          <Link to="/calendar" className="text-[#47a432] font-bold text-[14px]">전체보기 ›</Link>
        </div>

        <div className="space-y-3">
          {monthlyActivities && monthlyActivities.length > 0 ? (
            monthlyActivities.map((act) => (
              <div 
                key={act.actNum} 
                onClick={() => navigate(`/activity/${act.actNum}`)}
                className="bg-white rounded-[24px] p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-[#f9fafb]"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-[#f2f4f6] to-white rounded-2xl flex flex-col items-center justify-center border border-toss-bg shadow-sm">
                  <span className="text-[10px] text-toss-grey font-black uppercase tracking-tighter">
                    {new Date(act.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-[18px] font-black text-[#47a432] leading-none">
                    {new Date(act.eventDate).getDate()}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-[16px] text-[#191f28] truncate mb-0.5">{act.title}</h4>
                  <p className="text-[13px] text-toss-grey font-medium flex items-center gap-1.5">
                    <span className="opacity-60">🕒</span> {new Date(act.eventDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                    <span className="text-[#d1d6db]">|</span> 
                    <span className="truncate">{act.location}</span>
                  </p>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-[11px] font-black shrink-0 transition-colors
                  ${act.currentParticipants < act.maxParticipants 
                    ? 'text-[#47a432] bg-[#F0FDF4] border border-[#47a432]/10' 
                    : 'text-[#ff4757] bg-red-50'}`}>
                  {act.currentParticipants < act.maxParticipants ? 'JOIN' : 'CLOSED'}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[24px] py-12 text-center text-light font-bold">일정을 준비 중입니다 😴</div>
          )}
        </div>
        
        {/* 서비스 홍보 배너 */}
        <div className="mt-6 bg-[#191f28] rounded-[24px] p-6 text-white relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
           <div className="absolute right-[-10px] bottom-[-10px] text-[80px] opacity-20">✨</div>
           <h3 className="text-[18px] font-black mb-1">글로바 프리미엄 멤버십</h3>
           <p className="text-white/60 text-[13px] font-medium mb-4">더 많은 모임과 전용 혜택을 누리세요</p>
           <button className="bg-white text-black px-4 py-2 rounded-xl font-black text-[12px]">자세히 보기</button>
        </div>
      </main>
    </div>
  );
};

export default Home;

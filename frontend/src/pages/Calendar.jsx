import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const Calendar = () => {
  const [activities, setActivities] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (e) {
      return {};
    }
  })();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('/calendar');
        setActivities(response.data);
      } catch (error) {
        console.error('Failed to fetch calendar activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells = [];
    // 1. 앞쪽 빈칸
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="border-b border-toss-bg p-2"></div>);
    }

    // 2. 날짜 채우기
    for (let d = 1; d <= lastDate; d++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
      const dayOfWeek = new Date(year, month, d).getDay();
      const isSun = dayOfWeek === 0;
      const isSat = dayOfWeek === 6;

      const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = activities.filter(act => {
        const actDate = Array.isArray(act.eventDate) 
          ? `${act.eventDate[0]}-${String(act.eventDate[1]).padStart(2, '0')}-${String(act.eventDate[2]).padStart(2, '0')}`
          : act.eventDate.split('T')[0];
        return actDate === currentStr;
      });

      cells.push(
        <div key={d} className="border-b border-toss-bg flex flex-col items-center pt-2 relative h-full min-h-[80px]">
          <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[14px] font-medium mb-1 z-[2]
            ${isToday ? 'bg-[#47a432] text-white font-bold' : isSun ? 'text-red-500' : isSat ? 'text-[#47a432] font-bold' : 'text-black'}`}>
            {d}
          </div>
          {dayEvents.map((act, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/activity/${act.actNum}`)}
              className="w-[90%] text-[9px] bg-[#F0FDF4] text-[#47a432] p-1 rounded-[4px] font-bold truncate mb-0.5 cursor-pointer active:scale-95"
            >
              {act.title}
            </div>
          ))}
        </div>
      );
    }

    // 3. 뒷쪽 빈칸 (6주 고정)
    const totalSlots = 42;
    const filledSlots = firstDay + lastDate;
    for (let i = filledSlots; i < totalSlots; i++) {
      cells.push(<div key={`empty-last-${i}`} className="border-b border-toss-bg p-2"></div>);
    }

    return cells;
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <header className="px-6 py-4 flex justify-between items-center shrink-0">
        <button onClick={() => changeMonth(-1)} className="p-2 text-black font-bold">❮</button>
        <h2 className="text-[22px] font-black tracking-tight">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 text-black font-bold">❯</button>
      </header>

      <div className="grid grid-cols-7 text-center py-2 border-b border-toss-bg shrink-0">
        <span className="text-[12px] font-bold text-red-500">일</span>
        <span className="text-[12px] font-bold text-toss-grey">월</span>
        <span className="text-[12px] font-bold text-toss-grey">화</span>
        <span className="text-[12px] font-bold text-toss-grey">수</span>
        <span className="text-[12px] font-bold text-toss-grey">목</span>
        <span className="text-[12px] font-bold text-toss-grey">금</span>
        <span className="text-[12px] font-bold text-[#47a432]">토</span>
      </div>

      <div className="grid grid-cols-7 flex-1 overflow-hidden pointer-events-auto">
        {renderCalendar()}
      </div>

      {currentUser.role === 'ADMIN' && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-full max-w-[430px] h-0 z-[500] pointer-events-none">
          <button 
            onClick={() => navigate('/calendar/write')}
            className="absolute right-5 bottom-0 bg-[#191f28] text-white px-5 py-3 rounded-full font-bold text-[14px] shadow-lg active:scale-95 transition-transform pointer-events-auto"
          >
            + 일정 추가
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/axios';

const Attendance = () => {
  const { actNum } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ activity: null, attendList: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get(`/admin/attendance/${actNum}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [actNum]);

  if (loading) return <div className="p-20 text-center text-toss-grey">불러오는 중...</div>;
  if (!data.activity) return <div className="p-20 text-center text-toss-grey">활동 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="flex justify-center bg-[#f2f4f6] min-h-screen p-5">
      <div className="w-full max-w-[500px] bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-7 h-fit animate-in fade-in duration-500">
        <header className="border-b-2 border-toss-bg pb-5 mb-5 text-center">
          <h3 className="text-[22px] font-black text-[#191f28] mb-2.5">📋 출석 명단 확인</h3>
          <p className="text-[15px] text-toss-grey font-semibold mb-2">{data.activity.title}</p>
          <div className="inline-block bg-[#F0FDF4] text-deep-green text-[14px] font-bold px-3 py-1 rounded-full">
            총 출석: {data.attendList.length}명
          </div>
        </header>

        <div className="space-y-2.5">
          {data.attendList.length === 0 ? (
            <div className="text-center py-10 text-light bg-[#f9fafb] rounded-[16px]">아직 출석한 인원이 없습니다.</div>
          ) : (
            data.attendList.map((att, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-[16px] border border-toss-bg">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#e8ebed] w-9 h-9 rounded-full flex items-center justify-center text-[16px]">👤</div>
                  <span className="font-bold text-[#191f28]">{att.nickname}</span>
                </div>
                <div className="text-light text-[13px] font-medium">
                  {new Date(att.attDate).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace('.', '/')}
                </div>
              </div>
            ))
          )}
        </div>

        <Link 
          to={`/activity/${actNum}/admin/seat`}
          className="block w-full bg-[#47a432] active:bg-brand-600 text-white text-center rounded-[16px] py-[18px] text-[16px] font-bold mt-[30px] transition-colors shadow-sm"
        >
          🎲 현장 출석 & 조 짜기
        </Link>

        <button 
          onClick={() => navigate(-1)}
          className="block w-full mt-[15px] bg-toss-bg active:bg-[#e8ebed] text-toss-grey text-center rounded-[16px] py-[16px] text-[15px] font-bold transition-colors"
        >
          이전으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Attendance;

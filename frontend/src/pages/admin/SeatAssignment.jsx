import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const SeatAssignment = () => {
  const { actNum } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [walkIns, setWalkIns] = useState([]);
  const [walkInName, setWalkInName] = useState('');
  const [walkInLevel, setWalkInLevel] = useState('초급');
  const [tableCount, setTableCount] = useState(5);
  const [tableSize, setTableSize] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await api.get(`/admin/seat/${actNum}`);
        setAttendees(response.data.attendees.map(a => ({ ...a, checked: true })));
      } catch (error) {
        console.error('Failed to fetch attendees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [actNum]);

  const handleToggleAttendee = (index) => {
    const newAttendees = [...attendees];
    newAttendees[index].checked = !newAttendees[index].checked;
    setAttendees(newAttendees);
  };

  const handleAddWalkIn = () => {
    if (!walkInName.trim()) return;
    setWalkIns([...walkIns, { name: walkInName, level: walkInLevel, isWalkIn: true }]);
    setWalkInName('');
  };

  const removeWalkIn = (idx) => {
    setWalkIns(walkIns.filter((_, i) => i !== idx));
  };

  // 피셔-예이츠 셔플
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const assignSeats = () => {
    const finalMembers = [
      ...attendees.filter(a => a.checked).map(a => ({ name: a.nickname, level: a.level || '초급', isWalkIn: false })),
      ...walkIns
    ];

    if (finalMembers.length === 0) {
      alert('배정할 인원이 없습니다.');
      return;
    }

    // 인원 대비 테이블 부족 시 자동 보정
    const minTables = Math.ceil(finalMembers.length / tableSize);
    let actualTableCount = Math.max(tableCount, minTables);
    if (actualTableCount !== tableCount) setTableCount(actualTableCount);

    const adv = shuffle(finalMembers.filter(m => m.level === '고급'));
    const inter = shuffle(finalMembers.filter(m => m.level === '중급'));
    const beg = shuffle(finalMembers.filter(m => m.level === '초급'));

    const sortedMembers = [...adv, ...inter, ...beg];
    const tables = Array.from({ length: actualTableCount }, () => []);

    let currentTable = 0;
    for (const m of sortedMembers) {
      let start = currentTable;
      while (tables[currentTable].length >= tableSize) {
        currentTable = (currentTable + 1) % actualTableCount;
        if (currentTable === start) break;
      }
      if (tables[currentTable].length < tableSize) {
        tables[currentTable].push(m);
        currentTable = (currentTable + 1) % actualTableCount;
      }
    }

    setResult({
      tables,
      stats: {
        total: finalMembers.length,
        adv: adv.length,
        inter: inter.length,
        beg: beg.length
      }
    });

    setTimeout(() => {
      document.getElementById('assignmentResult')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) return <div className="p-20 text-center text-toss-grey">불러오는 중...</div>;

  return (
    <div className="flex justify-center bg-[#f2f4f6] min-h-screen p-4 pb-20">
      <div className="w-full max-w-[500px] animate-in fade-in duration-500">
        
        {/* 상단 헤더 */}
        <header className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6 text-center border border-white">
          <h1 className="text-[24px] font-black text-[#191f28] mb-2">현장 출석 & 자동 배정 🎲</h1>
          <p className="text-[14px] text-toss-grey font-medium leading-relaxed">
            실제 모임에 온 인원을 체크하고<br />레벨에 맞춰 최적의 조를 구성합니다.
          </p>
        </header>

        <div className="space-y-6">
          
          {/* 1. 사전 신청 현황 */}
          <section className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white">
            <div className="flex justify-between items-center mb-5 px-1">
              <h2 className="font-black text-[#191f28] text-[17px]">사전 신청자</h2>
              <span className="text-[13px] bg-[#F0FDF4] text-[#47a432] px-2.5 py-1 rounded-full font-bold">
                총 {attendees.length}명
              </span>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {attendees.length > 0 ? attendees.map((m, idx) => (
                <label key={idx} className="flex items-center gap-3.5 bg-[#f9fafb] p-4 rounded-[20px] cursor-pointer active:scale-[0.98] transition-all border border-[#f2f4f6]">
                  <input 
                    type="checkbox" 
                    checked={m.checked}
                    onChange={() => handleToggleAttendee(idx)}
                    className="w-[20px] h-[20px] accent-[#47a432] cursor-pointer"
                  />
                  <span className={`text-[10px] px-2 py-0.5 rounded-[6px] font-bold 
                    ${m.level === '고급' ? 'bg-red-50 text-red-500' : m.level === '중급' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-500'}`}>
                    {m.level || '초급'}
                  </span>
                  <span className="font-bold text-[#4e5968]">{m.nickname}</span>
                </label>
              )) : (
                <div className="text-center py-10 text-slate-400 font-medium">사전 신청 정보가 없습니다.</div>
              )}
            </div>
          </section>

          {/* 2. 현장 접수 (Walk-in) */}
          <section className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white">
            <h2 className="font-black text-[#191f28] text-[17px] mb-5 px-1">현장 접수 (Walk-in)</h2>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5">
                <input 
                  type="text" 
                  className="flex-1 p-4 bg-[#f9fafb] rounded-[18px] text-[15px] outline-none border border-[#f2f4f6] focus:border-[#47a432]/30 transition-colors font-medium"
                  placeholder="참가자 이름"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWalkIn()}
                />
                <select 
                  className="w-[85px] p-4 bg-[#f9fafb] rounded-[18px] text-[14px] outline-none border border-[#f2f4f6] font-bold text-[#4e5968]"
                  value={walkInLevel}
                  onChange={(e) => setWalkInLevel(e.target.value)}
                >
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                </select>
                <button 
                  onClick={handleAddWalkIn} 
                  className="bg-[#191f28] text-white px-5 rounded-[18px] font-bold text-[14px] active:scale-95 transition-transform"
                >
                  추가
                </button>
              </div>

              {walkIns.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {walkIns.map((m, idx) => (
                    <div key={idx} className="bg-[#47a432]/5 text-[#47a432] px-3.5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 border border-[#47a432]/10">
                      <span className="opacity-60">[{m.level}]</span> {m.name}
                      <button onClick={() => removeWalkIn(idx)} className="text-[#47a432] hover:text-red-500 font-black ml-1 text-base">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 3. 배정 설정 */}
          <section className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white space-y-4">
            <h2 className="font-black text-[#191f28] text-[17px] mb-1 px-1">배정 설정</h2>
            
            <div className="flex justify-between items-center bg-[#f9fafb] p-4.5 rounded-[20px] border border-[#f2f4f6]">
              <span className="text-[15px] font-bold text-[#4e5968]">테이블 갯수</span>
              <div className="flex items-center gap-3">
                 <button onClick={() => setTableCount(Math.max(1, tableCount - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#191f28] shadow-sm border border-[#f2f4f6]">-</button>
                 <span className="w-8 text-center font-black text-[#47a432] text-lg">{tableCount}</span>
                 <button onClick={() => setTableCount(tableCount + 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#191f28] shadow-sm border border-[#f2f4f6]">+</button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#f9fafb] p-4.5 rounded-[20px] border border-[#f2f4f6]">
              <span className="text-[15px] font-bold text-[#4e5968]">테이블당 인원</span>
              <div className="flex items-center gap-3">
                 <button onClick={() => setTableSize(Math.max(1, tableSize - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#191f28] shadow-sm border border-[#f2f4f6]">-</button>
                 <span className="w-8 text-center font-black text-[#47a432] text-lg">{tableSize}</span>
                 <button onClick={() => setTableSize(tableSize + 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#191f28] shadow-sm border border-[#f2f4f6]">+</button>
              </div>
            </div>
          </section>

          {/* 실행 버튼 */}
          <button 
            onClick={assignSeats}
            className="w-full bg-[#47a432] active:scale-[0.98] text-white py-5 rounded-[24px] text-[17px] font-black shadow-[0_8px_25px_rgba(71,164,50,0.25)] transition-all"
          >
            최종 멤버로 조 짜기
          </button>
        </div>

        {/* 결과 영역 */}
        {result && (
          <div id="assignmentResult" className="mt-10 pt-10 border-t-2 border-dashed border-[#d1d6db] animate-in slide-in-from-bottom duration-700">
            <div className="text-center mb-8">
              <h2 className="text-[22px] font-black text-[#191f28] mb-2.5">🎉 조 배정 결과</h2>
              <div className="flex justify-center flex-wrap gap-2 text-[13px] font-bold text-[#8b95a1]">
                <span className="bg-white px-2.5 py-1 rounded-full border border-[#f2f4f6]">총 {result.stats.total}명</span>
                <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full border border-red-50/50">고급 {result.stats.adv}</span>
                <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-50/50">중급 {result.stats.inter}</span>
                <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-50/50">초급 {result.stats.beg}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {result.tables.map((t, i) => (
                <div key={i} className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white">
                  <div className="flex justify-between items-center mb-5 border-b border-[#f9fafb] pb-4">
                    <span className="font-black text-[#191f28] text-[16px]">{i + 1}번 테이블</span>
                    <span className="text-[13px] font-bold text-[#8b95a1]">{t.length}명</span>
                  </div>
                  <ul className="space-y-3.5">
                    {t.length === 0 ? (
                      <li className="text-center text-slate-300 text-[14px] py-4 italic">비어있는 테이블입니다.</li>
                    ) : (
                      t.map((m, mi) => (
                        <li key={mi} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-[5px] font-bold 
                              ${m.level === '고급' ? 'bg-red-50 text-red-500' : m.level === '중급' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-500'}`}>
                              {m.level}
                            </span>
                            <span className="font-black text-[#4e5968] text-[15px]">{m.name}</span>
                          </div>
                          {m.isWalkIn && <span className="text-[11px] text-[#47a432] font-black bg-[#F0FDF4] px-1.5 py-0.5 rounded-md">현장</span>}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full mt-8 py-4 text-[#8b95a1] font-bold text-[14px]"
            >
              맨 위로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatAssignment;

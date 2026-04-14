import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';

const FindAccount = () => {
  const [activeTab, setActiveTab] = useState('findId'); // 'findId' or 'resetPw'
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFindId = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      const response = await api.post('/find-id', { nickname });
      setResult(`찾으시는 아이디는 [ ${response.data.username} ] 입니다.`);
    } catch (err) {
      setError(err.response?.data?.error || '정보를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/reset-password', { username, nickname, newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex justify-center items-center p-5">
      <div className="w-full max-w-[430px] bg-white rounded-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] px-6 py-8 flex flex-col items-center">
        <div className="w-full flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="text-toss-grey text-xl hover:opacity-70 transition-opacity">←</button>
          <h1 className="text-[1.5rem] font-bold text-slate-800">계정 정보 찾기</h1>
        </div>

        {/* Tabs */}
        <div className="w-full flex bg-slate-100 p-1 rounded-xl mb-8">
          <button 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'findId' ? 'bg-white text-[#47a432] shadow-sm' : 'text-slate-400'}`}
            onClick={() => { setActiveTab('findId'); setError(''); setResult(''); }}
          >
            아이디 찾기
          </button>
          <button 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'resetPw' ? 'bg-white text-[#47a432] shadow-sm' : 'text-slate-400'}`}
            onClick={() => { setActiveTab('resetPw'); setError(''); setResult(''); }}
          >
            비밀번호 재설정
          </button>
        </div>

        <div className="w-full">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="bg-[#F0FDF4] text-[#47a432] p-5 rounded-2xl text-center font-bold mb-8 border border-green-100 animate-pulse">
              {result}
              <div className="mt-3">
                <Link to="/login" className="text-xs bg-[#47a432] text-white px-4 py-1.5 rounded-full inline-block mt-2 no-underline">로그인하러 가기</Link>
              </div>
            </div>
          )}

          {activeTab === 'findId' ? (
            <form onSubmit={handleFindId} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-semibold text-toss-grey ml-0.5">닉네임</label>
                <input 
                  type="text" 
                  placeholder="가입 시 등록한 닉네임" 
                  className="w-full h-[54px] px-5 bg-toss-bg border-none rounded-[16px] text-[1rem] outline-none focus:bg-[#e8ebed] transition-colors"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-[54px] bg-[#47a432] hover:brightness-110 text-white font-bold rounded-[16px] text-[1.1rem] transition-all mt-4 disabled:opacity-50"
              >
                {loading ? '조회 중...' : '아이디 확인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                <label className="text-[0.9rem] font-semibold text-toss-grey ml-0.5">닉네임</label>
                <input 
                  type="text" 
                  placeholder="닉네임 입력" 
                  className="w-full h-[54px] px-5 bg-toss-bg border-none rounded-[16px] text-[1rem] outline-none focus:bg-[#e8ebed] transition-colors"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-semibold text-toss-grey ml-0.5">새 비밀번호</label>
                <input 
                  type="password" 
                  placeholder="변경할 새 비밀번호" 
                  className="w-full h-[54px] px-5 bg-toss-bg border-none rounded-[16px] text-[1rem] outline-none focus:bg-[#e8ebed] transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1 ml-1">* 보안을 위해 강력한 비밀번호를 권장합니다.</p>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-[54px] bg-[#47a432] hover:brightness-110 text-white font-bold rounded-[16px] text-[1.1rem] transition-all mt-4 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '비밀번호 재설정'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAccount;

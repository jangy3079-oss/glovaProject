import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
    language: '',
    level: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.level) {
      setError('실력을 선택해주세요.');
      return;
    }

    try {
      await api.post('/register', formData);
      alert('회원가입이 완료되었습니다! 로그인해 주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="flex justify-center bg-[#e5e8eb] min-h-screen">
      <div className="w-full max-w-[430px] min-h-screen bg-white relative flex flex-col shadow-lg">
        {/* 헤더 */}
        <header className="px-5 py-3 bg-white sticky top-0 z-10 h-[50px] flex items-center">
          <button onClick={() => navigate(-1)} className="text-[20px] text-black p-1">❮</button>
        </header>

        <div className="px-6 py-3 pb-10 flex-1">
          <div className="mb-10">
            <h1 className="text-[26px] font-extrabold text-[#191f28] leading-[1.3] mb-2.5">
              환영합니다!<br />회원 정보를 입력해주세요
            </h1>
            <p className="text-[15px] text-toss-grey leading-[1.5]">
              글로바의 멤버가 되어<br />다양한 언어교환 모임에 참여해 보세요.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-[#e74c3c] p-4 rounded-xl text-sm font-semibold mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">아이디</label>
              <input 
                type="text" 
                name="username"
                placeholder="사용할 아이디" 
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-colors"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">비밀번호</label>
              <input 
                type="password" 
                name="password"
                placeholder="비밀번호" 
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-colors"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">닉네임</label>
              <input 
                type="text" 
                name="nickname"
                placeholder="화면에 표시될 이름" 
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-colors"
                value={formData.nickname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">관심 언어</label>
              <input 
                type="text" 
                name="language"
                placeholder="예: 한국어, 영어, 일본어" 
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-colors"
                value={formData.language}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">현재 어학 실력</label>
              <select 
                name="level"
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238b95a1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '12px auto'
                }}
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="" disabled>본인의 실력을 선택해주세요</option>
                <option value="초급">초급 (기초 단어/인사 가능)</option>
                <option value="중급">중급 (일상 대화 가능)</option>
                <option value="고급">고급 (원어민 수준/유창함)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-toss-grey ml-1">자기소개</label>
              <textarea 
                name="bio"
                placeholder="자신을 짧게 소개해 주세요." 
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] min-h-[120px] outline-none focus:bg-[#e8ebed] transition-colors resize-none leading-[1.5]"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="w-full p-[18px] bg-[#47a432] active:bg-brand-600 text-white font-bold rounded-[16px] text-[16px] transition-colors mt-5 shadow-sm"
            >
              가입하기
            </button>
          </form>

          <div className="mt-8 text-center text-[14px] text-light">
            이미 계정이 있으신가요? 
            <Link to="/login" className="ml-1.5 text-toss-grey font-bold hover:border-b hover:border-toss-grey transition-all">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

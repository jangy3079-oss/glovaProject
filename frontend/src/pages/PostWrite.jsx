import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const PostWrite = () => {
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
    category: 'SEOMYEON',
    title: '',
    content: '',
    isNotice: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/write', {
        ...formData,
        authorId: currentUser.userId
      });
      alert('게시글이 등록되었습니다!');
      navigate(`/community?category=${formData.category}`);
    } catch (error) {
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-full animate-in slide-in-from-bottom duration-300">
      <header className="px-5 py-4 bg-white sticky top-0 z-10 border-b border-toss-bg flex items-center">
        <button onClick={() => navigate(-1)} className="text-[20px] text-black p-1 mr-4">❮</button>
        <span className="text-[18px] font-bold text-[#191f28]">글쓰기</span>
      </header>

      <div className="px-6 py-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-toss-grey ml-1">게시판 선택</label>
            <div className="relative">
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none appearance-none cursor-pointer focus:bg-[#e8ebed] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238b95a1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '12px auto'
                }}
              >
                <option value="SEOMYEON">서면 게시판</option>
                <option value="BUMIN">부민 게시판</option>
              </select>
            </div>
          </div>

          {currentUser.role === 'ADMIN' && (
            <div className="bg-[#fff1f1] p-4 rounded-[16px] flex items-center">
              <label className="flex items-center gap-2.5 cursor-pointer w-full text-[#ff4757] font-bold text-[14px]">
                <input 
                  type="checkbox" 
                  name="isNotice"
                  checked={formData.isNotice}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#ff4757] cursor-pointer"
                />
                📢 이 글을 공지사항으로 등록
              </label>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-toss-grey ml-1">제목</label>
            <input 
              type="text" 
              name="title"
              placeholder="제목을 입력하세요"
              className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] outline-none focus:bg-[#e8ebed] transition-colors"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-toss-grey ml-1">내용</label>
            <textarea 
              name="content"
              placeholder="내용을 자유롭게 입력해주세요."
              className="w-full p-4 bg-toss-bg border-none rounded-[16px] text-[16px] min-h-[250px] outline-none focus:bg-[#e8ebed] transition-colors resize-none leading-[1.6]"
              value={formData.content}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-1 p-[16px] bg-toss-bg text-toss-grey rounded-[16px] text-[16px] font-bold transition-colors shadow-sm"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="flex-1 p-[16px] bg-[#47a432] active:bg-brand-600 text-white rounded-[16px] text-[16px] font-bold transition-colors shadow-sm"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostWrite;

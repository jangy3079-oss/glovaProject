import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axios';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'SEOMYEON';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/community?category=${category}`);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  const handleCategoryChange = (e) => {
    setSearchParams({ category: e.target.value });
  };

  return (
    <div className="flex flex-col bg-white min-h-full animate-in fade-in duration-500 relative">
      <header className="px-6 py-5 bg-white sticky top-0 z-10 border-b border-toss-bg">
        <div className="flex justify-between items-center">
          <h1 className="text-[24px] font-black text-[#191f28]">커뮤니티</h1>
          <div className="relative inline-block">
            <select 
              value={category} 
              onChange={handleCategoryChange}
              className="appearance-none bg-toss-bg border-none rounded-[18px] pl-3.5 pr-8 py-2 text-[14px] font-bold text-toss-grey outline-none cursor-pointer"
            >
              <option value="SEOMYEON">서면</option>
              <option value="BUMIN">부민</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-toss-grey">▼</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col">
        {loading ? (
          <div className="p-20 text-center text-toss-grey">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-20 text-center text-light">게시글이 아직 없어요 💬</div>
        ) : (
          posts.map(post => (
            <div 
              key={post.postNum} 
              onClick={() => navigate(`/community/${post.postNum}`)}
              className="px-6 py-5 bg-white border-b border-toss-bg active:bg-[#f9fafb] transition-colors cursor-pointer flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[13px] font-semibold text-toss-grey">{post.authorName || '익명'}</span>
                <span className="text-[#e5e8eb]">·</span>
                <span className="text-[12px] text-light">
                  {new Date(post.regDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('.', '/')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {post.isNotice && (
                  <span className="bg-[#fff1f1] text-[#e85e5e] text-[11px] px-1.5 py-0.5 rounded-[4px] font-bold shrink-0">공지</span>
                )}
                <div className="text-[17px] font-bold text-[#191f28] leading-[1.4] truncate flex-1">
                  {post.title}
                </div>
              </div>

              <div className="text-[14px] text-toss-grey line-clamp-1 leading-[1.5]">
                {post.content}
              </div>

              <div className="flex gap-3 mt-1 text-[12px] text-light">
                <span className="flex items-center gap-1">👀 {post.viewCount}</span>
                <span className="flex items-center gap-1">💬 {post.replyCount}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 플로팅 글쓰기 버튼 */}
      <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-full max-w-[430px] h-0 z-[500] pointer-events-none">
        <button 
          onClick={() => navigate('/community/write')}
          className="absolute right-5 bottom-0 bg-[#191f28] text-white px-[22px] py-3.5 rounded-full font-bold text-[15px] shadow-lg active:scale-95 transition-transform pointer-events-auto flex items-center gap-1.5"
        >
          <span>✏️</span> 글쓰기
        </button>
      </div>
    </div>
  );
};

export default Community;

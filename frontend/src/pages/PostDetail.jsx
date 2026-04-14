import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const PostDetail = () => {
  const { postNum } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ post: null, replies: [] });
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (e) {
      return {};
    }
  })();

  const fetchPostDetail = async () => {
    try {
      const response = await api.get(`/community/${postNum}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [postNum]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await api.post('/community/reply/write', { postNum: parseInt(postNum), content: replyContent });
      setReplyContent('');
      fetchPostDetail(); // 댓글 목록 갱신
    } catch (error) {
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.post(`/community/delete/${postNum}`);
      alert('삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <header className="px-5 py-4 bg-white sticky top-0 z-10 border-b border-toss-bg flex items-center">
          <button onClick={() => navigate(-1)} className="text-[20px] text-black p-1 mr-4">❮</button>
          <span className="text-[18px] font-bold text-[#191f28]">글 보기</span>
          <span className="ml-auto text-[10px] text-slate-400 font-mono">V.401-FIX</span>
        </header>

        <div className="px-6 py-6 flex-1 animate-pulse min-h-[500px]">
          <div className="h-8 bg-slate-100 rounded-lg w-3/4 mb-6"></div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-slate-100 rounded w-24"></div>
              <div className="h-3 bg-slate-100 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.post) return <div className="p-20 text-center text-toss-grey">게시글을 찾을 수 없습니다.</div>;

  const { post, replies } = data;
  const isAuthor = currentUser.userId === post.authorId || currentUser.role === 'ADMIN';

  return (
    <div className="flex flex-col bg-white min-h-full">
      <header className="px-5 py-4 bg-white sticky top-0 z-10 border-b border-toss-bg flex items-center">
        <button onClick={() => navigate(-1)} className="text-[20px] text-black p-1 mr-4">❮</button>
        <span className="text-[18px] font-bold text-[#191f28]">글 보기</span>
        <span className="ml-auto text-[10px] text-slate-400 font-mono">V.401-FIX</span>
      </header>

      <div className="px-6 py-6 flex-1">
        <div className="mb-6">
          {post.isNotice && (
            <div className="inline-block bg-[#F0FDF4] text-deep-green text-[14px] font-bold px-3 py-1 rounded-full mb-2">공지</div>
          )}
          <h1 className="text-[22px] font-extrabold text-[#191f28] leading-[1.4] mb-4 break-keep">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-toss-bg rounded-full flex items-center justify-center text-[20px]">👤</div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#191f28]">{post.authorName || '익명'}</span>
              <span className="text-[13px] text-light mt-0.5">
                {new Date(post.regDate).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <hr className="h-[1px] bg-toss-bg border-none my-6" />

        <div className="text-[16px] leading-[1.7] text-[#191f28] whitespace-pre-wrap break-words min-h-[150px]">
          {post.content}
        </div>

        <hr className="h-[1px] bg-toss-bg border-none mt-10 mb-6" />

        {/* 댓글 섹션 */}
        <div className="mb-5">
          <div className="text-[16px] font-bold text-[#191f28] mb-4">
            댓글 <span className="text-deep-green">{replies?.length || 0}</span>
          </div>

          <div className="flex flex-col gap-5 mb-6">
            {replies?.length > 0 ? (
              replies.map((reply, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-bold text-[#191f28]">{reply.authorId}</span>
                    <span className="text-light text-[12px]">
                      {new Date(reply.regDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace('.', '/')}
                    </span>
                  </div>
                  <div className="bg-[#f9fafb] p-3 rounded-[12px] text-[15px] text-toss-grey leading-[1.5]">
                    {reply.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-light text-[14px] py-2">첫 댓글을 남겨보세요! 👋</div>
            )}
          </div>

          {currentUser?.userId ? (
            <form onSubmit={handleReplySubmit} className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-toss-bg border-none rounded-[20px] px-4 py-3.5 text-[15px] outline-none"
                placeholder="댓글을 입력하세요"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                type="submit"
                style={{ backgroundColor: '#3ea331' }}
                className="text-white px-5 py-3 rounded-[16px] font-bold text-[14px] shrink-0"
              >
                등록
              </button>
            </form>
          ) : (
            <div
              className="text-center py-3 text-[14px] text-toss-grey cursor-pointer"
              onClick={() => navigate('/Globar/login')}
            >
              댓글을 작성하려면 <span className="text-deep-green font-semibold">로그인</span>이 필요합니다.
            </div>
          )}
        </div>

        <div className="mt-10 pt-5 border-t border-toss-bg flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="bg-toss-bg text-toss-grey px-5 py-3 rounded-[12px] text-[14px] font-semibold">목록</button>
          
          {isAuthor && (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/community/edit/${postNum}`)}
                className="text-[13px] text-deep-green font-semibold mt-1 text-left"
              >
                수정
              </button>
              <button 
                onClick={handleDeletePost}
                className="text-light hover:text-[#ff4757] font-medium p-3 text-[14px]"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

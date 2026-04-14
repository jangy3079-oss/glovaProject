import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType();

  // 뒤로가기(POP) 동작인 경우 애니메이션 클래스를 제외하여 스와이프 모션과 충돌 방지
  const animationClass = navType === 'POP' ? '' : 'animate-page-in';

  return (
    <div className="flex justify-center bg-[#e5e8eb] min-h-screen">
      <div className="w-full max-w-[430px] min-h-screen bg-toss-bg relative flex flex-col pb-[90px] shadow-[0_0_30px_rgba(0,0,0,0.05)]">
        <main 
          key={location.pathname}
          className={`flex-1 overflow-x-hidden ${animationClass}`}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;

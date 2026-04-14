import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[70px] bg-white/95 backdrop-blur-md border-t border-black/5 flex justify-around items-center z-[1000] px-4 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      <NavLink 
        to="/home" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 no-underline transition-all ${isActive ? 'text-black font-bold' : 'text-[#b0b8c1]'}`
        }
      >
        <span className="text-[1.4rem]">🏠</span>
        <span className="text-[0.7rem]">홈</span>
      </NavLink>
      <NavLink 
        to="/community" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 no-underline transition-all ${isActive ? 'text-black font-bold' : 'text-[#b0b8c1]'}`
        }
      >
        <span className="text-[1.4rem]">💬</span>
        <span className="text-[0.7rem]">커뮤니티</span>
      </NavLink>
      <NavLink 
        to="/calendar" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 no-underline transition-all ${isActive ? 'text-black font-bold' : 'text-[#b0b8c1]'}`
        }
      >
        <span className="text-[1.4rem]">📅</span>
        <span className="text-[0.7rem]">캘린더</span>
      </NavLink>
      <NavLink 
        to="/mypage" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 no-underline transition-all ${isActive ? 'text-black font-bold' : 'text-[#b0b8c1]'}`
        }
      >
        <span className="text-[1.4rem]">👤</span>
        <span className="text-[0.7rem]">마이</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;

// src/components/Header.tsx

import React from 'react';
import '../styles/Header.css';

// 1. '계약서' 수정: "나는 onLoginClick이라는 함수를 받을 거야!"라고 명시
interface HeaderProps {
  onLoginClick: () => void;
}

// 2. Props로 onLoginClick 받아오기
const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">TimePlay</div>
        
        <nav className="nav-menu">
          <a href="#alarm">알림</a>
          <a href="#my-pick">MY 찜 보기</a>
          
          {/* 3. 로그인 버튼(또는 텍스트)에 클릭 이벤트 연결 */}
          {/* (className은 팀원이 만든 CSS에 따라 다를 수 있습니다. '로그인' 글자를 찾으세요) */}
          <div 
            className="login-btn" 
            onClick={onLoginClick} 
            style={{ cursor: 'pointer' }} 
          >
            로그인
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onShowLiked?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { isMobile } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`header ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="header-container">
        <div className="logo">TimePlay</div>
        
        {isMobile && (
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 토글"
          >
            ☰
          </button>
        )}

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <button className="nav-item">알림</button>
          <button className="nav-item" onClick={() => { (typeof (window as any).openLiked === 'function') ? (window as any).openLiked() : null; }}>MY 찜 보기</button>
          <button className="nav-item login-btn" onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }}>로그인</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

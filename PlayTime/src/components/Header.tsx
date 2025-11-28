import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onShowLiked?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { isMobile } = useResponsive();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Detect if current page is a chat-related page
  const isChatPage = ['/live-chat', '/chat-main', '/movie-chat-list', '/genres'].some(
    path => location.pathname.startsWith(path)
  ) || location.pathname.includes('/board') || location.pathname.includes('/post/');

  // 프로필 이니셜 (displayName 또는 email의 첫 글자)
  const getInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // 표시할 이름 (displayName 또는 email)
  const getDisplayName = () => {
    return user?.displayName || user?.email || '';
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 채팅 페이지에서 Header 자동 숨김/표시 기능
  useEffect(() => {
    if (!isChatPage) {
      setIsVisible(true);
      return;
    }

    // 채팅 페이지에서는 기본적으로 숨김
    setIsVisible(false);

    const handleMouseMove = (e: MouseEvent) => {
      // 마우스가 화면 상단 50px 이내에 있으면 표시
      if (e.clientY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isChatPage]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleOpenLiked = () => {
    // Check authentication before showing liked modal
    if (!user) {
      onLoginClick?.();
      return;
    }
    const openLikedFn = (window as Window & { openLiked?: () => void }).openLiked;
    if (typeof openLikedFn === 'function') {
      openLikedFn();
    }
  };

  return (
    <header className={`header ${isMobile ? 'mobile' : 'desktop'} ${!isVisible ? 'hidden' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <span className="logo-gradient">PlayTime</span>
        </div>
        
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
          <button className="nav-item" onClick={handleOpenLiked}>MY 찜 보기</button>
          
          {user ? (
            <div className="profile-container" ref={dropdownRef}>
              <button 
                className="profile-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="프로필 메뉴"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="프로필" className="profile-image" />
                ) : (
                  <span className="profile-initial">{getInitial()}</span>
                )}
                <span className="profile-name">{getDisplayName()}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <span className="profile-email">{user.email}</span>
                  </div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-item login-btn" onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }}>로그인</button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

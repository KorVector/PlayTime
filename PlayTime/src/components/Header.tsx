import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onShowLiked?: () => void;
}

// Constants for scroll behavior
const SCROLL_THRESHOLD = 50; // Minimum scroll position before hide/show kicks in
const SCROLL_DELTA = 5; // Minimum scroll change to trigger hide/show

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { isMobile } = useResponsive();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();

  // spacer 높이(헤더가 fixed이므로 문서 흐름 밀림 방지용)
  const [spacerHeight, setSpacerHeight] = useState<number>(0);

  // Detect if current page is a chat-related page
  const isChatPage =
    ['/live-chat', '/chat-main', '/movie-chat-list', '/genres'].some((path) =>
      location.pathname.startsWith(path)
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

  // 헤더의 실제 높이를 측정해서 spacer에 반영
  useLayoutEffect(() => {
    const measure = () => {
      const h = headerRef.current ? headerRef.current.offsetHeight : 0;
      setSpacerHeight(h);
    };

    // 최초 측정
    measure();

    // 리사이즈 시 재측정
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Scroll-based header hide/show behavior with RAF throttling
  useEffect(() => {
    // Skip scroll behavior on chat pages - they have their own mouse-based logic
    if (isChatPage) return;

    const updateHeader = (currentScrollY: number) => {
      const scrollDelta = currentScrollY - lastScrollY.current;

      // Keep header visible if dropdown is open or menu is open
      if (isDropdownOpen || isMenuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Don't hide/show if scroll delta is too small (prevents iOS bounce issues)
      if (Math.abs(scrollDelta) < SCROLL_DELTA) {
        return;
      }

      // Don't hide if we're near the top of the page
      if (currentScrollY < SCROLL_THRESHOLD) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide on scroll down, show on scroll up
      if (scrollDelta > 0) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    const handleScroll = () => {
      // Skip if we're in SSR or window is not available
      if (typeof window === 'undefined') return;

      // Use requestAnimationFrame for throttling
      if (!ticking.current) {
        const currentScrollY = window.scrollY;
        window.requestAnimationFrame(() => {
          updateHeader(currentScrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // initialize lastScrollY to current value to avoid jump on first scroll
    lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isChatPage, isDropdownOpen, isMenuOpen]);

  // 채팅 페이지에서 Header 자동 숨김/표시 기능 (마우스 기반) — 기존 동작 유지
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

  const handleMyProfile = () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/profile');
  };

  const handleUserSearch = () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    const openUserSearch = (window as Window & { openUserSearch?: () => void }).openUserSearch;
    if (typeof openUserSearch === 'function') {
      openUserSearch();
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`header ${isMobile ? 'mobile' : 'desktop'} ${!isVisible ? 'hidden' : ''}`}
        aria-hidden={!isVisible}
      >
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
            <button className="nav-item" onClick={handleOpenLiked}>
              MY 찜 보기
            </button>

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
                    <button className="dropdown-item" onClick={handleMyProfile}>
                      내 프로필
                    </button>
                    <button className="dropdown-item" onClick={handleUserSearch}>
                      유저 검색
                    </button>
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="nav-item login-btn"
                onClick={() => {
                  onLoginClick?.();
                  setIsMenuOpen(false);
                }}
              >
                로그인
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 헤더가 position:fixed이므로 문서 흐름 유지를 위해 spacer를 둠 */}
      <div style={{ height: spacerHeight }} aria-hidden="true" />
    </>
  );
};

export default Header;

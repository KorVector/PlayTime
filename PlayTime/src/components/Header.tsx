import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

interface HeaderProps {
  onLoginClick?: () => void;
  onShowLiked?: () => void;
}

interface SearchMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMovie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 영화 검색 API 호출 (debounce)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(searchQuery)}&page=1`
        );
        const data = await res.json();
        setSearchResults(data.results?.slice(0, 8) || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('영화 검색 오류:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 읽지 않은 알림 개수 실시간 구독
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    }, (error) => {
      console.error('알림 구독 오류:', error);
    });

    return () => unsubscribe();
  }, [user]);

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

  // 채팅 페이지 전용: 마우스 위치 기반 헤더 숨김/표시
  useEffect(() => {
    // 메인 화면에서는 이 로직 사용 안함 - 스크롤 로직에서 관리
    if (!isChatPage) {
      return;
    }

    // 채팅 페이지에서는 기본적으로 헤더 숨김
    setIsVisible(false);

    const handleMouseMove = (e: MouseEvent) => {
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

  const handleMovieClick = (movieId: number) => {
    setSearchQuery('');
    setShowSearchResults(false);
    const openMovieDetail = (window as Window & { openMovieDetail?: (movieId: number) => void }).openMovieDetail;
    if (typeof openMovieDetail === 'function') {
      openMovieDetail(movieId);
    }
  };

  const handleNotifications = () => {
    if (!user) {
      onLoginClick?.();
      return;
    }
    const openNotifications = (window as Window & { openNotifications?: () => void }).openNotifications;
    if (typeof openNotifications === 'function') {
      openNotifications();
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
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-gradient">PlayTime</span>
          </div>

          {/* 영화 검색창 */}
          <div className="movie-search-container" ref={searchRef}>
            <input
              type="text"
              className="movie-search-input"
              placeholder="영화 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            />
            {showSearchResults && (
              <div className="movie-search-results">
                {searchLoading ? (
                  <div className="search-loading">검색 중...</div>
                ) : searchResults.length === 0 ? (
                  <div className="search-no-results">검색 결과가 없습니다</div>
                ) : (
                  searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <img
                        src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://placehold.co/46x69'}
                        alt={movie.title}
                        className="search-result-poster"
                      />
                      <div className="search-result-info">
                        <span className="search-result-title">{movie.title}</span>
                        <span className="search-result-year">
                          {movie.release_date?.split('-')[0] || '연도 미상'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
            <button className="nav-item notification-btn" onClick={handleNotifications}>
              알림
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
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
    </>
  );
};

export default Header;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import '../styles/HeroSection.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface HeroSectionProps {
  onRecommendClick?: () => void;
}

interface Movie {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  message: string;
  timestamp: Timestamp;
}

// 샘플 채팅 버블 데이터 (실제 채팅이 없을 때 보여줄 애니메이션용)
const sampleBubbles = [
  { id: 1, user: '영화팬', message: '어벤져스 엔드게임 진짜 명작이야 👍', delay: 0 },
  { id: 2, user: '시네필', message: '인터스텔라 OST 들으면 소름..', delay: 2 },
  { id: 3, user: '무비러버', message: '오늘 뭐 볼까? 추천 좀!', delay: 4 },
  { id: 4, user: '팝콘매니아', message: '듄2 IMAX로 봐야 제맛 🎬', delay: 6 },
  { id: 5, user: '밤샘족', message: '넷플릭스 신작 뭐 있어?', delay: 8 },
  { id: 6, user: '평론가', message: '기생충 다시 봐도 대단해', delay: 10 },
  { id: 7, user: '액션덕후', message: '존윅4 액션 미쳤다 ㄷㄷ', delay: 1 },
  { id: 8, user: '로맨스팬', message: '라라랜드 엔딩 아직도 😢', delay: 3 },
];

const HeroSection: React.FC<HeroSectionProps> = ({ onRecommendClick }) => {
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // 인기 영화 가져오기
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ko-KR&page=1`
        );
        const data = await res.json();
        const moviesWithPoster = data.results
          .filter((m: Movie) => m.poster_path)
          .slice(0, 8);
        setMovies(moviesWithPoster);
      } catch (error) {
        console.error('영화 로딩 실패:', error);
      }
    };

    fetchMovies();
  }, []);

  // 실시간 채팅 메시지 구독
  useEffect(() => {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(15));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setChatMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when chat messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'chatMessages');
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '익명',
        userPhotoURL: user.photoURL || null,
        message: newMessage.trim(),
        timestamp: Timestamp.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setSending(false);
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleOpenFullChat = () => {
    navigate('/live-chat');
  };

  return (
    <>
      {/* 섹션 1: 커뮤니티 강조 히어로 */}
      <section className="community-hero">
        {/* 떠오르는 채팅 버블 애니메이션 */}
        <div className="floating-bubbles">
          {sampleBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="floating-bubble"
              style={{ animationDelay: `${bubble.delay}s` }}
            >
              <span className="bubble-user">{bubble.user}</span>
              <span className="bubble-message">{bubble.message}</span>
            </div>
          ))}
        </div>

        <div className="community-hero-content">
          <div className="community-badge">🎬 영화 커뮤니티</div>
          <h1 className="community-title">
            영화, 혼자 보지 말고<br />
            <span className="highlight">함께 이야기해요</span>
          </h1>
          <p className="community-subtitle">
            PlayTime은 영화를 보는 곳이 아닌,<br />
            영화에 대해 웃고 떠들 수 있는 <strong>커뮤니티</strong>입니다.
          </p>
          
          <div className="community-stats">
            <div className="stat-item">
              <span className="stat-icon">💬</span>
              <span className="stat-label">실시간 채팅</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📝</span>
              <span className="stat-label">영화별 게시판</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🤝</span>
              <span className="stat-label">취향 공유</span>
            </div>
          </div>

          <div className="community-buttons">
            <button className="community-btn-primary" onClick={handleOpenFullChat}>
              💬 채팅 시작하기
            </button>
            <button className="community-btn-secondary" onClick={onRecommendClick}>
              🎯 영화 추천받기
            </button>
          </div>
        </div>
      </section>

      {/* 섹션 2: 실시간 채팅 + 인기 영화 */}
      <section className="live-section">
        <div className="live-section-inner">
          {/* 왼쪽: 실시간 채팅 */}
          <div className="live-chat-panel">
            <div className="live-chat-header">
              <div className="live-chat-title-wrap">
                <span className="live-indicator"></span>
                <h2>실시간 대화</h2>
              </div>
              <button className="expand-chat-btn" onClick={handleOpenFullChat}>
                전체보기 →
              </button>
            </div>
            
            <div className="live-chat-messages" ref={chatMessagesRef}>
              {chatMessages.length === 0 ? (
                <div className="live-chat-empty">
                  <span className="empty-icon">💭</span>
                  <p>아직 대화가 없어요</p>
                  <p className="empty-sub">첫 번째로 인사해보세요!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="live-chat-message">
                    <div className="live-chat-avatar">
                      {msg.userPhotoURL ? (
                        <img src={msg.userPhotoURL} alt={msg.userName} />
                      ) : (
                        <span>{getInitial(msg.userName)}</span>
                      )}
                    </div>
                    <div className="live-chat-content">
                      <span className="live-chat-username">{msg.userName}</span>
                      <span className="live-chat-text">{msg.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user ? (
              <form className="live-chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="live-chat-input"
                />
                <button type="submit" className="live-chat-send" disabled={sending || !newMessage.trim()}>
                  전송
                </button>
              </form>
            ) : (
              <div className="live-chat-login-prompt" onClick={() => (window as Window & { openAuth?: () => void }).openAuth?.()}>
                🔐 로그인하고 대화에 참여하세요!
              </div>
            )}
          </div>

          {/* 오른쪽: 인기 영화 미니 캐러셀 */}
          {!isMobile && (
            <div className="trending-movies-panel">
              <h2 className="trending-title">🔥 지금 뜨는 영화</h2>
              <p className="trending-subtitle">이 영화들에 대해 이야기해보세요</p>
              
              <div className="trending-movies-grid">
                {movies.slice(0, isMobile ? 4 : 6).map((movie) => (
                  <div 
                    key={movie.id} 
                    className="trending-movie-card"
                    onClick={() => {
                      const openMovieDetail = (window as Window & { openMovieDetail?: (id: number) => void }).openMovieDetail;
                      if (openMovieDetail) openMovieDetail(movie.id);
                    }}
                  >
                    <img 
                      src={`${IMAGE_BASE}${movie.poster_path}`} 
                      alt={movie.title}
                    />
                    <div className="trending-movie-overlay">
                      <span className="trending-movie-title">{movie.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
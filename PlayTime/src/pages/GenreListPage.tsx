import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/GenreListPage.css';

interface Genre {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const GenreListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const genres: Genre[] = [
    { id: 'action', name: '액션', icon: '💥', color: '#FF6B6B' },
    { id: 'comedy', name: '코미디', icon: '😂', color: '#FFC93C' },
    { id: 'drama', name: '드라마', icon: '🎭', color: '#A8E6CF' },
    { id: 'horror', name: '공포', icon: '👻', color: '#9B59B6' },
    { id: 'romance', name: '로맨스', icon: '💕', color: '#FFB6D9' },
    { id: 'scifi', name: 'SF', icon: '🚀', color: '#5DADE2' },
    { id: 'thriller', name: '스릴러', icon: '🔪', color: '#34495E' },
    { id: 'animation', name: '애니메이션', icon: '🎨', color: '#FF9FF3' },
    { id: 'documentary', name: '다큐멘터리', icon: '📽️', color: '#95A5A6' },
    { id: 'fantasy', name: '판타지', icon: '🧙', color: '#BB8FCE' },
  ];

  return (
    <div className={`genre-list-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="genre-container">
        <button className="back-button" onClick={() => navigate('/chat-main')}>
          ← 뒤로가기
        </button>

        <h1 className="page-title">장르별 채팅방</h1>
        <p className="page-description">
          선호하는 장르를 선택하고 비슷한 취향의 사람들과 소통하세요
        </p>

        <div className="genre-grid">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="genre-card"
              style={{ borderColor: genre.color }}
              onClick={() => navigate(`/genre/${genre.id}/board`)}
            >
              <div className="genre-icon" style={{ backgroundColor: genre.color }}>
                {genre.icon}
              </div>
              <h2 className="genre-name">{genre.name}</h2>
              <button 
                className="genre-button"
                style={{ backgroundColor: genre.color }}
              >
                입장하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreListPage;

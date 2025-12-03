import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/HeroSection.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

interface HeroSectionProps {
  onRecommendClick?: () => void;
}

interface Movie {
  id: number;
  title: string;
  backdrop_path: string | null;
  overview: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onRecommendClick }) => {
  const { isMobile, isTablet } = useResponsive();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 인기 영화 가져오기
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ko-KR&page=1`
        );
        const data = await res.json();
        // backdrop_path가 있는 영화만 필터링하고 10개 선택
        const moviesWithBackdrop = data.results
          .filter((m: Movie) => m.backdrop_path)
          .slice(0, 10);
        setMovies(moviesWithBackdrop);
      } catch (error) {
        console.error('영화 로딩 실패:', error);
      }
    };

    fetchMovies();
  }, []);

  // 자동 슬라이드 (8초마다)
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const currentMovie = movies[currentIndex];

  return (
    <section className="hero-section">
      {/* 배경 이미지들 */}
      {movies.length > 0 && currentMovie && (
        <div className={`hero-backdrop ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <img 
            src={`${IMAGE_BASE}${currentMovie.backdrop_path}`}
            alt={currentMovie.title}
            className="hero-image"
          />
        </div>
      )}

      <div className="hero-overlay"></div>

      <div className={`hero-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        {/* 현재 영화 정보 */}
        {currentMovie && (
          <div className={`hero-movie-info ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            <h1 className="hero-movie-title">{currentMovie.title}</h1>
            {!isMobile && currentMovie.overview && (
              <p className="hero-movie-overview">
                {currentMovie.overview.length > 150 
                  ? currentMovie.overview.substring(0, 150) + '...' 
                  : currentMovie.overview}
              </p>
            )}
          </div>
        )}

        <p className="hero-subtitle">
          영화 고르는 게 힘들고 피로할 때, PlayTime으로 해결하세요.
          {!isMobile && <br />}
          {!isMobile && '사용자 채팅방을 통해 사람들과 영화를 추천받고 추천받는 혁신적인 서비스를 제공합니다.'}
        </p>
        <button className="hero-btn" onClick={onRecommendClick}>
          {isMobile ? '추천 받으러 가기' : '영화 추천 받으러 가기'}
        </button>

        {/* 슬라이드 인디케이터 */}
        {movies.length > 0 && (
          <div className="hero-indicators">
            {movies.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }}
                aria-label={`슬라이드 ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
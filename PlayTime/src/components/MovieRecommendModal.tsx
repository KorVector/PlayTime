import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import MovieDetailModal from './MovieDetailModal';
import '../styles/MovieRecommendModal.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

interface MovieRecommendModalProps {
  open: boolean;
  onClose: () => void;
}

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
}

const genres = [
  { id: 28, name: '액션', emoji: '💥' },
  { id: 35, name: '코미디', emoji: '😂' },
  { id: 10749, name: '로맨스', emoji: '💕' },
  { id: 27, name: '공포', emoji: '👻' },
  { id: 878, name: 'SF', emoji: '🚀' },
  { id: 16, name: '애니메이션', emoji: '🎨' },
  { id: 18, name: '드라마', emoji: '🎭' },
  { id: 53, name: '스릴러', emoji: '😱' },
];

const moods = [
  { id: 'popular', name: '인기작으로', emoji: '🔥', sort: 'popularity.desc' },
  { id: 'top_rated', name: '평점 높은 순', emoji: '⭐', sort: 'vote_average.desc' },
  { id: 'recent', name: '최신작으로', emoji: '🆕', sort: 'release_date.desc' },
  { id: 'classic', name: '클래식 명작', emoji: '🎬', sort: 'release_date.asc' },
];

const MovieRecommendModal: React.FC<MovieRecommendModalProps> = ({ open, onClose }) => {
  const { isMobile } = useResponsive();
  const [step, setStep] = useState<'genre' | 'mood' | 'result'>('genre');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setStep('genre');
      setSelectedGenre(null);
      setSelectedMood(null);
      setRecommendedMovies([]);
    }
  }, [open]);

  if (!open) return null;

  const handleGenreSelect = (genreId: number) => {
    setSelectedGenre(genreId);
    setStep('mood');
  };

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    setLoading(true);

    try {
      const mood = moods.find(m => m.id === moodId);
      const sortBy = mood?.sort || 'popularity.desc';
      
      // 클래식 영화는 2000년 이전, 최신작은 2020년 이후
      let dateFilter = '';
      if (moodId === 'classic') {
        dateFilter = '&release_date.lte=2000-12-31&vote_count.gte=500';
      } else if (moodId === 'recent') {
        dateFilter = '&release_date.gte=2020-01-01';
      } else if (moodId === 'top_rated') {
        dateFilter = '&vote_count.gte=200';
      }

      // 여러 페이지에서 영화 가져오기 (1~5페이지, 최대 100개)
      const pages = [1, 2, 3, 4, 5];
      const allMovies: TmdbMovie[] = [];
      const seenIds = new Set<number>();

      const fetchPromises = pages.map(async (page) => {
        try {
          const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ko-KR&with_genres=${selectedGenre}&sort_by=${sortBy}${dateFilter}&page=${page}`;
          const res = await fetch(url);
          const data = await res.json();
          return data.results || [];
        } catch {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      results.forEach((movies) => {
        movies.forEach((movie: TmdbMovie) => {
          if (!seenIds.has(movie.id)) {
            seenIds.add(movie.id);
            allMovies.push(movie);
          }
        });
      });
      
      // 랜덤으로 3개 선택
      const shuffled = [...allMovies].sort(() => Math.random() - 0.5);
      setRecommendedMovies(shuffled.slice(0, 3));
    } catch (error) {
      console.error('영화 추천 실패:', error);
    } finally {
      setLoading(false);
      setStep('result');
    }
  };

  const handleReset = () => {
    setStep('genre');
    setSelectedGenre(null);
    setSelectedMood(null);
    setRecommendedMovies([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDetailOpen(true);
  };

  return (
    <div className="recommend-modal-overlay" onClick={handleClose}>
      <div 
        className={`recommend-modal ${isMobile ? 'mobile' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="recommend-modal-close" onClick={handleClose}>×</button>
        
        {step === 'genre' && (
          <div className="recommend-step">
            <div className="step-indicator">
              <span className="step-dot active"></span>
              <span className="step-dot"></span>
              <span className="step-dot"></span>
            </div>
            <h2 className="recommend-title">어떤 장르를 원하세요?</h2>
            <p className="recommend-subtitle">오늘 보고 싶은 장르를 선택해주세요</p>
            
            <div className="options-grid">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  className="option-button"
                  onClick={() => handleGenreSelect(genre.id)}
                >
                  <span className="option-emoji">{genre.emoji}</span>
                  <span className="option-name">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'mood' && (
          <div className="recommend-step">
            <div className="step-indicator">
              <span className="step-dot completed">✓</span>
              <span className="step-dot active"></span>
              <span className="step-dot"></span>
            </div>
            <h2 className="recommend-title">어떤 영화를 볼까요?</h2>
            <p className="recommend-subtitle">원하는 스타일을 선택해주세요</p>
            
            <div className="options-grid mood">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  className="option-button mood"
                  onClick={() => handleMoodSelect(mood.id)}
                >
                  <span className="option-emoji">{mood.emoji}</span>
                  <span className="option-name">{mood.name}</span>
                </button>
              ))}
            </div>
            
            <button className="back-button" onClick={() => setStep('genre')}>
              ← 장르 다시 선택
            </button>
          </div>
        )}

        {step === 'result' && (
          <div className="recommend-step result">
            <div className="step-indicator">
              <span className="step-dot completed">✓</span>
              <span className="step-dot completed">✓</span>
              <span className="step-dot active">🎬</span>
            </div>
            <h2 className="recommend-title">🎉 추천 영화가 도착했어요!</h2>
            <p className="recommend-subtitle">
              {genres.find(g => g.id === selectedGenre)?.name} · {moods.find(m => m.id === selectedMood)?.name}
            </p>
            
            {loading ? (
              <div className="loading-spinner">로딩 중...</div>
            ) : (
              <div className="movies-result">
                {recommendedMovies.map((movie, index) => (
                  <div 
                    key={movie.id} 
                    className="movie-result-card clickable"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <div className="movie-rank">{index + 1}</div>
                    {movie.poster_path ? (
                      <img 
                        src={`${IMAGE_BASE}${movie.poster_path}`} 
                        alt={movie.title}
                        className="movie-poster-img"
                      />
                    ) : (
                      <div className="movie-poster">🎬</div>
                    )}
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.title}</h3>
                      <div className="movie-meta">
                        <span>{movie.release_date?.slice(0, 4) || '미정'}</span>
                        <span className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</span>
                      </div>
                      <p className="movie-reason">
                        {movie.overview?.slice(0, 50) || '줄거리 정보 없음'}
                        {movie.overview && movie.overview.length > 50 ? '...' : ''}
                      </p>
                    </div>
                    <div className="movie-click-hint">클릭하여 상세정보 보기 →</div>
                  </div>
                ))}
                
                {recommendedMovies.length === 0 && (
                  <p className="no-results">추천할 영화가 없습니다. 다시 시도해주세요.</p>
                )}
              </div>
            )}
            
            <div className="result-actions">
              <button className="retry-button" onClick={handleReset}>
                🔄 다시 추천받기
              </button>
              <button className="close-button" onClick={handleClose}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 영화 상세 정보 모달 */}
      <MovieDetailModal 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        movieId={selectedMovieId}
      />
    </div>
  );
};

export default MovieRecommendModal;

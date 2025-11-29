import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/MovieDetailModal.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface MovieDetailModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number | null;
}

interface MovieDetail {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  overview: string;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  tagline: string;
}

interface Credit {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path: string | null;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ open, onClose, movieId }) => {
  const { isMobile } = useResponsive();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [credits, setCredits] = useState<{ cast: Credit[]; director: Credit | null }>({ cast: [], director: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && movieId) {
      fetchMovieDetail(movieId);
    }
  }, [open, movieId]);

  const fetchMovieDetail = async (id: number) => {
    setLoading(true);
    try {
      // 영화 상세 정보와 크레딧 동시에 가져오기
      const [movieRes, creditsRes] = await Promise.all([
        fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ko-KR`),
        fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=ko-KR`)
      ]);

      const movieData = await movieRes.json();
      const creditsData = await creditsRes.json();

      setMovie(movieData);
      
      // 주요 출연진 5명과 감독 추출
      const cast = creditsData.cast?.slice(0, 5) || [];
      const director = creditsData.crew?.find((c: Credit & { job: string }) => c.job === 'Director') || null;
      setCredits({ cast, director });
    } catch (error) {
      console.error('영화 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '미정';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  return (
    <div className="movie-detail-overlay" onClick={onClose}>
      <div 
        className={`movie-detail-modal ${isMobile ? 'mobile' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="movie-detail-close" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="movie-detail-loading">
            <div className="loading-spinner"></div>
            <p>영화 정보를 불러오는 중...</p>
          </div>
        ) : movie ? (
          <>
            {/* 배경 이미지 */}
            {movie.backdrop_path && (
              <div 
                className="movie-detail-backdrop"
                style={{ backgroundImage: `url(${IMAGE_BASE}${movie.backdrop_path})` }}
              />
            )}
            
            <div className="movie-detail-content">
              {/* 포스터 */}
              <div className="movie-detail-poster">
                {movie.poster_path ? (
                  <img 
                    src={`${IMAGE_BASE}${movie.poster_path}`} 
                    alt={movie.title}
                  />
                ) : (
                  <div className="no-poster">🎬</div>
                )}
              </div>
              
              {/* 정보 */}
              <div className="movie-detail-info">
                <h1 className="movie-detail-title">{movie.title}</h1>
                {movie.original_title !== movie.title && (
                  <p className="movie-detail-original">{movie.original_title}</p>
                )}
                
                {movie.tagline && (
                  <p className="movie-detail-tagline">"{movie.tagline}"</p>
                )}
                
                <div className="movie-detail-meta">
                  <span className="movie-detail-rating">
                    ⭐ {movie.vote_average.toFixed(1)}
                    <span className="vote-count">({movie.vote_count.toLocaleString()}명)</span>
                  </span>
                  <span className="movie-detail-year">
                    📅 {movie.release_date?.slice(0, 4) || '미정'}
                  </span>
                  <span className="movie-detail-runtime">
                    ⏱️ {formatRuntime(movie.runtime)}
                  </span>
                </div>
                
                {movie.genres?.length > 0 && (
                  <div className="movie-detail-genres">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {movie.production_countries?.length > 0 && (
                  <p className="movie-detail-country">
                    🌍 {movie.production_countries.map(c => c.name).join(', ')}
                  </p>
                )}
                
                {credits.director && (
                  <p className="movie-detail-director">
                    🎬 감독: {credits.director.name}
                  </p>
                )}
                
                <div className="movie-detail-overview">
                  <h3>줄거리</h3>
                  <p>{movie.overview || '줄거리 정보가 없습니다.'}</p>
                </div>
                
                {credits.cast.length > 0 && (
                  <div className="movie-detail-cast">
                    <h3>출연진</h3>
                    <div className="cast-list">
                      {credits.cast.map((actor) => (
                        <div key={actor.id} className="cast-item">
                          {actor.profile_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                              alt={actor.name}
                              className="cast-photo"
                            />
                          ) : (
                            <div className="cast-photo-placeholder">👤</div>
                          )}
                          <div className="cast-info">
                            <span className="cast-name">{actor.name}</span>
                            <span className="cast-character">{actor.character}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="movie-detail-error">
            <p>영화 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailModal;

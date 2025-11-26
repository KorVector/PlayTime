import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import MovieCard from '../components/MovieCard';
import '../styles/MovieChatListPage.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview?: string;
  release_date?: string;
  original_language?: string;
}

const MovieChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError('API 키가 설정되어 있지 않습니다.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${BASE_URL}/movie/popular?language=ko-KR&page=1&api_key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err: any) {
        console.error(err);
        setError('영화 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className={`movie-chat-list-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="page-container">
        <button className="back-button" onClick={() => navigate('/chat-main')}>
          ← 뒤로가기
        </button>

        <h1 className="page-title">영화별 채팅방</h1>
        <p className="page-description">
          영화를 선택하고 다른 팬들과 이야기를 나눠보세요
        </p>

        {loading && <p className="loading-text">로딩 중...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              image={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : undefined}
              title={movie.title}
              date={movie.release_date || ''}
              rating={String(movie.vote_average)}
              languages={[movie.original_language ? movie.original_language.toUpperCase() : 'EN']}
            />
          ))}
        </div>

        {movies.length === 0 && !loading && !error && (
          <p className="no-data-text">데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default MovieChatListPage;

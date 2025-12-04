import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import MovieCard from '../components/MovieCard';
import MovieDetailModal from '../components/MovieDetailModal';
import '../styles/MovieListPage.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';
const TMDB_MAX_PAGES = 500; // TMDB API limits to 500 pages

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview?: string;
  release_date?: string;
  original_language?: string;
}

const MovieListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 페이지 진입 및 페이지 전환 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError('API 키가 설정되어 있지 않습니다.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/movie/popular?language=ko-KR&page=${currentPage}&api_key=${API_KEY}`
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, TMDB_MAX_PAGES));
      } catch (err) {
        console.error(err);
        setError('영화 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]);

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDetailOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = isMobile ? 5 : 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ←
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-button"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-button"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          →
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={`movie-list-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="page-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← 뒤로가기
        </button>

        <h1 className="page-title">영화 목록</h1>
        <p className="page-description">
          인기 영화를 둘러보고 상세 정보를 확인해보세요
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
              onMovieClick={handleMovieClick}
            />
          ))}
        </div>

        {movies.length === 0 && !loading && !error && (
          <p className="no-data-text">데이터가 없습니다.</p>
        )}

        {!loading && !error && movies.length > 0 && (
          <div className="pagination-container">
            {renderPagination()}
          </div>
        )}
      </div>

      <MovieDetailModal 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        movieId={selectedMovieId} 
      />
    </div>
  );
};

export default MovieListPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import MovieCard from '../components/MovieCard';
import MovieDetailModal from '../components/MovieDetailModal';
import '../styles/PopularMoviesPage.css';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

interface MovieLikeCount {
  movieId: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  likeCount: number;
  updatedAt: Timestamp;
}

const PopularMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [movies, setMovies] = useState<MovieLikeCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    setLoading(true);
    setError(null);

    try {
      const movieLikeCountsRef = collection(db, 'movieLikeCounts');
      const q = query(
        movieLikeCountsRef,
        orderBy('likeCount', 'desc'),
        limit(30)
      );
      
      const snapshot = await getDocs(q);
      const moviesData: MovieLikeCount[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as MovieLikeCount;
        moviesData.push(data);
      });
      
      setMovies(moviesData);
    } catch (err) {
      console.error('인기 영화 데이터 로딩 실패:', err);
      setError('인기 영화 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDetailOpen(true);
  };

  return (
    <div className={`popular-movies-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="page-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← 뒤로가기
        </button>

        <h1 className="page-title">인기 찜 영화 랭킹 🏆</h1>
        <p className="page-description">
          가장 많이 찜한 영화 TOP 30
        </p>

        {loading && <p className="loading-text">로딩 중...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && movies.length === 0 && (
          <p className="no-data-text">아직 찜한 영화 데이터가 없습니다.</p>
        )}

        <div className="movie-grid">
          {movies.map((movie, index) => (
            <div key={movie.movieId} className="movie-item-wrapper">
              <div className="rank-badge">
                {index + 1}
              </div>
              <MovieCard
                id={movie.movieId}
                image={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : undefined}
                title={movie.title}
                date={movie.release_date || ''}
                rating={String(movie.vote_average)}
                onMovieClick={handleMovieClick}
              />
              <div className="like-count">
                ❤️ {movie.likeCount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularMoviesPage;

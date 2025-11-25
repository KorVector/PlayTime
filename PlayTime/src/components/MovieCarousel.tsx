import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import MovieCard from './MovieCard';
import '../styles/MovieCarousel.css';

interface Movie {
  id: number;
  title: string;
  date: string;
  rating: string;
  languages: string[];
  image?: string;
}

interface MovieCarouselProps {
  movies?: Movie[];
  title: string;
  children?: React.ReactNode;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ movies = [], title, children }) => {
  const { isMobile, isTablet } = useResponsive();
  
  // 화면 크기에 따라 표시할 영화 수 제한
  const displayCount = isMobile ? 2 : isTablet ? 3 : 4;
  const displayedMovies = movies.slice(0, displayCount);

  return (
    <section className={`movie-carousel ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <h2 className="carousel-title">{title}</h2>
      <div className="carousel-container">
        {children ? (
          <div className={`movies-grid grid-${displayCount}`}>
            {children}
          </div>
        ) : (
          <div className={`movies-grid grid-${displayCount}`}>
            {displayedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                date={movie.date}
                rating={movie.rating}
                languages={movie.languages}
                image={movie.image}
                onChatClick={() => console.log(`${movie.title} 채팅방`)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="carousel-controls">
        <p className="more-info">영화 정보 더보기 →</p>
      </div>
    </section>
  );
};

export default MovieCarousel;

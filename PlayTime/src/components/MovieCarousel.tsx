import React, { useEffect, useRef, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import MovieCard from './MovieCard';
import '../styles/MovieCarousel.css';

interface Movie {
  id: number;
  title: string;
  date: string;
  rating: string;
  image?: string;
}

interface MovieCarouselProps {
  movies?: Movie[];
  title: string;
  children?: React.ReactNode;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ movies = [], title, children }) => {
  const { isMobile, isTablet } = useResponsive();
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // 무한 순환을 위해 영화 목록을 3번 복제
  const duplicatedMovies = [...movies, ...movies, ...movies];

  // children을 3번 복제
  const childArray = React.Children.toArray(children);
  const duplicatedChildren = [...childArray, ...childArray, ...childArray];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || isPaused) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5; // 속도 조절 (낮을수록 느림)

    const animate = () => {
      position -= speed;
      const singleSetWidth = track.scrollWidth / 3;
      
      // 첫 번째 세트가 완전히 지나가면 위치 리셋
      if (Math.abs(position) >= singleSetWidth) {
        position = 0;
      }
      
      track.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, movies.length, childArray.length]);

  return (
    <section className={`movie-carousel ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <h2 className="carousel-title">{title}</h2>
      <div 
        className="carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {children ? (
          <div className="movies-track" ref={trackRef}>
            {duplicatedChildren.map((child, index) => (
              <React.Fragment key={index}>{child}</React.Fragment>
            ))}
          </div>
        ) : (
          <div className="movies-track" ref={trackRef}>
            {duplicatedMovies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}`}
                title={movie.title}
                date={movie.date}
                rating={movie.rating}
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

export default React.memo(MovieCarousel);

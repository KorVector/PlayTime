import React from 'react';
import MovieCard from './MovieCard';
import '../styles/MovieCarousel.css';

interface Movie {
  id: number;
  title: string;
  date: string;
  rating: number; //기존 string속성에서 number속성으로 변경함. 변경하지 않을 경우 후에 평점순으로 영화 나열에 무조건 문제가 발생함
  languages: string[];
  image?: string;
}

interface MovieCarouselProps {
  movies: Movie[];
  title: string;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ movies, title }) => {
  return (
    <section className="movie-carousel">
      <h2 className="carousel-title">{title}</h2>
      <div className="carousel-container">
        <div className="movies-grid">
          {movies.map((movie) => (
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
      </div>
      <div className="carousel-controls">
        <p className="more-info">영화 정보 더보기 →</p>
      </div>
    </section>
  );
};

export default MovieCarousel;

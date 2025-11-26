import { useEffect, useState } from 'react';

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

import MovieCard from './MovieCard';

export default function MovieList() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError('API 키가 설정되어 있지 않습니다. `.env` 파일에 `VITE_TMDB_API_KEY`가 있는지 확인하세요.');
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
        setError('영화 데이터를 불러오는 중 오류가 발생했습니다. 콘솔을 확인하세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // helper: shuffle and pick up to 4 movies
  const getRandomMovies = (arr: TmdbMovie[], count = 4) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  };

  const displayed = getRandomMovies(movies, 4);

  const STORAGE_KEY = 'likedMovies';

  const readLiked = (): any[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const isMovieLiked = (id: number) => {
    return readLiked().some((it) => it.id === id);
  };

  const toggleLike = (movie: TmdbMovie, liked: boolean) => {
    const current = readLiked();
    if (liked) {
      // add
      const toAdd = {
        id: movie.id,
        title: movie.title,
        image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : undefined,
        date: movie.release_date,
        rating: String(movie.vote_average),
      };
      const exists = current.some((it) => it.id === movie.id);
      if (!exists) {
        current.unshift(toAdd);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
    } else {
      // remove
      const filtered = current.filter((it) => it.id !== movie.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  };

  return (
    <>
      {loading && <p style={{ color: 'white', textAlign: 'center' }}>로딩 중...</p>}
      {error && <p style={{ color: 'salmon', textAlign: 'center' }}>{error}</p>}

      {/* return just the MovieCard elements (no outer container) so MovieCarousel can layout them */}
      {displayed.map((m) => (
        <div key={m.id} style={{ flex: '0 0 auto' }}>
          <MovieCard
            id={m.id}
            image={m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : undefined}
            title={m.title}
            date={m.release_date || ''}
            rating={String(m.vote_average)}
            languages={[m.original_language ? m.original_language.toUpperCase() : 'EN']}
            onChatClick={() => console.log(`채팅방 진입: ${m.title}`)}
            onLikeClick={(liked) => toggleLike(m, liked)}
            isLiked={isMovieLiked(m.id)}
          />
        </div>
      ))}

      {displayed.length === 0 && !loading && !error && (
        <p style={{ color: '#999', textAlign: 'center', marginTop: 12 }}>데이터가 없습니다.</p>
      )}
    </>
  );
}

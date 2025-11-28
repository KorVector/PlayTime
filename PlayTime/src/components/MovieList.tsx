import { useEffect, useState, useMemo, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

interface LikedItem {
  id: number;
  title?: string;
  image?: string;
  date?: string;
  rating?: string;
}

import MovieCard from './MovieCard';

interface MovieListProps {
  onAuthRequired?: () => void;
}

function MovieList({ onAuthRequired }: MovieListProps) {
  const { user } = useAuth();
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
      } catch (err: unknown) {
        console.error(err);
        setError('영화 데이터를 불러오는 중 오류가 발생했습니다. 콘솔을 확인하세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // helper: shuffle and pick up to N movies (default 7)
  const getRandomMovies = (arr: TmdbMovie[], count = 7) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  };

  // pick 7 movies to display (computed once per `movies` change to avoid reshuffle on every render)
  const displayed = useMemo(() => getRandomMovies(movies, 7), [movies]);

  const STORAGE_KEY = 'likedMovies';

  // liked state (keep in memory to avoid reading localStorage on every render)
  // Only load liked state for authenticated users
  const [likedIds, setLikedIds] = useState<number[]>(() => {
    if (!user) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: LikedItem[] = raw ? JSON.parse(raw) : [];
      return parsed.map((it) => it.id);
    } catch {
      return [];
    }
  });

  // Update liked state when user changes
  useEffect(() => {
    if (!user) {
      setLikedIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: LikedItem[] = raw ? JSON.parse(raw) : [];
      setLikedIds(parsed.map((it) => it.id));
    } catch {
      setLikedIds([]);
    }
  }, [user]);

  const isMovieLiked = (id: number) => likedIds.includes(id);

  const syncLocalStorage = (items: LikedItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('localStorage 저장 실패', e);
    }
  };

  const toggleLike = (movie: TmdbMovie, liked: boolean) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current: LikedItem[] = raw ? JSON.parse(raw) : [];

      if (liked) {
        const toAdd: LikedItem = {
          id: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : undefined,
          date: movie.release_date,
          rating: String(movie.vote_average),
        };
        const exists = current.some((it) => it.id === movie.id);
        if (!exists) {
          const updated = [toAdd, ...current];
          syncLocalStorage(updated);
          setLikedIds((s) => (s.includes(movie.id) ? s : [movie.id, ...s]));
        }
      } else {
        const filtered = current.filter((it) => it.id !== movie.id);
        syncLocalStorage(filtered);
        setLikedIds((s) => s.filter((id) => id !== movie.id));
      }
    } catch (e) {
      console.error('찜 토글 실패:', e);
    }
  };

  return (
    <>
      {loading && <p style={{ color: 'white', textAlign: 'center' }}>로딩 중...</p>}
      {error && <p style={{ color: 'salmon', textAlign: 'center' }}>{error}</p>}

      {/* return just the MovieCard elements (no outer container) so MovieCarousel can layout them */}
      {displayed.map((m) => (
        <MovieCard
          key={m.id}
          id={m.id}
          image={m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : undefined}
          title={m.title}
          date={m.release_date || ''}
          rating={String(m.vote_average)}
          
          onChatClick={() => console.log(`채팅방 진입: ${m.title}`)}
          onLikeClick={(liked) => toggleLike(m, liked)}
          isLiked={isMovieLiked(m.id)}
          isAuthenticated={!!user}
          onAuthRequired={onAuthRequired}
        />
      ))}

      {displayed.length === 0 && !loading && !error && (
        <p style={{ color: '#999', textAlign: 'center', marginTop: 12 }}>데이터가 없습니다.</p>
      )}
    </>
  );
}

export default memo(MovieList);

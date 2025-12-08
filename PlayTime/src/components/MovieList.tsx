// src/components/MovieList.tsx
import {
  useEffect,
  useState,
  useMemo,
  memo,
  useCallback,
} from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';

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
import MovieDetailModal from './MovieDetailModal';

interface MovieListProps {
  onAuthRequired?: () => void;
  onMovieClick?: (movieId: number) => void; // 상위에서 필요하면 사용
}

function MovieList({ onAuthRequired, onMovieClick }: MovieListProps) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상세 모달 제어용 상태
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError(
          'API 키가 설정되어 있지 않습니다. `.env` 파일에 `VITE_TMDB_API_KEY`가 있는지 확인하세요.',
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoints = [
          `${BASE_URL}/movie/popular?language=ko-KR&page=1&api_key=${API_KEY}`,
          `${BASE_URL}/movie/popular?language=ko-KR&page=2&api_key=${API_KEY}`,
          `${BASE_URL}/movie/now_playing?language=ko-KR&page=1&api_key=${API_KEY}`,
          `${BASE_URL}/movie/top_rated?language=ko-KR&page=1&api_key=${API_KEY}`,
        ];

        const responses = await Promise.all(endpoints.map((url) => fetch(url)));
        const dataArray = await Promise.all(responses.map((res) => res.json()));

        const allMovies: TmdbMovie[] = [];
        const seenIds = new Set<number>();

        dataArray.forEach((data) => {
          (data.results || []).forEach((movie: TmdbMovie) => {
            if (!seenIds.has(movie.id)) {
              seenIds.add(movie.id);
              allMovies.push(movie);
            }
          });
        });

        setMovies(allMovies);
      } catch (err: unknown) {
        console.error(err);
        setError(
          '영화 데이터를 불러오는 중 오류가 발생했습니다. 콘솔을 확인하세요.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getRandomMovies = (arr: TmdbMovie[], count = 12) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  };

  const displayed = useMemo(() => getRandomMovies(movies, 12), [movies]);

  // 찜 상태
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const loadLikedIds = useCallback(async () => {
    if (!user) {
      setLikedIds([]);
      return;
    }

    try {
      const favoritesRef = collection(db, 'favorites', user.uid, 'movies');
      const snapshot = await getDocs(favoritesRef);
      const ids: number[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        ids.push(data.movieId);
      });
      setLikedIds(ids);
    } catch (err) {
      console.error('찜 목록 로딩 에러:', err);
      setLikedIds([]);
    }
  }, [user]);

  useEffect(() => {
    loadLikedIds();
  }, [loadLikedIds]);

  const isMovieLiked = (id: number) => likedIds.includes(id);

  const toggleLike = async (movie: TmdbMovie, liked: boolean) => {
    if (!user) {
      return;
    }

    try {
      const movieRef = doc(db, 'favorites', user.uid, 'movies', String(movie.id));
      const movieLikeCountRef = doc(db, 'movieLikeCounts', String(movie.id));

      if (liked) {
        await setDoc(movieRef, {
          movieId: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : '',
          date: movie.release_date || '',
          rating: String(movie.vote_average),
          addedAt: serverTimestamp(),
        });

        await setDoc(
          movieLikeCountRef,
          {
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || '',
            likeCount: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        setLikedIds((s) => (s.includes(movie.id) ? s : [movie.id, ...s]));
      } else {
        await deleteDoc(movieRef);

        const movieLikeCountDoc = await getDoc(movieLikeCountRef);
        if (movieLikeCountDoc.exists()) {
          const currentCount = movieLikeCountDoc.data().likeCount || 0;
          if (currentCount <= 1) {
            await deleteDoc(movieLikeCountRef);
          } else {
            await updateDoc(movieLikeCountRef, {
              likeCount: increment(-1),
              updatedAt: serverTimestamp(),
            });
          }
        }

        setLikedIds((s) => s.filter((id) => id !== movie.id));
      }
    } catch (e) {
      console.error('찜 토글 실패:', e);
    }
  };

  const handleCardClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setIsDetailOpen(true);
    onMovieClick?.(movieId); // 상위에서도 필요하면 사용
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const selectedMovie = selectedMovieId
    ? movies.find((m) => m.id === selectedMovieId)
    : null;

  return (
    <>
      {loading && (
        <p style={{ color: 'white', textAlign: 'center' }}>로딩 중...</p>
      )}
      {error && (
        <p style={{ color: 'salmon', textAlign: 'center' }}>{error}</p>
      )}

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
          onMovieClick={handleCardClick}
        />
      ))}

      {displayed.length === 0 && !loading && !error && (
        <p
          style={{
            color: '#999',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          데이터가 없습니다.
        </p>
      )}

      {/* ✅ 상세 모달: 카드와 같은 찜 상태/토글 사용 */}
      <MovieDetailModal
        open={isDetailOpen}
        onClose={handleCloseDetail}
        movieId={selectedMovieId}
        isLiked={selectedMovieId ? !!(selectedMovieId && isMovieLiked(selectedMovieId)) : false}
        isAuthenticated={!!user}
        onAuthRequired={onAuthRequired}
        onLikeClick={(liked) => {
          if (!selectedMovie || !selectedMovieId) return;
          toggleLike(selectedMovie, liked);
        }}
      />
    </>
  );
}

export default memo(MovieList);

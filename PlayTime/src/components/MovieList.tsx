import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, serverTimestamp, getDoc, increment, updateDoc } from 'firebase/firestore';

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

interface MovieListProps {
  onAuthRequired?: () => void;
  onMovieClick?: (movieId: number) => void;
}

function MovieList({ onAuthRequired, onMovieClick }: MovieListProps) {
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
        // 여러 페이지와 카테고리에서 영화 가져오기
        const endpoints = [
          `${BASE_URL}/movie/popular?language=ko-KR&page=1&api_key=${API_KEY}`,
          `${BASE_URL}/movie/popular?language=ko-KR&page=2&api_key=${API_KEY}`,
          `${BASE_URL}/movie/now_playing?language=ko-KR&page=1&api_key=${API_KEY}`,
          `${BASE_URL}/movie/top_rated?language=ko-KR&page=1&api_key=${API_KEY}`,
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));
        const dataArray = await Promise.all(responses.map(res => res.json()));
        
        // 모든 영화를 합치고 중복 제거
        const allMovies: TmdbMovie[] = [];
        const seenIds = new Set<number>();
        
        dataArray.forEach(data => {
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
        setError('영화 데이터를 불러오는 중 오류가 발생했습니다. 콘솔을 확인하세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // helper: shuffle and pick up to N movies (default 12)
  const getRandomMovies = (arr: TmdbMovie[], count = 12) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  };

  // pick 12 movies to display (computed once per `movies` change to avoid reshuffle on every render)
  const displayed = useMemo(() => getRandomMovies(movies, 12), [movies]);

  // liked state
  const [likedIds, setLikedIds] = useState<number[]>([]);

  // Load liked IDs from Firestore
  const loadLikedIds = useCallback(async () => {
    if (!user) {
      setLikedIds([]);
      return;
    }
    
    try {
      const favoritesRef = collection(db, 'favorites', user.uid, 'movies');
      const snapshot = await getDocs(favoritesRef);
      const ids: number[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ids.push(data.movieId);
      });
      setLikedIds(ids);
    } catch (err) {
      console.error('찜 목록 로딩 에러:', err);
      setLikedIds([]);
    }
  }, [user]);

  // Load liked state when user changes
  useEffect(() => {
    loadLikedIds();
  }, [loadLikedIds]);

  const isMovieLiked = (id: number) => likedIds.includes(id);

  const toggleLike = async (movie: TmdbMovie, liked: boolean) => {
    // Defense in depth: ensure user is authenticated before modifying favorites
    if (!user) {
      return;
    }
    
    try {
      const movieRef = doc(db, 'favorites', user.uid, 'movies', String(movie.id));
      const movieLikeCountRef = doc(db, 'movieLikeCounts', String(movie.id));
      
      if (liked) {
        // Add to personal favorites
        await setDoc(movieRef, {
          movieId: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : '',
          date: movie.release_date || '',
          rating: String(movie.vote_average),
          addedAt: serverTimestamp(),
        });
        
        // Update global like count
        const movieLikeCountDoc = await getDoc(movieLikeCountRef);
        if (movieLikeCountDoc.exists()) {
          // Document exists, increment likeCount
          await updateDoc(movieLikeCountRef, {
            likeCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        } else {
          // Document doesn't exist, create it
          await setDoc(movieLikeCountRef, {
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || '',
            likeCount: 1,
            updatedAt: serverTimestamp(),
          });
        }
        
        setLikedIds((s) => (s.includes(movie.id) ? s : [movie.id, ...s]));
      } else {
        // Remove from personal favorites
        await deleteDoc(movieRef);
        
        // Decrement global like count
        const movieLikeCountDoc = await getDoc(movieLikeCountRef);
        if (movieLikeCountDoc.exists()) {
          const currentCount = movieLikeCountDoc.data().likeCount || 0;
          if (currentCount <= 1) {
            // If count will be 0 or less, delete the document
            await deleteDoc(movieLikeCountRef);
          } else {
            // Decrement the count
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
          onMovieClick={onMovieClick}
        />
      ))}

      {displayed.length === 0 && !loading && !error && (
        <p style={{ color: '#999', textAlign: 'center', marginTop: 12 }}>데이터가 없습니다.</p>
      )}
    </>
  );
}

export default memo(MovieList);

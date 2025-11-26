import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/BoardPage.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface Post {
  id: string;
  movieId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  commentCount: number;
}

interface MovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}

const MovieBoardPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!API_KEY || !movieId) return;
      
      try {
        const url = `${BASE_URL}/movie/${movieId}?language=ko-KR&api_key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
      }
    };

    fetchMovieDetail();
  }, [movieId]);

  // Firestore 게시글 실시간 구독
  useEffect(() => {
    if (!movieId) return;

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts: Post[] = [];
      snapshot.forEach((doc) => {
        newPosts.push({
          id: doc.id,
          ...doc.data()
        } as Post);
      });
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      console.error('게시글 구독 오류:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [movieId]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || !user || !movieId) return;

    setSubmitting(true);
    try {
      const postsRef = collection(db, 'posts');
      await addDoc(postsRef, {
        movieId: movieId,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        createdAt: Timestamp.now(),
        commentCount: 0,
      });
      setNewPost({ title: '', content: '' });
      setShowForm(false);
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
  };

  return (
    <div className={`board-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="board-container">
        <button className="back-button" onClick={() => navigate('/movie-chat-list')}>
          ← 뒤로가기
        </button>

        {movie && (
          <div className="board-header">
            <div 
              className="board-backdrop"
              style={{
                backgroundImage: movie.backdrop_path 
                  ? `url(${IMAGE_BASE}${movie.backdrop_path})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />
            <div className="board-header-content">
              <h1 className="board-title">{movie.title}</h1>
              <p className="board-subtitle">영화 게시판</p>
            </div>
          </div>
        )}

        <div className="board-content">
          <div className="board-actions">
            <button 
              className="write-post-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '취소' : '글쓰기'}
            </button>
          </div>

          {showForm && (
            <form className="post-form" onSubmit={handleSubmitPost}>
              <input
                type="text"
                className="post-title-input"
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <textarea
                className="post-content-input"
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={5}
              />
              <button type="submit" className="submit-post-button" disabled={submitting}>
                {submitting ? '게시 중...' : '게시하기'}
              </button>
            </form>
          )}

          <div className="posts-list">
            {loading ? (
              <div className="loading-posts">게시글을 불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="no-posts">아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!</div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="post-card"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div className="post-header">
                    <span className="post-author">{post.authorName}</span>
                    <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-preview">{post.content}</p>
                  <div className="post-footer">
                    <span className="post-likes">💬 {post.commentCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieBoardPage;

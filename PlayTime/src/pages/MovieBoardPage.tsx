import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/BoardPage.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  timestamp: Date;
  likes: number;
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
  const { isMobile, isTablet } = useResponsive();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: '영화광123',
      title: '이 영화 진짜 최고예요!',
      content: '스토리도 좋고 연기도 훌륭했어요. 꼭 보세요!',
      timestamp: new Date(Date.now() - 3600000),
      likes: 15,
    },
    {
      id: 2,
      author: '시네마러버',
      title: '감독의 연출력이 돋보이는 작품',
      content: '세밀한 디테일까지 신경 쓴 게 느껴집니다.',
      timestamp: new Date(Date.now() - 7200000),
      likes: 8,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

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

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.title.trim() && newPost.content.trim()) {
      setPosts(prev => [{
        id: Date.now(),
        author: '나',
        title: newPost.title,
        content: newPost.content,
        timestamp: new Date(),
        likes: 0,
      }, ...prev]);
      setNewPost({ title: '', content: '' });
      setShowForm(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
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
              <button type="submit" className="submit-post-button">게시하기</button>
            </form>
          )}

          <div className="posts-list">
            {posts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <div className="post-header">
                  <span className="post-author">{post.author}</span>
                  <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-preview">{post.content}</p>
                <div className="post-footer">
                  <span className="post-likes">❤️ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieBoardPage;

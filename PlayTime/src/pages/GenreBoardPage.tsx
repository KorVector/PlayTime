import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/BoardPage.css';

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  timestamp: Date;
  likes: number;
}

const GenreBoardPage: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const genreNames: { [key: string]: string } = {
    action: '액션',
    comedy: '코미디',
    drama: '드라마',
    horror: '공포',
    romance: '로맨스',
    scifi: 'SF',
    thriller: '스릴러',
    animation: '애니메이션',
    documentary: '다큐멘터리',
    fantasy: '판타지',
  };

  const genreName = genreId ? genreNames[genreId] || genreId : '장르';

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: '액션팬',
      title: '최근 본 액션 영화 추천해요',
      content: '정말 박진감 넘치는 액션씬이 압권이었습니다!',
      timestamp: new Date(Date.now() - 3600000),
      likes: 12,
    },
    {
      id: 2,
      author: '영화마니아',
      title: '이 장르 명작 추천 부탁드립니다',
      content: '오래된 영화도 좋아요. 추천 부탁드립니다.',
      timestamp: new Date(Date.now() - 7200000),
      likes: 5,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

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
        <button className="back-button" onClick={() => navigate('/genres')}>
          ← 뒤로가기
        </button>

        <div className="board-header">
          <div className="board-backdrop genre-backdrop" />
          <div className="board-header-content">
            <h1 className="board-title">{genreName}</h1>
            <p className="board-subtitle">장르 게시판</p>
          </div>
        </div>

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

export default GenreBoardPage;

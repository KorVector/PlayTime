import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/PostDetailPage.css';

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: Date;
}

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  timestamp: Date;
  likes: number;
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [post] = useState<Post>({
    id: Number(postId),
    author: '영화광123',
    title: '이 영화 진짜 최고예요!',
    content: '스토리도 좋고 연기도 훌륭했어요. 액션 씬은 정말 압권이었고, 감동적인 엔딩까지 완벽했습니다. 여러분도 꼭 보세요! 후회하지 않으실 거예요.',
    timestamp: new Date(Date.now() - 3600000),
    likes: 15,
  });
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '시네마러버',
      text: '저도 봤는데 정말 좋더라구요!',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: 2,
      author: '무비팬',
      text: '이번 주말에 보러 가야겠어요',
      timestamp: new Date(Date.now() - 900000),
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // 실시간 댓글 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      const randomComments = [
        '동감합니다!',
        '저도 그렇게 생각해요',
        '좋은 정보 감사합니다',
        '완전 공감이에요',
      ];
      const randomAuthors = ['영화팬A', '무비러버B', '시네필C', '관객D'];
      
      if (Math.random() > 0.8) {
        setComments(prev => [...prev, {
          id: Date.now(),
          author: randomAuthors[Math.floor(Math.random() * randomAuthors.length)],
          text: randomComments[Math.floor(Math.random() * randomComments.length)],
          timestamp: new Date(),
        }]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments(prev => [...prev, {
        id: Date.now(),
        author: '나',
        text: newComment,
        timestamp: new Date(),
      }]);
      setNewComment('');
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
    <div className={`post-detail-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="post-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>

        <div className="post-detail">
          <div className="post-detail-header">
            <h1 className="post-detail-title">{post.title}</h1>
            <div className="post-meta">
              <span className="post-author">{post.author}</span>
              <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
            </div>
          </div>

          <div className="post-detail-content">
            <p>{post.content}</p>
          </div>

          <div className="post-actions">
            <button 
              className={`like-button ${liked ? 'liked' : ''}`}
              onClick={() => setLiked(!liked)}
            >
              ❤️ {liked ? post.likes + 1 : post.likes}
            </button>
          </div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">댓글 {comments.length}</h2>
          
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className={`comment ${comment.author === '나' ? 'my-comment' : ''}`}>
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          <form className="comment-form" onSubmit={handleSubmitComment}>
            <input
              type="text"
              className="comment-input"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="comment-submit-button">등록</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

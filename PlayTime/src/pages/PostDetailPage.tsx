import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/PostDetailPage.css';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  commentCount: number;
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Firestore에서 게시글 가져오기
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          setPost({
            id: postSnap.id,
            ...postSnap.data()
          } as Post);
        }
        setLoading(false);
      } catch (error) {
        console.error('게시글 조회 오류:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Firestore 댓글 실시간 구독
  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments: Comment[] = [];
      snapshot.forEach((doc) => {
        newComments.push({
          id: doc.id,
          ...doc.data()
        } as Comment);
      });
      setComments(newComments);
    }, (error) => {
      console.error('댓글 구독 오류:', error);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !postId) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        postId: postId,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        content: newComment.trim(),
        createdAt: Timestamp.now(),
      });

      // 게시글 댓글 수 증가
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성에 실패했습니다.');
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

  const isMyComment = (comment: Comment) => {
    return user && comment.authorId === user.uid;
  };

  if (loading) {
    return (
      <div className={`post-detail-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <div className="post-detail-container">
          <div className="loading-post">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`post-detail-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <div className="post-detail-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <div className="no-post">게시글을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

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
              <span className="post-author">{post.authorName}</span>
              <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div className="post-detail-content">
            <p>{post.content}</p>
          </div>

          <div className="post-actions">
            <span className="comment-count">💬 {comments.length}</span>
          </div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">댓글 {comments.length}</h2>
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={`comment ${isMyComment(comment) ? 'my-comment' : ''}`}>
                  <div className="comment-header">
                    <span className="comment-author">{comment.authorName}</span>
                    <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              ))
            )}
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
            <button type="submit" className="comment-submit-button" disabled={submitting || !newComment.trim()}>
              {submitting ? '등록 중...' : '등록'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

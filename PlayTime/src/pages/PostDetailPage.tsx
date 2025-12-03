import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/PostDetailPage.css';

interface FirestoreError extends Error {
  code?: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
  replyTo?: {
    commentId: string;
    authorName: string;
    content: string;
  };
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
  const [error, setError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Firestore에서 게시글 가져오기
  useEffect(() => {
    if (!postId) return;

    setError(null);
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          setPost({
            id: postSnap.id,
            ...postSnap.data()
          } as Post);
        } else {
          setError('게시글을 찾을 수 없습니다.');
        }
        setLoading(false);
      } catch (error: unknown) {
        console.error('게시글 조회 오류:', error);
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === 'permission-denied') {
          setError('게시글을 볼 권한이 없습니다.');
        } else {
          setError('게시글을 불러오는데 실패했습니다.');
        }
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Firestore 댓글 실시간 구독
  useEffect(() => {
    if (!postId) return;

    setCommentsError(null);
    const commentsRef = collection(db, 'comments');
    // 인덱스 없이도 작동하도록 클라이언트에서 정렬
    const q = query(
      commentsRef,
      where('postId', '==', postId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments: Comment[] = [];
      snapshot.forEach((doc) => {
        newComments.push({
          id: doc.id,
          ...doc.data()
        } as Comment);
      });
      // 클라이언트에서 createdAt 기준 오름차순 정렬
      newComments.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      });
      setComments(newComments);
    }, (error: FirestoreError) => {
      console.error('댓글 구독 오류:', error);
      if (error.code === 'failed-precondition') {
        setCommentsError('데이터베이스 설정이 필요합니다. 관리자에게 문의해주세요.');
      } else {
        setCommentsError('댓글을 불러오는데 실패했습니다.');
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!postId) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(db, 'comments');
      const commentData: Record<string, unknown> = {
        postId: postId,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || '익명',
        authorPhotoURL: user.photoURL || null,
        content: newComment.trim(),
        createdAt: Timestamp.now(),
      };

      // 답글인 경우 replyTo 정보 추가
      if (replyingTo) {
        commentData.replyTo = {
          commentId: replyingTo.id,
          authorName: replyingTo.authorName,
          content: replyingTo.content.substring(0, 50) + (replyingTo.content.length > 50 ? '...' : ''),
        };
      }

      await addDoc(commentsRef, commentData);

      // 알림 생성: 게시글 작성자에게 알림 (본인이 아닌 경우)
      if (post && post.authorId !== user.uid) {
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
          userId: post.authorId,
          type: 'comment',
          message: `${user.displayName || '누군가'}님이 회원님의 게시글에 댓글을 남겼습니다.`,
          postId: postId,
          postTitle: post.title,
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email?.split('@')[0] || '익명',
          read: false,
          createdAt: Timestamp.now(),
        });
      }

      // 답글인 경우 원 댓글 작성자에게도 알림 (본인이 아닌 경우)
      if (replyingTo && replyingTo.authorId !== user.uid) {
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
          userId: replyingTo.authorId,
          type: 'reply',
          message: `${user.displayName || '누군가'}님이 회원님의 댓글에 답글을 남겼습니다.`,
          postId: postId,
          postTitle: post?.title || '',
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email?.split('@')[0] || '익명',
          read: false,
          createdAt: Timestamp.now(),
        });
      }

      // 게시글 댓글 수 증가
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
      setReplyingTo(null);
    } catch (error: unknown) {
      console.error('댓글 작성 오류:', error);
      const firestoreError = error as FirestoreError;
      if (firestoreError.code === 'permission-denied') {
        alert('댓글 작성 권한이 없습니다. 다시 로그인해주세요.');
      } else {
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
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

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleAuthorClick = (authorId: string) => {
    navigate(`/profile/${authorId}`);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
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

  if (error || !post) {
    return (
      <div className={`post-detail-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <div className="post-detail-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <div className="no-post">{error || '게시글을 찾을 수 없습니다.'}</div>
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
            {commentsError ? (
              <div className="error-comments">{commentsError}</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={`comment ${isMyComment(comment) ? 'my-comment' : ''}`}>
                  <div 
                    className="comment-avatar"
                    onClick={() => handleAuthorClick(comment.authorId)}
                    style={{ cursor: 'pointer' }}
                  >
                    {comment.authorPhotoURL ? (
                      <img src={comment.authorPhotoURL} alt={comment.authorName} />
                    ) : (
                      <span className="avatar-initial">{getInitial(comment.authorName)}</span>
                    )}
                  </div>
                  <div className="comment-content-wrapper">
                    <div className="comment-header">
                      <span 
                        className="comment-author"
                        onClick={() => handleAuthorClick(comment.authorId)}
                        style={{ cursor: 'pointer' }}
                      >
                        {comment.authorName}
                      </span>
                      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                      <button 
                        className="reply-btn"
                        onClick={() => handleReply(comment)}
                        type="button"
                      >
                        답글
                      </button>
                    </div>
                    {comment.replyTo && (
                      <div className="reply-to-info">
                        <span className="reply-to-label">↳ {comment.replyTo.authorName}에게 답글</span>
                        <span className="reply-to-content">"{comment.replyTo.content}"</span>
                      </div>
                    )}
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <form className="comment-form" onSubmit={handleSubmitComment}>
            {replyingTo && (
              <div className="replying-to-bar">
                <span>↳ {replyingTo.authorName}에게 답글 작성 중</span>
                <button type="button" className="cancel-reply-btn" onClick={cancelReply}>✕</button>
              </div>
            )}
            <div className="comment-input-row">
              <input
                ref={inputRef}
                type="text"
                className="comment-input"
                placeholder={replyingTo ? `${replyingTo.authorName}에게 답글...` : "댓글을 입력하세요..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="comment-submit-button" disabled={submitting || !newComment.trim()}>
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LiveChatRoom.css';

interface FirestoreError extends Error {
  code?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  message: string;
  timestamp: Timestamp;
  replyTo?: {
    messageId: string;
    userName: string;
    message: string;
  };
}

const LiveChatRoom: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Firebase Firestore 실시간 메시지 구독
  useEffect(() => {
    setError(null);
    const messagesRef = collection(db, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      setMessages(newMessages);
      setLoading(false);
    }, (error: FirestoreError) => {
      console.error('메시지 구독 오류:', error);
      if (error.code === 'failed-precondition') {
        setError('데이터베이스 설정이 필요합니다. 관리자에게 문의해주세요.');
      } else {
        setError('메시지를 불러오는데 실패했습니다.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const messagesRef = collection(db, 'chatMessages');
      const messageData: Record<string, unknown> = {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '익명',
        userEmail: user.email || '',
        userPhotoURL: user.photoURL || null,
        message: newMessage.trim(),
        timestamp: Timestamp.now(),
      };

      // 답글인 경우 replyTo 정보 추가
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          userName: replyingTo.userName,
          message: replyingTo.message.substring(0, 30) + (replyingTo.message.length > 30 ? '...' : ''),
        };

        // 답글 알림 생성 (본인이 아닌 경우)
        if (replyingTo.userId !== user.uid) {
          const notificationsRef = collection(db, 'notifications');
          await addDoc(notificationsRef, {
            userId: replyingTo.userId,
            type: 'reply',
            message: `${user.displayName || '누군가'}님이 채팅방에서 회원님의 메시지에 답글을 남겼습니다.`,
            postId: 'live-chat',
            postTitle: '실시간 채팅방',
            fromUserId: user.uid,
            fromUserName: user.displayName || user.email?.split('@')[0] || '익명',
            read: false,
            createdAt: Timestamp.now(),
          });
        }
      }

      await addDoc(messagesRef, messageData);
      setNewMessage('');
      setReplyingTo(null);
    } catch (error: unknown) {
      console.error('메시지 전송 오류:', error);
      const firestoreError = error as FirestoreError;
      if (firestoreError.code === 'permission-denied') {
        alert('메시지 전송 권한이 없습니다. 다시 로그인해주세요.');
      } else {
        alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg: Message) => {
    return user && msg.userId === user.uid;
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="live-chat-room">
      <div className="chat-container">
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <h1 className="chat-title">실시간 채팅방</h1>
          <div className="online-count">
            <span className="online-dot"></span>
            {user?.displayName || '접속중'}
          </div>
        </div>

        <div className="messages-container">
          {loading ? (
            <div className="loading-messages">메시지를 불러오는 중...</div>
          ) : error ? (
            <div className="error-messages">{error}</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">아직 메시지가 없습니다. 첫 번째 메시지를 보내보세요!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${isMyMessage(msg) ? 'my-message' : ''}`}>
                <div 
                  className="message-avatar"
                  onClick={() => handleUserClick(msg.userId)}
                  style={{ cursor: 'pointer' }}
                >
                  {msg.userPhotoURL ? (
                    <img src={msg.userPhotoURL} alt={msg.userName} />
                  ) : (
                    <span className="avatar-initial">{getInitial(msg.userName)}</span>
                  )}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-header">
                    <span 
                      className="message-username"
                      onClick={() => handleUserClick(msg.userId)}
                      style={{ cursor: 'pointer' }}
                    >
                      {msg.userName}
                    </span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    <button 
                      className="reply-msg-btn"
                      onClick={() => handleReply(msg)}
                      type="button"
                    >
                      답글
                    </button>
                  </div>
                  {msg.replyTo && (
                    <div className="reply-to-info">
                      <span className="reply-to-label">↳ {msg.replyTo.userName}에게</span>
                      <span className="reply-to-content">"{msg.replyTo.message}"</span>
                    </div>
                  )}
                  <div className="message-text">{msg.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input-form" onSubmit={handleSendMessage}>
          {replyingTo && (
            <div className="replying-to-bar">
              <span>↳ {replyingTo.userName}에게 답글 작성 중</span>
              <button type="button" className="cancel-reply-btn" onClick={cancelReply}>✕</button>
            </div>
          )}
          <div className="message-input-row">
            <input
              ref={inputRef}
              type="text"
              className="message-input"
              placeholder={replyingTo ? `${replyingTo.userName}에게 답글...` : "메시지를 입력하세요..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="send-button" disabled={!newMessage.trim()}>전송</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveChatRoom;

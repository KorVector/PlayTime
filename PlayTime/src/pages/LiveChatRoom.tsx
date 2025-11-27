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
  message: string;
  timestamp: Timestamp;
}

const LiveChatRoom: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '익명',
        userEmail: user.email || '',
        message: newMessage.trim(),
        timestamp: Timestamp.now(),
      });
      setNewMessage('');
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
                <div className="message-header">
                  <span className="message-username">{msg.userName}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="send-button" disabled={!newMessage.trim()}>전송</button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatRoom;

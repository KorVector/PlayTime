import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LiveChatRoom.css';

interface Message {
  id: number;
  username: string;
  text: string;
  timestamp: Date;
}

const LiveChatRoom: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, username: '영화광123', text: '안녕하세요! 오늘 뭐 보셨나요?', timestamp: new Date() },
    { id: 2, username: '시네마러버', text: '저는 인터스텔라 다시 봤어요', timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(42);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 실시간 시뮬레이션: 랜덤 메시지 추가
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        '오늘 개봉한 영화 보신 분?',
        '추천 영화 있으신가요?',
        '주말에 뭐 볼까 고민중이에요',
        '넷플릭스 신작 재밌더라구요',
      ];
      const randomUsernames = ['영화팬', '무비러버', '시네필', '드라마킹'];
      
      if (Math.random() > 0.7) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: randomUsernames[Math.floor(Math.random() * randomUsernames.length)],
          text: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date(),
        }]);
        setOnlineCount(prev => prev + Math.floor(Math.random() * 3 - 1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        username: '나',
        text: newMessage,
        timestamp: new Date(),
      }]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
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
            {onlineCount}명 접속중
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.username === '나' ? 'my-message' : ''}`}>
              <div className="message-header">
                <span className="message-username">{msg.username}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
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
          <button type="submit" className="send-button">전송</button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatRoom;

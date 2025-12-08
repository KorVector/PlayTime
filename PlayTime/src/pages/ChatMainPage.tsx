import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/ChatMainPage.css';

const ChatMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const menuItems = [
    {
      id: 1,
      title: '영화별 게시판',
      description: '좋아하는 영화에 대해 이야기해보세요',
      icon: '🎬',
      path: '/movie-chat-list',
    },
    {
      id: 2,
      title: '장르별 채팅방',
      description: '선호하는 장르의 커뮤니티에 참여하세요',
      icon: '🎭',
      path: '/genres',
    },
    {
      id: 3,
      title: '실시간 채팅방',
      description: '지금 바로 영화 팬들과 대화하세요',
      icon: '💬',
      path: '/live-chat',
    },
  ];

  return (
    <div className={`chat-main-page ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="chat-main-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← 홈으로
        </button>
        
        <h1 className="page-title">소통 커뮤니티</h1>
        <p className="page-description">
          영화를 사랑하는 사람들과 함께 이야기를 나눠보세요
        </p>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-card"
              onClick={() => navigate(item.path)}
            >
              <div className="menu-icon">{item.icon}</div>
              <h2 className="menu-title">{item.title}</h2>
              <p className="menu-description">{item.description}</p>
              <button className="menu-button">입장하기 →</button> 
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMainPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import '../styles/ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="protected-route-container">
        <div className="login-required-card">
          <div className="login-icon">🔒</div>
          <h2 className="login-title">로그인이 필요합니다</h2>
          <p className="login-description">
            이 페이지에 접근하려면 로그인이 필요합니다.<br />
            로그인하시면 영화 팬들과 소통할 수 있습니다.
          </p>
          <div className="login-actions">
            <button 
              className="login-button"
              onClick={() => setAuthOpen(true)}
            >
              로그인하기
            </button>
            <button 
              className="home-button"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

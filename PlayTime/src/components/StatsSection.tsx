import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/StatsSection.css';

const StatsSection: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className={`stats-section ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="stats-content">
        <div className="stats-text">
          <h2 className="stats-title">
            영화 이야기,<br />
            <span className="highlight">PlayTime</span>에서 시작하세요
          </h2>
          <p className="stats-description">
            좋아하는 영화에 대해 이야기하고, 새로운 영화를 발견하고,
            같은 취향의 사람들과 연결되세요. PlayTime은 영화 팬들을 위한
            최고의 소통 공간입니다.
          </p>
          
          <div className="stats-numbers">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">등록된 영화</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">12K+</span>
              <span className="stat-label">활성 유저</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">8K+</span>
              <span className="stat-label">일일 대화</span>
            </div>
          </div>
        </div>

        <div className="stats-visual">
          <div className="floating-card card-1">
            <span className="card-emoji">🎬</span>
            <span className="card-text">최신 개봉작</span>
          </div>
          <div className="floating-card card-2">
            <span className="card-emoji">⭐</span>
            <span className="card-text">평점 9.2</span>
          </div>
          <div className="floating-card card-3">
            <span className="card-emoji">💬</span>
            <span className="card-text">실시간 토론 중</span>
          </div>
          <div className="main-visual">
            <div className="visual-circle"></div>
            <div className="visual-icon">🎥</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
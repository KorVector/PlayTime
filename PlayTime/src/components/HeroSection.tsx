/*
import React from 'react';
import '../styles/HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <img 
        src="https://placehold.co/1920x855" 
        alt="Hero background" 
        className="hero-image"
      />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <p className="hero-subtitle">
          영화 고르는 게 힘들고 피로할 때, TimePlay으로 해결하세요.<br />
          사용자 채팅방을 통해 사람들과 영화를 추천받고 추천받는 혁신적인 서비스를 제공합니다.
        </p>
        <button className="hero-btn">영화 추천 받으러 가기</button>
      </div>
    </section>
  );
};

export default HeroSection;
*/

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/HeroSection.css';

const HeroSection: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className="hero-section">
      <img 
        src={isMobile ? "/common-mobile.jpg" : "/common.jpg"}
        alt="Hero background" 
        className="hero-image"
      />

      <div className="hero-overlay"></div>

      <div className={`hero-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <p className="hero-subtitle">
          영화 고르는 게 힘들고 피로할 때, TimePlay으로 해결하세요.<br />
          {!isMobile && '사용자 채팅방을 통해 사람들과 영화를 추천받고 추천받는 혁신적인 서비스를 제공합니다.'}
          {isMobile && <span>사용자 채팅방을 통해 영화를 추천받는 서비스</span>}
        </p>
        <button className="hero-btn">
          {isMobile ? '추천 받으러 가기' : '영화 추천 받으러 가기'}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
/*
import React from 'react';
import '../styles/StatsSection.css';

interface Stat {
  id: number;
  image: string;
  value: string;
}

const StatsSection: React.FC = () => {
  const stats: Stat[] = [
    {
      id: 1,
      image: 'https://placehold.co/298x420',
      value: '1760만 +',
    },
    {
      id: 2,
      image: 'https://placehold.co/298x420',
      value: '1620만 +',
    },
    {
      id: 3,
      image: 'https://placehold.co/298x420',
      value: '1410만 +',
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <img src={stat.image} alt="stat" className="stat-image" />
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
*/

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/StatsSection.css';

interface Stat {
  id: number;
  image: string;
  value: string;
}

const StatsSection: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  const stats: Stat[] = [
    {
      id: 1,
      image: '/rank1.jpg',
      value: '1760만 +',
    },
    {
      id: 2,
      image: '/rank2.jpg',
      value: '1620만 +',
    },
    {
      id: 3,
      image: '/rank3.jpg',
      value: '1410만 +',
    },
  ];

  const boxWidth = isMobile ? '85%' : isTablet ? '80%' : 367;
  const boxHeight = isMobile ? 52 : isTablet ? 58 : 64;
  const boxTop = isMobile ? -80 : isTablet ? -90 : -100;

  return (
    <section className={`stats-section ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item" style={{ position: 'relative' }}>
            {stat.id === 2 && (
              <div
                className="ranking-label-box"
                style={{
                  width: boxWidth,
                  height: boxHeight,
                  top: boxTop,
                }}
              >
                <div className="ranking-label-text">
                  Korea Movie Ranking
                </div>
              </div>
            )}

            <img src={stat.image} alt={`rank${stat.id}`} className="stat-image" />
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
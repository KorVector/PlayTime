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

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item" style={{ position: 'relative' }}>
            {/* ✅ 두 번째(stat.id === 2) 이미지 위에만 박스 */}
            {stat.id === 2 && (
              <div
                style={{
                  width: 367,
                  height: 64,
                  position: 'absolute',
                  top: -100,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(39.31, 39.31, 39.31, 0.30)',
                  borderRadius: 50,
                }}
              >
                <div
                  style={{
                    left: 85,
                    top: 22,
                    position: 'absolute',
                    opacity: 0.7,
                    textAlign: 'center',
                    color: 'white',
                    fontSize: 20,
                    fontFamily: 'DM Sans',
                    fontWeight: 600,
                    lineHeight: '20px',
                    wordWrap: 'break-word',
                  }}
                >
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
import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/HotTopicsSection.css';

interface Topic {
  id: number;
  title: string;
  movieTitle: string;
  commentCount: number;
  emoji: string;
  isHot: boolean;
}

const HotTopicsSection: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  const topics: Topic[] = [
    {
      id: 1,
      title: '결말 해석이 너무 어려워요',
      movieTitle: '인셉션',
      commentCount: 342,
      emoji: '🤯',
      isHot: true,
    },
    {
      id: 2,
      title: '역대 최고의 빌런은?',
      movieTitle: '다크나이트',
      commentCount: 287,
      emoji: '🃏',
      isHot: true,
    },
    {
      id: 3,
      title: '이 장면에서 울었다는 사람?',
      movieTitle: '인터스텔라',
      commentCount: 256,
      emoji: '😭',
      isHot: false,
    },
    {
      id: 4,
      title: '숨겨진 이스터에그 발견!',
      movieTitle: '스파이더맨',
      commentCount: 198,
      emoji: '🔍',
      isHot: false,
    },
  ];

  return (
    <section className={`hot-topics-section ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      <div className="hot-topics-container">
        <div className="hot-topics-header">
          <h2 className="hot-topics-title">
            <span className="fire-emoji">🔥</span>
            이번 주 HOT 토론
          </h2>
          <p className="hot-topics-subtitle">지금 가장 뜨거운 영화 이야기</p>
        </div>

        <div className="topics-grid">
          {topics.map((topic) => (
            <div key={topic.id} className="topic-card">
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-content">
                <div className="topic-movie">
                  <span className="movie-badge">{topic.movieTitle}</span>
                  {topic.isHot && <span className="hot-badge">HOT</span>}
                </div>
                <h3 className="topic-title">{topic.title}</h3>
                <div className="topic-meta">
                  <span className="comment-count">💬 {topic.commentCount}개의 의견</span>
                </div>
              </div>
              <div className="topic-arrow">→</div>
            </div>
          ))}
        </div>

        <div className="hot-topics-cta">
          <button className="view-all-button">모든 토론 보기</button>
        </div>
      </div>
    </section>
  );
};

export default HotTopicsSection;

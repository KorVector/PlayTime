import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/HotTopicsSection.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// 영화 제목 캐시 (메모리)
const movieTitleCache: { [key: string]: string } = {};

// 장르 매핑 (GenreBoardPage와 동일)
const GENRE_NAMES: { [key: string]: string } = {
  action: '액션',
  comedy: '코미디',
  drama: '드라마',
  horror: '공포',
  romance: '로맨스',
  scifi: 'SF',
  thriller: '스릴러',
  animation: '애니메이션',
  documentary: '다큐멘터리',
  fantasy: '판타지',
};

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  commentCount: number;
  content: string;
  createdAt: Timestamp;
  movieId?: string;
  genreId?: string;
  title: string;
}

interface Topic {
  id: string;
  title: string;
  categoryName: string;
  commentCount: number;
  emoji: string;
  isHot: boolean;
}

interface MovieDetail {
  id: number;
  title: string;
}

const HotTopicsSection: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // 게시글 내용을 기반으로 이모지 선택
  const getEmojiForPost = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('결말') || text.includes('해석') || text.includes('의미')) return '🤯';
    if (text.includes('빌런') || text.includes('악당')) return '🃏';
    if (text.includes('감동') || text.includes('울') || text.includes('눈물')) return '😭';
    if (text.includes('이스터에그') || text.includes('숨겨진') || text.includes('발견')) return '🔍';
    if (text.includes('최고') || text.includes('명작')) return '⭐';
    if (text.includes('ost') || text.includes('음악')) return '🎵';
    if (text.includes('촬영') || text.includes('연출')) return '🎬';
    if (text.includes('배우') || text.includes('연기')) return '🎭';
    return '💬';
  };

  // TMDB API를 통해 영화 제목 가져오기 (캐싱 포함)
  const fetchMovieTitle = async (movieId: string): Promise<string> => {
    // 캐시 확인
    if (movieTitleCache[movieId]) {
      return movieTitleCache[movieId];
    }

    if (!API_KEY) return `영화 #${movieId}`;
    
    try {
      const url = `${BASE_URL}/movie/${movieId}?language=ko-KR&api_key=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MovieDetail = await res.json();
      // 캐시에 저장
      movieTitleCache[movieId] = data.title;
      return data.title;
    } catch (err) {
      console.error('Failed to fetch movie title:', err);
      const fallback = `영화 #${movieId}`;
      movieTitleCache[movieId] = fallback;
      return fallback;
    }
  };

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allPosts: Post[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // movieId 또는 genreId가 있는 게시글만 포함
        if (data.movieId || data.genreId) {
          allPosts.push({
            id: doc.id,
            ...data
          } as Post);
        }
      });

      // commentCount 기준 내림차순 정렬
      allPosts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));

      // 상위 4개만 선택
      const top4Posts = allPosts.slice(0, 4);

      // 각 게시글의 카테고리 이름 가져오기
      const topicsWithCategories = await Promise.all(
        top4Posts.map(async (post, index) => {
          let categoryName = '';
          
          if (post.movieId) {
            categoryName = await fetchMovieTitle(post.movieId);
          } else if (post.genreId) {
            categoryName = GENRE_NAMES[post.genreId] || post.genreId;
          }

          return {
            id: post.id,
            title: post.title,
            categoryName,
            commentCount: post.commentCount || 0,
            emoji: getEmojiForPost(post.title, post.content),
            isHot: index < 2, // 상위 2개는 HOT 배지
          };
        })
      );

      setTopics(topicsWithCategories);
      setLoading(false);
    }, (error) => {
      console.error('게시글 구독 오류:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTopicClick = (topicId: string) => {
    navigate(`/post/${topicId}`);
  };

  if (loading) {
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
            <div className="loading-topics">토론 게시글을 불러오는 중...</div>
          </div>
        </div>
      </section>
    );
  }

  if (topics.length === 0) {
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
            <div className="no-topics">아직 토론 게시글이 없습니다.</div>
          </div>
        </div>
      </section>
    );
  }

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
            <div 
              key={topic.id} 
              className="topic-card"
              onClick={() => handleTopicClick(topic.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-content">
                <div className="topic-movie">
                  <span className="movie-badge">{topic.categoryName}</span>
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
        
      </div>
    </section>
  );
};

export default HotTopicsSection;

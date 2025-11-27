// import React from 'react';
// import '../styles/MovieCard.css';

// interface MovieCardProps {
//   image?: string;
//   title: string;
//   date: string;
//   rating: string;
//   languages: string[];
//   onChatClick?: () => void;
//   onLikeClick?: () => void;
//   isLiked?: boolean;
// }

// const MovieCard: React.FC<MovieCardProps> = ({
//   image = 'https://placehold.co/309x450',
//   title,
//   date,
//   rating,
//   languages,
//   onChatClick,
//   onLikeClick,
//   isLiked = false,
// }) => {
//   return (
//     <div className="movie-card">
//       <img src={image} alt={title} className="movie-image" />
//       <div className="movie-overlay"></div>
      
//       <div className="movie-info">
//         <h3 className="movie-title">{title}</h3>
//         <p className="movie-date">{date}</p>
//         <p className="movie-rating">{rating}</p>
//         <div className="movie-languages">
//           {languages.map((lang, idx) => (
//             <span key={idx} className="language-tag">{lang}</span>
//           ))}
//         </div>
//       </div>
      
//       <div className="movie-actions">
//         <button 
//           className={`like-button ${isLiked ? 'liked' : ''}`} 
//           onClick={onLikeClick}
//           title="찜하기"
//         >
//           ♥
//         </button>
//         <button className="chat-button" onClick={onChatClick}>
//           채팅방 바로가기
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MovieCard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MovieCard.css';
import HeartIcon from './HeartIcon';

interface MovieCardProps {
  id?: number;
  image?: string;
  title: string;
  date: string;
  rating: string;
  onChatClick?: () => void;
  onLikeClick?: (liked: boolean) => void;
  isLiked?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  image = 'https://placehold.co/309x450',
  title,
  date,
  rating,
  onChatClick,
  onLikeClick,
  isLiked: initialLiked = false,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleLikeClick = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    // 부모 컴포넌트에도 알림 (콜백 제공된 경우)
    onLikeClick?.(newLikedState);
  };

  const handleChatClick = () => {
    // Call callback if provided
    onChatClick?.();
    
    // Navigate if id is present
    if (id) {
      navigate(`/movie/${id}/board`);
    }
  };

  return (
    <div className="movie-card">
      <img src={image} alt={title} className="movie-image" />
      <div className="movie-overlay"></div>
      
      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
        <div className="movie-meta">
          <p className="movie-date">{date}</p>

          <div className="movie-rating" aria-hidden>
            <svg className="star" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#FFD166"/>
            </svg>
            <span className="rating-value">{(Number(rating) || 0).toFixed(1)}</span>
          </div>

          <div className="movie-actions-inline">
            <button className="chat-button-inline" onClick={handleChatClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chat-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <HeartIcon 
              liked={isLiked}
              onClick={handleLikeClick}
              className="movie-like-button-inline"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);

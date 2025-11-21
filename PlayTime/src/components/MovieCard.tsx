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
import '../styles/MovieCard.css';
import HeartIcon from './HeartIcon';

interface MovieCardProps {
  image?: string;
  title: string;
  date: string;
  rating: number;//기존 rating의 속성이 string으로 되어있어서 number로 수정
  languages: string[];
  onChatClick?: () => void;
  onLikeClick?: (liked: boolean) => void;
  isLiked?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  image = 'https://placehold.co/309x450',
  title,
  date,
  rating,
  languages,
  onChatClick,
  onLikeClick,
  isLiked: initialLiked = false,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleLikeClick = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    // 부모 컴포넌트에도 알림 (콜백 제공된 경우)
    onLikeClick?.(newLikedState);
  };

  return (
    <div className="movie-card">
      <img src={image} alt={title} className="movie-image" />
      <div className="movie-overlay"></div>
      
      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
        <p className="movie-date">{date}</p>
        <p className="movie-rating">{rating}</p>
      </div>

      {/* 하단: 언어태그 + 채팅버튼(왼쪽), 찜 버튼(오른쪽) */}
      <div className="movie-actions">
        <div className="actions-left">
          <div className="movie-languages">
            {languages.map((lang, idx) => (
              <span key={idx} className="language-tag">{lang}</span>
            ))}
          </div>

          <button className="chat-button" onClick={onChatClick}>
            채팅방 바로가기
          </button>
        </div>

        <div className="actions-right">
          <HeartIcon 
            liked={isLiked}
            onClick={handleLikeClick}
            className="movie-like-button"
          />
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

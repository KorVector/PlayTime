import React from 'react';

interface HeartIconProps {
  liked: boolean;
  onClick?: () => void;
  className?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({ liked, onClick, className = '' }) => {
  return (
    <button
      className={`heart-button ${className}`}
      onClick={onClick}
      title="찜하기"
      aria-label="찜하기"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill={liked ? 'url(#heartGradient)' : 'none'}
        stroke={liked ? 'url(#heartGradient)' : '#b94a4a'}
        strokeWidth={liked ? '2' : '1.2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient
            id="heartGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="50%" stopColor="#eb5757" />
            <stop offset="100%" stopColor="#ff8fa3" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

export default HeartIcon;

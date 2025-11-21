import React from 'react';
import '../styles/FeatureCard.css';

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="feature-card">
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <button className="feature-button" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default FeatureCard;

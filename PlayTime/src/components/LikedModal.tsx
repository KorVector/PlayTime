import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LikedModal.css';

interface LikedItem {
  id: number;
  title: string;
  image?: string;
  date?: string;
  rating?: number;
}

interface LikedModalProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'likedMovies';

const LikedModal: React.FC<LikedModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<LikedItem[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(parsed || []);
    } catch {
      setItems([]);
    }
  }, [open, user]);

  const removeItem = (id: number) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  if (!open) return null;

  // Show message if not authenticated
  if (!user) {
    return (
      <div className="liked-modal-backdrop" onClick={onClose}>
        <div className="liked-modal" onClick={(e) => e.stopPropagation()}>
          <header className="liked-modal-header">
            <h3>MY 찜 보기</h3>
            <button className="close" onClick={onClose}>✕</button>
          </header>
          <div className="liked-modal-content">
            <p className="empty">로그인이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-modal-backdrop" onClick={onClose}>
      <div className="liked-modal" onClick={(e) => e.stopPropagation()}>
        <header className="liked-modal-header">
          <h3>MY 찜 보기</h3>
          <button className="close" onClick={onClose}>✕</button>
        </header>

        <div className="liked-modal-content">
          {items.length === 0 && (
            <p className="empty">찜한 영화가 없습니다.</p>
          )}

          <div className="liked-list">
            {items.map((it) => (
              <div key={it.id} className="liked-item">
                <img src={it.image || 'https://placehold.co/80x120'} alt={it.title} />
                <div className="meta">
                  <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                    <div className="title">{it.title}</div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove ${it.title}`}
                    >
                      삭제
                    </button>
                  </div>
                  <div className="sub">
                    <span>{it.date} · </span>
                    <span className="liked-rating" aria-hidden={false}>
                      <span className="rating-value">{it.rating ?? '-'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedModal;

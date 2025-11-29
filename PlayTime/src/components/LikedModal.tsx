import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Migrate localStorage data to Firestore
  const migrateToFirestore = useCallback(async () => {
    if (!user) return;
    
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    
    try {
      const localItems: LikedItem[] = JSON.parse(raw);
      if (!localItems || localItems.length === 0) return;
      
      setMigrating(true);
      
      // Upload each item to Firestore
      for (const item of localItems) {
        const movieRef = doc(db, 'favorites', user.uid, 'movies', String(item.id));
        await setDoc(movieRef, {
          movieId: item.id,
          title: item.title,
          image: item.image || '',
          date: item.date || '',
          rating: String(item.rating || ''),
          addedAt: serverTimestamp(),
        }, { merge: true });
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY);
      
      setMigrating(false);
    } catch (err) {
      console.error('마이그레이션 에러:', err);
      setMigrating(false);
    }
  }, [user]);

  // Load favorites from Firestore
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const favoritesRef = collection(db, 'favorites', user.uid, 'movies');
      const snapshot = await getDocs(favoritesRef);
      const favoritesList: LikedItem[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        favoritesList.push({
          id: data.movieId,
          title: data.title,
          image: data.image,
          date: data.date,
          rating: data.rating ? Number(data.rating) : undefined,
        });
      });
      
      setItems(favoritesList);
    } catch (err) {
      console.error('찜 목록 로딩 에러:', err);
      // Fallback to localStorage if Firestore fails
      const raw = localStorage.getItem(STORAGE_KEY);
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        setItems(parsed || []);
      } catch {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;
    
    // First migrate localStorage data if any, then load from Firestore
    const initFavorites = async () => {
      await migrateToFirestore();
      await loadFavorites();
    };
    
    initFavorites();
  }, [open, user, migrateToFirestore, loadFavorites]);

  const removeItem = async (id: number) => {
    if (!user) return;
    
    // Optimistically update UI
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    
    try {
      // Remove from Firestore
      const movieRef = doc(db, 'favorites', user.uid, 'movies', String(id));
      await deleteDoc(movieRef);
    } catch (err) {
      console.error('삭제 에러:', err);
      // Revert on error
      setItems(items);
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
          {(loading || migrating) && (
            <p className="empty">{migrating ? '데이터 마이그레이션 중...' : '로딩 중...'}</p>
          )}
          
          {!loading && !migrating && items.length === 0 && (
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

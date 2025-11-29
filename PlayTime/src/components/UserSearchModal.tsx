import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import '../styles/UserSearchModal.css';

interface UserSearchResult {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
}

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const usersRef = collection(db, 'users');
      
      // Search by displayName (case-sensitive partial match using >= and <)
      const searchTerm = searchQuery.trim();
      const endTerm = searchTerm + '\uf8ff';
      
      const nameQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<', endTerm),
        limit(20)
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      const userResults: UserSearchResult[] = [];
      const seenUids = new Set<string>();
      
      nameSnapshot.forEach((doc) => {
        if (!seenUids.has(doc.id)) {
          seenUids.add(doc.id);
          const data = doc.data();
          userResults.push({
            uid: doc.id,
            displayName: data.displayName || '알 수 없음',
            email: data.email || '',
            photoURL: data.photoURL,
            bio: data.bio,
          });
        }
      });

      // Also search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchTerm),
        where('email', '<', endTerm),
        limit(20)
      );

      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach((doc) => {
        if (!seenUids.has(doc.id)) {
          seenUids.add(doc.id);
          const data = doc.data();
          userResults.push({
            uid: doc.id,
            displayName: data.displayName || '알 수 없음',
            email: data.email || '',
            photoURL: data.photoURL,
            bio: data.bio,
          });
        }
      });

      setResults(userResults);
    } catch (err) {
      console.error('유저 검색 에러:', err);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (uid: string) => {
    onClose();
    navigate(`/profile/${uid}`);
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setSearched(false);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="user-search-overlay" onMouseDown={handleClose}>
      <div className="user-search-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="user-search-header">
          <h3>유저 검색</h3>
          <button className="user-search-close" onClick={handleClose} aria-label="닫기">✕</button>
        </div>

        <form className="user-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              className="user-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름 또는 이메일로 검색"
              autoFocus
            />
            <button 
              type="submit" 
              className="search-submit-btn"
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
        </form>

        {error && <p className="user-search-error">{error}</p>}

        <div className="user-search-results">
          {searched && results.length === 0 && !loading && (
            <p className="no-results">검색 결과가 없습니다.</p>
          )}

          {results.map((user) => (
            <div 
              key={user.uid} 
              className="user-result-card"
              onClick={() => handleUserClick(user.uid)}
            >
              <div className="user-result-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <span className="user-result-initial">{getInitial(user.displayName)}</span>
                )}
              </div>
              <div className="user-result-info">
                <span className="user-result-name">{user.displayName}</span>
                <span className="user-result-email">{user.email}</span>
                {user.bio && <span className="user-result-bio">{user.bio}</span>}
              </div>
              <span className="user-result-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;

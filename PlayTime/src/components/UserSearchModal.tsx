import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
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
      const searchTerm = searchQuery.trim().toLowerCase();
      
      // Firestore는 대소문자 구분 검색만 지원하므로 전체 유저를 가져와서 클라이언트에서 필터링
      const allUsersSnapshot = await getDocs(usersRef);
      const userResults: UserSearchResult[] = [];
      
      allUsersSnapshot.forEach((doc) => {
        const data = doc.data();
        const displayName = (data.displayName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        
        // 이름 또는 이메일에 검색어가 포함되어 있으면 결과에 추가
        if (displayName.includes(searchTerm) || email.includes(searchTerm)) {
          userResults.push({
            uid: doc.id,
            displayName: data.displayName || '알 수 없음',
            email: data.email || '',
            photoURL: data.photoURL,
            bio: data.bio,
          });
        }
      });

      setResults(userResults.slice(0, 20)); // 최대 20개 결과
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

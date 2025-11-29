import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/ProfileEditModal.css';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;

    const loadProfile = async () => {
      // Set initial values from Auth user
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');

      // Try to load additional data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBio(data.bio || '');
          // Override with Firestore values if they exist
          if (data.displayName) setDisplayName(data.displayName);
          if (data.photoURL) setPhotoURL(data.photoURL);
        } else {
          setBio('');
        }
      } catch (err) {
        console.error('프로필 로딩 에러:', err);
      }
    };

    loadProfile();
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });

      // Update Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        email: user.email,
        photoURL: photoURL.trim() || null,
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      alert('프로필이 업데이트되었습니다!');
      onClose();
      // Refresh the page to show updated profile
      window.location.reload();
    } catch (err) {
      console.error('프로필 업데이트 에러:', err);
      setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="profile-edit-overlay" onMouseDown={onClose}>
      <div className="profile-edit-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="profile-edit-header">
          <h3>프로필 수정</h3>
          <button className="profile-edit-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          {/* Preview */}
          <div className="profile-preview">
            <div className="preview-avatar">
              {photoURL ? (
                <img src={photoURL} alt="프로필 미리보기" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="preview-initial">{displayName.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <span className="preview-name">{displayName || '이름 입력'}</span>
          </div>

          <label className="profile-edit-label">
            이름
            <input
              className="profile-edit-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="표시할 이름을 입력하세요"
              required
              maxLength={50}
            />
          </label>

          <label className="profile-edit-label">
            프로필 사진 URL
            <input
              className="profile-edit-input"
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <span className="input-hint">이미지 URL을 입력하세요 (선택사항)</span>
          </label>

          <label className="profile-edit-label">
            자기소개
            <textarea
              className="profile-edit-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요"
              rows={3}
              maxLength={200}
            />
            <span className="input-hint">{bio.length}/200</span>
          </label>

          {error && <p className="profile-edit-error">{error}</p>}

          <div className="profile-edit-actions">
            <button 
              type="button" 
              className="profile-edit-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="profile-edit-submit"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;

import React, { useState } from 'react';
import '../styles/AuthModal.css';
// 1. Firebase 도구들을 가져옵니다.
import { auth, db, googleProvider, githubProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // 소셜 로그인 후 Firestore에 사용자 정보 저장
  const saveUserToFirestore = async (user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    // 이미 존재하는 사용자가 아니면 새로 생성
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || user.email?.split('@')[0] || '사용자',
        email: user.email,
        photoURL: user.photoURL,
        bio: '',
        createdAt: serverTimestamp(),
      });
    }
  };

  // Google 로그인
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      alert(`환영합니다, ${result.user.displayName || '사용자'}님! 🎉`);
      onClose();
    } catch (error: unknown) {
      console.error('Google 로그인 에러:', error);
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        // 사용자가 팝업을 닫음 - 무시
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        alert('이미 다른 방법으로 가입된 이메일입니다.');
      } else {
        alert('Google 로그인 실패: ' + (firebaseError.message || '알 수 없는 오류'));
      }
    } finally {
      setLoading(false);
    }
  };

  // GitHub 로그인
  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await saveUserToFirestore(result.user);
      alert(`환영합니다, ${result.user.displayName || '사용자'}님! 🎉`);
      onClose();
    } catch (error: unknown) {
      console.error('GitHub 로그인 에러:', error);
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        // 사용자가 팝업을 닫음 - 무시
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        alert('이미 다른 방법으로 가입된 이메일입니다.');
      } else {
        alert('GitHub 로그인 실패: ' + (firebaseError.message || '알 수 없는 오류'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (tab === 'signup') {
        // 2. 회원가입 로직 (진짜 Firebase 사용)
        // (1) 이메일과 비번으로 계정 생성
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // (2) 프로필에 '이름' 추가 저장
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        // (3) Firestore에 사용자 문서 생성
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: name,
          email: email,
          photoURL: null,
          bio: '',
          createdAt: serverTimestamp(),
        });

        alert(`환영합니다, ${name}님! 회원가입 성공! 🎉`);
        onClose(); // 모달 닫기

      } else {
        // 3. 로그인 로직 (진짜 Firebase 사용)
        await signInWithEmailAndPassword(auth, email, password);
        
        alert(`로그인 되었습니다!`);
        onClose(); // 모달 닫기
      }
    } catch (error: unknown) {
      // 4. 에러 처리 (실패했을 때)
      console.error("에러 발생:", error);
      
      // 친절한 에러 메시지 보여주기
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        alert('이미 사용 중인 이메일입니다.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        alert('이메일 형식이 올바르지 않습니다.');
      } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
        alert('이메일 혹은 비밀번호가 일치하지 않습니다.');
      } else if (firebaseError.code === 'auth/weak-password') {
        alert('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        alert('로그인/회원가입 실패: ' + (firebaseError.message || '알 수 없는 오류'));
      }
    }
  };

  return (
    <div className="auth-modal-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="auth-header">
          <h3>{tab === 'login' ? '로그인' : '회원가입'}</h3>
          <button className="auth-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>로그인</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>회원가입</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <label className="auth-label">
              이름
              <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
            </label>
          )}

          <label className="auth-label">
            이메일
            <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label className="auth-label">
            비밀번호
            <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 (6자리 이상)" required />
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '처리 중...' : (tab === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <div className="social-login-buttons">
          <button 
            className="social-btn google-btn" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
          
          <button 
            className="social-btn github-btn" 
            onClick={handleGithubLogin}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub로 계속하기
          </button>
        </div>

        <div className="auth-footer">
          <p className="small">개인정보 처리방침 및 이용약관에 동의합니다.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
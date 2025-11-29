import React, { useState } from 'react';
import '../styles/AuthModal.css';
// 1. Firebase 도구들을 가져옵니다.
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!open) return null;

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

          <button className="auth-submit" type="submit">{tab === 'login' ? '로그인' : '회원가입'}</button>
        </form>

        <div className="auth-footer">
          <p className="small">개인정보 처리방침 및 이용약관에 동의합니다.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
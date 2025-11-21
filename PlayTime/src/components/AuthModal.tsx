import React, { useState } from 'react';
import '../styles/AuthModal.css';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      // TODO: replace with real auth flow
      console.log('로그인 시도', { email, password });
      alert('로그인 시뮬레이션: ' + email);
      onClose();
    } else {
      console.log('회원가입 시도', { name, email, password });
      alert('회원가입 시뮬레이션: ' + name);
      onClose();
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
              <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            </label>
          )}

          <label className="auth-label">
            이메일 
            <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label className="auth-label">
            비밀번호
            <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
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

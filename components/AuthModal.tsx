
import React, { useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import { User } from '../types';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nickname) return alert('모든 필드를 입력해주세요.');
    const user = portfolioService.login(email, nickname);
    onSuccess(user);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl">×</button>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인 및 시작하기</h2>
        <p className="text-slate-500 text-sm mb-6">기록을 안전하게 저장하고 나만의 포트폴리오를 만드세요.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일 주소</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">닉네임</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="나만의 별명"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            기록 시작하기
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-6 text-center leading-relaxed">
          로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하는 것으로 간주합니다.<br/>
          수집된 정보는 포트폴리오 관리를 위해서만 사용됩니다.
        </p>
      </div>
    </div>
  );
};

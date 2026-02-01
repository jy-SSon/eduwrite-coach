
import React, { useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import { Submission } from '../types';

interface SubmissionModalProps {
  docId: string;
  initialData?: Submission;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ docId, initialData, onClose }) => {
  const [to, setTo] = useState(initialData?.submittedTo || '');
  const [date, setDate] = useState(initialData?.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    portfolioService.updateSubmission(docId, {
      submitted: true,
      submittedAt: new Date(date).toISOString(),
      submittedTo: to
    });
    alert('제출 상태가 업데이트되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">×</button>
        <h3 className="text-lg font-bold text-slate-900 mb-4">제출 정보 기록</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">제출처 (교사/플랫폼)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="예: 생명과학 ○○○ 선생님"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">제출 일자</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all">
            제출 완료 체크
          </button>
        </div>
      </div>
    </div>
  );
};

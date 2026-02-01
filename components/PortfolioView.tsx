
import React, { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import { Document, DocumentVersion, Submission, User } from '../types';

interface PortfolioViewProps {
  user: User;
  onBack: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ user, onBack }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docContent, setDocContent] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    setDocs(portfolioService.getDocuments(user.id));
  }, [user.id]);

  const filteredDocs = docs.filter(d => 
    d.title.includes(filter) || d.subject.includes(filter) || d.activityName.includes(filter)
  );

  const handleViewDoc = (doc: Document) => {
    setSelectedDoc(doc);
    const version = portfolioService.getLatestVersion(doc.id);
    setDocContent(version || null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련 이력이 모두 사라집니다.')) return;
    portfolioService.deleteDocument(id);
    setDocs(docs.filter(d => d.id !== id));
    setSelectedDoc(null);
  };

  const getTypeBadge = (type: string) => {
    const maps: any = { self: '자기평가', peer: '동료평가', inquiry_plan: '탐구계획', inquiry_report: '탐구보고' };
    return maps[type] || type;
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            📂 {user.nickname}님의 포트폴리오
          </h2>
          <p className="text-slate-500 text-sm">총 {docs.length}개의 기록이 보관 중입니다.</p>
        </div>
        <button onClick={onBack} className="text-indigo-600 font-bold text-sm hover:underline">작성 화면으로 돌아가기</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden">
        {/* List Section */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-250px)]">
          <input 
            type="text" 
            placeholder="제목, 과목, 활동명 검색..." 
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 sticky top-0 z-10 shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          
          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-slate-300">검색 결과가 없습니다.</div>
          )}

          {filteredDocs.map(doc => {
            const sub = portfolioService.getSubmission(doc.id);
            return (
              <div 
                key={doc.id}
                onClick={() => handleViewDoc(doc)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDoc?.id === doc.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-white bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">
                    {getTypeBadge(doc.docType)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sub?.submitted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {sub?.submitted ? '제출 완료' : '미제출'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">{doc.title}</h3>
                <div className="flex justify-between items-end text-[11px] text-slate-400">
                  <span>{doc.subject} · {new Date(doc.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="text-red-300 hover:text-red-500 font-bold"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-8 overflow-y-auto custom-scrollbar max-h-[calc(100vh-250px)] shadow-inner">
          {selectedDoc && docContent ? (
            <div className="document-container">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-left border-none p-0 m-0">{selectedDoc.title}</h1>
                  <p className="text-slate-400 text-sm">최종 업데이트: {new Date(selectedDoc.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200">인쇄</button>
                   <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">PDF 다운로드</button>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: docContent.content_form_fill.content }} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <div className="text-6xl">📁</div>
              <p className="font-medium text-lg">왼쪽 목록에서 기록을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

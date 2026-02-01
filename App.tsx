
import React, { useState, useEffect } from 'react';
import { 
  StudentProfile, 
  SelfEvalInputs, 
  PeerEvalInputs, 
  InquiryPlanInputs, 
  InquiryReportInputs,
  DocType, 
  AIResponse,
  User
} from './types';
import { TEMPLATE_FIELDS_CONFIG } from './constants';
import { geminiService } from './services/geminiService';
import { portfolioService } from './services/portfolioService';
import { InputGroup, TextField, SelectField, DatalistField } from './components/InputGroup';
import { AuthModal } from './components/AuthModal';
import { SubmissionModal } from './components/SubmissionModal';
import { PortfolioView } from './components/PortfolioView';

const SUBJECT_OPTIONS = [
  "국어", "수학", "영어", "한국사", "통합사회", "통합과학", 
  "과학탐구실험1", "과학탐구실험2", "윤리문제 탐구", "한국지리 탐구", "사회문제 탐구", "융합과학 탐구", 
  "금융과 경제생활", "기후변화와 지속가능한 세계", "미술 창작", "음악 연주와 창작", 
  "역학과 에너지", "물질과 에너지", "행성우주과학",
  "물리학I", "물리학II", "화학I", "화학II", "생명과학I", "생명과학II", "지구과학I", "지구과학II",
  "생활과 윤리", "윤리와 사상", "한국지리", "세계지리", "동아시아사", "세계사", "경제", "정치와 법", "사회·문화",
  "정보", "기술·가정", "제2외국어", "한문", "예술", "체육", "기타"
];

interface SubjectMetadata {
  careers: string[];
  topics: string[];
  selfEval: SelfEvalInputs;
}

const SUBJECT_METADATA: Record<string, SubjectMetadata> = {
  "국어": {
    careers: ["작가", "기자", "카피라이터", "방송 PD", "국어교사", "언어학자", "변호사", "문학평론가"],
    topics: ["현대 소설 속 소외 계층의 언어 표현 방식 분석", "매체 언어의 오남용 실태와 올바른 언어 사용 캠페인", "고전 문학의 현대적 재해석을 통한 가치 창출 탐구"],
    selfEval: {
      motivation: "현대 소설 수업 중 작가가 사회적 소수자를 묘사하는 방식에 호기심을 느껴 언어적 장치를 탐구함",
      process: "주요 단편 소설 5편을 선정하여 문체와 어휘 사용 빈도를 분석하고 사회적 배경을 조사함",
      troubleshooting: "추상적인 문학적 표현을 객관적 지표로 수치화하는 과정에서 동료와 토론하며 분석 기준을 정립함",
      achievement: "언어가 단순한 전달 수단을 넘어 권력 관계와 사회적 공감을 형성하는 핵심 도구임을 깨달음",
      vision: "사회적 약자의 목소리를 대변하는 따뜻한 시각을 가진 언론인으로서의 자질을 기르고자 함"
    }
  },
  "수학": {
    careers: ["데이터 사이언티스트", "금융 공학자", "회계사", "통계학자", "보험계리사", "알고리즘 개발자", "암호학자", "수학교사"],
    topics: ["미분방정식을 활용한 전염병 확산 모델링 분석", "생활 속 확률 통계의 오류와 올바른 데이터 해석", "프랙탈 기하학을 활용한 자연 구조의 수학적 모델링"],
    selfEval: {
      motivation: "뉴스를 통해 접한 감염병 확산 추이가 수학적 공식으로 예측 가능하다는 사실에 흥미를 느낌",
      process: "SIR 모델의 기본 원리를 학습하고 실제 통계 자료를 바탕으로 파이썬을 활용해 그래프를 시각화함",
      troubleshooting: "초기 변수 설정값에 따라 결과가 크게 달라지는 문제를 해결하기 위해 실제 논문의 매개변수를 참조함",
      achievement: "복잡한 사회 현상을 명료한 수식으로 추상화하는 수학적 사고의 정밀함과 유용성을 체득함",
      vision: "빅데이터를 논리적으로 분석하여 사회적 난제를 해결하는 데이터 전문가를 꿈꾸게 됨"
    }
  },
  "영어": {
    careers: ["동시통역사", "번역가", "외교관", "국제기구 종사자", "글로벌 마케터", "항공 승무원", "영문학자", "영어교사"],
    topics: ["영어권 문화의 관용구와 비유적 표현의 기원 탐구", "AI 번역기의 발전에 따른 언어 학습의 미래 고찰", "영미 문학 속에 나타난 사회적 갈등과 화해의 양상 분석"],
    selfEval: {
      motivation: "영미 문학 작품 속 관용구들이 한국어와 다르게 표현되는 문화적 배경의 차이를 탐구하고 싶어짐",
      process: "역사적 기원이 담긴 관용구 20개를 선정하여 영미권 역사 서적과 비교하며 그 의미의 변천사를 분석함",
      troubleshooting: "고어(Archaic English)의 의미 해석에 어려움이 있었으나 원어민 교사의 자문과 전문 사전으로 해결함",
      achievement: "언어는 단순히 소통의 도구를 넘어 해당 민족의 역사와 가치관을 담고 있는 그릇임을 이해함",
      vision: "다양한 문화를 존중하고 가교 역할을 수행하는 국제 관계 전문가로 성장하고자 함"
    }
  },
  "화학I": {
    careers: ["화학공학자", "약사", "화장품개발자", "식품공학자", "재료공학자", "환경분석가"],
    topics: ["수소 연료 전지의 화학적 원리와 미래 자동차 산업 전망", "미세 플라스틱의 분해를 위한 생분해성 고분자 소재 연구", "산화-환원 반응을 이용한 금속 부식 방지 기술 탐구"],
    selfEval: {
      motivation: "지속 가능한 에너지원으로서 수소의 가능성을 배우고, 실제 전지 내 화학 반응의 효율성을 확인하고 싶어짐",
      process: "연료 전지의 전기 화학적 원리를 조사하고, 촉매 종류에 따른 반응 속도 변화를 실험 설계하여 관찰함",
      troubleshooting: "실험 중 전극의 불순물로 인해 일정한 전압이 측정되지 않는 문제를 세척 공정 개선으로 해결함",
      achievement: "이론으로만 보던 산화-환원 반응이 실질적 에너지로 전환되는 물리적 실재를 경험함",
      vision: "친환경 신소재 개발을 통해 환경 오염을 획기적으로 줄이는 화학공학 연구원이 되고자 함"
    }
  },
  "생명과학I": {
    careers: ["의사", "간호사", "임상병리사", "생물학자", "수의사", "유전상담사", "생명공학연구원"],
    topics: ["CRISPR-Cas9 유전자 편집 기술의 원리와 윤리적 쟁점 분석", "항생제 내성균의 발생 기전과 천연 항균 물질의 효과 실험", "바이러스 감염 경로 분석을 통한 전염병 예방 전략 수립"],
    selfEval: {
      motivation: "유전자 편집 기술의 윤리적 쟁점과 실질적 구현 가능성에 대한 교과 수업 연계 탐구",
      process: "CRISPR-Cas9 원리 분석을 위해 전공 서적 발췌 독서 및 가상 시뮬레이션 모델링 수행",
      troubleshooting: "복잡한 효소 작용 기전을 이해하는 과정에서 시각화 자료 부족 문제를 직접 모형을 제작하여 극복함",
      achievement: "기술적 한계(오프타겟 효과)에 대한 비판적 시각을 정립하고 윤리적 가이드라인의 필요성을 도출함",
      vision: "미래 정밀 의료 분야에서 기술과 윤리를 조화시키는 연구원으로서의 목표 설정"
    }
  },
  "정보": {
    careers: ["소프트웨어 개발자", "정보보안 전문가", "AI 전문가", "빅데이터 분석가", "UX 디자이너", "게임 기획자"],
    topics: ["머신러닝을 활용한 이미지 인식 알고리즘 구현 및 분석", "블록체인 기술의 원리와 보안 솔루션으로서의 가치 탐구", "데이터 시각화를 통한 사회 문제 해결 대안 제시 프로젝트"],
    selfEval: {
      motivation: "인공지능이 사물을 인식하는 논리적 과정에 호기심을 갖고 기초적인 신경망 모델을 구현해보고 싶어짐",
      process: "오픈 소스 라이브러리를 활용해 간단한 숫자 필기체 인식 알고리즘을 코딩하고 정확도를 측정함",
      troubleshooting: "학습 데이터 부족으로 오버피팅이 발생하는 문제를 데이터 증강(Augmentation) 기법을 학습해 해결함",
      achievement: "알고리즘의 효율성이 실제 서비스의 품질을 결정짓는 핵심 요소임을 실제 코딩을 통해 체득함",
      vision: "인간의 편의를 증진하고 윤리적으로 올바른 인공지능 기술을 개발하는 소프트웨어 엔지니어를 꿈꿈"
    }
  },
  "과학탐구실험1": {
    careers: ["기초과학연구원", "변리사", "과학교사", "실험설계사"],
    topics: ["효모의 알코올 발효 조건에 따른 이산화탄소 발생량 비교 실험", "낙하 거리에 따른 충격량 변화와 완충 장치의 효율 분석", "토양의 산성도에 따른 식물 성장 속도의 상관관계 탐구"],
    selfEval: {
      motivation: "생활 속 과학적 현상을 직접 실험으로 증명하고 변인 통제의 중요성을 학습하고자 함",
      process: "가설 설정부터 실험 도구 준비, 3회 이상의 반복 실험을 통한 데이터 수집 및 오차 분석 수행",
      troubleshooting: "온도 조절 실패로 실험값이 튀는 현상을 항온 장치 보강을 통해 극복하고 신뢰도를 확보함",
      achievement: "과학적 방법론의 엄밀함과 객관적 증거 수집의 가치를 실제 실험 과정을 통해 깨달음",
      vision: "현상을 논리적으로 의심하고 증거로 입증하는 탐구 역량을 갖춘 연구자로 성장하고자 함"
    }
  },
  "윤리문제 탐구": {
    careers: ["윤리학자", "인권활동가", "정책분석가", "철학상담사"],
    topics: ["인공지능 자율주행차의 트롤리 딜레마와 법적 책임 소재 탐구", "장기 이식의 우선순위 결정 기준에 대한 정의론적 접근 분석", "디지털 잊혀질 권리와 알 권리 사이의 윤리적 균형점 모색"],
    selfEval: {
      motivation: "기술 발전에 따라 새롭게 등장하는 도덕적 난제들에 대한 철학적 해결책을 탐색하고 싶어짐",
      process: "공리주의와 칸트의 의무론 등 주요 윤리 이론을 사례에 적용하여 비판적 에세이를 작성함",
      troubleshooting: "상충하는 가치 사이에서 결론을 내리기 어려웠으나 다각도 토론을 통해 합의 도출 과정을 경험함",
      achievement: "단일한 정답보다 논리적인 근거를 바탕으로 한 가치 판단의 중요성을 깊이 이해함",
      vision: "기술과 인간이 공존하는 미래를 위해 보편적 윤리 가이드를 제시하는 전문가가 되고자 함"
    }
  },
  "기후변화와 지속가능한 세계": {
    careers: ["환경공학자", "기후정책전문가", "신재생에너지전문가", "국제기구종사자"],
    topics: ["탄소 중립 실현을 위한 탄소 포집 기술(CCUS)의 경제성 분석", "북극해 빙하 감소가 글로벌 물류 경로와 생태계에 미치는 영향 연구", "미세먼지 저감을 위한 도시 숲 조성 사업의 효과성 지표 탐구"],
    selfEval: {
      motivation: "전 지구적 재난인 기후 위기에 대응하기 위해 과학적 사실과 정책적 대안을 연결해보고 싶어짐",
      process: "IPCC 보고서를 요약 분석하고 우리 지역의 탄소 배출 실태를 조사하여 개인별 실천 방안 도출",
      troubleshooting: "방대한 기후 데이터 해석의 어려움을 시각화 도구 활용과 전문가 인터뷰로 해결함",
      achievement: "기후 변화가 단순한 환경 문제를 넘어 경제와 인권이 얽힌 복합적 과제임을 인식함",
      vision: "지속 가능한 지구 공동체를 위해 과학과 행정을 잇는 환경 정책 전문가를 꿈꾸게 됨"
    }
  },
  "금융과 경제생활": {
    careers: ["금융감독원", "자산운용사", "FP(재무설계사)", "경제기자"],
    topics: ["복리 효과의 수학적 원리와 생애 주기별 자산 관리 시뮬레이션", "핀테크 기술의 발전이 전통적 금융 산업에 미치는 파급 효과 분석", "심리적 회계와 손실 회피 편향이 투자 의사결정에 미치는 영향 탐구"],
    selfEval: {
      motivation: "경제 독립을 위해 필수적인 금융 문해력을 기르고 실제 경제 현상을 분석하는 역량을 키우고자 함",
      process: "가상의 포트폴리오를 구성하여 시장 변동에 따른 수익률을 분석하고 위험 관리 전략을 수립함",
      troubleshooting: "금융 용어의 모호함을 신문 기사 스크랩과 용어 사전 정리를 통해 체계적으로 극복함",
      achievement: "합리적 소비와 투자가 개인의 삶의 질뿐만 아니라 국가 경제 순환에 기여함을 배움",
      vision: "공정하고 투명한 금융 시스템 구축에 기여하는 경제 전문가로 성장하고 싶음"
    }
  },
  "행성우주과학": {
    careers: ["천문학자", "항공우주엔지니어", "NASA연구원", "위성데이터분석가"],
    topics: ["외계 행성의 대기 성분 분석을 통한 생명체 거주 가능성 탐색", "화성 탐사 로버의 착륙 메커니즘과 지질 샘플 수집 기술 연구", "소행성 충돌 방지를 위한 궤도 변경 기술의 물리적 원리 탐구"],
    selfEval: {
      motivation: "우주의 광활함 속에 숨겨진 물리 법칙을 탐구하고 인류의 다음 거주지에 대한 호기심을 해결하고자 함",
      process: "천체 망원경을 활용한 관측 데이터를 수집하고 우주 탐사선의 궤도 계산법을 학습함",
      troubleshooting: "복잡한 궤도 역학 수식을 이해하는 데 어려움이 있었으나 물리 교사의 도움과 시뮬레이터로 극복함",
      achievement: "지구라는 좁은 틀을 벗어나 우주적 관점에서 지구 환경의 소중함과 과학의 한계를 체감함",
      vision: "인류의 활동 영역을 우주로 확장하는 항공우주 분야의 선구자가 되고자 함"
    }
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocType>('self');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [keySelected, setKeySelected] = useState<boolean>(true);
  
  // New States for Portfolio & User
  const [user, setUser] = useState<User | null>(portfolioService.getCurrentUser());
  const [view, setView] = useState<'main' | 'portfolio' | 'settings'>('main');
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmission, setShowSubmission] = useState<{ docId: string } | null>(null);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setKeySelected(selected);
      }
    };
    checkKey();
  }, []);

  const [profile, setProfile] = useState<StudentProfile>({
    grade: '2학년 5반 07번',
    name: '김철수',
    subject: '생명과학I',
    activityName: 'CRISPR-Cas9 유전자 편집 기술의 원리와 윤리적 쟁점 분석',
    role: '실험 설계 및 총괄',
    period: '2025. 03. 10. ~ 2025. 08. 현재',
    careerInterest: '생명공학연구원'
  });

  const [selfInputs, setSelfInputs] = useState<SelfEvalInputs>(SUBJECT_METADATA["생명과학I"].selfEval);

  const [peerInputs, setPeerInputs] = useState<PeerEvalInputs>({
    context: '생물학 실험 및 데이터 통계 분석 활동',
    actions: '실험 결과값의 오차를 줄이기 위해 3회 반복 측정의 중요성을 팀원들에게 설득하고 직접 통계 툴을 활용함',
    strengths: '치밀한 데이터 관리 능력과 논리적 설득력',
    contribution: '보고서의 신뢰도를 높여 학급 발표에서 최우수 사례로 선정되는 데 기여함',
    feedback: '자료를 구조화하는 역량이 뛰어남. 다음 프로젝트에서는 전체 요약 발표를 맡아보길 권장'
  });

  const [inquiryInputs, setInquiryInputs] = useState<InquiryPlanInputs>({
    finalTopic: '천연 항생 물질의 항균 효과 비교 분석',
    motivation: '수업 중 배운 미생물의 내성 문제를 해결할 대안으로서 천연물질의 가능성에 주목',
    researchQuestion: '마늘 추출물과 도라지 추출물 중 대장균 증식 억제에 더 효과적인 물질은 무엇인가?',
    methods: '한천 배지 확산법을 이용한 저지환 크기 측정 및 농도별 대조 실험',
    expectedResult: '마늘의 알리신 성분이 더 강한 항균 작용을 보일 것으로 예측'
  });

  const [reportInputs, setReportInputs] = useState<InquiryReportInputs>({
    field: '생명과학 / 실험 / 보건',
    purpose: '항생제 내성 문제의 심각성을 인지하고 천연 항균 물질의 실제적 효능을 실험으로 검증함',
    groupDetails: '2학년 2명 (성명: ○○○, ○○○)',
    mainContent: '이론적 배경으로 항생제 작용 기전을 정리하고, 2주간의 배양 실험을 통해 저지환 데이터를 수집 분석함',
    conclusion: '특정 농도 이상의 천연 추출물에서 유의미한 항균 효과를 확인하여 대안적 가치를 발견함',
    references: '고교 생명과학I 교과서, ○○대학교 약학대학 논문 <천연물의 항균 특성>'
  });

  const handleSubjectChange = (subject: string) => {
    const meta = SUBJECT_METADATA[subject];
    setProfile({
      ...profile,
      subject: subject,
      careerInterest: meta ? meta.careers[0] : profile.careerInterest,
      activityName: meta ? meta.topics[0] : profile.activityName
    });
    
    if (meta && meta.selfEval) {
      setSelfInputs(meta.selfEval);
    }
  };

  const handleOpenKeyDialog = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setKeySelected(true);
    }
  };

  const handleGenerate = async () => {
    const aistudio = (window as any).aistudio;
    if (!keySelected && aistudio) {
      const confirmed = await aistudio.hasSelectedApiKey();
      if (!confirmed) {
        await handleOpenKeyDialog();
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setSavedDocId(null);

    const inputPayload = {
      student_profile: profile,
      self_eval_inputs: activeTab === 'self' ? selfInputs : undefined,
      peer_eval_inputs: activeTab === 'peer' ? peerInputs : undefined,
      inquiry_plan_inputs: activeTab === 'inquiry_plan' ? inquiryInputs : undefined,
      inquiry_report_inputs: activeTab === 'inquiry_report' ? reportInputs : undefined,
      template_fields: TEMPLATE_FIELDS_CONFIG[activeTab],
      target_doc: activeTab
    };

    try {
      const aiResult = await geminiService.generateRecords(inputPayload);
      setResult(aiResult);
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Portfolio Actions
  const handleSaveToPortfolio = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!result) return;
    const docId = portfolioService.saveDocument(user.id, activeTab, result, profile.subject, profile.activityName);
    setSavedDocId(docId);
    alert('기록이 포트폴리오에 저장되었습니다!');
  };

  const handleLogout = () => {
    portfolioService.logout();
    setUser(null);
    setView('main');
  };

  const renderTabButton = (type: DocType, label: string) => (
    <button
      onClick={() => { setActiveTab(type); setResult(null); setSavedDocId(null); }}
      className={`flex-1 py-3 text-[13px] font-bold transition-all border-b-2 ${
        activeTab === type 
          ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm' 
          : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  if (view === 'portfolio' && user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PortfolioView user={user} onBack={() => setView('main')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col min-h-screen">
      <header className="mb-6 flex flex-col items-center">
        <div className="w-full flex justify-end gap-4 mb-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">✨ {user.nickname}님 환영합니다</span>
              <button onClick={() => setView('portfolio')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">마이 포트폴리오</button>
              <button onClick={handleLogout} className="text-xs font-bold text-slate-400">로그아웃</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs font-bold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50">로그인/가입</button>
          )}
        </div>
        <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold mb-2 uppercase tracking-widest">
          High School Academic Writing Coach
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          🔥 열품고 <span className="text-indigo-600">성찰 & 탐구</span>
        </h1>
        <p className="text-slate-500 text-sm italic">
          “열품타가 시간을 관리했다면, <span className="font-bold text-slate-700 underline decoration-indigo-300">열품고는 ‘기록의 품질’</span>을 관리합니다.”
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Input Pane */}
        <div className="xl:col-span-5 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col sticky top-4 max-h-[calc(100vh-40px)]">
          <div className="flex bg-slate-50 border-b border-slate-200">
            {renderTabButton('self', '자기평가')}
            {renderTabButton('peer', '동료평가')}
            {renderTabButton('inquiry_plan', '탐구(계획서)')}
            {renderTabButton('inquiry_report', '탐구(보고서)')}
          </div>

          <div className="p-5 overflow-y-auto flex-grow custom-scrollbar space-y-5">
            <InputGroup label="인적사항 및 기본 정보">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="학년/반/번호" value={profile.grade} onChange={(v) => setProfile({...profile, grade: v})} placeholder="예) 2학년 3반 15번" />
                <TextField label="성명" value={profile.name} onChange={(v) => setProfile({...profile, name: v})} placeholder="실명 혹은 ○○○" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField 
                  label="교과목" 
                  value={profile.subject} 
                  options={SUBJECT_OPTIONS} 
                  onChange={handleSubjectChange} 
                />
                <DatalistField 
                  id="career-datalist"
                  label="진로 관심" 
                  value={profile.careerInterest} 
                  options={SUBJECT_METADATA[profile.subject]?.careers || []}
                  onChange={(v) => setProfile({...profile, careerInterest: v})}
                  placeholder="직접 입력 혹은 선택"
                />
              </div>
              <DatalistField 
                id="topic-datalist"
                label="활동명(주제)" 
                value={profile.activityName} 
                options={SUBJECT_METADATA[profile.subject]?.topics || []}
                onChange={(v) => setProfile({...profile, activityName: v})}
                placeholder="교과 활동 주제를 입력하세요."
              />
              <TextField label="활동 기간" value={profile.period} onChange={(v) => setProfile({...profile, period: v})} placeholder="예) 2025. 03. ~ 현재" />
            </InputGroup>

            {activeTab === 'self' && (
              <InputGroup label="자기평가 5요소 (과목 연계 추천)">
                <TextField label="① 배경 및 주제" type="textarea" value={selfInputs.motivation} onChange={(v) => setSelfInputs({...selfInputs, motivation: v})} placeholder="활동을 시작한 계기와 주제를 적어주세요." />
                <TextField label="② 역할과 실제 행동" type="textarea" value={selfInputs.process} onChange={(v) => setSelfInputs({...selfInputs, process: v})} placeholder="본인이 수행한 구체적 행동(조사, 실험 등)을 적어주세요." />
                <TextField label="③ 어려움과 극복" type="textarea" value={selfInputs.troubleshooting} onChange={(v) => setSelfInputs({...selfInputs, troubleshooting: v})} placeholder="활동 중 문제 상황과 이를 해결하기 위한 노력을 적어주세요." />
                <TextField label="④ 배운 점 (핵심)" type="textarea" value={selfInputs.achievement} onChange={(v) => setSelfInputs({...selfInputs, achievement: v})} placeholder="깨달은 개념, 관점의 변화, 태도의 성장을 적어주세요." />
                <TextField label="⑤ 변화 및 확장" type="textarea" value={selfInputs.vision} onChange={(v) => setSelfInputs({...selfInputs, vision: v})} placeholder="활동 후 생긴 관심사와 다음 계획을 적어주세요." />
              </InputGroup>
            )}

            {activeTab === 'peer' && (
              <InputGroup label="행동 중심 동료평가">
                <TextField label="활동 맥락" value={peerInputs.context} onChange={(v) => setPeerInputs({...peerInputs, context: v})} placeholder="어떤 상황에서 관찰했나요?" />
                <TextField label="구체적 행동 사례 (2-3가지)" type="textarea" value={peerInputs.actions} onChange={(v) => setPeerInputs({...peerInputs, actions: v})} placeholder="친구가 한 구체적인 행동과 말을 적어주세요." />
                <TextField label="팀 기여 및 영향" type="textarea" value={peerInputs.contribution} onChange={(v) => setPeerInputs({...peerInputs, contribution: v})} placeholder="친구의 행동이 팀에 어떤 긍정적 결과를 줬나요?" />
                <TextField label="강점 및 피드백" value={peerInputs.feedback} onChange={(v) => setPeerInputs({...peerInputs, feedback: v})} placeholder="친구가 성장할 수 있는 부드러운 조언" />
              </InputGroup>
            )}

            {activeTab === 'inquiry_report' && (
              <InputGroup label="정식 보고서 상세">
                <TextField label="활동 분야" value={reportInputs.field} onChange={(v) => setReportInputs({...reportInputs, field: v})} placeholder="예) 실험/천문/발명/마을연계 등" />
                <TextField label="탐구 목적" type="textarea" value={reportInputs.purpose} onChange={(v) => setReportInputs({...reportInputs, purpose: v})} />
                <TextField label="조원 인적사항" value={reportInputs.groupDetails} onChange={(v) => setReportInputs({...reportInputs, groupDetails: v})} />
                <TextField label="본론 핵심 내용" type="textarea" value={reportInputs.mainContent} onChange={(v) => setReportInputs({...reportInputs, mainContent: v})} />
                <TextField label="결론 및 기대효과" type="textarea" value={reportInputs.conclusion} onChange={(v) => setReportInputs({...reportInputs, conclusion: v})} />
              </InputGroup>
            )}

            {activeTab === 'inquiry_plan' && (
              <InputGroup label="탐구 계획 설계">
                <TextField label="최종 주제" value={inquiryInputs.finalTopic} onChange={(v) => setInquiryInputs({...inquiryInputs, finalTopic: v})} />
                <TextField label="탐구 동기" type="textarea" value={inquiryInputs.motivation} onChange={(v) => setInquiryInputs({...inquiryInputs, motivation: v})} />
                <TextField label="탐구 방법" type="textarea" value={inquiryInputs.methods} onChange={(v) => setInquiryInputs({...inquiryInputs, methods: v})} />
              </InputGroup>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-white transition-all shadow-md ${
                loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {loading ? "AI 문장 품질 점검 중..." : "정식 문서 생성하기 ✨"}
            </button>
          </div>
        </div>

        {/* Right: Output Pane */}
        <div className="xl:col-span-7 bg-slate-100 rounded-xl p-5 border border-slate-200 flex flex-col min-h-[800px] print:bg-white print:border-none print:p-0">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              문서 미리보기
            </h2>
            {result && (
              <div className="flex gap-2">
                <button 
                  onClick={() => { navigator.clipboard.writeText(result.print_view); alert('복사되었습니다.'); }}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm"
                >
                  복사
                </button>
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm">
                  인쇄
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow bg-white rounded-lg shadow-xl overflow-hidden flex flex-col print:shadow-none">
            {!result && !loading && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl">🖋️</div>
                <p className="text-sm font-medium">가이드에 맞춰 내용을 입력해 주세요.</p>
              </div>
            )}

            {loading && (
              <div className="p-10 space-y-6 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-1/3 mx-auto mb-8"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded"></div>
                  <div className="h-3 bg-slate-100 rounded"></div>
                  <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                </div>
              </div>
            )}

            {result && (
              <div className="flex-grow p-10 overflow-y-auto print:p-0 custom-scrollbar flex flex-col">
                <div className="document-container max-w-[210mm] mx-auto text-slate-900 leading-[1.6] flex-grow">
                  <div dangerouslySetInnerHTML={{ __html: result.form_fill.content }} />
                </div>
                
                {/* Result Action Buttons (Newly Added) */}
                <div className="mt-12 border-t pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                   <button 
                     onClick={handleSaveToPortfolio}
                     disabled={!!savedDocId}
                     className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                       savedDocId ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-100 bg-slate-50 hover:border-indigo-200 text-slate-600'
                     }`}
                   >
                     <span className="text-xl mb-1">{savedDocId ? '✅' : '💾'}</span>
                     <span className="text-[11px] font-bold">{savedDocId ? '저장됨' : '포트폴리오 저장'}</span>
                   </button>
                   
                   <button 
                     onClick={() => {
                        if (!savedDocId) return alert('먼저 저장해주세요.');
                        setShowSubmission({ docId: savedDocId });
                     }}
                     className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-200 text-slate-600 transition-all"
                   >
                     <span className="text-xl mb-1">📢</span>
                     <span className="text-[11px] font-bold">제출 체크</span>
                   </button>
                   
                   <button 
                     className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-200 text-slate-600 transition-all"
                   >
                     <span className="text-xl mb-1">📄</span>
                     <span className="text-[11px] font-bold">PDF 다운로드</span>
                   </button>

                   <button 
                     onClick={() => setView('portfolio')}
                     className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-200 text-slate-600 transition-all"
                   >
                     <span className="text-xl mb-1">🌍</span>
                     <span className="text-[11px] font-bold">전체 포트폴리오</span>
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAuth && <AuthModal 
        onSuccess={(u) => { setUser(u); setShowAuth(false); }} 
        onClose={() => setShowAuth(false)} 
      />}
      
      {showSubmission && <SubmissionModal 
        docId={showSubmission.docId} 
        onClose={() => setShowSubmission(null)} 
      />}

      <style>{`
        /* 정식 서식용 CSS */
        .document-container { font-family: 'Batang', 'Malgun Gothic', serif; }
        .document-container h1 { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
        .document-container h2 { font-size: 16pt; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #1e293b; }
        .document-container h3 { font-size: 12pt; font-weight: bold; margin-top: 1.2rem; margin-bottom: 0.5rem; }
        .document-container h4 { font-size: 11pt; font-weight: normal; margin-left: 1rem; margin-top: 0.5rem; }
        .document-container p { font-size: 11pt; margin-bottom: 0.8rem; line-height: 1.8; }
        .document-container table { font-size: 10pt; margin-bottom: 1.5rem; width: 100%; border-collapse: collapse; }
        .document-container th, .document-container td { padding: 8px; border: 0.15mm solid black; text-align: left; }
        .document-container th { background-color: #f8fafc; font-weight: bold; width: 140px; text-align: center; }

        @media print {
          body { background: white; margin: 0; padding: 0; }
          .xl:col-span-5, header, footer, button, .print\\:hidden { display: none !important; }
          .xl:col-span-7 { width: 100%; border: none; padding: 0; margin: 0; }
          .document-container { padding: 1.5cm; }
          .bg-slate-100 { background: transparent; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default App;


export interface StudentProfile {
  grade: string;
  name: string;
  subject: string;
  activityName: string;
  role: string;
  period: string;
  careerInterest: string;
}

export interface SelfEvalInputs {
  motivation: string;
  process: string;
  achievement: string;
  troubleshooting: string;
  vision: string;
}

export interface PeerEvalInputs {
  context: string;
  actions: string;
  strengths: string;
  contribution: string;
  feedback: string;
}

export interface InquiryPlanInputs {
  finalTopic: string;
  motivation: string;
  researchQuestion: string;
  methods: string;
  expectedResult: string;
}

export interface InquiryReportInputs {
  purpose: string;
  mainContent: string;
  conclusion: string;
  references: string;
  groupDetails: string;
  field: string;
}

export interface TemplateFields {
  [key: string]: {
    description: string;
    max_chars?: number;
  };
}

export type DocType = 'self' | 'peer' | 'inquiry_plan' | 'inquiry_report';

export interface AIResponse {
  form_fill: {
    title: string;
    content: string;
  };
  print_view: string;
}

/** New Entities for Portfolio Management **/

export interface User {
  id: string;
  email: string;
  nickname: string;
  grade: string;
  careerInterest?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  docType: DocType;
  title: string;
  subject: string;
  activityName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'finalized';
  tags: string[];
}

export interface DocumentVersion {
  id: string;
  docId: string;
  version: number;
  content_print_a4: string; // print_view
  content_form_fill: AIResponse['form_fill']; // form_fill content
  changeNote?: string;
  createdAt: string;
}

export interface Submission {
  docId: string;
  submitted: boolean;
  submittedAt?: string;
  submittedTo?: string; // e.g., "Biology Teacher", "EBS Online Class"
}

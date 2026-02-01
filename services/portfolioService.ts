
import { User, Document, DocumentVersion, Submission, AIResponse, DocType } from '../types';

const STORAGE_KEYS = {
  USER: 'ypg_user',
  DOCS: 'ypg_docs',
  VERSIONS: 'ypg_versions',
  SUBMISSIONS: 'ypg_submissions'
};

export class PortfolioService {
  private getStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Auth ---
  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  login(email: string, nickname: string): User {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      nickname,
      grade: '고등학생',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  deleteAccount(): void {
    const user = this.getCurrentUser();
    if (!user) return;
    
    const docs = this.getStorage<Document>(STORAGE_KEYS.DOCS).filter(d => d.userId !== user.id);
    const versions = this.getStorage<DocumentVersion>(STORAGE_KEYS.VERSIONS).filter(v => {
      const doc = this.getStorage<Document>(STORAGE_KEYS.DOCS).find(d => d.id === v.docId);
      return doc?.userId !== user.id;
    });
    
    this.setStorage(STORAGE_KEYS.DOCS, docs);
    this.setStorage(STORAGE_KEYS.VERSIONS, versions);
    this.logout();
  }

  // --- Documents ---
  saveDocument(userId: string, type: DocType, response: AIResponse, subject: string, activityName: string): string {
    const docs = this.getStorage<Document>(STORAGE_KEYS.DOCS);
    const versions = this.getStorage<DocumentVersion>(STORAGE_KEYS.VERSIONS);

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      docType: type,
      title: response.form_fill.title,
      subject,
      activityName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      tags: [subject]
    };

    const newVersion: DocumentVersion = {
      id: Math.random().toString(36).substr(2, 9),
      docId: newDoc.id,
      version: 1,
      content_print_a4: response.print_view,
      content_form_fill: response.form_fill,
      createdAt: new Date().toISOString()
    };

    this.setStorage(STORAGE_KEYS.DOCS, [...docs, newDoc]);
    this.setStorage(STORAGE_KEYS.VERSIONS, [...versions, newVersion]);
    return newDoc.id;
  }

  getDocuments(userId: string): Document[] {
    return this.getStorage<Document>(STORAGE_KEYS.DOCS).filter(d => d.userId === userId);
  }

  getLatestVersion(docId: string): DocumentVersion | undefined {
    return this.getStorage<DocumentVersion>(STORAGE_KEYS.VERSIONS)
      .filter(v => v.docId === docId)
      .sort((a, b) => b.version - a.version)[0];
  }

  getAllVersions(docId: string): DocumentVersion[] {
    return this.getStorage<DocumentVersion>(STORAGE_KEYS.VERSIONS)
      .filter(v => v.docId === docId)
      .sort((a, b) => b.version - a.version);
  }

  deleteDocument(docId: string): void {
    const docs = this.getStorage<Document>(STORAGE_KEYS.DOCS).filter(d => d.id !== docId);
    const versions = this.getStorage<DocumentVersion>(STORAGE_KEYS.VERSIONS).filter(v => v.docId !== docId);
    const subs = this.getStorage<Submission>(STORAGE_KEYS.SUBMISSIONS).filter(s => s.docId !== docId);
    
    this.setStorage(STORAGE_KEYS.DOCS, docs);
    this.setStorage(STORAGE_KEYS.VERSIONS, versions);
    this.setStorage(STORAGE_KEYS.SUBMISSIONS, subs);
  }

  // --- Submissions ---
  getSubmission(docId: string): Submission | undefined {
    return this.getStorage<Submission>(STORAGE_KEYS.SUBMISSIONS).find(s => s.docId === docId);
  }

  updateSubmission(docId: string, data: Partial<Submission>): void {
    const subs = this.getStorage<Submission>(STORAGE_KEYS.SUBMISSIONS);
    const existingIdx = subs.findIndex(s => s.docId === docId);
    
    if (existingIdx > -1) {
      subs[existingIdx] = { ...subs[existingIdx], ...data };
    } else {
      subs.push({ docId, submitted: true, ...data });
    }
    
    this.setStorage(STORAGE_KEYS.SUBMISSIONS, subs);
  }
}

export const portfolioService = new PortfolioService();

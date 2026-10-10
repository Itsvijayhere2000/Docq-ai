import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ChatResponse, Document, User, Workspace, WorkspaceMember } from './models';
import { formatDisplayDate } from './date.utils';

const API = 'http://localhost:3000/api';
type ApiWorkspace = Workspace & { _count?: { documents: number; members: number } };
const EMPTY_WORKSPACE: Workspace = { id: '', name: 'No workspace selected', description: '', ownerId: '', memberCount: 0, documentCount: 0, color: '#6658e8' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(JSON.parse(localStorage.getItem('docq-user') || 'null'));

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(`${API}/auth/login`, { email, password }).pipe(
      tap(result => localStorage.setItem('docq-access-token', result.accessToken)), switchMap(() => this.me()),
      tap(user => { this.user.set(user); localStorage.setItem('docq-user', JSON.stringify(user)); })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ accessToken: string }>(`${API}/auth/register`, { name, email, password }).pipe(
      tap(result => localStorage.setItem('docq-access-token', result.accessToken)),
      switchMap(() => this.me()), tap(user => { this.user.set(user); localStorage.setItem('docq-user', JSON.stringify(user)); })
    );
  }

  requestSignupOtp(name: string, email: string, password: string) { return this.http.post<{ message: string }>(`${API}/auth/signup/request-otp`, { name, email, password }); }
  verifySignupOtp(email: string, otp: string) { return this.http.post<{ accessToken: string }>(`${API}/auth/signup/verify-otp`, { email, otp }).pipe(tap(result => localStorage.setItem('docq-access-token', result.accessToken)), switchMap(() => this.me()), tap(user => { this.user.set(user); localStorage.setItem('docq-user', JSON.stringify(user)); })); }

  me() { return this.http.get<User>(`${API}/auth/me`, { withCredentials: true }); }
  logout() { this.http.post(`${API}/auth/logout`, {}, { withCredentials: true }).subscribe(); this.user.set(null); localStorage.removeItem('docq-user'); localStorage.removeItem('docq-access-token'); }
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  readonly workspaces = signal<Workspace[]>([]);
  readonly active = signal<Workspace>(EMPTY_WORKSPACE);
  load() { this.http.get<ApiWorkspace[]>(`${API}/workspaces`).pipe(catchError(() => of([] as ApiWorkspace[]))).subscribe(items => { const mapped = items.map(item => ({ ...item, memberCount: item._count?.members ?? item.memberCount ?? 0, documentCount: item._count?.documents ?? item.documentCount ?? 0 })); this.workspaces.set(mapped); this.active.set(mapped[0] || EMPTY_WORKSPACE); }); }
  select(id: string) { const workspace = this.workspaces().find(item => item.id === id); if (workspace) this.active.set(workspace); }
  create(name: string, description: string) { this.http.post<Workspace>(`${API}/workspaces`, { name, description }).subscribe(item => { this.workspaces.update(items => [item, ...items]); this.active.set(item); }); return this.active(); }
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  readonly documents = signal<Document[]>([]);
  list(workspaceId: string) { return this.documents().filter(item => item.workspaceId === workspaceId); }
  get(workspaceId: string, documentId: string) { return this.http.get<Document>(`${API}/workspaces/${workspaceId}/documents/${documentId}`).pipe(tap(item => this.documents.update(items => [...items.filter(doc => doc.id !== item.id), { ...item, uploadedAt: formatDisplayDate(item.uploadedAt) }]))); }
  load(workspaceId: string) { this.http.get<Document[]>(`${API}/workspaces/${workspaceId}/documents`).pipe(catchError(() => of([] as Document[]))).subscribe(items => this.documents.update(current => [...current.filter(item => item.workspaceId !== workspaceId), ...items.map(item => ({ ...item, uploadedAt: formatDisplayDate(item.uploadedAt) }))])); }
  find(id: string) { return this.documents().find(item => item.id === id); }
  upload(workspaceId: string, file: File) { const form = new FormData(); form.append('file', file); this.http.post<Document>(`${API}/workspaces/${workspaceId}/documents`, form).subscribe(item => this.documents.update(items => [{ ...item, uploadedAt: formatDisplayDate(item.uploadedAt) }, ...items])); }
  retry(id: string) { const item = this.find(id); if (!item) return; this.http.post<Document>(`${API}/workspaces/${item.workspaceId}/documents/${id}/retry`, {}).subscribe(updated => this.documents.update(items => items.map(doc => doc.id === id ? { ...updated, uploadedAt: formatDisplayDate(updated.uploadedAt) } : doc))); }
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  ask(workspaceId: string, question: string, conversationId?: string) { return this.http.post<ChatResponse>(`${API}/workspaces/${workspaceId}/chat`, { question, conversationId }); }
}

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);
  list(workspaceId: string) { return this.http.get<WorkspaceMember[]>(`${API}/workspaces/${workspaceId}/members`); }
}

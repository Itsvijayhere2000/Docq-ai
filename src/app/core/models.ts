export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
export interface User { id: string; name: string; email: string; }
export interface Workspace { id: string; name: string; description: string; ownerId: string; memberCount: number; documentCount: number; color: string; }
export interface Document { id: string; workspaceId: string; name: string; size: string; pages: number; status: DocumentStatus; uploadedBy: string; uploadedAt: string; color: string; summary?: string; }
export interface Citation { documentName: string; documentId: string; pageNumber: number; excerpt: string; }
export interface Message { id: string; role: 'USER' | 'ASSISTANT'; content: string; citations?: Citation[]; time: string; }
export interface ChatResponse { conversationId: string; messageId: string; answer: string; citations: Array<{ documentId: string; documentName: string; pageNumber: number; relevanceScore?: number | null; }>; }
export interface WorkspaceMember { id: string; name: string; email: string; role: string; status: string; joinedAt: string; }

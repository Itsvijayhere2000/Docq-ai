import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatService, WorkspaceService } from '../core/services';
import { Message } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `<div class="page chat-page"><div class="page-heading"><div><span class="eyebrow">AI CHAT · {{workspace.name}}</span><h1>Ask your documents</h1><p class="muted">Answers are grounded in your workspace knowledge.</p></div><button class="secondary" (click)="newConversation()">＋ New conversation</button></div><div class="chat-layout"><aside class="conversation-list panel"><div class="panel-head"><h3>Conversations</h3><span>＋</span></div><div class="conversation active"><span class="conversation-icon">✦</span><div><strong>{{conversationTitle}}</strong><small>Current conversation</small></div></div></aside><section class="chat-window panel"><div class="chat-window-head"><div><span class="online-dot"></span><strong>DocQ AI</strong><small>Searching {{workspace.name}}</small></div><span>⋯</span></div>@if (loading) {<div class="api-loading"><span class="spinner"></span><span>Searching your workspace and generating an answer...</span></div>}<div class="messages">@for (message of messages; track message.id) {<div class="message" [class.user-message]="message.role === 'USER'"><div class="message-avatar">{{message.role === 'USER' ? 'V' : '✦'}}</div><div><small class="message-label">{{message.role === 'USER' ? 'You' : 'DocQ AI'}} · {{message.time}}</small><p>{{message.content}}</p>@if (message.citations?.length) {<div class="citations"><small>Sources</small>@for (citation of message.citations; track citation.documentId + citation.pageNumber) {<a [routerLink]="['/workspaces', workspace.id, 'documents', citation.documentId]"><span class="source-number">{{citation.pageNumber}}</span><span><strong>{{citation.documentName}}</strong><small>Page {{citation.pageNumber}}</small></span><span>↗</span></a>}</div>}</div></div>}</div><div class="suggestions"><button (click)="question='What is the annual leave policy?'">What is the annual leave policy?</button><button (click)="question='Summarize the latest policy changes'">Summarize the latest policy changes</button></div><div class="chat-input"><input [(ngModel)]="question" (keyup.enter)="send()" placeholder="Ask anything about your documents..." [disabled]="loading"><button class="primary" (click)="send()" [disabled]="loading">{{loading ? '…' : '↑'}}</button></div><small class="disclaimer">DocQ can make mistakes. Check important information against the source documents.</small></section></div></div>`,
})
export class ChatComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ws = inject(WorkspaceService);
  private readonly chat = inject(ChatService);
  private readonly routeWorkspaceId = this.route.snapshot.paramMap.get('workspaceId') || this.ws.active().id;
  workspace = this.ws.workspaces().find((w) => w.id === this.routeWorkspaceId) || { ...this.ws.active(), id: this.routeWorkspaceId };
  messages: Message[] = [];
  question = '';
  loading = false;
  conversationId?: string;
  conversationTitle = 'New conversation';

  send() {
    const question = this.question.trim();
    if (!question || this.loading) return;
    this.messages = [...this.messages, { id: Date.now().toString(), role: 'USER', content: question, time: 'Just now' }];
    this.question = '';
    this.loading = true;
    this.chat.ask(this.workspace.id, question, this.conversationId).subscribe({
      next: (response) => { this.conversationId = response.conversationId; this.conversationTitle = question.slice(0, 40); this.messages = [...this.messages, { id: response.messageId, role: 'ASSISTANT', content: response.answer, time: 'Just now', citations: response.citations.map((item) => ({ ...item, excerpt: 'Retrieved source chunk' })) }]; this.loading = false; },
      error: (error) => { this.messages = [...this.messages, { id: `${Date.now()}-error`, role: 'ASSISTANT', content: error?.error?.message || 'Unable to answer right now. Check the backend logs and API billing/key configuration.', time: 'Just now' }]; this.loading = false; },
    });
  }

  newConversation() { this.conversationId = undefined; this.conversationTitle = 'New conversation'; this.messages = []; }
}

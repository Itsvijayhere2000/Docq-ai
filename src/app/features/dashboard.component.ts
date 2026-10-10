import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentService, WorkspaceService } from '../core/services';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<div class="page"><div class="page-heading"><div><span class="eyebrow">OVERVIEW</span><h1>Welcome back</h1><p class="muted">Here is what is happening across your knowledge base.</p></div>@if (active().id) {<a class="primary" [routerLink]="['/workspaces', active().id, 'chat']">✦ Ask your documents</a>}</div><div class="stats-grid"><div class="stat-card"><span class="stat-icon purple">▤</span><small>Total documents</small><strong>{{totalDocuments()}}</strong><span class="muted">Across your workspaces</span></div><div class="stat-card"><span class="stat-icon teal">✓</span><small>Ready to query</small><strong>{{readyDocuments()}}</strong><span class="muted">Processed documents</span></div><div class="stat-card"><span class="stat-icon amber">◷</span><small>Processing</small><strong>{{processingDocuments()}}</strong><span class="muted">Currently processing</span></div><div class="stat-card"><span class="stat-icon red">♧</span><small>Team members</small><strong>{{totalMembers()}}</strong><span class="muted">Across your workspaces</span></div></div><div class="content-grid"><section class="panel"><div class="panel-head"><div><h3>Recent documents</h3><p class="muted">Latest files added to your workspaces</p></div><a [routerLink]="['/workspaces', active().id, 'documents']">View all →</a></div><div class="doc-rows">@for (doc of recentDocuments(); track doc.id) {<a class="doc-row" [routerLink]="['/workspaces', doc.workspaceId, 'documents', doc.id]"><span class="file-icon" [style.background]="doc.color">PDF</span><span class="doc-main"><strong>{{doc.name}}</strong><small>{{doc.size}} · {{doc.pages || '—'}} pages</small></span><span class="status" [class]="doc.status.toLowerCase()">{{doc.status}}</span><span class="row-time">{{doc.uploadedAt}}</span><span>›</span></a>} @empty {<div class="empty-state"><span>▤</span><h3>No documents yet</h3><p>Upload a PDF to start building your knowledge base.</p></div>}</div></section><section class="panel activity"><div class="panel-head"><div><h3>Recent activity</h3><p class="muted">Activity will appear as you use DocQ</p></div></div><div class="empty-state"><span>◷</span><h3>No activity yet</h3><p>Your document and conversation activity will appear here.</p></div></section></div><section class="section"><div class="section-title"><div><h2>Your workspaces</h2><p class="muted">Knowledge bases you have access to</p></div><a routerLink="/workspaces">Manage workspaces →</a></div><div class="workspace-grid">@for (workspace of workspaces(); track workspace.id) {<a class="workspace-card" [routerLink]="['/workspaces', workspace.id]"><div class="workspace-card-top"><span class="workspace-logo" [style.background]="workspace.color || '#6658e8'">{{workspace.name.charAt(0)}}</span><span class="more">⋯</span></div><h3>{{workspace.name}}</h3><p>{{workspace.description || 'No description provided.'}}</p><div class="workspace-meta"><span>▤ {{workspace.documentCount}} documents</span><span>♧ {{workspace.memberCount}} members</span></div></a>} @empty {<div class="empty-state"><span>▦</span><h3>No workspaces yet</h3><p>Create a workspace to start adding documents.</p></div>}</div></section></div>`,
})
export class DashboardComponent {
  private readonly ws = inject(WorkspaceService);
  private readonly ds = inject(DocumentService);
  readonly workspaces = this.ws.workspaces;
  readonly active = this.ws.active;
  readonly documents = this.ds.documents;
  readonly totalDocuments = computed(() => this.documents().length);
  readonly readyDocuments = computed(() => this.documents().filter((doc) => doc.status === 'READY').length);
  readonly processingDocuments = computed(() => this.documents().filter((doc) => doc.status === 'PROCESSING' || doc.status === 'UPLOADED').length);
  readonly totalMembers = computed(() => this.workspaces().reduce((total, workspace) => total + (workspace.memberCount || 0), 0));
  readonly recentDocuments = computed(() => [...this.documents()].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 4));

  constructor() {
    effect(() => this.workspaces().forEach((workspace) => this.ds.load(workspace.id)));
  }
}

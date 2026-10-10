import { Component, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService, WorkspaceService } from '../core/services';
import { Document } from '../core/models';
const API = 'http://localhost:3000/api';

@Component({ standalone: true, imports: [RouterLink], template: `<div class="page"><a class="back-link" [routerLink]="['/workspaces', workspace.id, 'documents']">← Back to documents</a><div class="viewer-heading"><div><span class="eyebrow">DOCUMENT VIEWER</span><h1>{{doc?.name || 'Document'}}</h1><p class="muted">{{doc?.size}} · {{doc?.pages || '—'}} pages · Added {{doc?.uploadedAt || '—'}}</p></div></div><div class="viewer-grid"><section class="pdf-preview">@if (loading) {<div class="empty-state"><span class="spinner"></span><h3>Loading PDF preview...</h3></div>} @else if (error) {<div class="empty-state"><h3>Preview unavailable</h3><p>{{error}}</p></div>} @else if (pdfUrl) {<iframe class="pdf-frame" [src]="pdfUrl" title="PDF document preview"></iframe>}</section><aside class="viewer-sidebar"><div class="panel"><div class="panel-head"><h3>Document summary</h3><span class="sparkle">✦</span></div><p class="summary">{{doc?.summary || 'AI summary will be available after the summary workflow is connected.'}}</p></div><div class="panel"><h3>Document details</h3><div class="detail"><span>Status</span><b class="status" [class]="doc?.status?.toLowerCase()">{{doc?.status || '—'}}</b></div><div class="detail"><span>Uploaded by</span><strong>{{doc?.uploadedBy || '—'}}</strong></div><div class="detail"><span>File type</span><strong>PDF document</strong></div></div></aside></div></div>` })
export class DocumentViewerComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute); private readonly ds = inject(DocumentService); private readonly ws = inject(WorkspaceService); private readonly http = inject(HttpClient); private readonly sanitizer = inject(DomSanitizer);
  readonly workspaceId = this.route.snapshot.paramMap.get('workspaceId') || ''; readonly documentId = this.route.snapshot.paramMap.get('documentId') || ''; workspace = this.ws.workspaces().find((item) => item.id === this.workspaceId) || { ...this.ws.active(), id: this.workspaceId }; doc?: Document; pdfUrl: SafeResourceUrl | null = null; loading = true; error = '';
  constructor() { this.ds.get(this.workspaceId, this.documentId).subscribe({ next: (document) => { this.doc = document; this.loadPdf(); }, error: () => { this.error = 'The document could not be loaded.'; this.loading = false; } }); }
  private loadPdf() { this.http.get(`${API}/workspaces/${this.workspaceId}/documents/${this.documentId}/file`, { responseType: 'blob' }).subscribe({ next: (blob) => { this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)); this.loading = false; }, error: () => { this.error = 'The PDF file could not be loaded.'; this.loading = false; } }); }
  ngOnDestroy() { if (this.pdfUrl) { /* Browser revokes blob URLs when the page is closed. */ } }
}

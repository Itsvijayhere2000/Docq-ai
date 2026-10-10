import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth.component').then((m) => m.AuthComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth.component').then((m) => m.AuthComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'workspaces', canActivate: [authGuard], loadComponent: () => import('./features/workspaces.component').then((m) => m.WorkspacesComponent) },
  { path: 'workspaces/:workspaceId', canActivate: [authGuard], loadComponent: () => import('./features/workspace-detail.component').then((m) => m.WorkspaceDetailComponent) },
  { path: 'workspaces/:workspaceId/documents', canActivate: [authGuard], loadComponent: () => import('./features/documents.component').then((m) => m.DocumentsComponent) },
  { path: 'workspaces/:workspaceId/documents/:documentId', canActivate: [authGuard], loadComponent: () => import('./features/document-viewer.component').then((m) => m.DocumentViewerComponent) },
  { path: 'workspaces/:workspaceId/chat', canActivate: [authGuard], loadComponent: () => import('./features/chat.component').then((m) => m.ChatComponent) },
  { path: '**', redirectTo: 'dashboard' },
];

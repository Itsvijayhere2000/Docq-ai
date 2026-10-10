import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, WorkspaceService } from './core/services';

@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive], templateUrl: './app.html', styleUrl: './app.scss' })
export class App {
  private readonly auth = inject(AuthService);
  private readonly workspace = inject(WorkspaceService);
  private readonly router = inject(Router);
  readonly user = this.auth.user;
  readonly active = this.workspace.active;
  confirmLogout = false;
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (this.auth.user()) this.workspace.load();
  }

  openChat() {
    const workspace = this.active();
    if (!workspace.id) {
      this.showToast('Create a workspace before opening AI Chat.');
      return;
    }
    if (!workspace.documentCount) {
      this.showToast('Upload a PDF before opening AI Chat.');
      return;
    }
    this.router.navigate(['/workspaces', workspace.id, 'chat']);
  }

  showToast(message: string) {
    this.toast = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 3500);
  }

  openLogoutConfirmation() { this.confirmLogout = true; }
  cancelLogout() { this.confirmLogout = false; }
  logout() { this.auth.logout(); this.confirmLogout = false; this.router.navigateByUrl('/login'); }
}

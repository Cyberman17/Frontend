import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession, LoginResponse } from '../models/api.models';
import { ApiService } from '../api/api.service';

const SESSION_KEY = 'autoandes.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly currentSession = signal<AuthSession | null>(this.restoreSession());

  readonly session = this.currentSession.asReadonly();
  readonly authenticated = computed(() => {
    const session = this.currentSession();
    return !!session && session.expiraEn > Date.now();
  });
  readonly userName = computed(() => this.currentSession()?.nombreCompleto ?? '');
  readonly roles = computed(() => this.currentSession()?.roles ?? []);
  readonly permissions = computed(() => this.currentSession()?.permisos ?? []);

  constructor() {
    const session = this.currentSession();
    if (session) this.scheduleExpiry(session.expiraEn - Date.now());
  }

  login(username: string, password: string) {
    return this.api.login(username, password);
  }

  startSession(username: string, response: LoginResponse): void {
    const session: AuthSession = {
      ...response,
      username,
      expiraEn: Date.now() + response.expiraEnSegundos * 1000,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.currentSession.set(session);
    this.scheduleExpiry(response.expiraEnSegundos * 1000);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  clearSession(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    sessionStorage.removeItem(SESSION_KEY);
    this.currentSession.set(null);
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  private scheduleExpiry(milliseconds: number): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(() => {
      const returnUrl = this.router.url;
      this.clearSession();
      void this.router.navigate(['/login'], { queryParams: { returnUrl } });
    }, Math.max(milliseconds, 0));
  }

  private restoreSession(): AuthSession | null {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      const session = JSON.parse(stored) as AuthSession;
      if (
        typeof session !== 'object' ||
        session === null ||
        typeof session.token !== 'string' ||
        typeof session.tipo !== 'string' ||
        typeof session.username !== 'string' ||
        typeof session.nombreCompleto !== 'string' ||
        !Array.isArray(session.roles) ||
        !session.roles.every((role) => typeof role === 'string') ||
        !Array.isArray(session.permisos) ||
        !session.permisos.every((permission) => typeof permission === 'string') ||
        typeof session.expiraEn !== 'number' ||
        session.expiraEn <= Date.now()
      ) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      console.error('No se pudo restaurar la sesión almacenada.', error);
      return null;
    }
  }
}

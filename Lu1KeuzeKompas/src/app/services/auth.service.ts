import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.backendUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  // Signals voor reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  // Register nieuwe gebruiker
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        console.log('✅ Registration successful, handling auth response');
        this.handleAuthResponse(response);
      })
    );
  }

  // Login gebruiker
  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        console.log('✅ Login successful, handling auth response');
        this.handleAuthResponse(response);
      })
    );
  }

  // Logout gebruiker
  logout(): void {
    console.log('🚪 Logging out user');
    
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  // Get current user profile from API
  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`);
  }

  // Get token
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // Private helper methods
  private handleAuthResponse(response: AuthResponse): void {
    console.log('📝 Handling auth response for user:', response.user.email);
    
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
    
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    
    console.log('✅ Auth state updated:', {
      user: response.user.email,
      userId: response.user.id,
      isAuthenticated: this.isAuthenticated()
    });
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log('✅ User loaded from storage:', user.email);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }
}
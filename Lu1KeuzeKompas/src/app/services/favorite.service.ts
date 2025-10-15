import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Favorite {
  _id?: string;
  userId: string;
  courseId: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.backendUrl}/favorites`;
  private authService = inject(AuthService);
  
  // Signal om favorieten bij te houden
  private favoritesSignal = signal<Set<string>>(new Set());

  constructor(private http: HttpClient) {
    // Load favorieten wanneer gebruiker ingelogd is
    if (this.authService.isLoggedIn()) {
      this.loadFavorites();
    }
  }

  // Get current user ID from AuthService
  private getCurrentUserId(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.id || null;
  }

  // Load alle favorieten van gebruiker
  loadFavorites(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('⚠️ No user logged in, cannot load favorites');
      this.favoritesSignal.set(new Set());
      return;
    }

    console.log('📥 Loading favorites for user:', userId);
    this.http.get<Favorite[]>(`${this.apiUrl}/${userId}`).pipe(
      catchError(err => {
        console.error('Error loading favorites:', err);
        return of([]);
      })
    ).subscribe({
      next: (favorites) => {
        console.log('✅ Loaded favorites:', favorites);
        const courseIds = new Set(favorites.map(f => f.courseId));
        this.favoritesSignal.set(courseIds);
        console.log('📊 Favorites signal updated:', courseIds.size);
      }
    });
  }

  // Get alle favorieten als array
  getFavorites(): string[] {
    return Array.from(this.favoritesSignal());
  }

  // Add favorite
  addFavorite(courseId: string): Observable<Favorite> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('❌ Cannot add favorite: No user logged in');
      throw new Error('User not logged in');
    }

    console.log('➕ Adding favorite:', { userId, courseId });
    return this.http.post<Favorite>(this.apiUrl, {
      userId: userId,
      courseId: courseId
    }).pipe(
      tap((favorite) => {
        console.log('✅ Favorite added:', favorite);
        const current = new Set(this.favoritesSignal());
        current.add(courseId);
        this.favoritesSignal.set(current);
        console.log('📊 Favorites count:', this.favoritesSignal().size);
      }),
      catchError(err => {
        console.error('❌ Error adding favorite:', err);
        throw err;
      })
    );
  }

  // Remove favorite
  removeFavorite(courseId: string): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('❌ Cannot remove favorite: No user logged in');
      throw new Error('User not logged in');
    }

    console.log('➖ Removing favorite:', { userId, courseId });
    return this.http.request<void>('delete', this.apiUrl, {
      body: {
        userId: userId,
        courseId: courseId
      }
    }).pipe(
      tap(() => {
        console.log('✅ Favorite removed');
        const current = new Set(this.favoritesSignal());
        current.delete(courseId);
        this.favoritesSignal.set(current);
        console.log('📊 Favorites count:', this.favoritesSignal().size);
      }),
      catchError(err => {
        console.error('❌ Error removing favorite:', err);
        throw err;
      })
    );
  }

  // Toggle favorite (add als niet favoriet, remove als wel favoriet)
  toggleFavorite(courseId: string): Observable<any> {
    if (this.isFavorite(courseId)) {
      return this.removeFavorite(courseId);
    } else {
      return this.addFavorite(courseId);
    }
  }

  // Check of module favoriet is
  isFavorite(courseId: string): boolean {
    return this.favoritesSignal().has(courseId);
  }

  // Get favorites signal (voor reactive updates)
  getFavoritesSignal() {
    return this.favoritesSignal.asReadonly();
  }

  // Get aantal favorieten
  getFavoriteCount(): number {
    return this.favoritesSignal().size;
  }

  // Clear favorites (bij logout)
  clearFavorites(): void {
    console.log('🧹 Clearing favorites');
    this.favoritesSignal.set(new Set());
  }
}
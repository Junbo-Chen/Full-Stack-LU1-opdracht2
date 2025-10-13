import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/favorites';
  
  // Signal om favorieten bij te houden
  private favoritesSignal = signal<Set<string>>(new Set());
  
  // Hardcoded userId voor demo (vervang met echte auth later)
  private currentUserId = 'user123demo';

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  // Load alle favorieten van gebruiker
  loadFavorites(): void {
    this.http.get<Favorite[]>(`${this.apiUrl}/${this.currentUserId}`).subscribe({
      next: (favorites) => {
        const courseIds = new Set(favorites.map(f => f.courseId));
        this.favoritesSignal.set(courseIds);
      },
      error: (err) => console.error('Error loading favorites:', err)
    });
  }

  // Get alle favorieten
  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/${this.currentUserId}`);
  }

  // Add favorite
  addFavorite(courseId: string): Observable<Favorite> {
    return this.http.post<Favorite>(this.apiUrl, {
      userId: this.currentUserId,
      courseId: courseId
    }).pipe(
      tap(() => {
        const current = new Set(this.favoritesSignal());
        current.add(courseId);
        this.favoritesSignal.set(current);
      })
    );
  }

  // Remove favorite
  removeFavorite(courseId: string): Observable<void> {
    return this.http.request<void>('delete', this.apiUrl, {
      body: {
        userId: this.currentUserId,
        courseId: courseId
      }
    }).pipe(
      tap(() => {
        const current = new Set(this.favoritesSignal());
        current.delete(courseId);
        this.favoritesSignal.set(current);
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

  // Get current user ID
  getCurrentUserId(): string {
    return this.currentUserId;
  }

  // Set user ID (voor wanneer je auth hebt)
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
    this.loadFavorites();
  }
}
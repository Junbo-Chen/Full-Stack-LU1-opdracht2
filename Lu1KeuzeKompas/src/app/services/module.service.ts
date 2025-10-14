import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Module } from '../../domain/module.entity';
import { environment } from '../../environments/environment';

export interface ModuleFilters {
  searchTerm?: string;
  studycredit?: number;
  level?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = `${environment.backendUrl}/modules`;

  constructor(private http: HttpClient) {}

  // Get alle modules
  getModules(): Observable<Module[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => this.mapToModules(data))
    );
  }

  // Get modules met filters
  getModulesWithFilters(filters: ModuleFilters): Observable<Module[]> {
    let params = new HttpParams();

    if (filters.studycredit) {
      params = params.set('studycredit', filters.studycredit.toString());
    }
    if (filters.level) {
      params = params.set('level', filters.level);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(data => {
        let modules = this.mapToModules(data);
        
        // Client-side search filter (voor naam en beschrijving)
        if (filters.searchTerm && filters.searchTerm.trim()) {
          const searchLower = filters.searchTerm.toLowerCase();
          modules = modules.filter(m => 
            m.name.toLowerCase().includes(searchLower) ||
            m.shortDescription.toLowerCase().includes(searchLower) ||
            m.description.toLowerCase().includes(searchLower)
          );
        }
        
        return modules;
      })
    );
  }

  // Search modules
  searchModules(searchTerm: string): Observable<Module[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${searchTerm}`).pipe(
      map(data => this.mapToModules(data))
    );
  }

  // Get single module by ID
  getModuleById(id: string): Observable<Module | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => data ? this.mapToModule(data) : null)
    );
  }

  // Helper: Map API data naar Module entities
  private mapToModules(data: any[]): Module[] {
    return data.map(m => this.mapToModule(m));
  }

  private mapToModule(m: any): Module {
    return new Module(
      m.id?.toString() || m._id,
      m.name,
      m.shortdescription || '',
      m.description || '',
      m.content || '',
      m.studycredit,
      m.location,
      m.contact_id?.toString() || '',
      m.level,
      m.learningoutcomes || '',
      new Date(m.createdAt || Date.now()),
      new Date(m.updatedAt || Date.now())
    );
  }
}
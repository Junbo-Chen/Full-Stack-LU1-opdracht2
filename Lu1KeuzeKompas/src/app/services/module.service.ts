import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Module } from '../../domain/module.entity';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = 'http://localhost:3000/modules';

  constructor(private http: HttpClient) {}

  getModules(): Observable<Module[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data =>
        data.map(
          m =>
            new Module(
              m._id,
              m.name,
              m.shortdescription,
              m.description,
              m.content,
              m.studycredit,
              m.location,
              m.contact_id,
              m.level,
              m.learningoutcomes,
              new Date(m.createdAt || Date.now()),
              new Date(m.updatedAt || Date.now())
            )
        )
      )
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvDataService {

  private csvPath = 'assets/modules.csv';

  constructor(private http: HttpClient) {}

  getModules(): Observable<any[]> {
    return this.http.get(this.csvPath, { responseType: 'text' }).pipe(
      map(csvData => {
        const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
        return parsed.data as any[];
      })
    );
  }
}

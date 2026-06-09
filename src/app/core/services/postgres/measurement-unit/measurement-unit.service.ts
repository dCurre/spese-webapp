import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface MeasurementUnit {
  id: number;
  name: string;
  symbol: string;
  category: string;
  protected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MeasurementUnitService {
  private readonly baseUrl = `${environment.pgApiUrl}/api/measurement-units`;
  private cache$: Observable<{ measurement_units: MeasurementUnit[] }> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ measurement_units: MeasurementUnit[] }> {
    if (!this.cache$) {
      this.cache$ = this.http
        .get<{ measurement_units: MeasurementUnit[] }>(this.baseUrl)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.cache$;
  }

  invalidateCache(): void {
    this.cache$ = null;
  }

  create(payload: { name: string; symbol: string; category: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: number, payload: { name?: string; symbol?: string; category?: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }
}

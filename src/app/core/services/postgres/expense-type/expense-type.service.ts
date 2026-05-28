import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ExpenseType {
  id: number;
  name: string;
  protected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpenseTypeService {
  private readonly baseUrl = `${environment.pgApiUrl}/api/expense-types`;
  private cache$: Observable<{ expense_types: ExpenseType[] }> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ expense_types: ExpenseType[] }> {
    if (!this.cache$) {
      this.cache$ = this.http.get<{ expense_types: ExpenseType[] }>(this.baseUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cache$;
  }

  invalidateCache(): void {
    this.cache$ = null;
  }

  create(name: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, { name }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: number, name: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, { name }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }
}

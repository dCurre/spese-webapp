import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user';
import { ExpensesList } from '../expenses-list/expenses-list';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly baseUrl = `${environment.pgApiUrl}/api/users`;
  private allCache$: Observable<{ users: User[] }> | null = null;
  private byEmailCache = new Map<string, Observable<User>>();

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ users: User[] }> {
    if (!this.allCache$) {
      this.allCache$ = this.http.get<{ users: User[] }>(this.baseUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.allCache$;
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    if (!this.byEmailCache.has(email)) {
      const req$ = this.http.get<User>(`${this.baseUrl}/by-email/${encodeURIComponent(email)}`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.byEmailCache.set(email, req$);
    }
    return this.byEmailCache.get(email)!;
  }

  upsertByEmail(payload: { email: string; name: string; surname: string; profile_image: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/upsert-by-email`, payload, { headers: { 'X-Silent': '1' } }).pipe(
      tap(user => {
        if (user?.email) this.byEmailCache.delete(user.email);
        this.allCache$ = null;
      })
    );
  }

  getByEmailWithLists(email: string): Observable<{ user: User, expenses_lists: ExpensesList[] }> {
    return this.http.get<{ user: User, expenses_lists: ExpensesList[] }>(`${this.baseUrl}/by-email/${encodeURIComponent(email)}/expenses-lists`);
  }

  create(payload: Partial<User>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload).pipe(
      tap(() => { this.allCache$ = null; })
    );
  }

  update(id: number, payload: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.allCache$ = null;
        this.byEmailCache.clear();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => { this.allCache$ = null; })
    );
  }
}

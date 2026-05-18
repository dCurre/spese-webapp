import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user';
import { ExpensesList } from '../expenses-list/expenses-list';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly baseUrl = `${environment.pgApiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/by-email/${encodeURIComponent(email)}`);
  }

  getByEmailWithLists(email: string): Observable<{ user: User, expenses_lists: ExpensesList[] }> {
    return this.http.get<{ user: User, expenses_lists: ExpensesList[] }>(`${this.baseUrl}/by-email/${encodeURIComponent(email)}/expenses-lists`);
  }

  create(payload: Partial<User>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

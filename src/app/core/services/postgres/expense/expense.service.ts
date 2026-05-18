import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Expense } from './expense';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly baseUrl = `${environment.pgApiUrl}/api/expenses`;

  constructor(private http: HttpClient) {}

  getByListId(listId: number): Observable<{ expenses: Expense[] }> {
    return this.http.get<{ expenses: Expense[] }>(`${this.baseUrl}/by-list/${listId}`);
  }

  create(payload: Partial<Expense> & { expense_owner_user_id: number, expense_list_id: number, expense_date: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Expense>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

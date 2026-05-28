import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExpensesList } from './expenses-list';
import { SaldoDetails } from 'src/app/features/components/saldo-details/list-details-dialog-fields';

@Injectable({
  providedIn: 'root'
})
export class ExpensesListService {

  private readonly baseUrl = `${environment.pgApiUrl}/api/expenses-lists`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ expenses_lists: ExpensesList[] }> {
    return this.http.get<{ expenses_lists: ExpensesList[] }>(this.baseUrl);
  }

  getById(id: number): Observable<ExpensesList> {
    return this.http.get<ExpensesList>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<ExpensesList>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<ExpensesList>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  transferOwner(listId: number, currentOwnerId: number, newOwnerId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${listId}/transfer-owner`, {
      current_owner_id: currentOwnerId,
      new_owner_id: newOwnerId,
    });
  }

  getBalance(listId: number): Observable<{ balance: SaldoDetails[]; totals: { name: string; amount: number }[] }> {
    return this.http.get<{ balance: SaldoDetails[]; totals: { name: string; amount: number }[] }>(`${this.baseUrl}/${listId}/balance`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ExpenseType {
  id: number;
  name: string;
  protected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpenseTypeService {
  private readonly baseUrl = `${environment.pgApiUrl}/api/expense-types`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ expense_types: ExpenseType[] }> {
    return this.http.get<{ expense_types: ExpenseType[] }>(this.baseUrl);
  }

  create(name: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, { name });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

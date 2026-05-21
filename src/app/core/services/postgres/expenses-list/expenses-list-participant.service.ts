import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExpensesListParticipant } from './expenses-list-participant';

@Injectable({
  providedIn: 'root'
})
export class ExpensesListParticipantService {

  private baseUrl(listId: number) {
    return `${environment.pgApiUrl}/api/expenses-lists/${listId}/participants`;
  }

  constructor(private http: HttpClient) {}

  getByListId(listId: number): Observable<{ participants: ExpensesListParticipant[] }> {
    return this.http.get<{ participants: ExpensesListParticipant[] }>(this.baseUrl(listId));
  }

  add(listId: number, userId: number): Observable<void> {
    return this.http.post<void>(this.baseUrl(listId), { user_id: userId });
  }

  remove(listId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(listId)}/${userId}`);
  }

  removeGuest(listId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(listId)}/${userId}/guest`);
  }
}

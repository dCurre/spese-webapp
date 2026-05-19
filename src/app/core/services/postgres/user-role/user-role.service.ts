import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserRole {
  id: number;
  name: string;
  protected: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private readonly baseUrl = `${environment.pgApiUrl}/api/user-roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ user_roles: UserRole[] }> {
    return this.http.get<{ user_roles: UserRole[] }>(this.baseUrl);
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

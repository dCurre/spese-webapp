import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Product {
  id: number;
  name: string;
  brand: string | null;
  default_unit_id: number | null;
  default_unit_symbol: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.pgApiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(this.baseUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(payload: { name: string; brand?: string | null; default_unit_id?: number | null }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Pick<Product, 'name' | 'brand' | 'default_unit_id'>>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

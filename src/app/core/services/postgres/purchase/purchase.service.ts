import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Purchase {
  id: number;
  product_id: number;
  user_id: number;
  purchased_at: string;
  price: number;
  quantity: number;
  unit_id: number;
  unit_symbol: string | null;
  unit_price: number;
  store: string | null;
  notes: string | null;
}

export interface PriceHistoryPoint {
  period: string;
  avg_unit_price: number;
  min_unit_price: number;
  max_unit_price: number;
  count: number;
}

export interface PriceHistory {
  product_id: number;
  product_name: string;
  unit_symbol: string | null;
  data: PriceHistoryPoint[];
}

export type Granularity = 'year' | 'month' | 'day';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly baseUrl = `${environment.pgApiUrl}/api`;

  constructor(private http: HttpClient) {}

  getByProduct(productId: number): Observable<{ purchases: Purchase[] }> {
    return this.http.get<{ purchases: Purchase[] }>(`${this.baseUrl}/products/${productId}/purchases`);
  }

  create(payload: {
    product_id: number;
    user_id: number;
    purchased_at: string;
    price: number;
    quantity: number;
    unit_id: number;
    store?: string | null;
    notes?: string | null;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}/purchases`, payload);
  }

  update(id: number, payload: Partial<Pick<Purchase, 'purchased_at' | 'price' | 'quantity' | 'unit_id' | 'store' | 'notes'>>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/purchases/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/purchases/${id}`);
  }

  getPriceHistory(productId: number, granularity: Granularity = 'month', from?: string, to?: string): Observable<PriceHistory> {
    let params = new HttpParams().set('granularity', granularity);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<PriceHistory>(`${this.baseUrl}/products/${productId}/price-history`, { params });
  }
}

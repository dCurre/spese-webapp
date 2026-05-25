import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShoppingList, ShoppingItem, ShoppingCategory } from './shopping-list';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
    private readonly baseUrl = `${environment.pgApiUrl}/api/shopping-lists`;

    constructor(private http: HttpClient) {}

    getByUser(userId: number): Observable<{ shopping_lists: ShoppingList[] }> {
        return this.http.get<{ shopping_lists: ShoppingList[] }>(`${this.baseUrl}/by-user/${userId}`);
    }

    getById(id: number): Observable<ShoppingList> {
        return this.http.get<ShoppingList>(`${this.baseUrl}/${id}`);
    }

    create(payload: Partial<ShoppingList>): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.baseUrl, payload);
    }

    update(id: number, payload: Partial<ShoppingList>): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    generateInviteToken(id: number): Observable<{ invite_token: string }> {
        return this.http.post<{ invite_token: string }>(`${this.baseUrl}/${id}/invite-token`, {});
    }

    revokeInviteToken(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}/invite-token`);
    }

    joinByToken(token: string, userId: number): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(`${this.baseUrl}/join/${token}`, { user_id: userId }, { headers: { 'X-Silent': '1' } });
    }

    toggleStar(id: number, starred: boolean): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, { starred });
    }

    addParticipant(listId: number, userId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${listId}/participants`, { user_id: userId });
    }

    removeParticipant(listId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${listId}/participants/${userId}`);
    }

    transferOwnership(listId: number, oldOwnerId: number, newOwnerId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${listId}/transfer-ownership`, { old_owner_id: oldOwnerId, new_owner_id: newOwnerId });
    }
}

@Injectable({ providedIn: 'root' })
export class ShoppingItemService {
    private readonly baseUrl = `${environment.pgApiUrl}/api/shopping-items`;

    constructor(private http: HttpClient) {}

    create(payload: Partial<ShoppingItem>): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.baseUrl, payload);
    }

    update(id: number, payload: Partial<ShoppingItem>): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
    }

    toggleChecked(id: number, checked: boolean): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}/check`, { checked });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    bulkUpdate(updates: { id: number; name?: string; quantity?: number | null }[], deleteIds: number[]): Observable<void> {
    return this.http.put<void>(`${environment.pgApiUrl}/api/shopping-items/bulk`, { updates, delete_ids: deleteIds });
  }

  checkAll(listId: number, checked: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/check-all`, { shopping_list_id: listId, checked });
  }

  reorder(listId: number, orderedIds: number[]): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/reorder`, { shopping_list_id: listId, ordered_ids: orderedIds });
    }
}

@Injectable({ providedIn: 'root' })
export class ShoppingCategoryService {
    private readonly baseUrl = `${environment.pgApiUrl}/api/shopping-categories`;

    constructor(private http: HttpClient) {}

    create(payload: { shopping_list_id: number; name: string; sort_order?: number }): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.baseUrl, payload);
    }

    update(id: number, payload: { name?: string; sort_order?: number }): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    checkCategory(id: number, checked: boolean): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}/check`, { checked });
    }
}

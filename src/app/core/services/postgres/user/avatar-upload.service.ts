import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AvatarUploadService {

    private readonly baseUrl = `${environment.pgApiUrl}/api/users`;

    constructor(private http: HttpClient) {}

    upload(userId: number, file: File): Observable<{ url: string; history: string[] }> {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<{ url: string; history: string[] }>(`${this.baseUrl}/${userId}/profile-image`, form);
    }

    select(userId: number, url: string): Observable<{ url: string; history: string[] }> {
        return this.http.put<{ url: string; history: string[] }>(
            `${this.baseUrl}/${userId}/profile-image/select`, { url }
        );
    }
}

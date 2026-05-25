import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../postgres/user/user';
import { UserService } from '../postgres/user/user.service';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {

    private theme$ = new BehaviorSubject<Theme>('auto');

    constructor(private userService: UserService) {}

    apply(user: User | null): void {
        const theme: Theme = user?.theme_preference ?? 'auto';
        this.theme$.next(theme);
        document.documentElement.setAttribute('data-theme', theme);
    }

    setTheme(userId: number, theme: Theme): void {
        this.theme$.next(theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.userService.update(userId, { theme_preference: theme } as Partial<User>).subscribe();
    }

    getTheme(): Theme {
        return this.theme$.getValue();
    }

    getTheme$() {
        return this.theme$.asObservable();
    }
}

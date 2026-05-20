import { Injectable } from '@angular/core';
import { User } from '../postgres/user/user';
import { UserService } from '../postgres/user/user.service';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {

    private currentTheme: Theme = 'auto';

    constructor(private userService: UserService) {}

    apply(user: User | null): void {
        const theme: Theme = user?.theme_preference ?? 'auto';
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
    }

    setTheme(userId: number, theme: Theme): void {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.userService.update(userId, { theme_preference: theme } as Partial<User>).subscribe();
    }

    getTheme(): Theme {
        return this.currentTheme;
    }
}

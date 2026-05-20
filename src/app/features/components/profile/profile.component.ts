import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Theme, ThemeService } from 'src/app/core/services/theme/theme.service';
import { User } from 'src/app/core/services/postgres/user/user';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    loggedUser: User | null = null;
    selectedTheme: Theme = 'auto';

    avatarError = false;
    emailCopied = false;

    editingImage = false;
    savingImage = false;
    editImage = '';

    editingName = false;
    savingName = false;
    editName = '';
    editSurname = '';

    constructor(
        private authService: AuthService,
        private themeService: ThemeService,
        private userService: UserService,
        private toastService: ToastService,
    ) {}

    ngOnInit(): void {
        this.authService.getStoredUser().subscribe(user => {
            this.loggedUser = user;
            this.selectedTheme = user?.theme_preference ?? 'auto';
        });
    }

    logout(): void {
        this.authService.signOut();
    }

    setTheme(theme: Theme): void {
        if (!this.loggedUser?.id) return;
        this.selectedTheme = theme;
        this.themeService.setTheme(this.loggedUser.id, theme);
    }

    // ── Email ──

    copyEmail(): void {
        if (!this.loggedUser?.email) return;
        navigator.clipboard.writeText(this.loggedUser.email).then(() => {
            this.emailCopied = true;
            setTimeout(() => this.emailCopied = false, 2000);
        });
    }

    // ── Foto profilo ──

    onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).style.display = 'none';
        this.avatarError = true;
    }

    startEditImage(): void {
        this.editImage = this.loggedUser?.profile_image ?? '';
        this.avatarError = false;
        this.editingImage = true;
    }

    cancelEditImage(): void {
        this.avatarError = false;
        this.editingImage = false;
    }

    saveImage(): void {
        if (!this.loggedUser?.id) return;
        const profile_image = this.editImage.trim();
        this.savingImage = true;
        this.userService.update(this.loggedUser.id, { profile_image }).subscribe({
            next: () => {
                this.loggedUser!.profile_image = profile_image;
                this.avatarError = false;
                this.editingImage = false;
                this.savingImage = false;
                this.authService.refreshUser();
                this.toastService.success('Foto profilo aggiornata');
            },
            error: () => {
                this.savingImage = false;
                this.toastService.error('Errore durante il salvataggio');
            }
        });
    }

    // ── Nome e cognome ──

    startEditName(): void {
        this.editName = this.loggedUser?.name ?? '';
        this.editSurname = this.loggedUser?.surname ?? '';
        this.editingName = true;
    }

    cancelEditName(): void {
        this.editingName = false;
    }

    saveName(): void {
        if (!this.loggedUser?.id) return;
        const name = this.editName.trim();
        const surname = this.editSurname.trim();
        if (!name) return;
        this.savingName = true;
        this.userService.update(this.loggedUser.id, { name, surname }).subscribe({
            next: () => {
                this.loggedUser!.name = name;
                this.loggedUser!.surname = surname;
                this.editingName = false;
                this.savingName = false;
                this.authService.refreshUser();
                this.toastService.success('Nome aggiornato');
            },
            error: () => {
                this.savingName = false;
                this.toastService.error('Errore durante il salvataggio');
            }
        });
    }
}

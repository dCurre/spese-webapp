import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Theme, ThemeService } from 'src/app/core/services/theme/theme.service';
import { User } from 'src/app/core/services/postgres/user/user';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { AvatarUploadService } from 'src/app/core/services/postgres/user/avatar-upload.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
    @ViewChild('avatarWrap') avatarWrap!: ElementRef<HTMLElement>;

    loggedUser: User | null = null;
    selectedTheme: Theme = 'auto';

    statsLoaded = false;
    statListsOwned = 0;
    statListsParticipating = 0;
    statExpenses = 0;
    statAmount = 0;

    emailCopied = false;
    uploadingAvatar = false;
    showAvatarPanel = false;

    editingName = false;
    savingName = false;
    editName = '';
    editSurname = '';

    get themeLabel(): string {
        return { light: 'Chiaro', dark: 'Scuro', auto: 'Automatico' }[this.selectedTheme];
    }

    get roleBadgeClass(): string {
        const role = this.loggedUser?.role ?? 'user';
        if (role === 'superadmin') return 'badge badge-purple';
        if (role === 'admin') return 'badge badge-amber';
        return 'badge badge-green';
    }

    get avatarHistory(): string[] {
        return this.loggedUser?.profile_images_history ?? [];
    }

    constructor(
        private authService: AuthService,
        private themeService: ThemeService,
        private userService: UserService,
        private avatarUploadService: AvatarUploadService,
        private toastService: ToastService,
    ) {}

    ngOnInit(): void {
        this.authService.getStoredUser().subscribe(user => {
            this.loggedUser = user;
            if (user?.email) this.loadStats(user.email, user.id);
        });
        this.themeService.getTheme$().subscribe(theme => {
            this.selectedTheme = theme;
        });
    }

    private loadStats(email: string, userId: number): void {
        this.userService.getByEmailWithLists(email).subscribe({
            next: ({ expenses_lists }) => {
                this.statListsOwned = expenses_lists.filter(l => l.user_id === userId).length;
                this.statListsParticipating = expenses_lists.filter(l => l.user_id !== userId).length;
                this.statExpenses = expenses_lists.reduce((sum, l) => sum + (l.expenses_count ?? 0), 0);
                this.statsLoaded = true;
            }
        });
    }

    notImplemented(): void {
        this.toastService.error('Funzionalità non ancora disponibile');
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
            this.toastService.success('Email copiata negli appunti');
        });
    }

    // ── Foto profilo ──

    openAvatarPanel(): void {
        if (this.uploadingAvatar) return;
        this.showAvatarPanel = true;
        setTimeout(() => {
            const rect = this.avatarWrap.nativeElement.getBoundingClientRect();
            document.documentElement.style.setProperty('--avatar-panel-top', `${rect.bottom + 8}px`);
            document.documentElement.style.setProperty('--avatar-panel-left', `${rect.left}px`);
        });
    }

    closeAvatarPanel(): void {
        this.showAvatarPanel = false;
    }

    triggerAvatarPicker(): void {
        this.closeAvatarPanel();
        this.avatarInput.nativeElement.value = '';
        this.avatarInput.nativeElement.click();
    }

    selectHistoryImage(url: string): void {
        if (!this.loggedUser?.id || url === this.loggedUser.profile_image) {
            this.closeAvatarPanel();
            return;
        }
        this.uploadingAvatar = true;
        this.closeAvatarPanel();
        this.avatarUploadService.select(this.loggedUser.id, url).subscribe({
            next: ({ url: newUrl, history }) => {
                this.loggedUser!.profile_image = newUrl;
                this.loggedUser!.profile_images_history = history;

                this.uploadingAvatar = false;
                this.authService.setUser(this.loggedUser!);
                this.toastService.success('Foto profilo aggiornata');
            },
            error: () => {
                this.uploadingAvatar = false;
                this.toastService.error('Errore durante il salvataggio');
            }
        });
    }

    onAvatarFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !this.loggedUser?.id) return;

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            this.toastService.error('Formato non supportato. Usa JPG, PNG, WebP o GIF.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.toastService.error('File troppo grande (max 5MB).');
            return;
        }

        this.uploadingAvatar = true;
        this.avatarUploadService.upload(this.loggedUser.id, file).subscribe({
            next: ({ url, history }) => {
                this.loggedUser!.profile_image = url;
                this.loggedUser!.profile_images_history = history;

                this.uploadingAvatar = false;
                this.authService.setUser(this.loggedUser!);
                this.toastService.success('Foto profilo aggiornata');
            },
            error: () => {
                this.uploadingAvatar = false;
                this.toastService.error('Errore durante il caricamento');
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

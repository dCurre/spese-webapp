import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { User } from '../postgres/user/user';
import { UserService } from '../postgres/user/user.service';
import { PathService } from '../path/path.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private loggedUser$ = new BehaviorSubject<User | null | undefined>(undefined);

    constructor(
        private afAuth: AngularFireAuth,
        private pgUserService: UserService,
        private pathService: PathService,
        private router: Router,
    ) {
        this.afAuth.authState.subscribe(async firebaseUser => {
            if (!firebaseUser?.email) {
                this.loggedUser$.next(null);  // null = caricato, utente non loggato
                return;
            }
            try {
                const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
                this.loggedUser$.next(pgUser ?? this.fallbackUser(firebaseUser));
            } catch {
                this.loggedUser$.next(this.fallbackUser(firebaseUser));
            }
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                this.router.navigateByUrl(returnUrl);
            }
        });
    }

    GoogleAuth() {
        this.authLogin(new GoogleAuthProvider());
    }

    signOut(): void {
        this.afAuth.signOut().then(() => {
            this.router.navigate(['/signin']);
        });
    }

    authLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
        this.afAuth.signInWithPopup(provider).catch((error) => {
            console.error('AuthService.authLogin error:', error);
        });
    }

    getStoredUser(): Observable<User | null> {
        return this.loggedUser$.pipe(filter((u): u is User | null => u !== undefined));
    }

    setUser(user: User): void {
        this.loggedUser$.next(user);
    }

    /** Attende che l'utente sia caricato da Firebase+DB e lo restituisce. Non fa nuove HTTP request. */
    getUser(): Promise<User | null> {
        return firstValueFrom(
            this.loggedUser$.pipe(filter((u): u is User | null => u !== undefined))
        );
    }

    async refreshUser(): Promise<void> {
        const firebaseUser = await this.afAuth.currentUser;
        if (!firebaseUser?.email) return;
        try {
            const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
            this.loggedUser$.next(pgUser ?? this.fallbackUser(firebaseUser));
        } catch {
            this.loggedUser$.next(this.fallbackUser(firebaseUser));
        }
    }

    private fallbackUser(firebaseUser: firebase.User): User {
        const displayName = firebaseUser.displayName ?? '';
        const parts = displayName.split(' ');
        const user = new User();
        user.name = parts[0] ?? '';
        user.surname = parts.slice(1).join(' ');
        user.email = firebaseUser.email ?? '';
        user.profile_image = firebaseUser.photoURL ?? '';
        return user;
    }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../postgres/user/user';
import { UserService } from '../postgres/user/user.service';
import { PathService } from '../path/path.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private loggedUser$ = new BehaviorSubject<User | null>(null);

    constructor(
        private afAuth: AngularFireAuth,
        private pgUserService: UserService,
        private pathService: PathService,
        private router: Router,
    ) {
        this.afAuth.authState.subscribe(async firebaseUser => {
            if (!firebaseUser?.email) {
                this.loggedUser$.next(null);
                return;
            }
            try {
                const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
                this.loggedUser$.next(pgUser ?? this.fallbackUser(firebaseUser));
            } catch {
                this.loggedUser$.next(this.fallbackUser(firebaseUser));
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
        return this.loggedUser$.asObservable();
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

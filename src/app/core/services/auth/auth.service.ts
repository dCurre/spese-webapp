import { Injectable } from '@angular/core';
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
    ) {
        this.afAuth.authState.subscribe(async firebaseUser => {
            if (!firebaseUser?.email) {
                this.loggedUser$.next(null);
                return;
            }
            const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
            this.loggedUser$.next(pgUser ?? null);
        });
    }

    GoogleAuth() {
        this.authLogin(new GoogleAuthProvider());
    }

    signOut(): void {
        this.afAuth.signOut();
    }

    authLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
        this.afAuth.signInWithPopup(provider).catch((error) => {
            console.error('AuthService.authLogin error:', error);
        });
    }

    getStoredUser(): Observable<User | null> {
        return this.loggedUser$.asObservable();
    }
}

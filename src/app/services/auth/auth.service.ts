import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';
import { Observable, Subject } from 'rxjs';
import { User } from '../firestore/user/user';
import { UserService } from '../firestore/user/user.service';
import { PathService } from '../path/path.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private afAuth: AngularFireAuth,
        private userService: UserService,
        private pathService: PathService
    ) { }

    // Sign in with Google
    GoogleAuth() {
        this.authLogin(new GoogleAuthProvider());
    }

    signOut(): void {
        this.afAuth.signOut();
    }

    // Auth logic to run auth providers
    authLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
        this.afAuth.signInWithPopup(provider).then((result) => {
            console.log('AuthService.AuthLogin: You have been successfully logged in!')

            if (result == null) {
                return
            }

            this.userService.getById(result.user?.uid!).subscribe(user => {
                if (user == null || user == undefined) {
                    this.userService.insertGoogleUser(result.user)
                }
            });

        }).catch((error) => {
            console.error("AuthService.authLogin error:", error)
        })
    }

    getLoggedUser(): Observable<User> {
        var subject = new Subject<User>();
        if (!this.pathService.isPath("/signin")) {
            this.afAuth.authState.subscribe(googleUser => {
                try {
                    this.userService.getById(googleUser!!.uid).subscribe(user => {
                        subject.next(user)
                    })
                } catch (e) {
                    console.error("AuthService.getLoggedUser error:", e)
                }
            });
        }

        return subject.asObservable();
    }
}

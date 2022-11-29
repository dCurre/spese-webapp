import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';
import { Observable } from 'rxjs';
import { User } from '../firestore/user/user';
import { UserService } from '../firestore/user/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private afAuth: AngularFireAuth,
        private userService: UserService
    ) { }

    // Sign in with Google
    GoogleAuth() {
        this.AuthLogin(new GoogleAuthProvider());
    }

    // Auth logic to run auth providers
    AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
        this.afAuth.signInWithPopup(provider).then((result) => {
            console.log('AuthLogin: You have been successfully logged in!')
            
            if (result == null) {
                return
            }

            this.userService.getById(result.user?.uid!).subscribe(user => {
                if(user == null || user == undefined){
                    this.userService.insertGoogleUser(result.user)
                }
            });

        }).catch((error) => {
            console.debug("AuthLogin error:", error)
        })
    }
}

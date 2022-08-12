import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private afAuth: AngularFireAuth) { }

    // Sign in with Google
    GoogleAuth() {
        return this.AuthLogin(new GoogleAuthProvider());
    }

    // Auth logic to run auth providers
    AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
        return this.afAuth.signInWithPopup(provider)
        .then((result) => {
            console.log('You have been successfully logged in!')
        }).catch((error) => {
            console.log(error)
        })
    }

}

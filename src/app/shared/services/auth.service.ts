import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // other components can check on this variable for the login status of the user
    userLoggedIn: boolean;

    constructor(private afAuth: AngularFireAuth) {
        this.userLoggedIn = false;
        
        // set up a subscription to always know the login status of the user
        this.afAuth.onAuthStateChanged((user) => {
            if (user) {
                this.userLoggedIn = true;
            } else {
                this.userLoggedIn = false;
            }
        });
    }

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

    loginUser(email: string, password: string): Promise<any> {
        return this.afAuth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('Auth Service: loginUser: success');
                // this.router.navigate(['/dashboard']);
            })
            .catch(error => {
                console.log('Auth Service: login error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code)
                    return { isValid: false, message: error.message };
            });
    }

    signupUser(user: any): Promise<any> {
        return this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
            .then((result) => {
                let emailLower = user.email.toLowerCase();
                //result.user.sendEmailVerification();                    // immediately send the user a verification email
            })
            .catch(error => {
                console.log('Auth Service: signup error', error);
                if (error.code)
                    return { isValid: false, message: error.message };
            });
    }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { HomeComponent } from './components/home/home.component';
import { SignInComponent } from './components/sign-in/sign-in.component';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
//import { AngularFireStorageModule } from '@angular/fire/compat/storage';
//import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
//import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';

// Auth service
import { AuthService } from "./shared/services/auth.service";

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SignInComponent,
    HomeComponent,
    ExpensesListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    //ngularFirestoreModule,
    //AngularFireStorageModule,
    //AngularFireDatabaseModule,

    MatButtonModule,
    MatCardModule,
    MatInputModule,

    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})

export class AppModule { }

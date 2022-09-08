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
import { environment } from '../environments/environment';

// Auth service
import { AuthService } from 'src/app/services/auth/auth.service'

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { ExpenseListDetailsComponent } from './components/expenses-list-details/expenses-list-details.component';
import { DialogComponent } from 'src/app/components/dialog/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewListDialogComponent } from './components/dialog/new-list-dialog/new-list-dialog.component';
import { NewExpenseDialogComponent } from './components/dialog/new-expense-dialog/new-expense-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { JoinComponent } from './components/join/join.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SignInComponent,
    HomeComponent,
    ExpensesListComponent,
    ExpenseListDetailsComponent,
    DialogComponent,
    NewListDialogComponent,
    NewExpenseDialogComponent,
    JoinComponent,
    AccessDeniedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,

    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    MatAutocompleteModule,

    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})

export class AppModule { }

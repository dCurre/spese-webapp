//Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { NgChartsModule } from 'ng2-charts';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

//Components
import { AppComponent } from './app.component';
import { HomeComponent } from './features/components/home/home.component';
import { SignInComponent } from './features/components/sign-in/sign-in.component';
import { ToolbarComponent } from './features/components/toolbar/toolbar.component';
import { ExpensesListComponent } from './features/components/expenses-list/expenses-list.component';
import { ExpenseListDetailsComponent } from './features/components/expenses-list-details/expenses-list-details.component';
import { NewListDialogComponent } from './features/components/dialog/new-list-dialog/new-list-dialog.component';
import { NewExpenseDialogComponent } from './features/components/dialog/new-expense-dialog/new-expense-dialog.component';
import { JoinComponent } from './features/components/join/join.component';
import { AccessDeniedComponent } from './features/components/access-denied/access-denied.component';
import { ShareDialogComponent } from './features/components/dialog/share-dialog/share-dialog.component';
import { SpinnerComponent } from './features/components/spinner/spinner.component';
import { SidebarComponent } from './features/components/sidebar/sidebar.component';
import { SaldoDetailsComponent } from './features/components/saldo-details/saldo-details.component';
import { NotFoundComponent } from './features/components/not-found/not-found.component';
import { DialogComponent } from './features/components/dialog/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './features/components/toast/toast.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

// Auth service
import { AuthService } from './core/services/auth/auth.service';

// Pipe
import { ExpenseFilterPipe } from './features/components/filter-pipes/expense-filter/expense-filter.pipe';
import { ChecklistComponent } from './features/components/checklist/checklist.component';
import { ProfileComponent } from './features/components/profile/profile.component';
import { SignUpComponent } from './features/components/sign-up/sign-up.component';
import { ExpensesListPersonalComponent } from './features/components/expenses-list-personal/expenses-list-personal.component';
import { AdminComponent } from './features/components/admin/admin.component';
import { BadgeComponent } from './features/components/badge/badge.component';
import { ExpenseListViewComponent } from './features/components/expense-list-view/expense-list-view.component';
import { TransferOwnerDialogComponent } from './features/components/dialog/transfer-owner-dialog/transfer-owner-dialog.component';
import { AddGuestDialogComponent } from './features/components/dialog/add-guest-dialog/add-guest-dialog.component';
import { AboutComponent } from './features/components/about/about.component';
import { DcLogoComponent } from './features/components/dc-logo/dc-logo.component';

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
    AccessDeniedComponent,
    ShareDialogComponent,
    SpinnerComponent,
    SidebarComponent,
    SaldoDetailsComponent,
    NotFoundComponent,
    ExpenseFilterPipe,
    ToastComponent,
    ChecklistComponent,
    ProfileComponent,
    SignUpComponent,
    ExpensesListPersonalComponent,
    AdminComponent,
    BadgeComponent,
    ExpenseListViewComponent,
    TransferOwnerDialogComponent,
    AddGuestDialogComponent,
    AboutComponent,
    DcLogoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    HttpClientModule,

    NgbModule,
    NgChartsModule,

    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

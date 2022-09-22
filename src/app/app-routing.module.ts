import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// route guards
import { AuthGuard } from './guard/auth/auth.guard';
import { JoinGuard } from './guard/join/join.guard';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { HomeComponent } from './components/home/home.component';
import { ExpenseListDetailsComponent } from './components/expenses-list-details/expenses-list-details.component';
import { JoinComponent } from './components/join/join.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { ListGuard } from './guard/list/list.guard';
import { SignInGuard } from './guard/signin/signin.guard';
import { SaldoDetailsComponent } from './components/saldo-details/saldo-details.component';
import { ListDetailsGuard } from './guard/list-details/list-details.guard';

const routes: Routes = [
  { path: 'join', component: JoinComponent, canActivate: [AuthGuard, JoinGuard] },
  { path: 'signin', component: SignInComponent, canActivate: [SignInGuard] },
  { path: 'details/:id', component: SaldoDetailsComponent, canActivate: [AuthGuard, ListDetailsGuard]},
  { path: 'accessdenied', component: AccessDeniedComponent},
  { path: 'list/:id', component: ExpenseListDetailsComponent, canActivate: [AuthGuard, ListGuard] },
  { path: '', component: HomeComponent, canActivate: [AuthGuard]  },// catch-all in case no other path matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



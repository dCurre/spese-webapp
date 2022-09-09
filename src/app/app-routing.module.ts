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

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'join', component: JoinComponent, canActivate: [AuthGuard, JoinGuard] },
  { path: 'signin', component: SignInComponent},
  { path: 'accessdenied', component: AccessDeniedComponent},
  { path: 'list/:id', component: ExpenseListDetailsComponent, canActivate: [AuthGuard, ListGuard] },
  { path: '**', component: HomeComponent },// catch-all in case no other path matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



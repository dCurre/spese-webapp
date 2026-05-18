import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// route guards
import { AuthGuard } from './core/guards/auth/auth.guard';
import { JoinGuard } from './core/guards/join/join.guard';
import { ListGuard } from './core/guards/list/list.guard';
import { SignInGuard } from './core/guards/signin/signin.guard';
import { ListDetailsGuard } from './core/guards/list-details/list-details.guard';

//Components
import { AccessDeniedComponent } from './features/components/access-denied/access-denied.component';
import { ExpenseListDetailsComponent } from './features/components/expenses-list-details/expenses-list-details.component';
import { HomeComponent } from './features/components/home/home.component';
import { JoinComponent } from './features/components/join/join.component';
import { SaldoDetailsComponent } from './features/components/saldo-details/saldo-details.component';
import { SignInComponent } from './features/components/sign-in/sign-in.component';
const routes: Routes = [
  { path: 'join', component: JoinComponent, canActivate: [AuthGuard, JoinGuard] },
  { path: 'signin', component: SignInComponent, canActivate: [SignInGuard] },
  { path: 'details/:id', component: SaldoDetailsComponent, canActivate: [AuthGuard, ListDetailsGuard]},
  { path: 'accessdenied', component: AccessDeniedComponent},
  { path: 'list/:id', component: ExpenseListDetailsComponent, canActivate: [AuthGuard, ListGuard] },
  { path: '', component: HomeComponent, canActivate: [AuthGuard]  },
  { path: '**', component: AccessDeniedComponent, canActivate: [AuthGuard]  },// catch-all in case no other path matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



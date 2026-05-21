import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// route guards
import { AuthGuard } from './core/guards/auth/auth.guard';
import { JoinGuard } from './core/guards/join/join.guard';
import { ListGuard } from './core/guards/list/list.guard';
import { SignInGuard } from './core/guards/signin/signin.guard';
import { ListDetailsGuard } from './core/guards/list-details/list-details.guard';
import { ListPersonalGuard } from './core/guards/list-personal/list-personal.guard';
import { AdminGuard } from './core/guards/admin/admin.guard';
import { AdminComponent } from './features/components/admin/admin.component';
import { AboutComponent } from './features/components/about/about.component';

//Components
import { AccessDeniedComponent } from './features/components/access-denied/access-denied.component';
import { ExpenseListDetailsComponent } from './features/components/expenses-list-details/expenses-list-details.component';
import { HomeComponent } from './features/components/home/home.component';
import { JoinComponent } from './features/components/join/join.component';
import { SignInComponent } from './features/components/sign-in/sign-in.component';
import { ChecklistComponent } from './features/components/checklist/checklist.component';
import { ProfileComponent } from './features/components/profile/profile.component';
import { SignUpComponent } from './features/components/sign-up/sign-up.component';
import { ExpensesListPersonalComponent } from './features/components/expenses-list-personal/expenses-list-personal.component';
const routes: Routes = [
  { path: 'join', component: JoinComponent, canActivate: [AuthGuard, JoinGuard] },
  { path: 'signin', component: SignInComponent, canActivate: [SignInGuard], data: { animation: 'signin' } },
  { path: 'signup', component: SignUpComponent, data: { animation: 'signup' } },
  { path: 'accessdenied', component: AccessDeniedComponent},
  { path: 'list/:id', component: ExpenseListDetailsComponent, canActivate: [AuthGuard, ListGuard] },
  { path: 'list-personal/:id', component: ExpenseListDetailsComponent, canActivate: [AuthGuard, ListPersonalGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'checklist', component: ChecklistComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent, canActivate: [AuthGuard]  },
  { path: '**', component: AccessDeniedComponent, canActivate: [AuthGuard]  },// catch-all in case no other path matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



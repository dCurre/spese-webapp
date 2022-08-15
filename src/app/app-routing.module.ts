import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { HomeComponent } from './components/home/home.component';

// route guard
import { AuthGuard } from './guard/auth.guard';
import { ExpenseListDetailsComponent } from './components/expenses-list-details/expenses-list-details.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'signin', component: SignInComponent},
  { path: 'list/:id', component: ExpenseListDetailsComponent},
  //{ path: 'signup', component: SignupComponent },
  { path: '**', component: HomeComponent },// catch-all in case no other path matched
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



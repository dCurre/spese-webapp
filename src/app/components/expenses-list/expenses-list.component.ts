import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from '../../shared/services/firestore/expensesList/expenses-list.service';
import { ExpensesList } from '../../shared/services/firestore/expensesList/expenses-list';
import { Observable } from 'rxjs';
import { ExpensesListFieldsEnum } from 'src/app/shared/enums/expensesListFieldsEnum';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {

  protected expensesLists$: Observable<ExpensesList[]>;

  constructor(
    public afAuth: AngularFireAuth,
    private expensesListService: ExpensesListService) { }

  ngOnInit(): void {
    this.getExpensesListsByLoggedUser()
  }

  async getExpensesListsByLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try{
        this.expensesLists$ = this.expensesListService.getExpensesListsByUserId(ExpensesListFieldsEnum.PARTECIPANTS, user!!.uid);
      } catch (e){
          console.error("HomeComponent.getLoggedUser: ", e)
      }
    });
  }
}

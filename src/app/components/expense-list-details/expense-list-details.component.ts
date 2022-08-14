import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpenseService } from '../../shared/services/firestore/expense/expense.service';
import { Expense } from '../../shared/services/firestore/expense/expense';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expense-list-details',
  templateUrl: './expense-list-details.component.html',
  styleUrls: ['./expense-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit {

  protected expenses$: Observable<Expense[]>;

  constructor(
    public afAuth: AngularFireAuth,
    private expenseService: ExpenseService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getExpensesByListId(this.route.snapshot.paramMap.get('id')!!)
  }

  async getExpensesByListId(id: string) {
    try{
      this.expenses$ = this.expenseService.getExpenseByListID(id);
    } catch (e){
        console.error("HomeComponent.getLoggedUser: ", e)
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpenseService } from '../../services/firestore/expense/expense.service';
import { Expense } from '../../services/firestore/expense/expense';
import { ExpensesList } from '../../services/firestore/expensesList/expenses-list';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import DateUtils from 'src/app/utils/date-utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';

@Component({
  selector: 'app-expenses-list-details',
  templateUrl: './expenses-list-details.component.html',
  styleUrls: ['./expenses-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit {

  protected expenses$: Observable<Expense[]>;
  protected expensesList$: Observable<ExpensesList>;

  constructor(
    public afAuth: AngularFireAuth,
    private expenseService: ExpenseService,
    protected expensesListService: ExpensesListService,
    private modalService: NgbModal,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getExpensesByListId(this.route.snapshot.paramMap.get('id')!!)
    this.getExpensesListDetails(this.route.snapshot.paramMap.get('id')!!)
  }

  async getExpensesByListId(id: string) {
    try{
      this.expenses$ = this.expenseService.getExpensesByListID(id);
    } catch (e){
        console.error("ExpenseListDetailsComponent.getExpensesByListId: ", e)
    }
  }

  async getExpensesListDetails(id: string) {
    try{
      this.expensesList$ = this.expensesListService.getById(id);
    } catch (e){
        console.error("ExpenseListDetailsComponent.getExpensesListDetails: ", e)
    }
  }

  newExpense(){
    const modalDelete = this.modalService.open(NewExpenseDialogComponent, { centered: true });

    modalDelete.result.then((response) => {
      if (response == null) {
        return
      }

      console.debug(response)

      this.expenseService.insert(response, this.route.snapshot.paramMap.get('id')!!);
    });
  }

  edit(expense: Expense){

  }

  delete(expense: Expense){
    
  }

  timestampToDate(timestamp: number) {
    return DateUtils.timestampToDate(timestamp);
  }

  timestampToHour(timestamp: number) {
    return DateUtils.timestampToHour(timestamp);
  }
}

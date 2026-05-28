import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { SaldoDetails } from '../saldo-details/list-details-dialog-fields';
import DateUtils from 'src/app/shared/utils/date-utils';
import ListUtils from 'src/app/shared/utils/list-utils';
import { expenseTypeIcon, expenseTypeAccent } from 'src/app/shared/utils/expense-type.utils';

@Component({
  selector: 'app-expense-list-view',
  templateUrl: './expense-list-view.component.html',
  styleUrls: ['./expense-list-view.component.css']
})
export class ExpenseListViewComponent {

  @Input() expensesList: ExpensesList | null = null;
  @Input() expenses: Expense[] = [];
  @Input() expensesLoaded: boolean = false;
  @Input() expensesListTotalAmount: number = 0;
  @Input() isPersonal: boolean = false;
  @Input() balanceDetails: SaldoDetails[] = [];
  @Input() balanceTotals: { name: string; amount: number }[] = [];
  @Input() loggedUserId: number | null = null;

  @Output() newExpense = new EventEmitter<void>();
  @Output() editExpense = new EventEmitter<Expense>();
  @Output() repeatExpense = new EventEmitter<Expense>();
  @Output() deleteExpense = new EventEmitter<Expense>();
  @Output() salda = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();
  @Output() deleteList = new EventEmitter<void>();
  @Output() shareLink = new EventEmitter<void>();
  @Output() addGuest = new EventEmitter<void>();
  @Output() removeGuest = new EventEmitter<number>();

  protected searchTerm: string = '';
  protected sortBy: 'name' | 'date' | 'amount' = 'date';
  protected sortAsc: boolean = false;
  protected drawerOpen: boolean = false;
  protected balanceOpen: boolean = true;

  get sortedExpenses(): Expense[] {
    return ListUtils.filterAndSortExpenses(this.expenses, this.searchTerm, this.sortBy, this.sortAsc);
  }

  readonly expenseTypeIcon = expenseTypeIcon;
  readonly expenseTypeAccent = expenseTypeAccent;

  expenseDateString(expense: Expense): string {
    return expense.expense_date ? DateUtils.dateToString(new Date(expense.expense_date)) : '';
  }

  hasBeenModified(expense: Expense): boolean {
    return !!expense.updated_at && !!expense.modified_by;
  }

}

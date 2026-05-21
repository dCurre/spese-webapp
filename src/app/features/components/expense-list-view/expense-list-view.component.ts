import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { SaldoDetails } from '../saldo-details/list-details-dialog-fields';
import DateUtils from 'src/app/shared/utils/date-utils';
import MathUtils from 'src/app/shared/utils/math-utils';

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
    let list = this.searchTerm?.trim()
      ? this.expenses.filter(e => e.name.toLowerCase().includes(this.searchTerm.trim().toLowerCase()))
      : [...this.expenses];
    list = list.sort((a, b) => {
      let cmp = 0;
      if (this.sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (this.sortBy === 'amount') cmp = Number(a.amount) - Number(b.amount);
      else cmp = new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
      return this.sortAsc ? cmp : -cmp;
    });
    return list;
  }

  private readonly expenseTypeIcons: Record<string, string> = {
    'Alimentari':    'fa-basket-shopping',
    'Ristorante':    'fa-utensils',
    'Trasporti':     'fa-car',
    'Alloggio':      'fa-house',
    'Svago':         'fa-masks-theater',
    'Salute':        'fa-heart-pulse',
    'Abbigliamento': 'fa-shirt',
    'Utenze':        'fa-bolt',
    'Altro':         'fa-circle-question',
  };

  expenseTypeIcon(type: string | null): string {
    return type ? (this.expenseTypeIcons[type] ?? 'fa-tag') : 'fa-tag';
  }

  private readonly expenseTypeAccents: Record<string, string> = {
    'Alimentari':    '#00d88a',
    'Ristorante':    '#f59e0b',
    'Trasporti':     '#a78bfa',
    'Alloggio':      '#60a5fa',
    'Svago':         '#f59e0b',
    'Salute':        '#f87171',
    'Abbigliamento': '#e879f9',
    'Utenze':        '#f87171',
    'Altro':         '#7b849e',
  };

  expenseTypeAccent(type: string | null): string {
    return type ? (this.expenseTypeAccents[type] ?? '#00b37e') : '#00b37e';
  }

  expenseDateString(expense: Expense): string {
    return expense.expense_date ? DateUtils.dateToString(new Date(expense.expense_date)) : '';
  }

  hasBeenModified(expense: Expense): boolean {
    return !!expense.updated_at && !!expense.modified_by;
  }

  formatToEur(amount: number): string {
    return MathUtils.formatToEur(amount);
  }
}

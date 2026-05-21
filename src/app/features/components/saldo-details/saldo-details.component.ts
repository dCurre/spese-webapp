import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { SaldoDetails } from './list-details-dialog-fields';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListParticipant } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant';
import MathUtils from 'src/app/shared/utils/math-utils';

@Component({
  selector: 'app-saldo-details',
  templateUrl: './saldo-details.component.html',
  styleUrls: ['./saldo-details.component.css']
})
export class SaldoDetailsComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public pieChartType: 'doughnut' = 'doughnut';
  public pieChartPlugins = [ChartDataLabels];
  public pieChartOptions: ChartConfiguration<'doughnut'>['options'];
  public pieChartData: ChartData<'doughnut', number[], string | string[]>;
  private expensesListTotalAmount: number = 0;
  protected mapPagato = new Map<string, number>();
  protected balanceDetails: SaldoDetails[] = [];
  protected partecipantsList: ExpensesListParticipant[] = [];
  protected ownerUserId: number | null = null;
  protected panelOpenState = false;
  @Input() showParticipants: boolean = true;
  @Output() removeGuest = new EventEmitter<number>();

  private _groupBy: 'person' | 'type' = 'person';
  @Input() set groupBy(value: 'person' | 'type') {
    this._groupBy = value;
    if (this._expensesList) this.processData(this._expensesList, this._expenses);
  }
  get groupBy(): 'person' | 'type' { return this._groupBy; }

  protected partecipantiOpen = false;
  protected chartOpen = true;
  protected dataLoaded = false;
  protected chartColors = ['#00b37e', '#a78bfa', '#60a5fa', '#f59e0b', '#f87171', '#8b5cf6'];

  @Input() set expensesList(list: ExpensesList | null) {
    if (list) this.processData(list, this._expenses);
  }

  @Input() set expenses(expenses: Expense[]) {
    this._expenses = expenses;
    if (this._expensesList) this.processData(this._expensesList, expenses);
  }

  private _expenses: Expense[] = [];
  private _expensesList: ExpensesList | null = null;

  constructor() {}

  ngOnInit(): void {}

  private processData(list: ExpensesList, expenses: Expense[]) {
    this._expensesList = list;
    this.ownerUserId = list.user_id;
    const sorted = (list.participants ?? []).sort((a, b) =>
      `${a.name} ${a.surname ?? ''}`.localeCompare(`${b.name} ${b.surname ?? ''}`)
    );
    const owner = sorted.find(p => p.user_id === list.user_id);
    const others = sorted.filter(p => p.user_id !== list.user_id);
    this.partecipantsList = owner ? [owner, ...others] : others;

    this.expensesListTotalAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

    this.mapPagato = new Map();
    expenses.forEach(e => {
      const key = this.groupBy === 'type'
        ? (e.expense_type ?? 'Altro')
        : `${e.owner.name} ${e.owner.surname ?? ''}`;
      this.mapPagato.set(key, (this.mapPagato.get(key) ?? 0) + Number(e.amount));
    });

    this.mapPagato = new Map([...this.mapPagato.entries()].sort());

    this.balanceDetails = [];
    this.mapPagato.forEach((buyerPaid, buyer) => {
      this.mapPagato.forEach((receiverPaid, receiver) => {
        if (buyer !== receiver) {
          this.balanceDetails.push(new SaldoDetails(buyer, receiver, (receiverPaid - buyerPaid) / this.mapPagato.size));
        }
      });
    });

    this.dataLoaded = true;
    this.fillChart();
  }

  private fillChart() {
    this.pieChartData = {
      labels: Array.from(this.mapPagato.keys()),
      datasets: [{
        data: Array.from(this.mapPagato.values()),
        borderWidth: 3,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-card').trim() || '#181e2e',
        backgroundColor: this.chartColors,
        hoverOffset: 6,
      }]
    };

    this.pieChartOptions = {
      cutout: '62%',
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${MathUtils.formatToEur(ctx.parsed)}`
          }
        },
      }
    };
  }

  formatToEur(amount: number) {
    return MathUtils.formatToEur(amount);
  }

  filterByElement(balanceDetails: SaldoDetails[], filterKey: string) {
    return balanceDetails.filter(obj => obj.buyer === filterKey);
  }
}

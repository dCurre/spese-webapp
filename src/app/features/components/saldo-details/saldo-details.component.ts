import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { forkJoin } from 'rxjs';
import { SaldoDetails } from './list-details-dialog-fields';
import { ExpenseService } from 'src/app/core/services/postgres/expense/expense.service';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListParticipant } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant';
import MathUtils from 'src/app/shared/utils/math-utils';

@Component({
  selector: 'app-saldo-details',
  templateUrl: './saldo-details.component.html',
  styleUrls: ['./saldo-details.component.css']
})
export class SaldoDetailsComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ChartDataLabels];
  public pieChartOptions: ChartConfiguration['options'];
  public pieChartData: ChartData<'pie', number[], string | string[]>;
  private listID: number;
  private expensesListTotalAmount: number = 0;
  protected mapPagato = new Map<string, number>();
  protected balanceDetails: SaldoDetails[] = [];
  protected partecipantsList: ExpensesListParticipant[] = [];
  protected ownerUserId: number | null = null;
  protected panelOpenState = false;
  protected partecipantiOpen = false;
  protected chartOpen = true;
  protected dataLoaded = false;
  protected chartColors = ['#00b37e', '#1a1f2e', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  @Input() set listId(id: number) {
    if (id) this.loadData(id);
  }

  constructor(
    private pgExpenseService: ExpenseService,
    private pgExpensesListService: ExpensesListService,
  ) {}

  ngOnInit(): void {}

  private loadData(id: number) {
    forkJoin({
      list: this.pgExpensesListService.getById(id),
      expenses: this.pgExpenseService.getByListId(id),
    }).subscribe({
      next: ({ list, expenses: res }) => {
        this.ownerUserId = list.user_id;
        const sorted = (list.participants ?? []).sort((a, b) =>
          `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`)
        );
        const owner = sorted.find(p => p.user_id === list.user_id);
        const others = sorted.filter(p => p.user_id !== list.user_id);
        this.partecipantsList = owner ? [owner, ...others] : others;

        const expenseList = res.expenses;

        this.expensesListTotalAmount = expenseList.reduce((acc, e) => acc + Number(e.amount), 0);

        this.mapPagato = new Map();
        expenseList.forEach(e => {
          const buyer = `${e.owner.name} ${e.owner.surname}`;
          this.mapPagato.set(buyer, (this.mapPagato.get(buyer) ?? 0) + Number(e.amount));
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
      },
      error: (e) => console.error('SaldoDetailsComponent.getSaldoDetails: ', e)
    });
  }

  private fillChart() {
    this.pieChartData = {
      labels: Array.from(this.mapPagato.keys()),
      datasets: [{
        data: Array.from(this.mapPagato.values()),
        borderWidth: 1,
        backgroundColor: [
          '#00b37e',
          '#1a1f2e',
          '#6366f1',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
      }]
    };

    this.pieChartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        datalabels: {
          color: ['white'],
          formatter: (value, ctx) => {
            if (ctx.chart.data.labels) {
              return MathUtils.formatToEur(value);
            }
          },
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
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
  private listID: number = Number(this.route.snapshot.paramMap.get('id'));
  private expensesListTotalAmount: number = 0;
  protected mapPagato = new Map<string, number>();
  protected balanceDetails: SaldoDetails[] = [];
  protected partecipantsList: ExpensesListParticipant[] = [];
  protected panelOpenState = false;
  protected partecipantiOpen = false;

  constructor(
    private route: ActivatedRoute,
    private pgExpenseService: ExpenseService,
    private pgExpensesListService: ExpensesListService,
  ) {}

  ngOnInit(): void {
    this.loadData(this.listID);
  }

  private loadData(id: number) {
    forkJoin({
      list: this.pgExpensesListService.getById(id),
      expenses: this.pgExpenseService.getByListId(id),
    }).subscribe({
      next: ({ list, expenses: res }) => {
        this.partecipantsList = (list.participants ?? []).sort((a, b) =>
          `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`)
        );

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
          '#7C4DFF',
          '#69A197',
          '#8BBCCC',
          '#4C6793',
          '#ADDDD0',
        ],
      }]
    };

    this.pieChartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Totale: ' + MathUtils.formatToEur(this.expensesListTotalAmount),
          font: { weight: 'bold', size: 24 },
          color: '',
          padding: { top: 30, bottom: -1000 },
        },
        legend: {
          display: true,
          position: 'right',
          labels: { font: { size: 16 }, color: 'black' }
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

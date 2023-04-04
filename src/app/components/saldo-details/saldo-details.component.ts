import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from 'src/app/services/firestore/expense/expense.service';
import { first } from 'rxjs';
import MathUtils from 'src/app/utils/math-utils';
import { SaldoDetails } from './list-details-dialog-fields';
import { AppComponent } from 'src/app/app.component';

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
  private listID: string = this.route.snapshot.paramMap.get('id')!!;
  private expensesListTotalAmount: number = 0;
  protected mapPagato = new Map<string, number>();
  protected balanceDetails: SaldoDetails[] = [];

  constructor(
    private appComponent: AppComponent,
    private route: ActivatedRoute,
    private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.getSaldoDetails(this.listID)

    this.appComponent.showSpinner = false; //TODO: trovare un modo più intelligente per nascondere lo spinner
  }

  getSaldoDetails(id: string) {
    try {
      this.expenseService.getExpensesByListID(id).pipe(first()).subscribe(expenseList => {
        //Calcolo il totale di tutte le spese
        this.expensesListTotalAmount = expenseList.reduce((accumulator, current) => { return accumulator + current.amount; }, 0);

        //Calcolo il totale per utente
        [...new Set(expenseList.map(a => a.buyer))].forEach(user => {
          this.mapPagato.set(user, expenseList.filter(expenseFiltered => expenseFiltered.buyer == user).reduce((accumulator, current) => { return accumulator + current.amount; }, 0));
        });

        //Calcolo il totale dovuto per ogni utente
        this.mapPagato.forEach((buyerPaid: number, buyer: string) => {
          this.mapPagato.forEach((receiverPaid: number, receiver: string) => {
            if (buyer != receiver) {
              this.balanceDetails.push(new SaldoDetails(buyer, receiver, (receiverPaid - buyerPaid) / this.mapPagato.size))
            }
          });
        });

        this.fillChart();
      });
    } catch (e) {
      console.error("SaldoDetailsComponent.getSaldoDetails: ", e)
    }
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
          font: {
            weight: 'bold',
            size: 24,
          },
          color: '',
          padding: {
            top: 30,
            bottom: -1000
          },
        },
        legend: {
          display: true,
          position: 'right',
          labels: {
            font: {
              size: 16,
            },
            color: 'black',
          }
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
  
  filterByElement(balanceDetails: SaldoDetails[], filterKey: string){
    return balanceDetails.filter((obj) => { return obj.buyer === filterKey;});
  }
}

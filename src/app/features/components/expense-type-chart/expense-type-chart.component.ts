import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ExpenseService } from 'src/app/core/services/postgres/expense/expense.service';
import MathUtils from 'src/app/shared/utils/math-utils';

@Component({
  selector: 'app-expense-type-chart',
  templateUrl: './expense-type-chart.component.html',
  styleUrls: ['./expense-type-chart.component.css']
})
export class ExpenseTypeChartComponent {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ChartDataLabels];
  public pieChartOptions: ChartConfiguration['options'];
  public pieChartData: ChartData<'pie', number[], string | string[]>;
  protected chartOpen = true;
  protected dataLoaded = false;
  protected mapTipologia = new Map<string, number>();
  protected readonly chartColors = ['#00b37e', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#1a1f2e', '#0ea5e9', '#ec4899'];

  private _listId: number;

  @Input() set listId(id: number) {
    if (id) { this._listId = id; this.loadData(id); }
  }

  @Input() set refreshTrigger(val: any) {
    if (this._listId) this.loadData(this._listId);
  }

  constructor(private pgExpenseService: ExpenseService) {}

  private loadData(id: number) {
    this.pgExpenseService.getByListId(id).subscribe({
      next: (res) => {
        this.mapTipologia = new Map();
        res.expenses.forEach(e => {
          const tipo = e.expense_type ?? 'Altro';
          this.mapTipologia.set(tipo, (this.mapTipologia.get(tipo) ?? 0) + Number(e.amount));
        });
        this.mapTipologia = new Map([...this.mapTipologia.entries()].sort());
        this.dataLoaded = true;
        this.fillChart();
      },
      error: (e) => console.error('ExpenseTypeChartComponent.loadData:', e)
    });
  }

  private fillChart() {
    this.pieChartData = {
      labels: Array.from(this.mapTipologia.keys()),
      datasets: [{
        data: Array.from(this.mapTipologia.values()),
        borderWidth: 1,
        backgroundColor: this.chartColors,
      }]
    };

    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: {
          color: 'white',
          formatter: (value) => MathUtils.formatToEur(value),
        },
      }
    };
  }

  formatToEur(amount: number) {
    return MathUtils.formatToEur(amount);
  }
}

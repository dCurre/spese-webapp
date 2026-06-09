import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartData, ChartOptions } from 'chart.js';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Product, ProductService } from 'src/app/core/services/postgres/product/product.service';
import { Granularity, Purchase, PurchaseService } from 'src/app/core/services/postgres/purchase/purchase.service';
import { NewProductDialogComponent } from '../dialog/new-product-dialog/new-product-dialog.component';
import { NewPurchaseDialogComponent } from '../dialog/new-purchase-dialog/new-purchase-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-price-history-detail',
  templateUrl: './price-history-detail.component.html',
  styleUrls: ['./price-history-detail.component.css'],
})
export class PriceHistoryDetailComponent implements OnInit {
  protected product: Product | null = null;
  protected purchases: Purchase[] = [];
  protected hasLoaded = false;
  protected loadError = false;

  protected granularity: Granularity = 'month';
  protected chartHasLoaded = false;

  protected chartData: ChartData<'line'> = { labels: [], datasets: [] };
  protected chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `€ ${ctx.parsed.y.toFixed(4)} / ${this.product?.default_unit_symbol ?? 'u.'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { size: 11 },
          callback: (v) => `€ ${Number(v).toFixed(2)}`,
        },
      },
    },
  };

  private loggedUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.authService.getUser().then((u) => {
      this.loggedUserId = u?.id ?? null;
    });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  private loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loadPurchases(id);
        this.loadChart(id);
      },
      error: () => {
        this.hasLoaded = true;
        this.loadError = true;
      },
    });
  }

  private loadPurchases(id: number): void {
    this.purchaseService.getByProduct(id).subscribe({
      next: (res) => {
        this.purchases = res.purchases;
        this.hasLoaded = true;
        this.loadError = false;
      },
      error: () => {
        this.hasLoaded = true;
        this.loadError = true;
      },
    });
  }

  private loadChart(id: number): void {
    this.chartHasLoaded = false;
    this.purchaseService.getPriceHistory(id, this.granularity).subscribe({
      next: (res) => {
        this.chartData = {
          labels: res.data.map((d) => d.period),
          datasets: [
            {
              label: `€ / ${res.unit_symbol ?? 'u.'}`,
              data: res.data.map((d) => d.avg_unit_price),
              borderColor: '#00b37e',
              backgroundColor: 'rgba(0,179,126,0.08)',
              pointBackgroundColor: '#00b37e',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0.3,
            },
          ],
        };
        this.chartHasLoaded = true;
      },
      error: () => {
        this.chartHasLoaded = true;
      },
    });
  }

  protected setGranularity(g: Granularity): void {
    this.granularity = g;
    if (this.product) this.loadChart(this.product.id);
  }

  protected retry(): void {
    this.hasLoaded = false;
    this.loadError = false;
    if (this.product) {
      this.loadPurchases(this.product.id);
      this.loadChart(this.product.id);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/price-history']);
  }

  protected openEditProduct(): void {
    if (!this.product) return;
    const modal = this.modalService.open(NewProductDialogComponent, { centered: true });
    modal.componentInstance.product = this.product;
    modal.result
      .then((updated) => {
        if (!updated) return;
        this.product = { ...this.product!, ...updated };
      })
      .catch(() => {});
  }

  protected openNewPurchase(): void {
    if (!this.product || !this.loggedUserId) return;
    const modal = this.modalService.open(NewPurchaseDialogComponent, { centered: true });
    modal.componentInstance.productId = this.product.id;
    modal.componentInstance.userId = this.loggedUserId;
    modal.componentInstance.defaultUnitId = this.product.default_unit_id;
    modal.componentInstance.defaultUnitSymbol = this.product.default_unit_symbol ?? '';
    modal.result
      .then((created) => {
        if (!created) return;
        this.loadPurchases(this.product!.id);
        this.loadChart(this.product!.id);
      })
      .catch(() => {});
  }

  protected openEditPurchase(purchase: Purchase): void {
    const modal = this.modalService.open(NewPurchaseDialogComponent, { centered: true });
    modal.componentInstance.productId = purchase.product_id;
    modal.componentInstance.userId = purchase.user_id;
    modal.componentInstance.defaultUnitId = this.product!.default_unit_id;
    modal.componentInstance.defaultUnitSymbol = this.product!.default_unit_symbol ?? '';
    modal.componentInstance.purchase = purchase;
    modal.result
      .then((updated) => {
        if (!updated) return;
        this.loadPurchases(this.product!.id);
        this.loadChart(this.product!.id);
      })
      .catch(() => {});
  }

  protected deletePurchase(purchase: Purchase): void {
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.title = 'Elimina acquisto';
    modal.componentInstance.message = `Eliminare l'acquisto del ${purchase.purchased_at}?`;
    modal.result
      .then((confirmed) => {
        if (!confirmed) return;
        this.purchaseService.delete(purchase.id).subscribe({
          next: () => {
            this.loadPurchases(this.product!.id);
            this.loadChart(this.product!.id);
          },
        });
      })
      .catch(() => {});
  }

  protected deleteProduct(): void {
    if (!this.product) return;
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.title = 'Elimina prodotto';
    modal.componentInstance.message = `Eliminare "${this.product.name}" e tutto il suo storico?`;
    modal.result
      .then((confirmed) => {
        if (!confirmed) return;
        this.productService.delete(this.product!.id).subscribe({
          next: () => this.router.navigate(['/price-history']),
        });
      })
      .catch(() => {});
  }
}

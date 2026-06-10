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
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';

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
          label: (ctx) => `€ ${ctx.parsed.y.toFixed(2)} / ${this.product?.default_unit_symbol ?? 'u.'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { font: { size: 11 }, color: 'rgba(255,255,255,0.45)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          font: { size: 11 },
          color: 'rgba(255,255,255,0.45)',
          callback: (v) => `€ ${Number(v).toFixed(2)}`,
        },
      },
    },
  };

  protected readonly dotColors = ['#00b37e', '#6366f1', '#f59e0b', '#06b6d4', '#a78bfa', '#fb923c'];
  protected sortDesc = true;

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

  protected get stats() {
    if (!this.purchases.length) return null;
    const sorted = [...this.purchases].sort((a, b) =>
      b.purchased_at.localeCompare(a.purchased_at),
    );
    const latest = sorted[0];
    const previous = sorted[1];
    const currentUnitPrice = latest.unit_price ?? null;

    const totalSpent = this.purchases.reduce((s, p) => s + p.price, 0);
    const totalQty = this.purchases.reduce((s, p) => s + p.quantity, 0);
    const avgQty = totalQty / this.purchases.length;
    const unitSymbol = latest.unit_symbol ?? this.product?.default_unit_symbol ?? '';

    const lastDateStr = new Date(latest.purchased_at + 'T00:00:00').toLocaleDateString('it-IT', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    const allTimeLowPurchase = [...this.purchases].reduce((min, p) =>
      p.unit_price < min.unit_price ? p : min,
    );
    const allTimeLowPrice = allTimeLowPurchase.unit_price;
    const allTimeLowDateStr = new Date(allTimeLowPurchase.purchased_at + 'T00:00:00').toLocaleDateString('it-IT', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const allTimeLowStore = allTimeLowPurchase.store ?? null;

    const priceChangePercent =
      currentUnitPrice != null && this.purchases.length > 1 && currentUnitPrice !== allTimeLowPrice
        ? ((currentUnitPrice - allTimeLowPrice) / allTimeLowPrice) * 100
        : null;
    const isAllTimeLow = this.purchases.length > 1 && currentUnitPrice === allTimeLowPrice;

    return {
      currentUnitPrice,
      unitSymbol,
      priceChangePercent,
      isAllTimeLow,
      totalSpent,
      totalQty,
      avgQty,
      lastDateStr,
      allTimeLowPrice,
      allTimeLowDateStr,
      allTimeLowStore,
      count: this.purchases.length,
    };
  }

  protected dotColor(i: number): string {
    return this.dotColors[i % this.dotColors.length];
  }

  protected toggleSort(): void {
    this.sortDesc = !this.sortDesc;
  }

  protected get sortedPurchases(): Purchase[] {
    return [...this.purchases].sort((a, b) =>
      this.sortDesc
        ? b.purchased_at.localeCompare(a.purchased_at)
        : a.purchased_at.localeCompare(b.purchased_at),
    );
  }

  protected get groupedPurchases(): { month: string; items: Purchase[] }[] {
    const groups: { month: string; items: Purchase[] }[] = [];
    for (const p of this.sortedPurchases) {
      const month = new Date(p.purchased_at + 'T00:00:00')
        .toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
        .toUpperCase();
      const existing = groups.find((g) => g.month === month);
      if (existing) existing.items.push(p);
      else groups.push({ month, items: [p] });
    }
    return groups;
  }

  protected purchaseFlatIndex(p: Purchase): number {
    return this.sortedPurchases.findIndex((x) => x.id === p.id);
  }

  protected formatDate(s: string): string {
    return new Date(s + 'T00:00:00').toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
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
        const values = res.data.map((d) => d.avg_unit_price);
        const yMin = values.length ? Math.min(...values) * 0.95 : 0;
        this.chartOptions = {
          ...this.chartOptions,
          scales: {
            x: (this.chartOptions.scales as any)?.['x'],
            y: { ...(this.chartOptions.scales as any)?.['y'], min: yMin },
          },
        };
        this.chartData = {
          labels: res.data.map((d) => d.period),
          datasets: [
            {
              label: `€ / ${res.unit_symbol ?? 'u.'}`,
              data: values,
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
        this.productService.getById(this.product!.id).subscribe((p) => {
          this.product = p;
        });
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
    modal.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina acquisto',
      `Eliminare l'acquisto del ${this.formatDate(purchase.purchased_at)}?`,
    );
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
    modal.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina prodotto',
      `Eliminare "${this.product.name}" e tutto il suo storico?`,
    );
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

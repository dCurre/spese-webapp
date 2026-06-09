import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Purchase, PurchaseService } from 'src/app/core/services/postgres/purchase/purchase.service';

interface StoreSuggestion {
  short: string;
  detail: string;
}

@Component({
  selector: 'app-new-purchase-dialog',
  templateUrl: './new-purchase-dialog.component.html',
  styleUrls: ['./new-purchase-dialog.component.css'],
})
export class NewPurchaseDialogComponent implements OnInit, OnDestroy {
  @Input() productId!: number;
  @Input() userId!: number;
  @Input() defaultUnitId!: number;
  @Input() defaultUnitSymbol = '';
  @Input() purchase: Purchase | null = null;

  protected purchasedAt = '';
  protected price: number | null = null;
  protected quantity: number | null = 1;
  protected store = '';
  protected notes = '';
  protected saving = false;

  protected storeSuggestions: StoreSuggestion[] = [];
  protected showStoreSuggestions = false;

  private storeSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public modal: NgbActiveModal,
    private purchaseService: PurchaseService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (this.purchase) {
      this.purchasedAt = this.purchase.purchased_at;
      this.price = this.purchase.price;
      this.quantity = this.purchase.quantity;
      this.store = this.purchase.store ?? '';
      this.notes = this.purchase.notes ?? '';
    } else {
      this.purchasedAt = new Date().toISOString().split('T')[0];
    }

    this.storeSearch$
      .pipe(
        debounceTime(450),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.length < 3) return of([]);
          return this.http
            .get<any[]>('https://nominatim.openstreetmap.org/search', {
              params: { q, format: 'json', limit: '6', addressdetails: '1' },
              headers: { 'Accept-Language': 'it' },
            })
            .pipe(catchError(() => of([])));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.storeSuggestions = results.map((r) => this.formatSuggestion(r));
        this.showStoreSuggestions = this.storeSuggestions.length > 0;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onStoreInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.store = val;
    this.storeSearch$.next(val);
  }

  protected onStoreBlur(): void {
    setTimeout(() => (this.showStoreSuggestions = false), 200);
  }

  protected selectStore(s: StoreSuggestion): void {
    this.store = s.short;
    this.showStoreSuggestions = false;
  }

  private formatSuggestion(r: any): StoreSuggestion {
    const parts = (r.display_name as string).split(', ');
    const name = parts[0];
    const addr = r.address ?? {};
    const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? '';
    return {
      short: city ? `${name}, ${city}` : name,
      detail: r.display_name,
    };
  }

  protected get isEdit(): boolean {
    return !!this.purchase;
  }

  protected get unitPrice(): number | null {
    if (!this.price || !this.quantity || this.quantity <= 0) return null;
    return this.price / this.quantity;
  }

  protected get canSave(): boolean {
    return (
      !!this.purchasedAt &&
      this.price !== null && this.price > 0 &&
      this.quantity !== null && this.quantity > 0 &&
      !this.saving
    );
  }

  protected save(): void {
    if (!this.canSave) return;
    this.saving = true;
    const payload = {
      purchased_at: this.purchasedAt,
      price: this.price!,
      quantity: this.quantity!,
      unit_id: this.defaultUnitId,
      store: this.store.trim() || null,
      notes: this.notes.trim() || null,
    };

    if (this.isEdit) {
      this.purchaseService.update(this.purchase!.id, payload).subscribe({
        next: () => this.modal.close(payload),
        error: () => (this.saving = false),
      });
    } else {
      this.purchaseService.create({ product_id: this.productId, user_id: this.userId, ...payload }).subscribe({
        next: () => this.modal.close(payload),
        error: () => (this.saving = false),
      });
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Purchase, PurchaseService } from 'src/app/core/services/postgres/purchase/purchase.service';

@Component({
  selector: 'app-new-purchase-dialog',
  templateUrl: './new-purchase-dialog.component.html',
  styleUrls: ['./new-purchase-dialog.component.css'],
})
export class NewPurchaseDialogComponent implements OnInit {
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

  constructor(
    public modal: NgbActiveModal,
    private purchaseService: PurchaseService,
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

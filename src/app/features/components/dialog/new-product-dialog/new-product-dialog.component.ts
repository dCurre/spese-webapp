import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MeasurementUnit, MeasurementUnitService } from 'src/app/core/services/postgres/measurement-unit/measurement-unit.service';
import { Product, ProductService } from 'src/app/core/services/postgres/product/product.service';

@Component({
  selector: 'app-new-product-dialog',
  templateUrl: './new-product-dialog.component.html',
  styleUrls: ['./new-product-dialog.component.css'],
})
export class NewProductDialogComponent implements OnInit {
  @Input() product: Product | null = null;

  protected name = '';
  protected brand = '';
  protected defaultUnitId: number | null = null;
  protected units: MeasurementUnit[] = [];
  protected saving = false;

  constructor(
    public modal: NgbActiveModal,
    private productService: ProductService,
    private measurementUnitService: MeasurementUnitService,
  ) {}

  ngOnInit(): void {
    if (this.product) {
      this.name = this.product.name;
      this.brand = this.product.brand ?? '';
      this.defaultUnitId = this.product.default_unit_id;
    }
    this.measurementUnitService.getAll().subscribe({
      next: (res) => (this.units = res.measurement_units),
    });
  }

  protected get isEdit(): boolean {
    return !!this.product;
  }

  protected get canSave(): boolean {
    return this.name.trim().length > 0 && !!this.defaultUnitId && !this.saving;
  }

  protected save(): void {
    if (!this.canSave) return;
    this.saving = true;
    const payload = {
      name: this.name.trim(),
      brand: this.brand.trim() || null,
      default_unit_id: this.defaultUnitId,
    };

    if (this.isEdit) {
      this.productService.update(this.product!.id, payload).subscribe({
        next: () => this.modal.close({ ...this.product, ...payload }),
        error: () => (this.saving = false),
      });
    } else {
      this.productService.create(payload).subscribe({
        next: (res) => this.modal.close({ id: res.id, ...payload, default_unit_symbol: null }),
        error: () => (this.saving = false),
      });
    }
  }
}

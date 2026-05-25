import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [`:host { display: contents; }`],
})
export class ItemEditFormComponent implements OnInit {
  @Input() name = '';
  @Input() quantity: number | null = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<{ name: string; quantity: number | null }>();
  @Output() cancel = new EventEmitter<void>();

  protected editName = '';
  protected editQty: number | null = null;

  ngOnInit(): void {
    this.editName = this.name;
    this.editQty = this.quantity;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onSave();
    if (event.key === 'Escape') this.cancel.emit();
  }

  protected onSave(): void {
    if (!this.editName.trim() || this.saving) return;
    const qty = (this.editQty && this.editQty > 0) ? this.editQty : null;
    this.save.emit({ name: this.editName.trim(), quantity: qty });
  }
}

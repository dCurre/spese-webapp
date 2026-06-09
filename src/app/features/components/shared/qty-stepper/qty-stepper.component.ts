import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-qty-stepper',
  templateUrl: './qty-stepper.component.html',
  styleUrls: ['./qty-stepper.component.css'],
})
export class QtyStepperComponent {
  @Input() value: number | null | undefined = null;
  @Output() valueChange = new EventEmitter<number | null>();
  @Input() step = 1;
  @Input() min = 1;
  @Input() allowNull = false;
  @Input() nullLabel = '—';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' = 'md';

  protected get displayValue(): string {
    return this.value != null ? String(this.value) : this.nullLabel;
  }

  protected get canDecrement(): boolean {
    if (this.disabled || this.value == null) return false;
    return this.allowNull ? true : this.value > this.min;
  }

  protected increment(): void {
    const next = Math.round(((this.value ?? 0) + this.step) * 10000) / 10000;
    this.valueChange.emit(next);
  }

  protected decrement(): void {
    if (this.value == null) return;
    const next = Math.round((this.value - this.step) * 10000) / 10000;
    if (this.allowNull && next < this.min) {
      this.valueChange.emit(null);
    } else {
      this.valueChange.emit(Math.max(this.min, next));
    }
  }
}

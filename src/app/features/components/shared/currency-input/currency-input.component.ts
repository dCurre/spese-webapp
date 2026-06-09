import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.css'],
})
export class CurrencyInputComponent {
  @Input() value: number | null | undefined = null;
  @Output() valueChange = new EventEmitter<number | null>();
  @Input() currency = '€';
  @Input() placeholder = '0,00';
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() valid = false;

  @Output() blurred = new EventEmitter<void>();

  protected onInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.valueChange.emit(isNaN(val) ? null : val);
  }
}

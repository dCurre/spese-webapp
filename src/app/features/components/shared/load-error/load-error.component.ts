import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-load-error',
  templateUrl: './load-error.component.html',
  styleUrls: ['./load-error.component.css'],
})
export class LoadErrorComponent {
  @Input() message = 'Impossibile caricare i dati. Riprova più tardi.';
  @Output() retry = new EventEmitter<void>();
}

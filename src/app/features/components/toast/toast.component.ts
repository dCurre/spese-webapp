import { Component } from '@angular/core';
import { Toast, ToastService } from 'src/app/core/services/toast/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  host: { class: 'toast-container position-fixed end-0 p-3', style: 'z-index: 9999; bottom: 0' }
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  trackToast(_: number, toast: Toast) { return toast; }
}

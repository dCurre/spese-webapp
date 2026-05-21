import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-guest-dialog',
  templateUrl: './add-guest-dialog.component.html',
  styleUrls: ['./add-guest-dialog.component.css']
})
export class AddGuestDialogComponent {

  guestName = '';

  constructor(public modalService: NgbActiveModal) {}

  confirm(): void {
    const name = this.guestName.trim();
    if (!name) return;
    this.modalService.close(name);
  }
}

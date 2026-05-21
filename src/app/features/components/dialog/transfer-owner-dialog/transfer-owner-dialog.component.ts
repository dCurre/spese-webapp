import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesListParticipant } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant';

@Component({
  selector: 'app-transfer-owner-dialog',
  templateUrl: './transfer-owner-dialog.component.html',
  styleUrls: ['./transfer-owner-dialog.component.css']
})
export class TransferOwnerDialogComponent implements OnInit {

  @Input() participants: ExpensesListParticipant[] = [];
  @Input() listName: string = '';

  selectedUserId: number | null = null;

  constructor(public modalService: NgbActiveModal) {}

  ngOnInit(): void {}

  select(userId: number): void {
    this.selectedUserId = userId;
  }

  confirm(): void {
    if (!this.selectedUserId) return;
    this.modalService.close({ action: 'transfer', newOwnerId: this.selectedUserId });
  }

  deleteAndLeave(): void {
    this.modalService.close({ action: 'delete' });
  }

  initials(p: ExpensesListParticipant): string {
    return `${p.name?.[0] ?? ''}${p.surname?.[0] ?? ''}`.toUpperCase();
  }
}

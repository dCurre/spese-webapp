import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChecklistType } from 'src/app/core/services/postgres/shopping-list/shopping-list';

@Component({
  selector: 'app-new-checklist-dialog',
  templateUrl: './new-checklist-dialog.component.html',
  styleUrls: ['./new-checklist-dialog.component.css']
})
export class NewChecklistDialogComponent implements OnInit {
  protected name: string = '';
  protected selectedType: ChecklistType = 'personal';
  protected readonly maxLength = 40;

  constructor(public modalService: NgbActiveModal) {}

  ngOnInit(): void {}

  protected isValid(): boolean {
    return this.name.trim().length > 0 && this.name.trim().length <= this.maxLength;
  }

  protected confirm(): void {
    if (!this.isValid()) return;
    this.modalService.close({ name: this.name.trim(), list_type: this.selectedType });
  }
}

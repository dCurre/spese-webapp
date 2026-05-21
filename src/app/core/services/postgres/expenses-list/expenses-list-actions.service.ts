import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesList } from './expenses-list';
import { ExpensesListService } from './expenses-list.service';
import { ExpensesListParticipantService } from './expenses-list-participant.service';
import { UserService } from '../user/user.service';
import { DialogComponent } from 'src/app/features/components/dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from 'src/app/features/components/dialog/confirm-dialog/confirm-dialog-fields';
import { TransferOwnerDialogComponent } from 'src/app/features/components/dialog/transfer-owner-dialog/transfer-owner-dialog.component';

@Injectable({ providedIn: 'root' })
export class ExpensesListActionsService {

  constructor(
    private modalService: NgbModal,
    private afAuth: AngularFireAuth,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
  ) {}

  /**
   * Gestisce abbandono/eliminazione di una lista condivisa o eliminazione di una personale.
   * onSuccess viene chiamato dopo ogni azione completata con successo.
   */
  async deleteOrLeave(expensesList: ExpensesList, onSuccess: () => void): Promise<void> {
    const firebaseUser = await this.afAuth.currentUser;
    if (!firebaseUser?.email) return;
    const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
    if (!pgUser) return;

    const isPersonal = expensesList.list_type === 'personal';
    const isOwner = expensesList.user_id === pgUser.id;
    const otherParticipants = (expensesList.participants ?? []).filter(p => p.user_id !== pgUser.id && !p.is_guest);

    if (isPersonal || (isOwner && otherParticipants.length === 0)) {
      // Lista personale o owner senza altri: conferma ed elimina
      const message = isPersonal
        ? `Vuoi veramente eliminare ${expensesList.name}?`
        : `Sei l'unico membro di ${expensesList.name}. La lista verrà eliminata definitivamente.`;
      const modal = this.modalService.open(DialogComponent, { centered: true });
      modal.componentInstance.dialogFields = new ConfirmDialogFields('Elimina', message);
      modal.result.then(response => {
        if (!response) return;
        this.pgExpensesListService.delete(expensesList.id).subscribe({ next: onSuccess });
      }).catch(() => {});

    } else if (isOwner && otherParticipants.length > 0) {
      // Owner con altri partecipanti: trasferisci o elimina
      const modal = this.modalService.open(TransferOwnerDialogComponent, { centered: true });
      modal.componentInstance.participants = otherParticipants;
      modal.componentInstance.listName = expensesList.name;
      modal.result.then(result => {
        if (!result) return;
        if (result.action === 'transfer') {
          this.pgExpensesListService.transferOwner(expensesList.id, pgUser.id, result.newOwnerId).subscribe({ next: onSuccess });
        } else if (result.action === 'delete') {
          this.pgExpensesListService.delete(expensesList.id).subscribe({ next: onSuccess });
        }
      }).catch(() => {});

    } else {
      // Non owner: abbandona
      const modal = this.modalService.open(DialogComponent, { centered: true });
      modal.componentInstance.dialogFields = new ConfirmDialogFields(
        'Abbandona', `Vuoi veramente abbandonare ${expensesList.name}?`
      );
      modal.result.then(response => {
        if (!response) return;
        this.pgParticipantService.remove(expensesList.id, pgUser.id).subscribe({ next: onSuccess });
      }).catch(() => {});
    }
  }
}

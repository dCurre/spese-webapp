import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NewListDialogComponent } from '../dialog/new-list-dialog/new-list-dialog.component';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import { User } from 'src/app/core/services/postgres/user/user';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ExpensesListActionsService } from 'src/app/core/services/postgres/expenses-list/expenses-list-actions.service';
import GenericUtils from 'src/app/shared/utils/generic-utils';
import ListUtils from 'src/app/shared/utils/list-utils';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {

  protected allLists: ExpensesList[] = [];
  protected loggedUser: User | null = null;
  protected hasLoaded = false;
  protected loadError = false;
  private userEmail: string | null = null;
  protected searchTerm = '';
  protected sortBy: 'name' | 'date' = 'date';
  protected sortAsc = false;

  get expensesLists(): ExpensesList[] {
    return ListUtils.filterAndSort(this.allLists, this.searchTerm, this.sortBy, this.sortAsc);
  }

  get activeLists(): ExpensesList[] {
    return this.expensesLists.filter(l => !l.paid);
  }

  get settledLists(): ExpensesList[] {
    return this.expensesLists.filter(l => l.paid);
  }

  constructor(
    private afAuth: AngularFireAuth,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    private authService: AuthService,
    private modalService: NgbModal,
    private listActionsService: ExpensesListActionsService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  private load() {
    this.authService.getUser().then(pgUser => {
      if (!pgUser?.email) {
        this.hasLoaded = true;
        this.loadError = true;
        return;
      }
      this.userEmail = pgUser.email;
      this.loggedUser = pgUser;
      this.loadLists();
    }).catch(() => {
      this.hasLoaded = true;
      this.loadError = true;
    });
  }

  private loadLists() {
    if (!this.userEmail) return;
    this.pgUserService.getByEmailWithLists(this.userEmail).subscribe({
      next: (res) => {
        this.loggedUser = res.user;
        this.allLists = res.expenses_lists;
        this.hasLoaded = true;
        this.loadError = false;
        this.authService.setUser(res.user);
      },
      error: (e) => {
        console.error('ExpensesListComponent.load: ', e);
        this.hasLoaded = true;
        this.loadError = true;
      }
    });
  }

  private reloadLists() {
    if (!this.loggedUser) return;
    this.pgUserService.getByEmailWithLists(this.loggedUser.email).subscribe({
      next: (res) => this.allLists = res.expenses_lists,
      error: (e) => console.error('ExpensesListComponent.reloadLists: ', e)
    });
  }

  newList(userId: number) {
    const modal = this.modalService.open(NewListDialogComponent, { centered: true });

    modal.result.then((response) => {
      if (GenericUtils.isNullOrUndefined(response)) {
        return;
      }

      const { name, list_type } = response;
      this.pgExpensesListService.create({ name, user_id: userId, paid: false, list_type }).subscribe({
        next: (res) => {
          if (list_type === 'shared') {
            this.pgParticipantService.add(res.id, userId).subscribe({
              next: () => this.reloadLists(),
              error: (e) => console.error('ExpensesListComponent.newList add participant: ', e)
            });
          } else {
            this.reloadLists();
          }
        },
        error: (e) => console.error('ExpensesListComponent.newList: ', e)
      });
    }).catch(() => {});
  }

  deleteOrLeave(expensesList: ExpensesList) {
    this.listActionsService.deleteOrLeave(expensesList, () => this.reloadLists());
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  protected changePaidListsVisibility() {
    if (!this.loggedUser) return;
    this.loggedUser.paid_list_shown = !this.loggedUser.paid_list_shown;
    this.pgUserService.update(this.loggedUser.id, { paid_list_shown: this.loggedUser.paid_list_shown }).subscribe({
      next: () => this.reloadLists(),
      error: (e) => console.error('ExpensesListComponent.changePaidListsVisibility: ', e)
    });
  }

  protected archive() {}

  protected retry() {
    this.hasLoaded = false;
    this.loadError = false;
    this.authService.refreshUser();
    this.loadLists();
  }
}

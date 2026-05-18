import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import { UserService } from 'src/app/core/services/postgres/user/user.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  protected listID: number;
  protected expensesList: ExpensesList | null = null;
  protected maxUsers = 10;

  constructor(
    private route: ActivatedRoute,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    public afAuth: AngularFireAuth,
  ) {}

  ngOnInit(): void {
    this.getParams();
    this.getExpensesListDetails(this.listID);
  }

  getExpensesListDetails(id: number) {
    try {
      this.pgExpensesListService.getById(id).subscribe({
        next: (list) => this.expensesList = list,
        error: (e) => console.error('JoinComponent.getExpensesListDetails: ', e)
      });
    } catch (e) {
      console.error('JoinComponent.getExpensesListDetails: ', e);
    }
  }

  async addUserToList(id: number) {
    try {
      const firebaseUser = await this.afAuth.currentUser;
      if (!firebaseUser?.email) return;

      const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
      if (!pgUser) return;

      this.pgParticipantService.add(id, pgUser.id).subscribe({
        next: () => window.alert('Benvenuto nella lista ' + this.expensesList?.name),
        error: (e) => console.error('JoinComponent.addUserToList: ', e)
      });
    } catch (e) {
      console.error('JoinComponent.addUserToList: ', e);
    }
  }

  private getParams() {
    this.route.queryParams.subscribe(params => {
      this.listID = Number(params['list']);
    });
  }
}

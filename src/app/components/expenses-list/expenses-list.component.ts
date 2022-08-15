import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from '../../shared/services/firestore/expensesList/expenses-list.service';
import { ExpensesList } from '../../shared/services/firestore/expensesList/expenses-list';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/shared/services/firestore/user/user.service';
import { UserFieldsEnum } from 'src/app/shared/enums/userFieldsEnum';
import { User } from 'src/app/shared/services/firestore/user/user';
import DateUtils from 'src/app/utils/date-utils';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})

export class ExpensesListComponent implements OnInit {

  protected expensesLists$: Observable<ExpensesList[]>;
  protected listOwner$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    private expensesListService: ExpensesListService,
    private userService: UserService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getExpensesListsByLoggedUser()
    this.getListOwner()
  }

  async getExpensesListsByLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.expensesLists$ = this.expensesListService.getByUserId(user!!.uid);
      } catch (e) {
        console.error("HomeComponent.getLoggedUser: ", e)
      }
    });
  }

  async getListOwner() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.listOwner$ = this.userService.getUserByField(UserFieldsEnum.ID, user!!.uid);
      } catch (e) {
        console.error("HomeComponent.getLoggedUser: ", e)
      }
    });
  }

  timestampToDate(timestamp: string){
    return DateUtils.timestampToDate(timestamp);
  }

  leaveDialog(){
    this.dialog.open(DialogComponent, {
      width: '250px'
    });
  }
}

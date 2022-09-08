import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { first, Observable } from 'rxjs';
import { Constants } from 'src/app/services/firestore/constants/constants';
import { ConstantsService } from 'src/app/services/firestore/constants/constants.service';
import { ExpensesList } from 'src/app/services/firestore/expensesList/expenses-list';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  protected listID: string;
  protected constants$: Observable<Constants>;
  protected expensesList$: Observable<ExpensesList>;

  constructor(private route: ActivatedRoute,
    private constantsService: ConstantsService,
    private expensesListService: ExpensesListService,
    public afAuth: AngularFireAuth,) { }

  ngOnInit(): void {
    this.getParams();
    this.getConstants();
    this.getExpensesListDetails(this.listID)
  }

  async getConstants() {
    try {
      this.constants$ = this.constantsService.getConstants();
    } catch (e) {
      console.error("JoinComponent.getDynamicLinks: ", e)
    }
  }

  async getExpensesListDetails(id: string) {
    try {
      this.expensesList$ = this.expensesListService.getById(id);
    } catch (e) {
      console.error("JoinComponent.getExpensesListDetails: ", e)
    }
  }

  addUserToList(id: string) {
    this.expensesListService.getById(id).pipe(first()).subscribe(expensesList => {
      this.afAuth.authState.pipe(first()).subscribe(user => {
        try {
          expensesList.partecipants.push(user!!.uid)
          this.expensesListService.update(expensesList)
          window.alert("Benvenuto nella lista " + expensesList.name)
        } catch (e) {
          console.error("JoinComponent.addUserToList: ", e)
        }
      });

    })
  }

  private getParams() {
    this.route.queryParams
      .subscribe(params => {
        console.log(params['list']);
        this.listID = params['list']
      }
      );
  }

}

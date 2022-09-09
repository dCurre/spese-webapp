import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs';
import { ExpenseService } from 'src/app/services/firestore/expense/expense.service';
import MathUtils from 'src/app/utils/math-utils';
import { ListDetailsDialogFields, SaldoDetails } from './list-details-dialog-fields';

@Component({
  selector: 'app-list-details-dialog',
  templateUrl: './list-details-dialog.component.html',
  styleUrls: ['./list-details-dialog.component.css']
})
export class ListDetailsDialogComponent implements OnInit {

  @Input() dialogFields: ListDetailsDialogFields;
  protected expensesListTotalAmount: number = 0;
  protected balanceDetails: SaldoDetails[] = [];
  protected mapPagato = new Map<string, number>();

  constructor(public modalService: NgbActiveModal,
    private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.getSaldoDetails(this.dialogFields.expensesList.id)
  }

  formatToEur(amount: number) {
    return MathUtils.formatToEur(amount);
  }

  getSaldoDetails(id: string) {
    try {
      this.expenseService.getExpensesByListID(id).pipe(first()).subscribe(expenseList => {
        //Calcolo il totale di tutte le spese
        this.expensesListTotalAmount = expenseList.reduce((accumulator, current) => { return accumulator + current.amount; }, 0);

        //Calcolo il totale per utente
        [...new Set(expenseList.map(a => a.buyer))].forEach(user => {
          this.mapPagato.set(user, expenseList.filter(expenseFiltered => expenseFiltered.buyer == user).reduce((accumulator, current) => { return accumulator + current.amount; }, 0));
        });

        //Calcolo il totale dovuto per ogni utente
        this.mapPagato.forEach((buyerPaid: number, buyer: string) => {
          this.mapPagato.forEach((receiverPaid: number, receiver: string) => {
            if(buyer != receiver){
              this.balanceDetails.push(new SaldoDetails(buyer, receiver, (receiverPaid - buyerPaid)/this.mapPagato.size))
            }
          });
        });
      });
    } catch (e) {
      console.error("ListDetailsDialogComponent.getSaldoDetails: ", e)
    }
  }

  filterByElement(balanceDetails: SaldoDetails[], filterKey: string){
    return balanceDetails.filter((obj) => { return obj.buyer === filterKey;});
  }
}

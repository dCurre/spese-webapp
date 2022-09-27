import { ExpensesList } from "src/app/services/firestore/expensesList/expenses-list";

export class ListDetailsDialogFields{
    title: string;
    expensesList: ExpensesList

    constructor(title: string, expensesList: ExpensesList){
        this.title = title;
        this.expensesList = expensesList;
    }
}

export class SaldoDetails{
    buyer: string;
    receiver: string;
    toPay: number;

    constructor(buyer: string, receiver: string, toPay: number){
        this.buyer = buyer;
        this.receiver = receiver;
        this.toPay = toPay;
    }
}
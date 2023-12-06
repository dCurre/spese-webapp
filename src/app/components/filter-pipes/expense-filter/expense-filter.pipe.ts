import { PipeTransform, Pipe } from '@angular/core';
import { Expense } from 'src/app/services/firestore/expense/expense';

@Pipe({
    name: 'expenseFilter'
})
export class ExpenseFilterPipe implements PipeTransform {
    transform(expense: Expense[], searchTerm: string): Expense[] {
        if (!expense || !searchTerm) {
            return expense;
        }

        return expense.filter(expense =>
            (expense.expense.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) 
            || (expense.buyer.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1));
    }
}
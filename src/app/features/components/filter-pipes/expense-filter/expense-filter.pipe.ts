import { PipeTransform, Pipe } from '@angular/core';
import { Expense } from 'src/app/core/services/postgres/expense/expense';

@Pipe({
    name: 'expenseFilter'
})
export class ExpenseFilterPipe implements PipeTransform {
    transform(expenses: Expense[], searchTerm: string): Expense[] {
        if (!expenses || !searchTerm) {
            return expenses;
        }

        const term = searchTerm.toLowerCase();
        return expenses.filter(e =>
            e.name?.toLowerCase().includes(term)
            || e.owner?.name?.toLowerCase().includes(term)
            || e.owner?.surname?.toLowerCase().includes(term));
    }
}

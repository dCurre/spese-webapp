import { ExpensesListParticipant } from './expenses-list-participant';

export class ExpensesList {
    id: number;
    name: string;
    user_id: number;
    paid: boolean;
    created_at: string;
    participants: ExpensesListParticipant[];
}

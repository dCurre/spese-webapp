import { ExpensesListParticipant } from './expenses-list-participant';

export type ListType = 'shared' | 'personal';

export class ExpensesList {
    id: number;
    name: string;
    user_id: number;
    paid: boolean;
    created_at: string;
    list_type: ListType;
    max_participants?: number;
    participants?: ExpensesListParticipant[];
}

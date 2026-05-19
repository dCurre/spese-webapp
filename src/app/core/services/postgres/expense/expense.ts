import { User } from '../user/user';

export class Expense {
    id: number;
    name: string;
    amount: number;
    owner: User;
    expense_owner_user_id: number;
    updated_at: string;
    modified_by: number;
    expense_list_id: number;
    expense_date: string;
    created_at: string;
    expense_type_id: number | null;
    expense_type: string | null;
}

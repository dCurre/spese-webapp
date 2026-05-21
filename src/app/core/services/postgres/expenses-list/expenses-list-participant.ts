export class ExpensesListParticipant {
    user_id: number;
    expenses_list_id: number;
    joined_at: string;
    name: string;
    surname: string | null;
    email: string;
    profile_image: string;
    is_guest: boolean;
}

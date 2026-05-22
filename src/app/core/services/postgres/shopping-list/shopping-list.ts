export type ChecklistType = 'personal' | 'shared';

export class ShoppingItem {
    id: number;
    shopping_list_id: number;
    name: string;
    quantity: number | null;
    checked: boolean;
    sort_order: number;
    created_at: string;
}

export class ShoppingList {
    id: number;
    name: string;
    owner_id: number;
    list_type: ChecklistType;
    completed: boolean;
    starred: boolean;
    invite_token: string | null;
    created_at: string;
    items?: ShoppingItem[];
    items_count?: number;
    checked_count?: number;
    participants?: ShoppingListParticipant[];
}

export class ShoppingListParticipant {
    user_id: number;
    shopping_list_id: number;
    name: string;
    surname: string | null;
    email: string;
    profile_image: string;
    joined_at: string;
}

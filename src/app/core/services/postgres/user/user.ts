export class User {
    id: number;
    name: string;
    surname: string;
    email: string;
    profile_image: string;
    paid_list_shown: boolean;
    theme_preference: 'light' | 'dark' | 'auto';
    created_at: string;
    role: 'user' | 'admin' | 'superadmin' | null;
}

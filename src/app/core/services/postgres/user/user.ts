export class User {
    id: number;
    name: string;
    surname: string | null;
    email: string;
    profile_image: string;
    profile_images_history: string[];
    paid_list_shown: boolean;
    theme_preference: 'light' | 'dark' | 'auto';
    created_at: string;
    role: 'user' | 'admin' | 'superadmin' | null;
    is_guest: boolean;
}

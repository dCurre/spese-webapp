export const EXPENSE_TYPE_ICONS: Record<string, string> = {
    'Alimentari':    'fa-basket-shopping',
    'Ristorante':    'fa-utensils',
    'Trasporti':     'fa-car',
    'Alloggio':      'fa-house',
    'Svago':         'fa-masks-theater',
    'Salute':        'fa-heart-pulse',
    'Abbigliamento': 'fa-shirt',
    'Utenze':        'fa-bolt',
    'Altro':         'fa-circle-question',
};

export const EXPENSE_TYPE_ACCENTS: Record<string, string> = {
    'Alimentari':    '#00d88a',
    'Ristorante':    '#f59e0b',
    'Trasporti':     '#a78bfa',
    'Alloggio':      '#60a5fa',
    'Svago':         '#f59e0b',
    'Salute':        '#f87171',
    'Abbigliamento': '#e879f9',
    'Utenze':        '#f87171',
    'Altro':         '#7b849e',
};

export function expenseTypeIcon(type: string | null): string {
    return type ? (EXPENSE_TYPE_ICONS[type] ?? 'fa-tag') : 'fa-tag';
}

export function expenseTypeAccent(type: string | null): string {
    return type ? (EXPENSE_TYPE_ACCENTS[type] ?? '#00b37e') : '#00b37e';
}

import GenericUtils from "./generic-utils";

export default class ListUtils {
    static contains(list: any, value: any): boolean {
        if (GenericUtils.isNullOrUndefined(list) || GenericUtils.isNullOrUndefined(value))
            return false;

        return list.includes(value);
    }

    /** Filtra per nome e ordina per name|date una lista di oggetti con { name, created_at } */
    static filterAndSort<T extends { name: string; created_at: string }>(
        items: T[],
        searchTerm: string,
        sortBy: 'name' | 'date',
        sortAsc: boolean,
    ): T[] {
        let result = [...items];
        const term = searchTerm.trim().toLowerCase();
        if (term) result = result.filter(i => i.name.toLowerCase().includes(term));
        result.sort((a, b) => {
            const cmp = sortBy === 'name'
                ? a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
                : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return sortAsc ? cmp : -cmp;
        });
        return result;
    }

    /** Filtra per nome e ordina per name|date|amount una lista di spese */
    static filterAndSortExpenses<T extends { name: string; expense_date: string; amount: number | string }>(
        items: T[],
        searchTerm: string,
        sortBy: 'name' | 'date' | 'amount',
        sortAsc: boolean,
    ): T[] {
        let result = searchTerm?.trim()
            ? items.filter(e => e.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
            : [...items];
        result = result.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') cmp = a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
            else if (sortBy === 'amount') cmp = Number(a.amount) - Number(b.amount);
            else cmp = new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
            return sortAsc ? cmp : -cmp;
        });
        return result;
    }
}
export default class ListUtils {
    static contains(list: any, value: any): boolean {
        if (list == null || list == undefined)
            return false;

        if (value == null || value == undefined)
            return false;
        return list.includes(value)
    }
}
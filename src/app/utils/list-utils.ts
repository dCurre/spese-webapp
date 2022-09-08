export default class ListUtils {
    static contains(list: any, value: any): boolean {
        if (list == null || list == undefined)
            return false;

        if (value == null || value == undefined)
            return false;

        console.log("INCLUDES: " + list.includes(value))
        return list.includes(value)
    }
}
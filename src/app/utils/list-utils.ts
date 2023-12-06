import GenericUtils from "./generic-utils";

export default class ListUtils {
    static contains(list: any, value: any): boolean {
        if (GenericUtils.isNullOrUndefined(list) || GenericUtils.isNullOrUndefined(value))
            return false;

        return list.includes(value);
    }
}
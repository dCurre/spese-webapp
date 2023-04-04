import GenericUtils from "./generic-utils";

export default class StringUtils {
    static replaceSpecialCharsForLinks(string: string) {
        if(StringUtils.isNullOrEmpty(string)){
            return "";
        }

        string = string.replace("&","\%26"); // &
        return string;
    }

    static stringToNumber(value: string){
        return +value;
    }

    static equalsIgnoreCase(string1: String, string2: String){
        if(StringUtils.isNullOrEmpty(string1.toString()))
            return false;

        return string1.toUpperCase() === string2.toUpperCase();
    }
    
    static isNullOrEmpty(string: string) {
        return GenericUtils.isNullOrUndefined(string)
            || string.trim().length == 0;
    }
}
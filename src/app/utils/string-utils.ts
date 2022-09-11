
export default class StringUtils {
    static replaceSpecialCharsForLinks(string: string) {
        if(string === null || string === undefined){
            return "";
        }

        string = string.replace("&","\%26"); // &
        return string;
    }
}
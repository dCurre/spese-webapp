export default class DateUtils {
    static timestampToDate(timestamp: string) {
        var date = new Date(+timestamp * 1000);
        return date.getUTCDate() + "/"+ (date.getUTCMonth()+1) + "/" + date.getUTCFullYear();
    }
}
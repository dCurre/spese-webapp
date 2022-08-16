export default class DateUtils {
    static timestampToDate(timestamp: number) {
        var date = new Date(timestamp * 1000);
        return date.getDate() + "/"+ (date.getMonth()+1) + "/" + date.getFullYear();
    }

    static timestampToHour(timestamp: number) {
        var date = new Date(timestamp * 1000);
        return date.getHours() + ":" + date.getMinutes();
    }

    static getNowTimestamp(){
        return (new Date().getTime())/1000;
    }
}
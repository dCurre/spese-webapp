import MathUtils from './math-utils'

export default class DateUtils {
    static timestampToDateString(timestamp: number) {
        return DateUtils.dateToString(new Date(timestamp * 1000));
    }

    static timestampToHourString(timestamp: number) {
        var date = new Date(timestamp * 1000);
        return MathUtils.twoDigits(date.getHours()) + ":" + MathUtils.twoDigits(date.getMinutes());
    }

    static dateToTimestamp(date: Date) {
        return date.getTime() / 1000;
    }

    static getNowTimestamp() {
        return (new Date().getTime()) / 1000;
    }

    static dateToString(date: Date) {
        return MathUtils.twoDigits(date.getDate()) + "/" + MathUtils.twoDigits(date.getMonth() + 1) + "/" + date.getFullYear();
    }

    static ddmmyyyyToDate(date: string) {
        var parts = date.split('/');
        return new Date(+parts[2], +parts[1] - 1, +parts[0], new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    }

    // Converte yyyy-MM-dd (input[type=date]) in dd/MM/yyyy (formato backend)
    static isoStringToDateString(isoDate: string): string {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }

    // Converte una Date in yyyy-MM-dd per input[type=date]
    static dateToIsoString(date: Date): string {
        return date.getFullYear() + '-'
            + MathUtils.twoDigits(date.getMonth() + 1) + '-'
            + MathUtils.twoDigits(date.getDate());
    }
}

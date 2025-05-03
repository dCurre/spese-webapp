import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
        return date.getTime()/1000;
    }

    static getNowTimestamp(){
        return (new Date().getTime())/1000;
    }

    static dateToString(date: Date){
        return MathUtils.twoDigits(date.getDate()) + "/" + MathUtils.twoDigits(date.getMonth()+1) + "/" + date.getFullYear();
    }

    static ddmmyyyyToDate(date: string){
        var parts = date.split('/');
        return new Date(+parts[2], +parts[1] - 1, +parts[0], new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()); 
    }

    static ngbDateStructToDate(ngbDate: NgbDateStruct){
        return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    }

    static ngbDateStructToDateString(ngbDate: NgbDateStruct){
        return this.dateToString(this.ngbDateStructToDate(ngbDate));
    }

    static dateTongbDateStruct(date: Date){
        return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }
}
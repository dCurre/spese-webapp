import GenericUtils from "./generic-utils";

export default class MathUtils {

    static isMoreThanZero(n: number){
        return !GenericUtils.isNullOrUndefined(n) && n > 0;
    }

    static twoDigits(n: number) {
        return ('0'+n).slice(-2);
    }

    static formatAmount(amount: number){
        if(amount < 0){
            amount = 0;
        }
        return (Math.round(amount * 100) / 100).toFixed(2).replace(".",",");
    }

    static formatToEur(amount: number){
        return this.formatAmount(amount) + " €"
    }
}
import { Pipe, PipeTransform } from '@angular/core';
import MathUtils from 'src/app/shared/utils/math-utils';

@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null) return '0,00 €';
    return MathUtils.formatToEur(Number(value));
  }
}

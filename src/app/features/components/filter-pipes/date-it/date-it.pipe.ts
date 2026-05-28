import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateIt' })
export class DateItPipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (!value) return '';
    const opts: Intl.DateTimeFormatOptions = format === 'long'
      ? { day: '2-digit', month: 'long', year: 'numeric' }
      : {};
    return new Date(value).toLocaleDateString('it-IT', opts);
  }
}

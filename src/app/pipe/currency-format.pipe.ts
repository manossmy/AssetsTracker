import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';


@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) { }

  transform(value: any, format: string): unknown {
    return (this.decimalPipe.transform(value, format) || '')
      .replace(/,/g, '')
      .split('.')
      .map((data: string, index: number) => {
        if (index == 0) return data.replace(/\B(?=(?:(\d\d)+(\d)(?!\d))+(?!\d))/g, ',');
        else return data;
      })
      .join(".");
  }

}

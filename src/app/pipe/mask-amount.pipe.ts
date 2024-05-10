import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskAmount'
})
export class MaskAmountPipe implements PipeTransform {

  constructor() { }

  transform(value: any, maskAmount: boolean): unknown {
    return maskAmount ? '***' : value;
  }

}

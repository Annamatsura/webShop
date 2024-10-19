import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textCut'
})
export class TextCutPipe implements PipeTransform {

  transform(value: string): string {
    let sliced: string = value.slice(0,100);
    if (sliced.length < value.length) {
      sliced += '...';
    }

    return sliced;
  }

}

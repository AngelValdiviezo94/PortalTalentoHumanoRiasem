import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: 'input[documentoDirective]'
})

export class DocumentoDirective {
    @Input() documentoDirective = '';

    constructor(private _el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event: any) {
        // const regexValue = this.documentoDirective === 'Cédula' ? '/[^0-9]*/g' : '/[^A-Za-z0-9]*/g';
        const initalValue = this._el.nativeElement.value;

        if (this.documentoDirective === 'c')
            this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
        else
            this._el.nativeElement.value = initalValue.replace(/[^A-Za-z0-9]*/g, '');

        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }
    }

}

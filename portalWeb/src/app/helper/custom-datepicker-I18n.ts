import { Injectable } from "@angular/core";
import { NgbDatepickerI18n, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

const I18N_VALUES: InterfaceI18nDate = {
    weekdays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    months: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'],
    weekLabel: 'Sem',
};

@Injectable()
export class I18n {
    language = 'es';
}

@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
    constructor(private _i18n: I18n) {
        super();
    }

    getWeekdayLabel(weekday: number): string {
        return I18N_VALUES.weekdays[weekday - 1];
    }
    override getWeekLabel(): string {
        return I18N_VALUES.weekLabel;
    }
    getMonthShortName(month: number): string {
        return I18N_VALUES.months[month - 1];
    }
    getMonthFullName(month: number): string {
        return this.getMonthShortName(month);
    }
    getDayAriaLabel(date: NgbDateStruct): string {
        return `${date.day}-${date.month}-${date.year}`;
    }
}

export interface InterfaceI18nDate {
    weekdays: string[],
    months: string[],
    weekLabel: string
}
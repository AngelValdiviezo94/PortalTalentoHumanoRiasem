import { Pipe, PipeTransform } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';

@Pipe({
    name: 'filtroTurnoPipe',
    pure: false
})
export class FiltroTurnoPipe implements PipeTransform {
    transform(items: CalendarEvent[], filter: string): CalendarEvent[]{
        if (!items || !filter) {
            return items;
        }

        return items.filter(item => item.title?.toLowerCase().indexOf(filter?.toLowerCase()) !== -1);
    }
}

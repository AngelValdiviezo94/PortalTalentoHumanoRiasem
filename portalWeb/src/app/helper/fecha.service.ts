import { Injectable } from "@angular/core";
import { differenceInHours, format, subHours } from "date-fns";

@Injectable({
    providedIn: 'root'
})
export class FechaService {

    timeZoneEcuador(fechaString: string | Date): Date {
        const fecha = new Date(fechaString);
        return fecha;// zonedTimeToUtc(fecha, zonaHorariaEcuador);
    }

    getTime(fechaString: string | Date): string {
        const fecha = new Date(fechaString); // zonedTimeToUtc(fechaString, zonaHorariaEcuador);
        return format(fecha, 'HH:mm');
    }

    diferenciaHoras(fechaIni: Date, fechaFin: Date) {
        const fi = this.timeZoneEcuador(fechaIni);
        const ff = this.timeZoneEcuador(fechaFin);
        return `${differenceInHours(ff, fi)} horas`;
    }

}

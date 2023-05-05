import { CalendarEvent } from "angular-calendar";

export interface TurnoCalendar {
    id: string,
    descripcion: string,
    logo: string,
    color: string,
    turnos?: CalendarEvent[]
}

/* ini interface multi select */
export interface SubTurnosCalendar {
    id: string,
    title: string,
    selected: boolean
}

export interface ColaboradorSubturno {
    id: string,
    nombre: string,
    subturnos: SubTurnosCalendar[]
}
/* fin interface multi select */

export interface AsignaTurnoRequest {
    idTurno: string,
    fechaAsignacionDesde: string,
    fechaAsignacionHasta: string,
    clienteSubturno: ClienteSubturno[]
}

export interface ClienteSubturno {
    idCliente: string,
    clienteSubturno: SubturnoAsignado[]
}

export interface SubturnoAsignado {
    idSubturno: string
}
export interface AsignacionTurnoResponse {
    id: string;
    idTurno: string;
    idTurnoPadre: null | string;
    idColaborador: string;
    nombresColaborador: string;
    apellidosColaborador: string;
    identificacion: string;
    fechaAsignacion: Date;
    horaEntrada: Date | string;
    horaSalida: Date | string;
    codigoTurno: string;
    codigoIntegracion: string;
}

export interface AsignadoColaboradorInterface {
    idColaborador: string,
    idTurno: string,
    idAsignacion?: string,
    colaborador: string,
    fechaAsignacion: Date | string,
    subturnos: AsignadoSubturnoInterface[],
    selected?: boolean
}

export interface AsignadoSubturnoInterface {
    id: string,
    idTurnoAsignado?: string,
    title: string,
    selected: boolean
}

export interface TurnoMasivoColaborador {
    identificacion: string,
    fechaAsignacion: string,
    codTurno: string
}
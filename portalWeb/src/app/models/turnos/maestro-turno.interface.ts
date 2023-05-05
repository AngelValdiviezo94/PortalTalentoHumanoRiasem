export interface MestroTurno {
    tipoTurnoType: DetalleMaestroTurno[],
    claseTurnoType: DetalleMaestroTurno[],
    subclaseTurnoType: DetalleMaestroTurno[],
    tipoJornadaType: DetalleMaestroTurno[],
    modalidadJornadaType: DetalleMaestroTurno[]
}

export interface DetalleMaestroTurno {
    id: string,
    descripcion: string
}
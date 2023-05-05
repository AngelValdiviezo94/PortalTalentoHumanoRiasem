export interface MarcacionColaborador {
    identificacion: string;
    colaborador: string;
    hTotalAsignadas: string;
    hTotalTrabajadas: string;
    hTotalPendiente: string;
    dias: DetalleMarcacionColaborador[];
}

export interface DetalleMarcacionColaborador {
    fecha: Date;
    horasTrabajada: string;
    horasAsignadas: string;
    horasPendiente: string;
    localidadDescripcion: string;
}
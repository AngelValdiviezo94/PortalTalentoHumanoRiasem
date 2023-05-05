export interface SolicitudVacacion {
    id: string;
    codOrganizacion: number;
    periodoAfectacion: string;
    idTipoSolicitud: string;
    idEstadoSolicitud: string;
    numeroSolicitud: number;
    nombreEmpleado: string;
    identificacionEmpleado: string;
    idSolicitante: number;
    idBeneficiario: number;
    fechaDesde: Date;
    fechaHasta: Date;
    cantidadDias: number;
    codigoEmpleadoReemplazo: string;
    observacion: string;
    fechaCreacion: Date;
    descripcionFeature: string;
}

export interface SolicitudVacacionRequest {
    codOrganizacion: number;
    nombreEmpleado: string;
    identificacionEmpleado: string;
    idSolicitante: number;
    idBeneficiario: number;
    fechaDesde: string;
    fechaHasta: string;
    periodoAfectacion: any[];
    codigoEmpleadoReemplazo: string;
    contenidoTexto: string;
    contenidoHtml: string;
    observacion: string;
}
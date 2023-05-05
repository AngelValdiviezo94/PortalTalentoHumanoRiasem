export interface SolicitudPermiso {
    id: string;
    codOrganizacion: number;
    idTipoPermiso: string;
    tipoPermiso: string;
    idEstadoSolicitud: string;
    numeroSolicitud: number;
    idSolicitante: number;
    idBeneficiario: number;
    nombreEmpleado: string;
    identificacionEmpleado: string;
    porHoras: boolean;
    fechaDesde: Date;
    horaInicio: string;
    fechaHasta: Date;
    horaFin: string;
    cantidadHoras: Date;
    cantidadDias: number;
    observacion: string;
    fechaCreacion: Date;
    descripcionFeature:string;
}

export interface SolicitudPermisoRequest {
    codOrganizacion: number,
    idTipoPermiso: string,
    idSolicitante: number,
    nombreEmpleado: string,
    idBeneficiario: number,
    identificacion: string,
    porHoras: boolean,
    fechaDesde: string,
    horaInicio: string,
    fechaHasta: string,
    horaFin: string,
    observacion: string,
    contenidoHtml: string,
    contenidoTexto: string
}

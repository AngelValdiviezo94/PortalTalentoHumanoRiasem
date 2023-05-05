export interface SolicitudJustificacion {
    id: string;
    codOrganizacion: number;
    idTipoJustificacion: string;
    idFeature: string;
    tipoJustificacion: string;
    idEstadoSolicitud: string;
    nombreEmpleado: string;
    identBeneficiario: string;
    identificacionEmpleado: string;
    idMarcacion: number;
    idTurno: number;
    marcacionEntrada: Date;
    turnoEntrada: Date;
    marcacionSalida: Date;
    turnoSalida: Date;
    docAdjunto: any[];
    comentarios: string;
    fechaCreacion: Date;
    usuarioCreacion: string;
    fechaModificacion: Date;
    usuarioModificacion: string;
    descripcionFeature:string;
}

export interface DiasJustificarResponse {
    fecha: Date;
    idColaborador: string;
    idMarcacion: string;
    estadoMarcacionEntrada: string;
    estadoMarcacionSalida: string;
    descripciónNovedad: string;
    idTurnoColaborador: string;
    descripcionCombo: string;
}

export interface SolicitudJustificacionRequest {
    codOrganizacion: number,
    idFeature: string,
    idTipoJustificacion: string,
    nombreEmpleado: string,
    identBeneficiario: string,
    identificacionEmpleado: string,
    idMarcacionG: string,
    idMarcacion: string,
    tipoMarcacion: string,
    estadoMarcacion: string,
    fecha: string,
    docAdjunto: AdjuntoRequest[],
    comentarios: string
}

export interface AdjuntoRequest {
    archivoBase64: any,
    nombreArchivo: string,
    extensionArchivo: string
}

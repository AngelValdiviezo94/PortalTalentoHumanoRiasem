export interface SolicitudInterface {
    id: string;
    idTipoPermiso: string;
    codigoFeature: string;
    idEstadoSolicitud: string;
    idSolicitante: number;
    idBeneficiario: number;
    nombreEmpleado: string;
    identificacionEmpleado: string;
    empresa: string;
    area: string;
    departamento: string;
    fechaCreacion?: Date;
    aplicaDescuento?:boolean;
}

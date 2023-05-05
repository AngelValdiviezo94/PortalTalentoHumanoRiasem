export interface SolicitudHorasExtras {
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

export interface SolicitudHorasExtrasRequest {
  identSolicitante: string,
  identBeneficiario: string,
  fechaDesde: string,
  fechaHasta: string,
  horaInicio: string,
  horaFin: string,
  comentarios: string,
  // contenidoHtml: string,
  // contenidoTexto: string
}

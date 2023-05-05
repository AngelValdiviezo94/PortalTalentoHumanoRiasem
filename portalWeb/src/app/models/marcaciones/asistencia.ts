export interface Asistencia {
  colaborador:    string;
  identificacion: string;
  codBiometrico:  string;
  udn:            string;
  area:           string;
  subCentroCosto: string;
  fecha:          Date;
  turnoLaboral:   TurnoLaboral;
  turnoReceso:    TurnoReceso;
  novedades:      Novedades[];
  solicitudes: SolicitudesA[];
}

export interface Novedades {
  idMarcacion:      number;
  idSolicitud:      string;
  usuarioAprobador: string;
  fechaAprobacion:  string;
  descripcion:      string;
  minutosNovedad:   string;
  estadoMarcacion:  string;
}

export interface TurnoLaboral {
  idTurno:                 string;
  entrada:                 Date;
  idMarcacionEntrada:      number;
  marcacionEntrada:        Date;
  salida:                  Date;
  idMarcacionSalida:       number;
  marcacionSalida:         Date;
  totalHoras:              string;
  idSolicitudEntrada:      null | string;
  idFeatureEntrada:        null;
  estadoEntrada:           string;
  fechaSolicitudEntrada:   Date;
  usuarioSolicitudEntrada: string;
  estadoSolicitudEntrada:  null;
  idSolicitudSalida:       null | string;
  idFeatureSalida:         null;
  estadoSalida:            string;
  fechaSolicitudSalida:    Date;
  usuarioSolicitudSalida:  string;
  estadoSolicitudSalida:   null;
}

export interface TurnoReceso {
  idTurno:                       null | string;
  entrada:                       Date;
  idMarcacionEntrada:            number;
  marcacionEntrada:              string;
  salida:                        Date;
  idMarcacionSalida:             number;
  marcacionSalida:               string|Date;
  totalHoras:                    string;
  idSolicitudEntradaReceso:      null;
  idFeatureEntradaReceso:        null;
  estadoEntradaReceso:           string;
  fechaSolicitudEntradaReceso:   Date;
  usuarioSolicitudEntradaReceso: string;
  estadoSolicitudEntradaReceso:  null;
  idSolicitudSalidaReceso:       null;
  idFeatureSalidaReceso:         null;
  estadoSalidaReceso:            string;
  fechaSolicitudSalidaReceso:    Date;
  usuarioSolicitudSalidaReceso:  string;
  estadoSolicitudSalidaReceso:   null;
}

export interface SolicitudesA{
  colaborador: string;
  comentarios: string;
  id: string;
  idControlAsistenciaDet: number;
  idFeature: string;
  idSolicitud: string;
}

export interface AsistenciaNovedad {
  udn: string,
  colaborador: string,
  identificacion: string,
  fecha: Date,
  dia: string,
  entradaLaboral: string,
  marcacionEntrada: string,
  estadoEntrada: string,
  salidaLaboral: string,
  marcacionSalida: string,
  estadoSalida: string,
  entradaReceso: string,
  marcacionEntradaReceso: string,
  estadoEntradaReceso: string,
  salidaReceso: string,
  marcacionSalidaReceso: string,
  estadoSalidaReceso: string,
  novedad: Novedades[]
}

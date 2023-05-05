export interface TipoJornadaType {
  idTipoJornada: string;
  tipoJornada: string;
  logoTipoJornada: string,
  colorTipoJornada: string,
  turnoType: TurnoType[];
}

export interface TurnoType {
  id: string;
  idTurnoPadre: null;
  idTipoTurno: string;
  idClaseTurno: string;
  idSubclaseTurno: string;
  idTipoJornada: string;
  idModalidadJornada: string;
  tipoTurno: string;
  claseTurno: string;
  subclaseTurno: string;
  tipoJornada: string;
  modalidadJornada: string;
  codigoTurno: string;
  codigoIntegracion: string;
  descripcion: string;
  entrada: Date | string;
  salida: Date | string;
  margenEntrada: Date | string;
  margenSalida: Date | string;
  margenEntradaPrevio: string;
  margenEntradaPosterior: string;
  margenSalidaPrevio: string;
  margenSalidaPosterior: string;
  totalHoras: string;
  SubturnoType: SubturnoType[];
}

export interface SubturnoType {
  id: string,
  idTurnoPadre: string,
  idTipoTurno: string;
  TipoTurno: string;
  codigoTurno: string;
  descripcion: string;
  entrada: Date | string;
  salida: Date | string;
  margenEntrada: Date | string;
  margenSalida: Date | string;
  margenEntradaPrevio: string;
  margenEntradaPosterior: string;
  margenSalidaPrevio: string;
  margenSalidaPosterior: string;
  totalHoras: string;
}
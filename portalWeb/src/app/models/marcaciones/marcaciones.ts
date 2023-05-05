export interface Marcacion {
  udn: String,
  nombre: String,
  cedula: String,
  codigo: String,
  area: String,
  subcentroCosto: String,
  fechaHora?: String,
  fecha?: String,
  hora?: String,
  codEvento?: String,
  evento: String,
  novedad: String,
  minutos_novedad: string
}

export interface ComboMarcacion {
  codigo: string;
  descripcion: string;
  selectedGroup?: string;
}

export interface ComboPeriodo {
  id: number,
  udn: string,
  desPeriodo: string
}

export interface ResponseMarcacionWeb {
  colaborador: string,
  identificacion: string,
  mensaje: string,
  fotoPerfil: string
}

export interface RequestMarcacionWeb {
  identificacionColaborador: string,
  pinColaborador: string,
  tipoMarcacion: string,
  base64Archivo: string,
  nombreArchivo: string,
  extensionArchivo: string
}
export interface Colaborador {
  id:           string;
  udn:          string;
  area:         string;
  scc:          string;
  colaborador:  string;
  cedula:       string;
  codigo:       string;
  cargo:        string;
  celular:      string;
  direccion:    string;
  correo:       string;
  lstLocalidad: Localidad[];
  idJefe:       string;
  jefe:         string;
  codUdn: string;
  codArea: string;
  codScc: string;
  fotoPerfil:string;
  // cambioImagen: boolean;
  latitud:string,
  longitud:string,
  adjunto: DocAdjunto;
  idReemplazo: string;
  reemplazo: string;
  facialPersonId: string;
}

export interface Localidad{
  id: string,
  codigo: string,
  idEmpresa: string,
  latitud : string,
  longitud: string,
  radio: number,
  descripcion : string;
  esPrincipal: boolean;
}

export interface DocAdjunto{
  base64: string;
  nombre: string;
  extension: string;
}

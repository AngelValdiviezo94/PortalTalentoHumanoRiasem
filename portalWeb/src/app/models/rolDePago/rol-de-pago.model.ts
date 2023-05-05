export interface RolDePago {
  cabeceraRol:   CabeceraRol;
  totalIngresos: number;
  totalEgresos:  number;
  netoPagar:     number;
  listaIngresos: ListaGreso[];
  listaEgresos:  ListaGreso[];
}

export interface CabeceraRol {
  nombres:                 string;
  apellidos:               string;
  division:                string;
  empresa:                 string;
  sucursal:                string;
  tipoNomina:              string;
  proceso:                 string;
  periodo:                 string;
  area:                    string;
  centroCosto:             string;
  subCentroCosto:          string;
  cargo:                   string;
  sueldo:                  number;
  encargadoCoporativoRRHH: string;
  cargoCorporativoRRHH:    string;
  tipoPago:                string;
  observacion:             string;
}

export interface ListaGreso {
  descripcion: string;
  cantidad:    number;
  valor:       number;
  tipoRubro:   string;
}

export interface Familiar {
  id: string;
  tipoRelacionFamiliarId: string;
  tipoRelacionFamiliarDes: string;
  colaboradorId: string;
  tipoIdentificacion: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  alias: string;
  latitud: string;
  longitud: string;
  direccion: string;
  celular: string;
  correo: string;
  fechaNacimiento: Date;
  genero: string;
  servicioActivo: boolean;
  estado: string;
  eliminado: boolean;
  fechaDesde: Date;
  fechaHasta: Date;
  habilitado: boolean;
  cupo: number;
  fotoPerfil: string;
}

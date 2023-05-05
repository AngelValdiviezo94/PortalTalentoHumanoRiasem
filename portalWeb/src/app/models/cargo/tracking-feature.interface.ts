export interface InfoTrackingFeature {
    identificacion: string,
    colaborador: string,
    actividad: string,
    featureNombre: string,
    canalNombre: string,
    fechaRegistro: Date
}

export interface ComboTrackingFeature {
    codigo: string;
    descripcion: string;
    padreId: string
}
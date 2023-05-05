export interface InfoCargo {
    id: string,
    cargoId: string,
    cargoNombre: string,
    cargoDescripcion: string,
    nombreUsuario: string,
    canales: Canal[]
}

export interface Canal {
    id: string,
    codigo: string,
    nombre: string,
    descripcion: string,
    features: Feature[]
}

export interface Feature {
    id: string,
    codigo: string,
    nombre: string,
    descripcion: string,
    atributos: Atributo[]
}

export interface Atributo {
    id: string,
    codigo: string,
    nombre: string,
    descripcion: string
}

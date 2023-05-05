import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Feature, InfoCargo } from '../models/cargo/cargo.interface';
import { CargoService } from '../services/cargo.service';
import { GestionService } from './gestion.service';
import { TokenService } from './token.service';

const featuresMain = [
    {
        id: 'f2f78b22-dbf3-4b4f-acd2-c5da6026bc2f',
        cod: 'TUR',
        nombre: 'Turnos',
        atributos: [
            {
                id: '4bf2f6bf-1f64-4e0d-8880-67eb825017e2',
                cod: 'CON',
                nombre: 'consultar',
            },
            {
                id: '77d3cf1a-3422-4556-a250-81a7090f4701',
                cod: 'GEN',
                nombre: 'generar',
            },
            {
                id: '82628493-fef1-4a2a-82a7-4595d17d2f71',
                cod: 'ASG',
                nombre: 'asignar',
            },
            {
                id: '15221be4-1852-4a1f-af9f-995d26890b83',
                cod: 'RPT',
                nombre: 'Generar excel'
            },
            {
                id: '1ed04248-4d12-4f0f-b582-402c2ee51ca4',
                cod: 'CAR',
                nombre: 'Cargar excel'
            }
        ],
    },
    {
        id: 'c39bf95a-4b5e-40b3-bd5c-6d5f833deabb',
        cod: 'MAR',
        nombre: 'Marcaciones',
        atributos: [
            {
                id: '90a2a098-bbad-441c-b1da-e599f381566f',
                cod: 'CON',
                nombre: 'consultar',
            },
            {
                id: 'edea11b9-c7b1-4163-a8c5-6e9bfdce5f85',
                cod: 'GEN',
                nombre: 'GENERAR',
            },
            {
                id: '17283605-6290-426c-aca1-be5a7739346f',
                cod: 'TXT',
                nombre: 'GENERAR TXT',
            },
        ],
    },
    {
        id: 'b80fa28f-b3e4-4994-81b2-6f3a7946051a',
        cod: 'TIN',
        nombre: 'Transferencia de información',
        atributos: [
            {
                id: '7cceb62d-5ab9-4338-b8a0-8afc0ab0ea25',
                cod: 'CON',
                nombre: 'consultar',
            },
        ],
    },
    {
        id: '2e493971-aa6c-46c5-a1d2-7069b3eebfff',
        cod: 'ENR',
        nombre: 'Enrolamiento',
        atributos: [
            {
                id: '6f1a7250-562b-42b8-9682-28d22159f691',
                cod: 'CON',
                nombre: 'consultar',
            },
        ],
    },
    {
        id: '3feb7daa-271e-4a65-96cd-31ee88e57942',
        cod: 'SOL',
        nombre: 'Solicitudes',
        atributos: [
            {
                id: 'd65a4762-762c-44c8-a723-bc3558955150',
                cod: 'CON',
                nombre: 'consultar',
            },
        ],
    },
    {
        id: '9f166441-22ab-459a-94e1-7cc39fe425f3',
        cod: 'GSL',
        nombre: 'Gestión Solicitudes',
        atributos: [
            {
                id: '2bf13b43-6443-4cc1-89a3-e9cfbfc53cf2',
                cod: 'CON',
                nombre: 'Consultar',
            },
            {
                id: '573adc8d-e57a-4fb1-b0ca-c2b2e30d7764',
                cod: 'THH',
                nombre: 'Talento humano',
            },
        ],
    },
    {
        id: '52e8e249-6e22-4677-9e5c-09776f7e9c13',
        cod: 'RSP',
        nombre: 'Registrar solicitud permiso',
        atrinutos: [
            {
                id: '3e94e5bc-0cb2-4e7b-8b51-e1db7791659f',
                cod: 'GEN',
                nombre: 'Generar',
            },
        ],
    },
    {
        id: '8ee4eb9c-c2a3-4bee-9064-403e300a10d9',
        cod: 'RSJ',
        nombre: 'Registrar solicitud justificacion',
        atrinutos: [
            {
                id: '5ad1f7a2-11d7-425f-b521-8dc210778a11',
                cod: 'GEN',
                nombre: 'Generar',
            },
        ],
    },
    {
        id: 'edf57498-6389-416b-9abe-7ac648c86cee',
        cod: 'RSV',
        nombre: 'Registrar solicitud vacación',
        atrinutos: [
            {
                id: '6b77eab8-4242-487c-b97b-da88c04525d5',
                cod: 'GEN',
                nombre: 'Generar',
            },
        ],
    },
    {
        id: '2b86ab33-46ca-4c33-bddd-08f4c83293e7',
        cod: 'RSH',
        nombre: 'Registrar solicitud horas extras',
        atrinutos: [
            {
                id: '1d9e6900-c88a-4174-9968-a71a3431a34e',
                cod: 'GEN',
                nombre: 'Generar',
            },
        ],
    },
    {
        id: '48D31F7C-D2E3-4964-8EB3-F01AFE5527F2',
        cod: 'MNT',
        nombre: 'Mantenimiento',
        atrinutos: [
            {
                id: '04649FDA-D9FA-498B-AAE3-588AA844E061',
                cod: 'MOD',
                nombre: 'Modificar mantenimiento',
            },
            {
                id: '29073271-E894-4FF3-AC57-852341CB6F75',
                cod: 'CON',
                nombre: 'Consultar mantenimiento',
            },
        ],
    },
    {
        id: 'C264E0B1-0990-4FFC-9A53-430AB7D31822',
        cod: 'CTA',
        nombre: 'Control de asistencias',
        atrinutos: [
            {
                id: 'B5172EC4-03D0-41BB-A85B-13A24B487A35',
                cod: 'CON',
                nombre: 'Consultar control asistencias',
            },
            {
                id: 'b6fdc8b0-a452-42dd-a585-093774a6533a',
                cod: 'GEN',
                nombre: 'Generar reporte',
            },
        ],
    },
    {
        id: '67dbbb6a-b886-4736-bdb2-94cd3949db37',
        cod: 'TRF',
        nombre: 'Tracking feature',
        atributos: [
            {
                id: 'c3b414eb-e33b-424d-a97f-13bc184a8c7e',
                cod: 'CON',
                nombre: 'Consultar tracking features',
            }
        ]
    },
    {
        id: '0dcc5499-75e3-4d7e-bc07-1c4d89416807',
        cod: 'RMW',
        nombre: 'Registro marcación',
        atributos: [
            {
                id: '9348dad3-5f65-4ee0-a3c2-c47648392c57',
                cod: 'GEN',
                nombre: 'Generar marcación',
            }
        ]
    },
    {
        id: 'f29a7b73-73e0-4de7-8555-ab1d481c8b08',
        cod: 'RMF',
        nombre: 'Registro marcación facial',
        atributos: [
            {
                id: '2935050b-ae2d-4302-b9d0-f225038256b8',
                cod: 'GEN',
                nombre: 'Generar marcación',
            }
        ]
    },
    {
        id: '90847567-acff-4d31-9ccf-48615343d112',
        cod: 'CAN',
        nombre: 'Asistencias y novedades',
        atributos: [
            {
                id: 'b9f30337-0104-4f2e-bfa9-b63329184747',
                cod: 'CON',
                nombre: 'Consulta asistencias y novedades',
            }
        ]
    },
    {
      id: '7A680836-0F6D-466C-A66D-B0C79080CC05',
      cod: 'MDA',
      nombre: 'Mesa de ayuda',
      atributos: [
        {
          id: 'E91F3D3F-A349-4FA8-AEF6-3375DE41AC1F',
          cod: 'CONF-REPORT',
          nombre: 'Reportes',
        },
        {
            id: '271CFD11-D775-49EA-88D0-38D327C6335A',
            cod: 'CONF-ME',
            nombre: 'Configuración de mesa',
        },
        {
          id: '91C7B06D-7445-4DDF-BD12-7000A64EEFDA',
          cod: 'CONF-TI',
          nombre: 'Configuración de tipo de información',
        },
        {
          id: '09904D1F-4093-4D22-985C-79C3D3C54786',
          cod: 'CONF-TICK',
          nombre: 'Ticket',
        },
        {
            id: 'B77EA0A3-C4F9-48EE-BABE-9C90741CA5BB',
            cod: 'CONF-SERV',
            nombre: 'Configuración de servicio',
        },
        {
          id: '1A3924A0-DD66-4137-950F-EEE7CB04A900',
          cod: 'CONF-ENC',
          nombre: 'Encuesta orden de servicio',
        },
      ]
  }
];

@Injectable({
    providedIn: 'root',
})
export class FeatureService {
    constructor(
        private gestionService: GestionService,
        private cargoService: CargoService,
        private tokenService: TokenService
    ) { }

    private get infoCargo(): InfoCargo {
        return this.gestionService.obtenerInfoCargoSuscriptorLocal();
    }

    private get features(): Feature[] {
        const canal = this.infoCargo.canales.find(
            (x) => x.id === environment.uidCanalWeb
        );
        return canal?.features || [];
    }

    private featureMainId(cod: string): string {
        return featuresMain.find((fe) => fe.cod === cod)?.id?.toLowerCase() || '';
    }

    private atributoMainId(codFea: string, codAtr: string): string {
        const atr = featuresMain.find((x) => x.cod === codFea);
        return atr?.atributos?.find((x) => x.cod === codAtr)?.id?.toLocaleLowerCase() || '';
    }

    isCanalActive(): boolean {
        return this.infoCargo.canales.find((x) => x.id === environment.uidCanalWeb)
            ? true
            : false;
    }

    isFeatureActive(codFeature: string): boolean {
        return this.features.find((x) => x.id.toLocaleLowerCase() === this.featureMainId(codFeature))
            ? true
            : false;
    }

    isAtributoActive(codFeature: string, codAtributo: string): boolean {
        const atributos = this.features.find(
            (x) => x.id.toLowerCase() === this.featureMainId(codFeature)
        );
        return atributos?.atributos.find(
            (x) => x.id.toLowerCase() === this.atributoMainId(codFeature, codAtributo)
        )
            ? true
            : false;
    }

    getInfoCargoAsync(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargoService
                .obtenerInfoCargoSuscriptor(this.tokenService.getIdentificacion())
                .subscribe({
                    next: (resp) => resolve(resp),
                    error: (err) => reject(err),
                });
        });
    }
}

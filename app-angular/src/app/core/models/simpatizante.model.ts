export interface IDomicilio {
  calle: string;
  colonia: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
}

export interface ISimpatizante {
  token?: string;
  _id?: string;
  clave_estatus?: number;
  nombre_estatus?: string;
  justificacion_estatus?: string;

  nombre_completo?: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;

  fecha_nacimiento: Date;

  clave_elector: string;
  curp: string;

  sexo: string;

  domicilio: IDomicilio;

  estado: number;
  municipio: number;
  localidad: string;
  emision: number;
  seccion: number;
  anio_registro: number;
  vigencia: number;

  telefono_celular?: string;
  foto_ine?: string;

  telefono_verificado?: boolean;
  telegram_chat_id?: number;
  telegram_user_id?: number;
  bot_assigned?: string;

  coordenadas?: {
    type: 'Point';
    coordinates: [number, number];
  };

  ejercio?: string;
}

export interface ISimpatizanteUbicacion {
  _id?: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  curp: string;
  telefono_celular: string;
  coordenadas: {
    type: 'Point';
    coordinates: [number, number];
  };
}

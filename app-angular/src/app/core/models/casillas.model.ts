export interface Direccion {
  latitud: number;  // Coordenada de latitud
  longitud: number; // Coordenada de longitud
}

export interface Casilla {
  _id?: string;
  id_evento?: string;
  distritoFederal?: number;
  distritoLocal?: number;
  municipio?: number;
  seccion: number;
  tipoCasilla: string;
  totalVotos: number;
  listaNominal: number;
  meta: number;
  direccion: Direccion;
  ejercidos?: number;
}

export interface CasillaUbicacion {
  _id?: string;
  // municipio: string;
  seccion: string;
  tipoCasilla: string;
  // distritoLocal: string;
  direccion: {
    type: 'Point';
    coordinates: [number, number];
  };
}


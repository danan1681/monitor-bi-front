export interface Candidatura {
  _id?: string;
  id_evento?: string;
  estatus?: number;
  nombre?: string;
  tipo?: string;
  estado_clave?: number | null;
  distrito_federal_clave?: number | null;
  distrito_local_clave?: number | null;
  municipio_clave?: number | null;
}

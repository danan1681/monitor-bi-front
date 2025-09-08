export interface IDependencias {
  _id: string;
  clave_dependencia: number;
  nombre_dependencia: string;
  tipo_dependencia: string;
  subtipo_dependencia: string;

  nombre_titular: string;
  correo_titular_cero_papel: string;
}

export type IDependenciaSelect = Pick<
  IDependencias,
  'clave_dependencia' | 'nombre_dependencia'
>;

export interface IEstados {
  _id: string;
  clave_estado: number;
  nombre_estado: string;
}

export interface IDistritosFederales {
  _id: string;
  distrito_federal_clave: number;
}

export interface IDistritosLocales {
  _id: string;
  distrito_local_clave: number;
}

export interface IMunicipios {
  _id: string;
  municipio_clave: number;
  municipio_nombre: string;
}

export interface ISecciones {
  _id: string;
  distrito_federal: number;
  distrito_local: number;
  municipio: number;
  seccion: number;
}

export type IEstadoSelect = Pick<IEstados, 'clave_estado' | 'nombre_estado'>;

export interface ILocalidades {
  nombre_localidad: string;
  no_localidad: number;
  no_municipio: number;
  nombre_municipio: string;
}

export interface IRoles {
  clave_rol: number;
  nombre_rol: string;
}

export interface IUsuarioEstatus {
  clave_estatus: number;
  nombre_estatus: string;
  descripcion_estatus: string;
}

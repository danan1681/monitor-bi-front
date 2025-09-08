export interface Usuario {
  _id: string;
  clave_estatus: string;
  nombre_estatus: string;
  justificacion_estatus: string;
  correo: string;
  contrasena: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  // curp: string;
  telefono: number;
  clave_dependencia: number;
  clave_rol: number;
}

export interface Rol {
  clave: number;
  nombre: string;
}

export interface DatosRol {
  nombre_completo: string;
  rol: string;
  nombre_dependencia: string;
}

export interface RespuestaValidarSession {
  code: number;
  message: string;
}

export interface RespuestaLogout {
  code: number;
  message: string;
}

export interface IPromotor {
  _id: string;
  nombre_completo: string;
  clave_rol: number;
}

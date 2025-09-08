import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment'
import {DatosRol, RespuestaValidarSession, Usuario} from '../models/usuario.model';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {NavItem} from '../../layouts/full/vertical/sidebar/nav-item/nav-item';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient) {
  }//end constructor

  private tablaUsuarios = new BehaviorSubject<Usuario[]>([])

  ObtenerTablaUsuarios(): Observable<Usuario[]> {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/obtener_usuarios`, {withCredentials: true}).subscribe(
      (tablaUsuariosData: Usuario[]) => {
        this.tablaUsuarios.next(tablaUsuariosData)
      })
    return this.tablaUsuarios.asObservable()
  }//end getUsuarios

  verificarCorreoExistente(correo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/usuarios/verificar_correo/${correo}`)
  }

  verificarTelefonoExistente(telefono: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/usuarios/verificar_telefono/${telefono}`);
  }
  //
  // verificarCurpExistente(curp: string): Observable<boolean> {
  //   return this.http.get<boolean>(`${this.apiUrl}/usuarios/verificar_curp/${curp}`)
  // }

  verificarCurpExistente(curp: string, id_evento?: string): Observable<boolean> {
    const params = id_evento ? new HttpParams().set('id_evento', id_evento) : undefined;
    return this.http.get<boolean>(`${this.apiUrl}/usuarios/verificar_curp/${curp}`, { params });
  }


  createUsuario(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/crear_usuario`, data, {withCredentials: true}).pipe(
      tap(((usuarioNuevo: any) => {
        this.ObtenerTablaUsuarios()
      }))
    )
  }

  actualizarUsuario(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/usuarios/actualizar_usuario`, data, {withCredentials: true}).pipe(
      tap(((usuarioActualizado: any) => {
        this.ObtenerTablaUsuarios()
      }))
    )
  }

  updateEstatusUsuario(dataEstatus: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/usuarios/actualizar_estatus`, dataEstatus, {withCredentials: true}).pipe(
      tap( (response:any) => {
        this.ObtenerTablaUsuarios()
      })
    );
  }

  updatePasswordUsuario(data: any) {
    return this.http.patch(`${this.apiUrl}/usuarios/actualizar_contrasena`, data, {withCredentials: true}).pipe(
      tap( this.ObtenerTablaUsuarios() )
    )
  }

  obtenerDatosUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/obtener_informacion_usuario`, {withCredentials: true})
  }

  obtenerMenu(): Observable<NavItem> {
    const url = `${this.apiUrl}/roles/menu`;
    return this.http.get<NavItem>(url, {withCredentials: true})
  }

  restartState(): void {
    this.tablaUsuarios.next([])
  } //end restartState

}

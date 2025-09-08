import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, Observable} from "rxjs";
import { tap } from 'rxjs/operators';
import {RespuestaLogout, RespuestaValidarSession} from "../models/usuario.model";
export interface LoginResponse {
  token: string;
  // Agrega otros campos si la respuesta tiene más datos
}

@Injectable({
  providedIn: 'root', // Esto lo hace accesible globalmente
})

export class LoginService {
  private apiUrl = `${environment.API_URL}`;

  private cache$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/login`, { correo: email, contrasena: password }, { withCredentials: true });
  }

  validarSession(): Observable<RespuestaValidarSession> {
    return this.http.get<RespuestaValidarSession>(`${this.apiUrl}/usuarios/validar_sesion`, { withCredentials: true })
  }

  validarSessionAdmin(): Observable<RespuestaValidarSession> {
    return this.http.get<RespuestaValidarSession>(`${this.apiUrl}/usuarios/validar_sesion_admin`, { withCredentials: true })
  }

  validarSessionPromotor(): Observable<RespuestaValidarSession> {
    return this.http.get<RespuestaValidarSession>(`${this.apiUrl}/usuarios/validar_sesion_promotor`, { withCredentials: true })
  }

  logout(): Observable<RespuestaLogout> {
    return this.http.get<RespuestaLogout>(`${this.apiUrl}/usuarios/logout`, { withCredentials: true })
  }

}

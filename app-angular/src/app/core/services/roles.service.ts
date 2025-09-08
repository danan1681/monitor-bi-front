import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Rol, Usuario} from "../models/usuario.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient) { }

  obtenerRolUsuario() {
    return this.http.get(`${this.apiUrl}/usuarios/rol`, {withCredentials: true});
  }//end obtenerRol


  getRoles() {
    return this.http.get<JSON>(`${this.apiUrl}/roles`, { withCredentials: true });
  }//end getRoles


  obtenerMenu() {
    return this.http.get(`${environment.API_URL}/roles/menu`, { withCredentials: true });
  }//end obtenerMenu
}

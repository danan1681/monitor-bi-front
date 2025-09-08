import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ResponseApi} from "../models/response.model";
import {
  CandidaturaCreate,
  CandidaturaResponse,
  CandidaturasResponse,
  CandidaturaUpdate
} from "../models/candidaturas.dto";
import {Observable} from "rxjs";
import {CandidatoUpdate} from "../models/candidato.dto";

@Injectable({
  providedIn: 'root'
})
export class CandidaturasService {

  private apiUrl = `${environment.API_URL}`;

  private httpClient = inject(HttpClient);

  constructor() { }

  // obtenerCandidaturas() {
  //   return this.httpClient.get<CandidaturasResponse>(`${this.apiUrl}/candidaturas`, { withCredentials: true });
  // }
  //
  // crearCandidatura(candidatura: CandidaturaCreate) {
  //   return this.httpClient.post<ResponseApi>(`${this.apiUrl}/candidaturas`, candidatura, {withCredentials: true});
  // }
  //
  // actualizarCandidatura(candidatura: CandidaturaUpdate) {
  //   return this.httpClient.put<CandidaturaResponse>(`${this.apiUrl}/candidaturas`, candidatura, {withCredentials: true});
  // }
  //
  // verificarNombreExistente(nombre: string): Observable<boolean> {
  //   return this.httpClient.get<boolean>(`${this.apiUrl}/candidaturas/verificar_nombre/${nombre}`)
  // }

  obtenerCandidaturas(id_evento: string) {
    return this.httpClient.get<CandidaturasResponse>(`${this.apiUrl}/eventos/${id_evento}/candidaturas`,{ withCredentials: true });
  }


  crearCandidatura(candidatura: CandidaturaCreate, id_evento: string) {
    return this.httpClient.post<ResponseApi>(`${this.apiUrl}/eventos/${id_evento}/candidaturas`, candidatura,{ withCredentials: true });
  }

  actualizarCandidatura(candidatura: CandidaturaUpdate, id_evento: string) {
    return this.httpClient.put<CandidaturaResponse>(`${this.apiUrl}/eventos/${id_evento}/candidaturas`,candidatura,{ withCredentials: true });
  }

  verificarNombreExistente(nombre: string, id_evento: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiUrl}/eventos/${id_evento}/candidaturas/verificar_nombre/${nombre}`,{ withCredentials: true });
  }


}

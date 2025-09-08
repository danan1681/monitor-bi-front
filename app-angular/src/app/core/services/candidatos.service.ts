import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

import {ResponseApi} from "../models/response.model";
import {CandidatoCreate, CandidatoResponse, CandidatosResponse, CandidatoUpdate} from "../models/candidato.dto";

@Injectable({
  providedIn: 'root'
})
export class CandidatosService {

  private apiUrl = `${environment.API_URL}`;

  private httpClient = inject(HttpClient);

  constructor() { }

  obtenerCandidatos(id_evento: string) {
    return this.httpClient.get<CandidatosResponse>(`${this.apiUrl}/eventos/${id_evento}/candidatos`, { withCredentials: true });
  }

  crearCandidato(candidato: CandidatoCreate, id_evento: string) {
    return this.httpClient.post<ResponseApi>(`${this.apiUrl}/eventos/${id_evento}/candidatos`, candidato, {withCredentials: true});
  }

  actualizarCandidato(candidato: CandidatoUpdate, id_evento: string) {
    return this.httpClient.put<CandidatoResponse>(`${this.apiUrl}/eventos/${id_evento}/candidatos`, candidato, {withCredentials: true});
  }
}

import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ResponseApi} from "../models/response.model";
import {Observable} from "rxjs";
import {EventoCreate, EventoResponse, EventosResponse, EventoUpdate} from "../models/eventos.dto";

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = `${environment.API_URL}`;

  private httpClient = inject(HttpClient);

  constructor() { }

  obtenerEventos() {
    return this.httpClient.get<EventosResponse>(`${this.apiUrl}/eventos`, { withCredentials: true });
  }

  crearEvento(candidatura: EventoCreate) {
    return this.httpClient.post<ResponseApi>(`${this.apiUrl}/eventos`, candidatura, {withCredentials: true});
  }

  actualizarEvento(candidatura: EventoUpdate) {
    return this.httpClient.put<EventoResponse>(`${this.apiUrl}/eventos`, candidatura, {withCredentials: true});
  }

  obtenerEvento(id: string): Observable<EventoResponse> {
    return this.httpClient.get<EventoResponse>(`${this.apiUrl}/eventos/${id}`, { withCredentials: true });
  }

  actualizarEstatusEvento(dataEstatus: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/eventos/actualizar_estatus_evento`, dataEstatus, {withCredentials: true});
  }
}

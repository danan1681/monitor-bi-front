import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ResponseApi} from "../models/response.model";
import {Observable} from "rxjs";
import {CasillaCreate, CasillaResponse, CasillasResponse, CasillaUpdate} from "../models/casillas.dto";
import {CasillaUbicacion} from "../models/casillas.model";
import {SimpatizanteResponse, SimpatizanteUpdate} from "../models/simpatizante.dto";

@Injectable({
  providedIn: 'root'
})
export class CasillasService {

  private apiUrl = `${environment.API_URL}`;

  private httpClient = inject(HttpClient);

  constructor() { }

  obtenerCasillas(id_evento: string) {
    return this.httpClient.get<CasillasResponse>(`${this.apiUrl}/eventos/${id_evento}/casillas`, { withCredentials: true });
  }

  crearCasilla(casilla: CasillaCreate, id_evento: string | null | undefined) {
    return this.httpClient.post<ResponseApi>(`${this.apiUrl}/eventos/${id_evento}/casillas`, casilla, {withCredentials: true});
  }

  actualizarCasilla(casilla: any, id_evento: string) {
    return this.httpClient.put<CasillaResponse>(`${this.apiUrl}/eventos/${id_evento}/casillas`, casilla, {withCredentials: true});
  }

  actualizarEjercidosCasilla(casilla: any, id_evento: string) {
    return this.httpClient.patch<CasillaResponse>(`${this.apiUrl}/eventos/${id_evento}/casillas/actualizar_ejercidos`, casilla, {withCredentials: true});
  }

    verMapaCasilla(id_evento: string | null | undefined): Observable<CasillaUbicacion[]> {
    return this.httpClient.get<CasillaUbicacion[]>(`${this.apiUrl}/eventos/${id_evento}/casillas/ubicaciones`, { withCredentials: true });
  }

  cargaMasiva(archivo: File, id_evento: string | null | undefined){
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.httpClient.post<ResponseApi>(`${this.apiUrl}/eventos/${id_evento}/casillas/carga_masiva`, formData, { withCredentials: true });
  }

  obtenerSecciones(id_evento: string | null | undefined){
    return this.httpClient.get<CasillasResponse>(`${this.apiUrl}/eventos/${id_evento}/casillas/secciones`, { withCredentials: true });
  }

}

import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  SimpatizanteCreate,
  SimpatizanteResponse,
  SimpatizantesResponse,
  SimpatizanteUpdate,
} from '../models/simpatizante.dto';
import { ResponseApi } from '../models/response.model';
import { map, Observable } from 'rxjs';
import { CasillaUbicacion } from '../models/casillas.model';
import { ISimpatizanteUbicacion } from '../models/simpatizante.model';

@Injectable({
  providedIn: 'root',
})
export class SimpatizantesService {
  private apiUrl = `${environment.API_URL}`;

  private httpClient = inject(HttpClient);

  constructor() {}

  // obtenerSimpatizantes() {
  //   return this.httpClient.get<SimpatizantesResponse>(`${this.apiUrl}/simpatizantes`, { withCredentials: true });
  // }

  obtenerSimpatizantes(
    id_evento?: string | null
  ): Observable<SimpatizantesResponse> {
    const params = id_evento ? { params: { id_evento } } : {};
    return this.httpClient.get<SimpatizantesResponse>(
      `${this.apiUrl}/simpatizantes`,
      {
        ...params,
        withCredentials: true,
      }
    );
  }

  obtenerSimpatizantesFiltrados(filtros: {
    id_evento: string;
    sexo?: string[]; // ahora arrays
    municipio?: number[];
    seccion?: number[];
    edad_min?: number;
    edad_max?: number;
    telefono_verificado?: boolean[];
  }): Observable<SimpatizantesResponse> {
    let params = new HttpParams().set('id_evento', filtros.id_evento);

    if (filtros.sexo) {
      filtros.sexo.forEach((s) => (params = params.append('sexo', s)));
    }

    if (filtros.municipio) {
      filtros.municipio.forEach(
        (m) => (params = params.append('municipio', m.toString()))
      );
    }

    if (filtros.seccion) {
      filtros.seccion.forEach(
        (s) => (params = params.append('seccion', s.toString()))
      );
    }

    if (filtros.edad_min != null)
      params = params.set('edad_min', filtros.edad_min.toString());
    if (filtros.edad_max != null)
      params = params.set('edad_max', filtros.edad_max.toString());

    if (filtros.telefono_verificado && filtros.telefono_verificado.length > 0) {
      params = params.set(
        'telefono_verificado',
        filtros.telefono_verificado.join(',') // convierte [true, false] en "true,false"
      );
    }

    return this.httpClient.get<SimpatizantesResponse>(
      `${this.apiUrl}/simpatizantes/filtrados`,
      {
        params,
        withCredentials: true,
      }
    );
  }

  crearSimpatizante(simpatizante: SimpatizanteCreate) {
    return this.httpClient.post<ResponseApi>(
      `${this.apiUrl}/simpatizantes`,
      simpatizante,
      { withCredentials: true }
    );
  }

  actualizarSimpatizante(simpatizante: SimpatizanteUpdate) {
    return this.httpClient.patch<SimpatizanteResponse>(
      `${this.apiUrl}/simpatizantes`,
      simpatizante,
      { withCredentials: true }
    );
  }

  // verificarCurpsimpatizante(curp: string): Observable<boolean> {
  //   return this.httpClient.get<{ bandera: boolean }>(`${this.apiUrl}/simpatizantes/verificar_curp/${curp}`).pipe(
  //     map(res => res.bandera) // extraemos el valor booleano
  //   );
  // }

  verificarCurpExistente(
    curp: string,
    id_evento?: string
  ): Observable<boolean> {
    const params = id_evento
      ? new HttpParams().set('id_evento', id_evento)
      : undefined;
    return this.httpClient.get<boolean>(
      `${this.apiUrl}/simpatizantes/verificar_curp/${curp}`,
      { params }
    );
  }

  verificarTelefonoExistente(
    telefono_celular: string,
    id_evento?: string
  ): Observable<boolean> {
    const params = id_evento
      ? new HttpParams().set('id_evento', id_evento)
      : undefined;
    return this.httpClient.get<boolean>(
      `${this.apiUrl}/simpatizantes/verificar_telefono/${telefono_celular}`,
      { params }
    );
  }

  actualizarTelefonoSimpatizante(simpatizante: SimpatizanteUpdate) {
    return this.httpClient.patch<SimpatizanteResponse>(
      `${this.apiUrl}/simpatizantes/actualizar_telefono`,
      simpatizante,
      { withCredentials: true }
    );
  }

  actualizarCoordenadasSimpatizante(data: {
    id_simpatizante: string;
    latitud: number;
    longitud: number;
  }) {
    return this.httpClient.patch<SimpatizanteResponse>(
      `${this.apiUrl}/simpatizantes/actualizar_coordenadas`,
      data,
      { withCredentials: true }
    );
  }

  actualizarIneSimpatizante(id: string, formData: FormData): Observable<any> {
    return this.httpClient.put(
      `${this.apiUrl}/simpatizantes/actualizar_ine/${id}`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  actualizarEjercioSimpatizante(simpatizante: any) {
    return this.httpClient.patch<SimpatizanteResponse>(
      `${this.apiUrl}/simpatizantes/actualizar_ejercio`,
      simpatizante,
      { withCredentials: true }
    );
  }

  verMapaSimpatizantes(): Observable<ISimpatizanteUbicacion[]> {
    return this.httpClient.get<ISimpatizanteUbicacion[]>(
      `${this.apiUrl}/simpatizantes/ubicaciones`,
      { withCredentials: true }
    );
  }

  obtenerSecciones() {
    return this.httpClient.get<any>(`${this.apiUrl}/simpatizantes/secciones`, {
      withCredentials: true,
    });
  }

  obtenerPromotores(id_evento: string) {
    return this.httpClient.get<any>(
      `${this.apiUrl}/usuarios/obtener_promotor/${id_evento}`,
      {
        withCredentials: true,
      }
    );
  }

  obtenerEnlacePromotores(id_evento: string) {
    return this.httpClient.get<any>(
      `${this.apiUrl}/usuarios/obtener_enlace_promotor/${id_evento}`,
      {
        withCredentials: true,
      }
    );
  }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment'
import {Actividad} from "../models/actividades.model";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {Usuario} from "../models/usuario.model";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient) {
  }//end constructor

  private tablaActividades = new BehaviorSubject<Actividad[]>([])

  obtenerTablaActividades(id: string | null): Observable<Actividad[]> {
    return this.http.get<{ success: boolean; code: number; message: string; data: Actividad[] }>(
        `${this.apiUrl}/actividades/${id}`,
        { withCredentials: true }
    ).pipe(
        map(response => response.data), // Extrae solo el campo `data`
        tap((tablaActividadesData: Actividad[]) => {
          this.tablaActividades.next(tablaActividadesData);
        })
    );
  }

  crearActividad(data: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.apiUrl}/actividades/`, data, { withCredentials: true }).pipe(
        tap((actividadNueva: Actividad) => {
          if (actividadNueva.id_evento) {
            this.obtenerTablaActividades(actividadNueva.id_evento).subscribe();
          }
        })
    );
  }

  obtenerActividad(id: string): Observable<Actividad> {
    return this.http.get<{ success: boolean; code: number; message: string; data: Actividad }>(
        `${this.apiUrl}/actividades/obtener_actividad/${id}`,
        { withCredentials: true }
    ).pipe(
        map(response => response.data)
    );
  }

  actualizarActividad(id: string, data: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/actividades/${id}`, data, { withCredentials: true }).pipe(
        tap((actividadActualizada: Actividad) => {
          if (actividadActualizada.id_evento) {
            this.obtenerTablaActividades(actividadActualizada.id_evento).subscribe();
          }
        })
    );
  }

  actualizarEstatusActividad(id: string, data: { estatus: boolean }): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/actividades/cambiar_estatus/${id}`, data, { withCredentials: true }).pipe(
        tap((actividadActualizada: Actividad) => {
          if (actividadActualizada.id_evento) {
            this.obtenerTablaActividades(actividadActualizada.id_evento).subscribe();
          }
        })
    );
  }

  getTablaActividades(): Observable<Actividad[]> {
    return this.tablaActividades.asObservable();
  }

  actualizarFotografiaPonente(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/actividades/actualizar_fotografia/${id}`, formData, {
      withCredentials: true,
    });
  }






}

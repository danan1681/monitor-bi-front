import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, EMPTY, map, catchError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import {
  IDependencias,
  IDistritosFederales,
  IDistritosLocales,
  IEstados,
  ILocalidades,
  IMunicipios,
  IRoles,
  ISecciones,
  IUsuarioEstatus,
} from '../models/datos-estaticos1';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StarterServices {
  private apiUrl = `${environment.API_URL}`;

  private dependencias = new ReplaySubject<IDependencias[]>(1);
  private estados = new ReplaySubject<IEstados[]>(1);
  private estatusUsuario = new ReplaySubject<IUsuarioEstatus[]>(1);

  constructor(private http: HttpClient) {}

  getRoles(): Observable<IRoles[]> {
    // if (!this.roles.observed) {
    //   this.http.get<IRoles[]>(`${this.apiUrl}/datos_estaticos/roles`, { withCredentials: true }).pipe(
    //     tap((data: IRoles[]) => this.roles)
    //   ).subscribe();
    // }

    return this.http.get<IRoles[]>(`${this.apiUrl}/datos_estaticos/roles`, {
      withCredentials: true,
    });
  }

  getDependencias(): Observable<IDependencias[]> {
    if (!this.dependencias.observed) {
      this.http
        .get<IDependencias[]>(`${this.apiUrl}/datos_estaticos/dependencias`, {
          withCredentials: true,
        })
        .pipe(tap((data: IDependencias[]) => this.dependencias.next(data)))
        .subscribe();
    }
    return this.dependencias.asObservable();
  }

  obtenerEstados() {
    return this.http.get<IEstados[]>(`${this.apiUrl}/datos_estaticos/estados`, {
      withCredentials: true,
    });
  }

  obtenerDistritosFederales() {
    return this.http.get<IDistritosFederales[]>(
      `${this.apiUrl}/datos_estaticos/distritos_federales`,
      { withCredentials: true }
    );
  }

  obtenerDistritosLocales() {
    return this.http.get<IDistritosLocales[]>(
      `${this.apiUrl}/datos_estaticos/distritos_locales`,
      { withCredentials: true }
    );
  }

  obtenerMunicipios() {
    return this.http.get<IMunicipios[]>(
      `${this.apiUrl}/datos_estaticos/municipios`,
      { withCredentials: true }
    );
  }

  obtenerSecciones(): Observable<ISecciones[]> {
    return this.http.get<ISecciones[]>(
      `${this.apiUrl}/datos_estaticos/secciones`,
      { withCredentials: true }
    );
  }

  obtenerSeccion(seccion: number) {
    return this.http.get<ISecciones[]>(
      `${this.apiUrl}/datos_estaticos/secciones/${seccion}`,
      { withCredentials: true }
    );
  }

  obtenerLocalidades(): Observable<ILocalidades[]> {
    return this.http.get<ILocalidades[]>(
      `${this.apiUrl}/datos_estaticos/localidades`,
      { withCredentials: true }
    );
  }

  obtenerLogs(
    page: number = 1,
    limit: number = 20,
    usuario?: string,
    accion?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (usuario) {
      params = params.set('usuario', usuario);
    }
    if (accion) {
      params = params.set('accion', accion);
    }
    if (fechaInicio && fechaFin) {
      params = params.set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    }

    return this.http.get<boolean>(`${this.apiUrl}/datos_estaticos/logs`, {
      params,
      withCredentials: true,
    });
  }

  validarSeccionExiste(seccion: number): Observable<boolean> {
    if (!seccion) return EMPTY;

    return this.http
      .get<any[]>(`${this.apiUrl}/datos_estaticos/secciones/${seccion}`, {
        withCredentials: true,
      })
      .pipe(
        // true si se encontraron resultados
        map((data) => Array.isArray(data) && data.length > 0),
        catchError(() => [false]) // si ocurre error asumimos que no existe
      );
  }

  getUsuariosEstatus(): Observable<IUsuarioEstatus[]> {
    if (!this.estatusUsuario.observed) {
      this.http
        .get<IUsuarioEstatus[]>(
          `${this.apiUrl}/datos_estaticos/usuario_estatus`,
          { withCredentials: true }
        )
        .pipe(tap((data: IUsuarioEstatus[]) => this.estatusUsuario.next(data)))
        .subscribe();
    }
    return this.estatusUsuario.asObservable();
  }

  resetState(): void {
    this.dependencias.next([]);
    this.estatusUsuario.next([]);
  }
}

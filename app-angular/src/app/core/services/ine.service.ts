import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IneService {
  private apiUrl = `${environment.INE_URL}`;

  constructor(private http: HttpClient) {}

  getIne(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    );
    return this.http.post(`${this.apiUrl}/documents/process-ine`, formData, {
      headers,
    });
  }

  enviarMensaje(body: Object) {
    return this.http.post(
      `https://modulo.amigostlax.mx/api/v1/mensajes/enviar_mensaje`,
      body,
      {
        withCredentials: true,
      }
    );
  }
}

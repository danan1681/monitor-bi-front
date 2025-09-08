import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DataActualizarSeccion } from '../models/enlaces.model';
import {ReglamentosService} from "./reglamentos.service";
import {LoaderService} from "./loader.service";

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  constructor(
    private toastr: ToastrService,
    private reglamentosService: ReglamentosService,
    private loaderService: LoaderService,
  ) { }


  aprobarContenido(data: any): Observable<any> {
    return new Observable(observer => {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c15ef6',
        cancelButtonColor: '#5987ef',
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true  // Esta opción invierte los botones
      }).then((result:any) => {
        if (result.isConfirmed) {
          const finalizar = {
            id_manual: data._id,
            seccion: data.seccion,
          };

          const dataSeccion: DataActualizarSeccion = {
            id_manual: data._id,
            seccion: data.seccion,
            contenido: data.contenido,
            estatus_seccion: 'Aceptada',
            fecha_ultima_modificacion: new Date().toISOString(),
            fecha_ultimo_acceso: new Date().toISOString()
          };

        } else {
          observer.complete();
        }
      });
    });
  }

  aprobarContenidoSubseccion(data: any): Observable<any> {
    return new Observable(observer => {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c15ef6',
        cancelButtonColor: '#5987ef',
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true  // Esta opción invierte los botones
      }).then((result:any) => {
        if (result.isConfirmed) {
          const finalizar = {
            id_manual: data._id,
            seccion: data.seccion,
            subseccion: data.subseccion,
          };

          const dataSubseccion = {
            id_manual: data._id,
            seccion: data.seccion,
            subseccion: data.subseccion,
            contenido: data.contenido,
            estatus_subseccion: 'Aceptada',
          };

        } else {
          observer.complete();
        }
      });
    });
  }

  aprobarReglamentoCompleto(id_reglamento: string): Observable<any> {
    return new Observable((observer) => {
      // Llamar al servicio para obtener el estatus de las secciones
      this.reglamentosService.obtenerEstatusSecciones(id_reglamento).subscribe({
        next: (estatus: any) => {
          // Construir la lista de estatus de las secciones dinámicamente
          const estatusSecciones = Object.keys(estatus)
            .filter((key) => key !== 'tipo_dependencia' && key !== 'nombre_dependencia' && key !== '_id')
            .map((key) => `<strong>${this.formatSectionName(key)}:</strong> ${estatus[key]}`)
            .join('<br>');

          // Mostrar el Swal con los estatus de las secciones
          Swal.fire({
            title: '¿Aprobar reglamento?',
            html: `Esta acción hará que todas las secciones del reglamento sean aprobadas sin importar el estatus actual.<br><br>
                 <strong>Estatus actual de las secciones:</strong><br>${estatusSecciones}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c15ef6',
            cancelButtonColor: '#5987ef',
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
          }).then((result) => {
            if (result.isConfirmed) {
              this.loaderService.show();
              // Llamar al servicio para aprobar el reglamento
              const body = {
                id_reglamento: id_reglamento
              }
              this.reglamentosService.aprobarReglamento(body).subscribe({
                next: (response) => {
                  setTimeout(() => {
                    this.loaderService.hide(); // Ocultar el loader después de 2 segundos
                    Swal.fire(
                      '¡Aprobado!',
                      'El reglamento ha sido aprobado correctamente.',
                      'success'
                    ).then(() => {
                      window.location.reload(); // Recargar la página después de cerrar el mensaje
                    });
                    observer.next(response);
                    observer.complete();
                  }, 2000); // Delay de 2 segundos
                },
                error: (error) => {
                  Swal.fire(
                    'Error',
                    'Ocurrió un error al aprobar el reglamento.',
                    'error'
                  );
                  observer.error(error);
                },
              });
            } else {
              observer.complete();
            }
          });
        },
        error: (error) => {
          Swal.fire(
            'Error',
            'Ocurrió un error al obtener el estatus de las secciones.',
            'error'
          );
          observer.error(error);
        },
      });
    });
  }

// Método auxiliar para formatear nombres de secciones
  private formatSectionName(section: string): string {
    return section
      .replace(/_/g, ' ') // Reemplazar guiones bajos por espacios
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalizar cada palabra
  }




}

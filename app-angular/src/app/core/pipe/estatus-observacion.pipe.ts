import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estatusObservacion',
  standalone: true
})
export class EstatusObservacionPipe implements PipeTransform {

  transform(status: any): any {
    switch (status) {
      case "2":
        return `<h4>
                  <span class="bg-light-warning text-warning rounded f-w-600 p-6 p-y-4 f-s-12">
                    Leída
                  </span>
                </h4>`;
      case "1":
        return `<h4>
                  <span class="bg-light-accent text-accent rounded f-w-600 p-6 p-y-4 f-s-12">
                    Creada
                  </span>
                </h4>`;
      case "3":
        return `<h4>
                  <span class="bg-light-success text-success rounded f-w-600 p-6 p-y-4 f-s-12">
                    Atendida
                  </span>
                </h4>`;
      default:
        return `<h4>
                  <span class="bg-light-muted text-muted rounded f-w-600 p-6 p-y-4 f-s-12">
                    Desconocido
                  </span>
                </h4>`;
    }
  }

}

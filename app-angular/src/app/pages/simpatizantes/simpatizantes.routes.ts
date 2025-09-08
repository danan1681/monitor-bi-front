import { Routes } from '@angular/router';
import { SimpatizantesComponent } from './simpatizantes.component';
import { RegistroSimpatizantesComponent } from './registro-simpatizantes/registro-simpatizantes.component';
import {MapaSimpatizantesComponent} from "./mapa-simpatizantes/mapa-simpatizantes.component";

export const SimpatizantesRoutes: Routes = [
  {
    path: '',
    component: SimpatizantesComponent,
    data: {
      title: 'REGISTRO',
    }
  },
  {
    path: 'registro',
    component: RegistroSimpatizantesComponent,
    data: {
      title: 'NUEVO REGISTRO',
    }
  },
  {
    path: 'mapa',
    component: MapaSimpatizantesComponent,
    data: {
      title: 'MAPA DE SIMPATIZANTES',
    }
  }
];

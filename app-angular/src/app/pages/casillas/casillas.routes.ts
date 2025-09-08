import {Routes} from "@angular/router";
import {CasillasComponent} from "./casillas.component";
import {RegistroCasillasComponent} from "./registro-casillas/registro-casillas.component";
import {CasillasMapaComponent} from "./casillas-mapa/casillas-mapa.component";

export const CasillasRoutes: Routes = [
  {
    path: '',
    component: CasillasComponent,
    data: {
      title: 'CASILLAS',
    }
  },
  {
    path: 'registro',
    component: RegistroCasillasComponent,
    data: {
      title: 'NUEVA CASILLA',
      urls: [
        { title: 'Eventos /', url: '/eventos' },
        { title: 'Detalles evento /' },
        { title: 'Casillas /' },
        { title: 'Nueva casilla' }
      ]
    }
  },
  {
    path: 'mapa',
    component: CasillasMapaComponent,
    data: {
      title: 'MAPA DE CASILLAS',
      urls: [
        { title: 'Eventos /', url: '/eventos' },
        { title: 'Detalles evento /' },
        { title: 'Casillas /' },
        { title: 'Mapa de casillas' }
      ]
    }
  }

]

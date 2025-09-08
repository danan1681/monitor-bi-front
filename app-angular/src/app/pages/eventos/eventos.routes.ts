import { Routes } from '@angular/router';
import { EventosComponent } from "./eventos.component";
import {EventoDetallesComponent} from "./evento-detalles/evento-detalles.component";
import {EventoPromotoresComponent} from "./evento-promotores/evento-promotores.component";

export const EventosRoutes: Routes = [
  {
    path: '',
    component: EventosComponent,
    data: {
      title: 'EVENTOS',
    }
  },
  {
    path: ':id_evento/detalles',
    component: EventoDetallesComponent,
    data: {
      title: 'Detalles evento',
      urls: [
        { title: 'Eventos /', url: '/eventos' },
        { title: 'Detalles evento' }
      ]
    }
  },
  {
    path: ':id_evento/promotores',
    component: EventoPromotoresComponent,
    data: {
      title: 'Promotores evento',
      urls: [
        { title: 'Eventos /', url: '/eventos' },
        { title: 'Detalles evento /' },
        { title: 'Promotores evento' }
      ]
    }
  },
  {
    path: ':id_evento',
    children: [
      {
        path: 'candidaturas',
        loadChildren: () =>
          import('../candidaturas/candidaturas.routes').then(m => m.CandidaturasRoutes),
        data: {
          title: 'Candidaturas',
          urls: [
            { title: 'Eventos /', url: '/eventos' },
            { title: 'Detalles evento /' },
            { title: 'Candidaturas' }
          ]
        }
      },
      {
        path: 'casillas',
        loadChildren: () =>
          import('../casillas/casillas.routes').then(m => m.CasillasRoutes),
        data: {
          title: 'Casillas',
          urls: [
            { title: 'Eventos /', url: '/eventos' },
            { title: 'Detalles evento /' },
            { title: 'Casillas' }
          ]
        }
      },
      {
        path: 'candidatos',
        loadChildren: () =>
          import('../candidatos/candidatos.routes').then(m => m.CandidatosRoutes),
        data: {
          title: 'Candidatos',
          urls: [
            { title: 'Eventos /', url: '/eventos' },
            { title: 'Detalles evento /' },
            { title: 'Candidatos' }
          ]
        }
      }
    ]
  }
];

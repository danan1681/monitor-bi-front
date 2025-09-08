import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './core/guards/auth.guard';
import {authAdminGuard} from "./core/guards/auth-admin.guard";
import {authAdminOrPromotorGuard} from "./core/guards/auth-promotor.guard";

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    data: { title: 'full Views' },
    children: [
      {
        path: '',
        redirectTo: 'starter',
        pathMatch: 'full',
      },
      {
        canActivate: [AuthGuard],
        path: 'starter',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        canActivate: [authAdminOrPromotorGuard],
        path: 'usuarios',
        loadChildren: () =>
          import('./pages/usuarios/usuarios.routes').then((m) => m.UsuariosRoutes),
      },
      {
        canActivate: [authAdminGuard],
        path: 'eventos',
        loadChildren: () =>
          import('./pages/eventos/eventos.routes').then((m) => m.EventosRoutes),
      },
      {
        canActivate: [AuthGuard],
        path: 'nuevo_registro',
        loadChildren: () =>
          import('./pages/simpatizantes/simpatizantes.routes').then((m) => m.SimpatizantesRoutes),
      },
      {
        canActivate: [authAdminGuard],
        path: 'logs',
        loadChildren: () =>
          import('./pages/logs/logs.routes').then((m) => m.LogsRoutes),
      },
      {
        canActivate: [AuthGuard],
        path: 'telefonos',
        loadChildren: () =>
          import('./pages/telefonos/telefonos.routes').then((m) => m.TelefonosRoutes),
      }
      // {
      //   canActivate: [authAdminGuard],
      //   path: 'candidatos',
      //   loadChildren: () =>
      //     import('./pages/candidatos/candidatos.routes').then((m) => m.CandidatosRoutes),
      // },
      // {
      //   canActivate: [authAdminGuard],
      //   path: 'candidaturas',
      //   loadChildren: () =>
      //     import('./pages/candidaturas/candidaturas.routes').then((m) => m.CandidaturasRoutes),
      // },
      // {
      //   canActivate: [authAdminGuard],
      //   path: 'casillas',
      //   loadChildren: () =>
      //     import('./pages/casillas/casillas.routes').then((m) => m.CasillasRoutes),
      // }
    ]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },



  {
    path: '**',
    redirectTo: 'authentication',
  },
];

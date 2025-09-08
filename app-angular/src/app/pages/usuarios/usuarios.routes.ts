import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';

export const UsuariosRoutes: Routes = [
  {
    path: '',
    component: UsuariosComponent,
    data: {
      title: 'USUARIOS',
    }
  }

];

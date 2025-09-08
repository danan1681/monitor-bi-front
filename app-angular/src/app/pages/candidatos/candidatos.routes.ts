import {Routes} from "@angular/router";
import {CandidatosComponent} from "./candidatos.component";

export const CandidatosRoutes: Routes = [
  {
    path: '',
    component: CandidatosComponent,
    data: {
      title: 'CANDIDATOS',
    }
  },
]

import {Routes} from "@angular/router";
import {CandidaturasComponent} from "./candidaturas.component";

export const CandidaturasRoutes: Routes = [
  {
    path: '',
    component: CandidaturasComponent,
    data: {
      title: 'CANDIDATURAS',
    }
  },
]

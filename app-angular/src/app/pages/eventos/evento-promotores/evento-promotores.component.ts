import { Component } from '@angular/core';
import {UsuariosComponent} from "../../usuarios/usuarios.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-evento-promotores',
  standalone: true,
  imports: [
    UsuariosComponent
  ],
  templateUrl: './evento-promotores.component.html',
  styleUrl: './evento-promotores.component.scss'
})
export class EventoPromotoresComponent {

  id_evento: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id_evento = this.route.snapshot.paramMap.get('id_evento')!;
  }

}

import {Component, QueryList, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import { StarterServices } from 'src/app/core/services/starter.service';
import { MaterialModule } from 'src/app/material.module';
import {IRoles} from "../../core/models/datos-estaticos1";
import {NgIf} from "@angular/common";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {LegendPosition} from "@swimlane/ngx-charts";
import { Color, ScaleType } from '@swimlane/ngx-charts';
import {FormsModule} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  standalone: true,
  imports: [MaterialModule, NgIf, NgxChartsModule, FormsModule, MatDatepickerModule, MatNativeDateModule],
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class StarterComponent{

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>; // Manejar múltiples paginadores
  nombreCompleto = localStorage.getItem('nombreCompleto')
  claveRol = Number(localStorage.getItem('clave_rol'));
  nombreRol: any;
  participantes: any[] = [];
  eventos: any[] = [];
  legendPos: LegendPosition = LegendPosition.Below;
  colorSchemeGenero : Color = {
    name: 'genero',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#a81cf1', '#ff185e']
  };
  colorSchemeDependencias : Color = {
    name: 'dependencia',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#aa172d', '#77b82c', '#16b5ce', '#ef8115', '#9C27B0', '#FF5722', '#582471'] // Verde, Naranja, Azul, Amarillo, Púrpura, Rojo
  };
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  actividadSeleccionadaPorEvento: { [eventoId: string]: string } = {};


  displayedColumns: string[] = ['nombre', 'correo', 'curp', 'rfc', 'telefono'];

  constructor( private starterService: StarterServices)
  {
    
    this.starterService.getRoles().subscribe((roles: IRoles[]) => {

      const rolEncontrado = roles.find((rol: IRoles) => rol.clave_rol === this.claveRol);

      if(this.claveRol === 27){
        this.nombreRol = 'Superadministrador';
      }
      if(this.claveRol === 48){
        this.nombreRol = 'Promotor';
      } else {
        this.nombreRol = rolEncontrado?.nombre_rol || 'Sin Rol';
      }
    });

  } //end constructor

  ngOnInit(): void{

  }



}

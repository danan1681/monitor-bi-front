import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import {EventoResponse} from "../../core/models/eventos.dto";
import {EventosService} from "../../core/services/eventos.service";
import {Evento} from "../../core/models/eventos.model";
import {MatIcon} from "@angular/material/icon";
import { MaterialModule } from '../../material.module';
import { Location } from '@angular/common';

@Component({
  selector: 'app-evento-titulo',
  standalone: true,
  imports: [CommonModule, MatCardModule, TablerIconsModule, MatIcon, MaterialModule],
  templateUrl: './evento-titulo.component.html',
})
export class EventoTituloComponent implements OnInit {
  @Input() idEvento!: string;

  evento: Evento | null = null;
  constructor(private eventoService: EventosService,
              private location: Location) {}

  ngOnInit(): void {
    this.eventoService.obtenerEvento(this.idEvento).subscribe({
      next: (response: EventoResponse) => {
        if (response.code === 200) {
          this.evento = response.data;
        }
      },
      error: err => {
        console.error('Error al obtener el evento', err);
      }
    });
    this.descripcionRecortada
  }

  goBack(): void {
    this.location.back();
  }

  get descripcionRecortada(): string {
    if (!this.evento?.descripcion) return '';
    return this.evento.descripcion.length > 2800
      ? this.evento.descripcion.slice(0, 2800) + '...'
      : this.evento.descripcion;
  }


  protected readonly window = window;
}

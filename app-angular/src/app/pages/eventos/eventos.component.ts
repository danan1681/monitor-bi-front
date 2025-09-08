import {Component, effect, signal, ViewChild} from '@angular/core';
import {
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Evento} from "../../core/models/eventos.model";
import {EventosResponse} from "../../core/models/eventos.dto";
import {EventosService} from "../../core/services/eventos.service";
import {TablerIconsModule} from "angular-tabler-icons";
import {CommonModule, DatePipe} from "@angular/common";
import {MaterialModule} from "../../material.module";
import {ToastrModule, ToastrService} from "ngx-toastr";
import {EventosDialogComponent} from "./eventos-dialog/eventos-dialog.component";
import {IEstados} from "../../core/models/datos-estaticos1";
import {StarterServices} from "../../core/services/starter.service";

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [MaterialModule, ToastrModule, TablerIconsModule, CommonModule],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'nombre',
    'descripcion',
    'tipo',
    'fecha',
    'acciones',
  ];

  eventos = signal<Evento[]>([]);
  estados = signal<IEstados[]>([])
  dataSource = new MatTableDataSource<Evento>([]);


  constructor(
    private routes: Router,
    private eventosService: EventosService,
    private dialog: MatDialog,
    private starterService: StarterServices,
    private toastr: ToastrService,
  ){
    effect(() => {
      this.dataSource.data = this.eventos();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void{
    this.obtenerEventos();
    this.obtenerEstados();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  obtenerEventos(): void {
    this.eventosService.obtenerEventos().subscribe({
      next: (response: EventosResponse) => {
        if (response.code === 200) {
          this.eventos.set(response.data); // ← Solo modificas la signal
        } else {
          console.error("Error al obtener los eventos", response.message);
        }
      },
      error: (error: any) => {
        console.error('Error al obtener los eventos', error.message);
      }
    });
  }


  verDetalles(id: number): void {
    this.routes.navigate(['eventos', id, 'detalles']);
  }

  verPromotores(id: number): void {
    this.routes.navigate(['eventos', id, 'promotores']);
  }

  openNuevoEvento(action: String, evento: Evento | null): void {
    const dialogRef = this.dialog.open(EventosDialogComponent, {
      data: { action, evento },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerEventos();
      }
    });
  }

  obtenerNombreEstado(clave: string): string {
    const estado = this.estados().find(e => String(e.clave_estado) === String(clave));
    return estado ? estado.nombre_estado : '';
  }

  obtenerEstados(){
    this.starterService.obtenerEstados().subscribe({
      next: (response: IEstados[]) => {
        this.estados.set(response);
      },
      error: (error) => {
        console.error("Error al obtener los estados", error);
        this.toastr.error('Error al obtener los estados');
      }
    })
  }


}

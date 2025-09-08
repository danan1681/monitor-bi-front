import {Component, ViewChild} from '@angular/core';
import {MaterialModule} from "../../material.module";
import {TablerIconsModule} from "angular-tabler-icons";
import {ToastrModule} from "ngx-toastr";
import {DatePipe, NgClass, SlicePipe} from "@angular/common";
import {MatChipsModule} from "@angular/material/chips";
import {StarterServices} from "../../core/services/starter.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule, ToastrModule, SlicePipe, NgClass, MatChipsModule, DatePipe],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent {

  displayedColumns: string[] = ['usuario', 'accion', 'usuario_afectado', 'fecha'];
  dataSource = new MatTableDataSource<any>([]);
  totalRegistros = 0;
  filtroTexto = '';  // Nuevo filtro de búsqueda
  pageSize = 10;  // Tamaño de página
  pageIndex = 0;  // Página actual

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private starterService: StarterServices) {
  }

  ngOnInit() {
    this.cargarLogs();
  }

  cargarLogs() {
    this.starterService.obtenerLogs(this.pageIndex + 1, this.pageSize, this.filtroTexto)
      .subscribe(response => {
        this.dataSource.data = response.logs;
        this.totalRegistros = response.total;
      });
  }

  applyFilter(event: Event) {
    this.filtroTexto = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.pageIndex = 0;  // Reiniciar a la primera página al buscar
    this.cargarLogs();
  }

  cambiarPagina(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarLogs();
  }

}

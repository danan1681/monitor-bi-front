import {Component, effect, signal, ViewChild} from '@angular/core';
import {
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Casilla} from "../../core/models/casillas.model";
import {CasillasService} from "../../core/services/casillas.service";
import {CasillasResponse} from "../../core/models/casillas.dto";
import {CasillasDialogComponent} from "./casillas-dialog/casillas-dialog.component";

import {TablerIconsModule} from "angular-tabler-icons";
import {MaterialModule} from "../../material.module";
import {ToastrModule, ToastrService} from "ngx-toastr";
import {CommonModule} from "@angular/common";
import {ISimpatizante} from "../../core/models/simpatizante.model";
import {
  DialogEditarSimpatizanteComponent
} from "../simpatizantes/dialog-editar-simpatizante/dialog-editar-simpatizante.component";
import {EventoTituloComponent} from "../../components/evento-titulo/evento-titulo.component";
import {LoaderService} from "../../core/services/loader.service";
import Swal from "sweetalert2";
import {EjercidosCasillasComponent} from "./casillas-dialog/ejercidos-casillas.component";
import {StarterServices} from "../../core/services/starter.service";

@Component({
  selector: 'app-casillas',
  standalone: true,
  imports: [MaterialModule, ToastrModule, TablerIconsModule, CommonModule, EventoTituloComponent],
  templateUrl: './casillas.component.html',
  styleUrl: './casillas.component.scss'
})
export class CasillasComponent {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'distrito_federal',
    'distrito_local',
    'municipio',
    'seccion',
    'tipo_casilla',
    'total_votos',
    'lista_nominal',
    'meta',
    'ejercidos',
    'acciones',
  ];

  casillas = signal<Casilla[]>([]);
  dataSource = new MatTableDataSource<Casilla>([]);
  idEvento!: string;
  seccionesInfo = signal<Map<string, any>>(new Map());


  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private casillasService: CasillasService,
    private starterService: StarterServices,
    private dialog: MatDialog,
    private loader: LoaderService,
    private toastr: ToastrService,
  ){
    effect(() => {
      this.dataSource.data = this.casillas();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void{
    this.idEvento = this.route.snapshot.paramMap.get('id_evento')!;
    this.obtenerCasillas();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  obtenerCasillas(): void {
    this.casillasService.obtenerCasillas(this.idEvento).subscribe({
      next: (response: CasillasResponse) => {
        if (response.code === 200) {
          const casillas = response.data;

          casillas.forEach((casilla) => {
            const needsData =
              casilla.distritoFederal == null ||
              casilla.distritoLocal == null ||
              casilla.municipio == null;

            console.log(needsData)
            if (needsData) {
              this.starterService.obtenerSeccion(Number(casilla.seccion)).subscribe({
                next: (res: any[]) => {
                  if (res.length > 0) {
                    const datos = res[0];
                    casilla.distritoFederal = datos.distrito_federal;
                    casilla.distritoLocal = datos.distrito_local;
                    casilla.municipio = datos.municipio;
                    this.dataSource._updateChangeSubscription();
                  } else {
                    console.warn(`No se encontró sección ${casilla.seccion}`);
                  }
                },
                error: (err) => {
                  console.error(`Error obteniendo sección ${casilla.seccion}`, err);
                }
              });

            }
          });

          this.casillas.set(casillas); // Actualiza signal
        } else {
          console.error("Error al obtener las casillas", response.message);
        }
      },
      error: (error) => {
        console.error("Error al obtener las casillas", error.message);
      }
    });
  }


  nuevaCasilla(): void {
    this.routes.navigate([`/eventos`, this.idEvento, 'casillas', 'registro']);
  }

  verMapa(): void {
    this.routes.navigate([`/eventos`, this.idEvento, 'casillas', 'mapa']);
  }


  openDialogEditar(casilla: any): void {
    const dialogRef = this.dialog.open(CasillasDialogComponent, {
      data: {casilla, id_evento: this.idEvento}
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerCasillas();
      }
    });
  }

  openDialogEjercidos(action: String, casilla: any): void {
    const dialogRef = this.dialog.open(EjercidosCasillasComponent, {
      data: {action, casilla, id_evento: this.idEvento}
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerCasillas();
      }
    });
  }

  subirArchivoExcel(event: Event): void {
    this.loader.show();
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      this.casillasService.cargaMasiva(archivo, this.idEvento).subscribe({
        next: (res) => {
          this.loader.hide();
          this.toastr.success('Archivo cargado correctamente');
          this.obtenerCasillas(); // Refresca la tabla
        },
        error: (err) => {
          this.loader.hide();
          this.toastr.error('Error al cargar el archivo');
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar el archivo',
            text: err.error.message || 'Ocurrió un error al procesar el archivo. Por favor, verifica el formato y vuelve a intentarlo.'
          })
        }
      });
      input.value = ''; // Reinicia el input para permitir subir el mismo archivo de nuevo si se desea
    }
  }


}

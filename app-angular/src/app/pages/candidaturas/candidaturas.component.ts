import {Component, effect, signal, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {CandidatosResponse} from "../../core/models/candidato.dto";
import {MaterialModule} from "../../material.module";
import {ToastrModule, ToastrService} from "ngx-toastr";
import {TablerIconsModule} from "angular-tabler-icons";
import {CommonModule} from "@angular/common";
import {CandidaturasResponse} from "../../core/models/candidaturas.dto";
import {Candidatura} from "../../core/models/candidaturas.model";
import {CandidaturasService} from "../../core/services/candidaturas.service";
import {CandidaturasDialogComponent} from "./candidaturas-dialog/candidaturas-dialog.component";
import {ActivatedRoute} from "@angular/router";
import {EventoTituloComponent} from "../../components/evento-titulo/evento-titulo.component";
import {IMunicipios} from "../../core/models/datos-estaticos1";
import {StarterServices} from "../../core/services/starter.service";

@Component({
  selector: 'app-candidaturas',
  standalone: true,
  imports: [MaterialModule, ToastrModule, TablerIconsModule, CommonModule, EventoTituloComponent],
  templateUrl: './candidaturas.component.html',
  styleUrl: './candidaturas.component.scss'
})
export class CandidaturasComponent {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'nombre',
    'tipo',
    'clave',
    'estatus',
    'acciones',
  ];

  candidaturas = signal<Candidatura[]>([]);
  dataSource = new MatTableDataSource<Candidatura>([]);
  idEvento!: string;
  municipios = signal<IMunicipios[]>([])

  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private candidaturasService: CandidaturasService,
    private starterService: StarterServices,
    private dialog: MatDialog,
    private toastr: ToastrService
  ){
    effect(() => {
      this.dataSource.data = this.candidaturas();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void{
    this.idEvento = this.route.snapshot.paramMap.get('id_evento')!;
    this.obtenerCandidaturas();
    this.obtenerMunicipios();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // obtenerCandidaturas(): void {
  //   this.candidaturasService.obtenerCandidaturas().subscribe({
  //     next: (response: CandidaturasResponse) => {
  //       if (response.code === 200) {
  //         this.candidaturas.set(response.data);
  //       } else {
  //         console.error("Error al obtener las candidaturas", response.message);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener las candidaturas', error.message);
  //     }
  //   });
  // }
  //
  // openNuevoCandidatura(action: String, candidatura: Candidatura | null): void {
  //   const dialogRef = this.dialog.open(CandidaturasDialogComponent, {
  //     data: { action, candidatura },
  //   });
  //
  //   dialogRef.afterClosed().subscribe((result: string) => {
  //     if (result === 'reload') {
  //       this.obtenerCandidaturas();
  //     }
  //   });
  // }

  obtenerCandidaturas(): void {
    this.candidaturasService.obtenerCandidaturas(this.idEvento).subscribe({
      next: (response: CandidaturasResponse) => {
        if (response.code === 200) {
          this.candidaturas.set(response.data);
        } else {
          console.error("Error al obtener las candidaturas", response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener las candidaturas', error.message);
      }
    });
  }

  openNuevoCandidatura(action: string, candidatura: Candidatura | null): void {
    const dialogRef = this.dialog.open(CandidaturasDialogComponent, {
      data: { action, candidatura, id_evento: this.idEvento },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerCandidaturas();
      }
    });
  }

  obtenerNombreMunicipio(clave: string): string {
    const municipio = this.municipios().find(m => String(m.municipio_clave) === String(clave));
    return municipio ? municipio.municipio_nombre : '';
  }

  obtenerMunicipios(){
    this.starterService.obtenerMunicipios().subscribe({
      next: (response: IMunicipios[]) => {
        this.municipios.set(response);
      },
      error: (error) => {
        console.error("Error al obtener los municipios", error);
        this.toastr.error('Error al obtener los municipios');
      }
    });
  }

}

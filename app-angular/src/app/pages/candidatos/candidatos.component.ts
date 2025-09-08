import {Component, effect, signal, ViewChild} from '@angular/core';
import {CommonModule, SlicePipe} from "@angular/common";
import {TablerIconsModule} from "angular-tabler-icons";
import {MaterialModule} from "../../material.module";
import {ToastrModule} from "ngx-toastr";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Candidato} from "../../core/models/candidato.model";
import {CandidatosDialogComponent} from "./candidatos-dialog/candidatos-dialog.component";
import {CandidatosService} from "../../core/services/candidatos.service";
import {CandidatosResponse} from "../../core/models/candidato.dto";
import {EventoTituloComponent} from "../../components/evento-titulo/evento-titulo.component";
import {CasillasService} from "../../core/services/casillas.service";
import {Casilla} from "../../core/models/casillas.model";
import {CandidaturasService} from "../../core/services/candidaturas.service";
import {Candidatura} from "../../core/models/candidaturas.model";


@Component({
  selector: 'app-candidatos',
  standalone: true,
  imports: [MaterialModule, ToastrModule, TablerIconsModule, CommonModule, EventoTituloComponent],
  templateUrl: './candidatos.component.html',
  styleUrl: './candidatos.component.scss'
})
export class CandidatosComponent {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  displayedColumns: string[] = [
    'nombre',
    'candidatura',
    // 'tipo_candidatura',
    // 'secciones',
    'celular',
    'acciones',
  ];

  candidatos = signal<Candidato[]>([]);
  casillas = signal<Casilla[]>([]);
  candidaturas = signal<Candidatura[]>([]); // Cambia el tipo según tu modelo de candidatura
  dataSource = new MatTableDataSource<Candidato>([]);
  idEvento!: string;

  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private candidatosService: CandidatosService,
    private casillasService: CasillasService,
    private candidaturasService: CandidaturasService,
    private dialog: MatDialog
  ){
    effect(() => {
      this.dataSource.data = this.candidatos();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void{
    this.idEvento = this.route.snapshot.paramMap.get('id_evento')!;
    this.obtenerCandidatos()
    this.obtenerCasillas()
    this.obtenerCandidaturas();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // obtenerCandidatos(): void {
  //   this.candidatosService.obtenerCandidatos().subscribe({
  //     next: (response: CandidatosResponse) => {
  //       if (response.code === 200) {
  //         this.candidatos.set(response.data); // ← Solo modificas la signal
  //       } else {
  //         console.error("Error al obtener los programas", response.message);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener los programas', error.message);
  //     }
  //   });
  // }
  //
  // openNuevoCandidato(action: String, candidato: Candidato | null): void {
  //   const dialogRef = this.dialog.open(CandidatosDialogComponent, {
  //     data: { action, candidato },
  //   });
  //
  //   dialogRef.afterClosed().subscribe((result: string) => {
  //     if (result === 'reload') {
  //       this.obtenerCandidatos();
  //     }
  //   });
  // }

  obtenerCandidatos(): void {
    this.candidatosService.obtenerCandidatos(this.idEvento).subscribe({
      next: (response: CandidatosResponse) => {
        if (response.code === 200) {
          this.candidatos.set(response.data); // ← Solo modificas la signal
        } else {
          console.error("Error al obtener los programas", response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener los programas', error.message);
      }
    });
  }

  openNuevoCandidato(action: String, candidato: Candidato | null): void {
    const dialogRef = this.dialog.open(CandidatosDialogComponent, {
      data: { action, candidato, id_evento: this.idEvento},
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerCandidatos();
      }
    });
  }

  obtenerCasillas(): void {
    this.casillasService.obtenerCasillas(this.idEvento).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.casillas.set(response.data);
        } else {
          console.error("Error al obtener las casillas", response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener las casillas', error.message);
      }
    });
  }


  obtenerCandidaturas(): void {
    this.candidaturasService.obtenerCandidaturas(this.idEvento).subscribe({
      next: (response: any) => {
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

  obtenerNombreCandidatura(candidaturaId: string): string {
    const candidatura = this.candidaturas().find(c => c._id === candidaturaId);
    return candidatura?.nombre ?? 'Sin nombre';
  }


}

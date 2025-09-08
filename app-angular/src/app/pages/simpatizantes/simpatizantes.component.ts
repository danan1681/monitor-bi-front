import { Component, ViewChild, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ISimpatizante } from 'src/app/core/models/simpatizante.model';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from '../../material.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CommonModule } from '@angular/common';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { IRespuestaHttp } from 'src/app/core/models/respuesta-http';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditarSimpatizanteComponent } from './dialog-editar-simpatizante/dialog-editar-simpatizante.component';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

import { SimpatizantesResponse } from '../../core/models/simpatizante.dto';
import { IRoles } from '../../core/models/datos-estaticos1';
import { StarterServices } from '../../core/services/starter.service';
import { TelefonoSimpatizanteComponent } from './simpatizantes-dialog/telefono-simpatizante.component';
import { IneSimpatizanteComponent } from './simpatizantes-dialog/ine-simpatizante.component';
import { GuardarIneSimpatizanteComponent } from './simpatizantes-dialog/guardar-ine.component';
import { environment } from '../../environments/environment';
import { CoordenadasSimpatizanteComponent } from './simpatizantes-dialog/coordenadas-simpatizante.component';
import { EventoTituloComponent } from '../../components/evento-titulo/evento-titulo.component';
import { Evento } from '../../core/models/eventos.model';
import { EventosService } from '../../core/services/eventos.service';
import { FormsModule } from '@angular/forms';
import {EventoResponse, EventosResponse} from '../../core/models/eventos.dto';
import { LoaderService } from '../../core/services/loader.service';
import { IPromotor } from 'src/app/core/models/usuario.model';

@Component({
  selector: 'app-simpatizantes',
  standalone: true,
  imports: [
    MaterialModule,
    ToastrModule,
    TablerIconsModule,
    CommonModule,
    EventoTituloComponent,
    FormsModule,
  ],
  templateUrl: './simpatizantes.component.html',
  styleUrl: './simpatizantes.component.scss',
})
export class SimpatizantesComponent {
  protected claveRol = Number(localStorage.getItem('clave_rol'));

  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);

  displayedColumns: string[] = [
    'nombre',
    'clave_elector',
    'curp',
    'sexo',
    'municipio',
    'seccion',
    'telefono_celular',
    'telefono_verificado',
    'foto_ine',
    'coordenadas',
    'acciones',
  ];

  filtroBusqueda: string = '';
  pageIndex: number = 0;
  pageSize: number = 100;

  simpatizantes = signal<ISimpatizante[]>([]);
  simpatizantesSinFiltrados = signal<ISimpatizante[]>([]);

  promotores: IPromotor[] = [];
  // enlacePromotores: IPromotor[] = [];
  promotorSeleccionado: IPromotor | null = null;
  promotorEnlaceSeleccionado: IPromotor | null = null;

  enlacePromotores = signal<IPromotor[]>([]);
  promotorSeleccionadoSig = signal<IPromotor | null>(null); // opcional: espejo en signal

  enlacesDelPromotor = computed(() => {
    const p = this.promotorSeleccionadoSig();
    if (!p) return [];
    return this.enlacePromotores().filter((e: any) => e.id_promotor === p._id);
  });

  dataSource = new MatTableDataSource<ISimpatizante>([]);
  IMG_FOTO_INE = `${environment.IMG_FOTO_INE}`;
  id_evento: string | null = localStorage.getItem('id_evento');
  eventos = signal<Evento[]>([]);
  eventoSeleccionado: string | undefined = '';

  constructor(
    private routes: Router,
    private simpatizanteServices: SimpatizantesService,
    private starterService: StarterServices,
    private eventosService: EventosService,
    private dialog: MatDialog,
    private loader: LoaderService,
    private toastr: ToastrService
  ) {
    effect(() => {
      this.dataSource.data = this.simpatizantes();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void {
    this.obtenerTipoRol();
    if ([27, 35].includes(this.claveRol)) {
      this.obtenerEventos();
    }
    if (this.claveRol !== 27 && this.claveRol !== 35) {
      this.obtenerTablaUsuarios();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  get simpatizantesFiltradosPaginados(): ISimpatizante[] {
    const filtro = this.filtroBusqueda.toLowerCase();
    const filtrados = this.simpatizantes().filter(
      (s) =>
        `${s.nombre} ${s.ap_paterno} ${s.ap_materno}`
          .toLowerCase()
          .includes(filtro) ||
        s.curp?.toLowerCase().includes(filtro) ||
        s.seccion?.toString().includes(filtro)
    );

    const start = this.pageIndex * this.pageSize;
    return filtrados.slice(start, start + this.pageSize);
  }

  registrarSimpatizanteSinIne() {
    this.routes.navigate(['nuevo_registro/registro'], {
      queryParams: { formularioDirecto: true },
    });
  }

  registrarSimpatizanteConIne() {
    this.routes.navigate(['nuevo_registro/registro']);
  }

  verMapa(): void {
    this.routes.navigate(['nuevo_registro/mapa']);
  }

  obtenerTipoRol() {
    this.starterService.getRoles().subscribe((roles: IRoles[]) => {
      const rolEncontrado = roles.find(
        (rol: IRoles) => rol.clave_rol === this.claveRol
      );
    });
  }

  // obtenerEventos() {
  //   this.eventosService.obtenerEventos().subscribe({
  //     next: (response: EventosResponse) => {
  //       if (response.code === 200) {
  //         this.eventos.set(response.data);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error al cargar eventos:', err);
  //     },
  //   });
  // }

  obtenerEventos() {
    // id_evento guardado en localStorage para el admin de evento
    const idEventoLocal = localStorage.getItem('id_evento');

    if (this.claveRol === 35 && idEventoLocal) {
      // ADMIN (35): solo su evento
      this.eventosService.obtenerEvento(idEventoLocal).subscribe({
        next: (resp: EventoResponse) => {
          if (resp.code === 200 && resp.data) {
            this.eventos.set([resp.data]);            // <-- lista con 1 evento
            this.eventoSeleccionado = resp.data._id;  // <-- preseleccionado
            this.obtenerTablaUsuarios();              // <-- carga datos del evento
          }
        },
        error: (err) => console.error('Error al cargar evento del admin', err),
      });
    } else if (this.claveRol === 27) {
      // SUPERADMIN (27): todos los eventos
      this.eventosService.obtenerEventos().subscribe({
        next: (resp: EventosResponse) => {
          if (resp.code === 200) {
            this.eventos.set(resp.data);
            // (opcional) si quieres precargar el primero:
            // if (!this.eventoSeleccionado && resp.data.length) {
            //   this.eventoSeleccionado = resp.data[0]._id;
            //   this.obtenerTablaUsuarios();
            // }
          }
        },
        error: (err) => console.error('Error al cargar eventos', err),
      });
    }
  }


  obtenerPromotores() {
    if (this.eventoSeleccionado != null) {
      this.simpatizanteServices
        .obtenerPromotores(this.eventoSeleccionado)
        .subscribe({
          next: (response: any) => {
            if (response.code == 200) {
              this.promotores = response.data;
              this.obtenerEnlacePromotor();
            }
          },
          error: (err) => {
            console.log('Error al conseguir los promotres', err);
          },
        });
    }
  }

  // obtenerEnlacePromotor() {
  //   if (this.eventoSeleccionado != null) {
  //     this.simpatizanteServices
  //       .obtenerEnlacePromotores(this.eventoSeleccionado)
  //       .subscribe({
  //         next: (response: any) => {
  //           if (response.code == 200) {
  //             this.enlacePromotores = response.data;
  //           }
  //         },
  //         error: (err) => {
  //           console.log('Error al conseguir los promotres', err);
  //         },
  //       });
  //   }
  // }

  obtenerEnlacePromotor() {
    if (this.eventoSeleccionado != null) {
      this.simpatizanteServices
        .obtenerEnlacePromotores(this.eventoSeleccionado)
        .subscribe({
          next: (response: any) => {
            if (response.code == 200) {
              this.enlacePromotores.set(response.data);
            }
          },
          error: (err) => console.log('Error al conseguir los promotores', err),
        });
    }
  }

  openDialogEditar(simpatizante: ISimpatizante | null): void {
    const dialogRef = this.dialog.open(DialogEditarSimpatizanteComponent, {
      data: simpatizante,
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerTablaUsuarios();
      }
    });
  }

  openDialogTelefono(action: String, simpatizante: ISimpatizante | null): void {
    const dialogRef = this.dialog.open(TelefonoSimpatizanteComponent, {
      data: { action, simpatizante },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerTablaUsuarios();
      }
    });
  }

  openDialogIne(action: String, simpatizante: ISimpatizante | null): void {
    const dialogRef = this.dialog.open(GuardarIneSimpatizanteComponent, {
      data: { action, simpatizante },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerTablaUsuarios();
      }
    });
  }

  openDialogCoordenadas(
    action: String,
    simpatizante: ISimpatizante | null
  ): void {
    const dialogRef = this.dialog.open(CoordenadasSimpatizanteComponent, {
      data: { action, simpatizante },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'reload') {
        this.obtenerTablaUsuarios();
      }
    });
  }

  obtenerTablaUsuarios() {
    const inicio = Date.now();
    setTimeout(() => this.loader.show());
    const filtroPorEvento =
      [27, 35].includes(this.claveRol) && this.eventoSeleccionado;

    this.simpatizanteServices
      .obtenerSimpatizantes(filtroPorEvento ? this.eventoSeleccionado : null)
      .subscribe({
        next: (response: SimpatizantesResponse) => {
          const duracion = Date.now() - inicio;
          const esperaRestante = Math.max(800 - duracion, 0); // Asegura al menos 2 seg

          setTimeout(() => {
            if (response.code === 200) {
              this.simpatizantes.set(response.data);
              this.simpatizantesSinFiltrados.set(response.data);
              this.obtenerPromotores();
            } else {
              console.error(
                'Error al obtener los simpatizantes',
                response.message
              );
            }
            this.loader.hide(); // Oculta loader después de esperar
          }, esperaRestante);
        },
        error: (error) => {
          this.loader.hide();
          console.error('Error al obtener los simpatizantes', error.message);
        },
      });
    // this.simpatizanteServices.obtenerSimpatizantes().subscribe({
    //   next: (response: SimpatizantesResponse) => {
    //     if(response.code === 200){
    //       this.simpatizantes.set(response.data);
    //     }else{
    //       console.error("Error al obtener los simpatizantes", response.message);
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener los simpatizantes', error.message);
    //   }
    // });
  }

  filtrarSimpatizantesPorPromotor() {
    if (!this.promotorSeleccionado) {
      this.simpatizantes.set(this.simpatizantesSinFiltrados());
      this.pageIndex = 0;
      return;
    }

    let simpatizantesFiltrados = this.simpatizantesSinFiltrados().filter(
      (simpatizante: any) =>
        simpatizante.id_promotor == this.promotorSeleccionado?._id
    );

    // Si ya hay un enlace seleccionado, aplica también ese filtro
    if (this.promotorEnlaceSeleccionado) {
      simpatizantesFiltrados = simpatizantesFiltrados.filter(
        (simpatizante: any) =>
          simpatizante.id_enlace_promotor ==
          this.promotorEnlaceSeleccionado?._id
      );
    }

    this.simpatizantes.set(simpatizantesFiltrados);
    this.pageIndex = 0;
  }

  filtrarSimpatizantesPorEnlace() {
    // Reutiliza el filtro completo
    this.filtrarSimpatizantesPorPromotor();
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.promotorSeleccionado = null;
    this.promotorEnlaceSeleccionado = null;

    // Restaurar todos los simpatizantes
    this.simpatizantes.set(this.simpatizantesSinFiltrados());
    this.pageIndex = 0;
  }

  // obtenerSecciones(){
  //   this.simpatizanteServices.obtenerSecciones().subscribe({
  //     next: (response: any) => {
  //       if (response.code === 200) {
  //         console.log("Secciones obtenidas correctamente", response.data);
  //       } else {
  //         console.error("Error al obtener las secciones", response.message);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener las secciones', error.message);
  //     }
  //   })
  // }

  confirmarActualizarEjercio(simpatizante: ISimpatizante) {
    const estaEjercio = simpatizante.ejercio === '1';
    const textoAccion = estaEjercio ? 'Eliminar voto' : 'Guardar voto';
    const nuevoValor = estaEjercio ? '0' : '1';

    Swal.fire({
      title: textoAccion,
      text: `¿Estás seguro que deseas ${textoAccion.toLowerCase()} para ${
        simpatizante.nombre
      }?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.simpatizanteServices
          .actualizarEjercioSimpatizante({
            id_simpatizante: simpatizante._id,
            ejercio: nuevoValor,
          })
          .subscribe({
            next: (response) => {
              this.toastr.success(
                `Ejercio actualizado para ${simpatizante.nombre}`
              );
              this.obtenerTablaUsuarios(); // Recarga la tabla
            },
            error: (error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al actualizar el registro.',
                'error'
              );
              console.error('Error al actualizar ejercio:', error);
            },
          });
      }
    });
  }

  onPromotorChange(p: IPromotor | null) {
    this.promotorSeleccionado = p; // tu propiedad existente (si la necesitas)
    this.promotorSeleccionadoSig.set(p); // para el computed
    this.promotorEnlaceSeleccionado = null; // limpiar enlace al cambiar promotor
    this.filtrarSimpatizantesPorPromotor(); // re-aplicar filtro
  }
}

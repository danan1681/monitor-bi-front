import { Component, effect, signal, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ISimpatizante } from '../../core/models/simpatizante.model';
import { environment } from '../../environments/environment';
import { Evento } from '../../core/models/eventos.model';
import { Router } from '@angular/router';
import { SimpatizantesService } from '../../core/services/simpatizantes.service';
import { StarterServices } from '../../core/services/starter.service';
import { EventosService } from '../../core/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '../../core/services/loader.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventosResponse } from '../../core/models/eventos.dto';
import { SimpatizantesResponse } from '../../core/models/simpatizante.dto';
import { EventoTituloComponent } from '../../components/evento-titulo/evento-titulo.component';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from '../../material.module';
import { IMunicipios, ISecciones } from '../../core/models/datos-estaticos1';
import Swal from 'sweetalert2';
import { QuillModule } from 'ngx-quill';
import { IneService } from 'src/app/core/services/ine.service';

@Component({
  selector: 'app-telefonos',
  standalone: true,
  imports: [
    MaterialModule,
    ToastrModule,
    TablerIconsModule,
    CommonModule,
    EventoTituloComponent,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
  ],
  templateUrl: './telefonos.component.html',
  styleUrl: './telefonos.component.scss',
})
export class TelefonosComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);

  filtroBusqueda: string = '';
  pageIndex: number = 0;
  pageSize: number = 100;

  simpatizantes = signal<ISimpatizante[]>([]);
  dataSource = new MatTableDataSource<ISimpatizante>([]);
  IMG_FOTO_INE = `${environment.IMG_FOTO_INE}`;
  id_evento: string | null = localStorage.getItem('id_evento');
  eventos = signal<Evento[]>([]);
  eventoSeleccionado: string | null = null;

  columnas: string[] = [
    'nombre',
    'telefono',
    'seccion',
    'municipio',
    'verificado',
  ];

  municipios = signal<IMunicipios[]>([]);
  seccionesOriginales: ISecciones[] = []; // todas las secciones originales
  seccionesFiltradas = signal<ISecciones[]>([]);
  filtroSexo: string[] = [];
  filtroMunicipio: number[] = [];
  filtroSeccion: number[] = [];
  filtroEdadMin: number | null = null;
  filtroEdadMax: number | null = null;
  filtroTelefonoVerificado: boolean[] = [];

  formFiltros!: FormGroup;

  editorModules = {
    toolbar: [['bold', 'italic', 'underline', 'strike'], ['link'], ['clean']],
  };

  constructor(
    private routes: Router,
    private simpatizanteServices: SimpatizantesService,
    private starterService: StarterServices,
    private ineServices: IneService,
    private eventosService: EventosService,
    private dialog: MatDialog,
    private loader: LoaderService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    effect(() => {
      this.dataSource.data = this.simpatizantes();
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void {
    this.formFiltros = this.fb.group({
      eventoSeleccionado: [''],
      municipio: [[]],
      seccion: [[]],
      mensaje: [''], // <--- aquí va el contenido del Quill Editor
    });

    this.obtenerTablaUsuarios();
    this.eventoSeleccionado = null;
    this.obtenerEventos();
    this.cargarMunicipios();
    this.cargarSecciones();

    this.formFiltros.get('municipio')?.valueChanges.subscribe((value) => {
      console.log('Municipio cambió:', value);
      this.aplicarFiltros();
    });

    this.formFiltros.get('seccion')?.valueChanges.subscribe((value) => {
      console.log('Sección cambió:', value);
      this.aplicarFiltros();
    });
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

  obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe({
      next: (response: EventosResponse) => {
        if (response.code === 200) {
          this.eventos.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
      },
    });
  }

  obtenerTablaUsuarios() {
    const inicio = Date.now();
    this.loader.show(); // Mostrar loader al iniciar
    this.simpatizanteServices
      .obtenerSimpatizantes(this.eventoSeleccionado)
      .subscribe({
        next: (response: SimpatizantesResponse) => {
          const duracion = Date.now() - inicio;
          const esperaRestante = Math.max(800 - duracion, 0); // Asegura al menos 2 seg

          setTimeout(() => {
            if (response.code === 200) {
              this.simpatizantes.set(response.data);
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
          console.error('Error al obtener los simpatizantes', error.message);
          this.loader.hide(); // Oculta loader también en error
        },
      });
  }

  enviarMensaje() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas enviar este mensaje?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const body = this.formFiltros.value;

        this.ineServices.enviarMensaje(body).subscribe({
          next: (resp) => {
            Swal.fire({
              title: 'Mensaje enviado',
              text: 'El mensaje fue enviado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
          },
          error: (err) => {
            console.error('Error al enviar el mensaje:', err);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    });
  }

  cargarMunicipios() {
    this.starterService.obtenerMunicipios().subscribe({
      next: (response: IMunicipios[]) => {
        this.municipios.set(response);
      },
      error: (error) => {
        console.error('Error al obtener los municipios', error);
        this.toastr.error('Error al obtener los municipios');
      },
    });
  }

  getNombreMunicipio(clave: number): string {
    const lista = this.municipios(); // accedes al valor del signal
    const municipio = lista.find((m) => m.municipio_clave == clave);
    return municipio ? municipio.municipio_nombre : 'Desconocido';
  }
  cargarSecciones() {
    this.starterService.obtenerSecciones().subscribe({
      next: (response: ISecciones[]) => {
        this.seccionesOriginales = response;
        this.seccionesFiltradas.set(response);
      },
      error: (error) => {
        console.error('Error al obtener las secciones', error);
        this.toastr.error('Error al obtener las secciones');
      },
    });
  }

  onChangeMunicipios(clavesMunicipios: number[]) {
    this.filtroMunicipio = clavesMunicipios;
    this.filtroSeccion = [];

    if (clavesMunicipios.length > 0) {
      const filtradas = this.seccionesOriginales.filter((s) =>
        clavesMunicipios.includes(s.municipio)
      );
      this.seccionesFiltradas.set(filtradas);
    } else {
      this.seccionesFiltradas.set(this.seccionesOriginales);
    }
  }

  aplicarFiltros() {
    if (!this.eventoSeleccionado) {
      this.toastr.warning('Primero selecciona un evento');
      return;
    }

    const filtros = this.formFiltros.value;
    this.loader.show();

    this.simpatizanteServices
      .obtenerSimpatizantesFiltrados({
        id_evento: this.eventoSeleccionado,
        municipio:
          filtros.municipio?.length > 0 ? filtros.municipio : undefined,
        seccion: filtros.seccion?.length > 0 ? filtros.seccion : undefined,
      })
      .subscribe({
        next: (response) => {
          this.loader.hide();
          if (response.code === 200) {
            this.simpatizantes.set(response.data);
            this.pageIndex = 0;
          } else {
            this.toastr.warning(
              'No se encontraron simpatizantes con esos filtros'
            );
            this.simpatizantes.set([]);
          }
        },
        error: (error) => {
          console.error('Error al aplicar filtros', error);
          this.loader.hide();
          this.toastr.error('Error al aplicar los filtros');
        },
      });
  }

  limpiarFiltros() {
    this.filtroSexo = [];
    this.filtroMunicipio = [];
    this.filtroSeccion = [];
    this.filtroEdadMin = null;
    this.filtroEdadMax = null;

    this.seccionesFiltradas.set(this.seccionesOriginales);

    if (this.eventoSeleccionado) {
      this.obtenerTablaUsuarios(); // recarga los simpatizantes del evento
      this.toastr.info('Filtros limpiados');
    }
  }
}

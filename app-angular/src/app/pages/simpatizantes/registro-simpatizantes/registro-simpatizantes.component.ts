import {
  Component,
  ElementRef,
  signal,
  ViewChild,
  computed,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { IneSimpatizanteComponent } from '../simpatizantes-dialog/ine-simpatizante.component';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../core/services/loader.service';
import { ISimpatizante } from '../../../core/models/simpatizante.model';
import { SimpatizantesService } from '../../../core/services/simpatizantes.service';
import { Location } from '@angular/common';
import { IneService } from '../../../core/services/ine.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import {
  curpExistenteSimpatizanteValidator,
  curpExistenteValidator,
  telefonoExistenteValidator,
} from '../../../core/validators/validators';
import { AvisoPrivacidadComponent } from '../simpatizantes-dialog/aviso-privacidad.component';
import {
  IMunicipios,
  ILocalidades,
} from '../../../core/models/datos-estaticos1';
import { StarterServices } from '../../../core/services/starter.service';

@Component({
  selector: 'app-registro-simpatizantes',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    NgIf,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
  ],
  templateUrl: './registro-simpatizantes.component.html',
  styleUrl: './registro-simpatizantes.component.scss',
})
export class RegistroSimpatizantesComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  mostrarFormularioDirecto = false;
  imagenProcesada: string | null = null;
  cargandoImagen: boolean = false;
  mostrarFormulario: boolean = false;
  crearSimpanitanzteForm: FormGroup;
  imagenINEUrl: string | null = null;
  imagenFotoUrl: string | null = null;
  id_evento: string | null = null;
  private api_ine = `${environment.INE_URL}`;
  simpatizanteGuardado: any;
  imagenRecortadaFile: File | null = null;
  municipios = signal<IMunicipios[]>([]);
  localidades = signal<ILocalidades[]>([]);

  filtroLocalidad = signal(''); // Texto que escribe el usuario
  limiteLocalidades = signal(50); // Límite inicial

  // Computed que filtra y limita
  localidadesFiltradas = computed(() => {
    const filtro = this.filtroLocalidad().toLowerCase();
    const filtradas = this.localidades().filter((loc) =>
      loc.nombre_localidad.toLowerCase().includes(filtro)
    );
    return filtradas.slice(0, this.limiteLocalidades());
  });

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: LoaderService,
    private simpatizanteService: SimpatizantesService,
    private location: Location,
    private ineService: IneService,
    private starterService: StarterServices,
    private routes: Router,
    private route: ActivatedRoute
  ) {
    const mostrarFormulario =
      this.route.snapshot.queryParamMap.get('formularioDirecto');
    this.mostrarFormularioDirecto = mostrarFormulario === 'true';
    this.mostrarFormulario = this.mostrarFormularioDirecto;

    this.id_evento = localStorage.getItem('id_evento');

    this.crearSimpanitanzteForm = this.fb.group({
      telefono_celular: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
        [
          telefonoExistenteValidator(
            this.simpatizanteService,
            undefined,
            this.id_evento ?? undefined
          ),
        ],
      ],
      nombre: ['', [Validators.required]],
      apellido_paterno: ['', [Validators.required]],
      apellido_materno: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      clave_elector: ['', [Validators.required]],
      curp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[0-9A-Z]{2}$/),
          Validators.minLength(18),
          Validators.maxLength(18),
        ],
        [
          curpExistenteSimpatizanteValidator(
            this.simpatizanteService,
            undefined,
            this.id_evento ?? undefined
          ),
        ],
      ],
      sexo: ['', [Validators.required]],
      domicilio: this.fb.group({
        calle: ['', Validators.required],
        colonia: ['', Validators.required],
        codigo_postal: ['', Validators.required],
        ciudad: ['', Validators.required],
        estado: ['TLAXCALA', Validators.required],
      }),
      estado: ['29', [Validators.required]],
      municipio: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      localidad: ['', [Validators.required]],
      emision: [''],
      seccion: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      anio_registro: ['', [Validators.required]],
      vigencia: ['', [Validators.required]],
      // aceptaAvisoPrivacidad: [false, Validators.requiredTrue],
    });

    this.cargarMunicipios();
    this.cargarLocalidades();
  }

  async onImageChange(event: any): Promise<void> {
    const dialogRef = this.dialog.open(IneSimpatizanteComponent, {
      width: '500px',
      data: { imageChangedEvent: event },
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      this.loader.show();
      this.cargandoImagen = true;

      const blob = await fetch(result).then((r) => r.blob());
      const file = new File([blob], 'ine_recortada.png', { type: blob.type });
      this.imagenRecortadaFile = file;

      this.ineService.getIne(file).subscribe({
        next: (res) => {
          this.loader.hide();
          this.toastr.success('Imagen procesada correctamente');
          this.mostrarFormulario = true;
          this.cargandoImagen = false;
          this.imagenProcesada = result;

          this.imagenFotoUrl = `${this.api_ine}/${res.url_foto}`;
          this.imagenINEUrl = `${this.api_ine}/${res.url_ine}`;

          // Llenar el formulario con los datos recibidos
          this.crearSimpanitanzteForm.patchValue({
            nombre: res.nombre,
            apellido_paterno: res.apellido_paterno,
            apellido_materno: res.apellido_materno,
            fecha_nacimiento: this.convertirFecha(res.fecha_nacimiento),
            clave_elector: res.clave_elector,
            curp: res.curp,
            sexo: res.sexo === 'H' ? 'Masculino' : 'Femenino',
            domicilio: {
              calle: res.domicilio?.calle || '',
              colonia: res.domicilio?.colonia || '',
              codigo_postal: res.domicilio?.codigo_postal || '',
              ciudad: res.domicilio?.ciudad || '',
              estado: res.domicilio?.estado || '',
            },
            estado: res.estado,
            municipio: res.municipio,
            localidad: res.localidad,
            emision: res.emision,
            seccion: res.seccion,
            anio_registro: res.año_registro,
            vigencia: res.vigencia,
          });
        },
        error: (err) => {
          this.toastr.error(
            'Error al procesar la imagen, Intenta nuevamente con una imagen diferente'
          );
          this.cargandoImagen = false;
          this.loader.hide();
          this.fileInput.nativeElement.value = '';
        },
      });
    }
  }

  async guardarSimpatizante(): Promise<void> {
    this.loader.show();
    return new Promise((resolve, reject) => {
      const dataSimpatizante: ISimpatizante = {
        nombre: this.crearSimpanitanzteForm.get('nombre')?.value,
        ap_paterno: this.crearSimpanitanzteForm.get('apellido_paterno')?.value,
        ap_materno: this.crearSimpanitanzteForm.get('apellido_materno')?.value,
        fecha_nacimiento:
          this.crearSimpanitanzteForm.get('fecha_nacimiento')?.value,
        clave_elector: this.crearSimpanitanzteForm.get('clave_elector')?.value,
        curp: this.crearSimpanitanzteForm.get('curp')?.value,
        sexo: this.crearSimpanitanzteForm.get('sexo')?.value,
        domicilio: {
          calle: this.crearSimpanitanzteForm.get('domicilio.calle')?.value,
          colonia: this.crearSimpanitanzteForm.get('domicilio.colonia')?.value,
          codigo_postal: this.crearSimpanitanzteForm.get(
            'domicilio.codigo_postal'
          )?.value,
          ciudad: this.crearSimpanitanzteForm.get('domicilio.ciudad')?.value,
          estado: this.crearSimpanitanzteForm.get('domicilio.estado')?.value,
        },
        estado: this.crearSimpanitanzteForm.get('estado')?.value,
        municipio: this.crearSimpanitanzteForm.get('municipio')?.value,
        localidad: this.crearSimpanitanzteForm.get('localidad')?.value,
        emision: this.crearSimpanitanzteForm.get('emision')?.value,
        seccion: this.crearSimpanitanzteForm.get('seccion')?.value,
        anio_registro: this.crearSimpanitanzteForm.get('anio_registro')?.value,
        vigencia: this.crearSimpanitanzteForm.get('vigencia')?.value,
        telefono_celular:
          this.crearSimpanitanzteForm.get('telefono_celular')?.value,
      };

      this.simpatizanteService
        .crearSimpatizante(dataSimpatizante)
        .subscribe((res: any) => {
          this.simpatizanteGuardado = res.data;
          this.guardarImagenIneSimpatizante(this.simpatizanteGuardado._id);
          this.toastr.success('Simpatizante creado correctamente', 'Éxito');
          setTimeout(() => {
            this.loader.hide();
            this.routes.navigate(['nuevo_registro']);
          }, 2000);
        });
    });
  }

  guardarImagenIneSimpatizante(id_simpatizante: string): void {
    if (!this.imagenRecortadaFile) return;

    const formData = new FormData();
    formData.append('simpatizant', this.imagenRecortadaFile);

    this.simpatizanteService
      .actualizarIneSimpatizante(id_simpatizante, formData)
      .subscribe({
        next: () => {
          this.toastr.success('¡INE actualizada correctamente!');
        },
        error: (error) => {
          this.toastr.error('Error al actualizar la INE');
          console.error(error);
        },
      });
  }

  abrirAvisoPrivacidad(event: Event): void {
    event.preventDefault();
    this.dialog.open(AvisoPrivacidadComponent, {
      width: '600px',
    });
  }

  private convertirFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    const partes = fechaStr.split('/');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return new Date(+anio, +mes - 1, +dia);
    }
    return null;
  }

  regresar(): void {
    this.location.back();
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

  cargarLocalidades() {
    this.starterService.obtenerLocalidades().subscribe({
      next: (response: ILocalidades[]) => {
        this.localidades.set(response);
      },
    });
  }

  agregarLocalidad(nombre: string) {
    const nueva: ILocalidades = {
      nombre_localidad: nombre,
      no_localidad: 0,
      no_municipio: 0,
      nombre_municipio: '',
    };
    this.localidades.update((localidades) => [...localidades, nueva]);
    this.crearSimpanitanzteForm
      .get('localidad')
      ?.setValue(nueva.nombre_localidad);
  }
}

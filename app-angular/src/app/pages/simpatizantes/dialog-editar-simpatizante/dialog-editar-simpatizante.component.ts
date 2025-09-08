import { Component, Inject, signal, computed } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule, Location } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISimpatizante } from 'src/app/core/models/simpatizante.model';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormsModule,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { LoaderService } from '../../../core/services/loader.service';
import { SimpatizantesService } from '../../../core/services/simpatizantes.service';
import { ToastrService } from 'ngx-toastr';
import {
  SimpatizanteResponse,
  SimpatizanteUpdate,
} from '../../../core/models/simpatizante.dto';
import { curpExistenteSimpatizanteValidator } from '../../../core/validators/validators';
import {
  ILocalidades,
  IMunicipios,
} from '../../../core/models/datos-estaticos1';
import { StarterServices } from '../../../core/services/starter.service';

@Component({
  selector: 'app-dialog-editar-simpatizante',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    FormsModule,
  ],
  templateUrl: './dialog-editar-simpatizante.component.html',
  styleUrl: './dialog-editar-simpatizante.component.scss',
})
export class DialogEditarSimpatizanteComponent {
  formulario_actualizar_simpatizante: FormGroup;
  id_evento: string | null = null;
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
    private dialogRef: MatDialogRef<DialogEditarSimpatizanteComponent>,
    @Inject(MAT_DIALOG_DATA) public simpatizante: ISimpatizante,
    private fb: FormBuilder,
    private loader: LoaderService,
    private simpatizanteService: SimpatizantesService,
    private starterService: StarterServices,
    private toastr: ToastrService
  ) {
    this.id_evento = localStorage.getItem('id_evento');
    this.formulario_actualizar_simpatizante = this.fb.group({
      nombre: [this.simpatizante.nombre, [Validators.required]],
      ap_paterno: [this.simpatizante.ap_paterno, [Validators.required]],
      ap_materno: [this.simpatizante.ap_materno, [Validators.required]],
      fecha_nacimiento: [
        new Date(this.simpatizante.fecha_nacimiento),
        [Validators.required],
      ],
      clave_elector: [this.simpatizante.clave_elector, [Validators.required]],
      curp: [
        this.simpatizante.curp,
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[0-9A-Z]{2}$/),
          Validators.minLength(18),
          Validators.maxLength(18),
        ],
        [
          curpExistenteSimpatizanteValidator(
            this.simpatizanteService,
            this.simpatizante.curp,
            this.id_evento ?? undefined
          ),
        ],
      ],
      sexo: [this.simpatizante.sexo, [Validators.required]],
      domicilio: this.fb.group({
        calle: [this.simpatizante.domicilio.calle, Validators.required],
        colonia: [this.simpatizante.domicilio.colonia, Validators.required],
        codigo_postal: [
          this.simpatizante.domicilio.codigo_postal,
          Validators.required,
        ],
        ciudad: [this.simpatizante.domicilio.ciudad, Validators.required],
        estado: [this.simpatizante.domicilio.estado, Validators.required],
      }),
      estado: [this.simpatizante.estado, [Validators.required]],
      municipio: [
        this.simpatizante.municipio,
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      localidad: [],
      emision: [this.simpatizante.emision, []],
      seccion: [
        this.simpatizante.seccion,
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      anio_registro: [this.simpatizante.anio_registro, [Validators.required]],
      vigencia: [this.simpatizante.vigencia, [Validators.required]],
    });

    this.formulario_actualizar_simpatizante.valueChanges.subscribe(() => {
      this.formulario_actualizar_simpatizante.markAsDirty(); // Marca el formulario como "modificado"
    });
  }

  ngOnInit() {
    this.cargarLocalidades();
    this.cargarMunicipios();

    const localidadActual: ILocalidades = {
      nombre_localidad: this.simpatizante.localidad,
      no_localidad: 0,
      no_municipio: 0,
      nombre_municipio: '',
    };

    console.log(this.localidades());

    const existe = this.localidades().some(
      (loc) => loc.nombre_localidad == localidadActual.nombre_localidad
    );

    if (!existe) {
      this.localidades.update((lista) => [...lista, localidadActual]);

      this.formulario_actualizar_simpatizante
        .get('localidad')
        ?.setValue(localidadActual.nombre_localidad);
    }

    this.formulario_actualizar_simpatizante
      .get('localidad')
      ?.setValue(this.simpatizante.localidad);
  }

  actualizarSimpatizante() {
    if (this.formulario_actualizar_simpatizante.invalid) return;
    this.loader.show();
    const simpatizante = this.formulario_actualizar_simpatizante
      .value as SimpatizanteUpdate;
    simpatizante.id_simpatizante = this.simpatizante._id!;
    this.simpatizanteService.actualizarSimpatizante(simpatizante).subscribe({
      next: (response: SimpatizanteResponse) => {
        if (response.code === 200) {
          this.toastr.success(
            'Simpatizante actualizado correctamente',
            'Éxito'
          );
          setTimeout(() => {
            this.loader.hide();
            this.dialogRef.close('reload');
          }, 2000);
        } else {
          this.toastr.error('Error al actualizar el simpatizante', 'Error');
          console.error(
            'Error al actualizar el simpatizante',
            response.message
          );
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toastr.error('Error en la petición', 'Error');
        console.error('Error del servidor', error);
        this.loader.hide();
      },
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
    this.formulario_actualizar_simpatizante
      .get('localidad')
      ?.setValue(nueva.nombre_localidad);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

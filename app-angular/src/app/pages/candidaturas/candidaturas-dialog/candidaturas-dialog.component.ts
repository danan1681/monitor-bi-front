import {Component, inject, Inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ResponseApi} from "../../../core/models/response.model";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {CandidaturasService} from "../../../core/services/candidaturas.service";
import {CandidaturaCreate, CandidaturaResponse, CandidaturaUpdate} from "../../../core/models/candidaturas.dto";
import {curpExistenteValidator, nombreExistenteValidator} from "../../../core/validators/validators";
import {LoaderService} from "../../../core/services/loader.service";
import {IDistritosFederales, IDistritosLocales, IEstados, IMunicipios} from "../../../core/models/datos-estaticos1";
import {StarterServices} from "../../../core/services/starter.service";

@Component({
  selector: 'app-candidaturas-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './candidaturas-dialog.component.html',
  styleUrl: './candidaturas-dialog.component.scss'
})
export class CandidaturasDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CandidaturasDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private candidaturasService: CandidaturasService,
    private starterService: StarterServices,
    private toastr: ToastrService,
    private loader: LoaderService,
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioCandidatura: FormGroup;
  action = this.data.action
  candidatura = this.data.candidatura
  isSubmitting = false;
  id_evento = this.data.id_evento;
  tipos: string[] = ['Estado', 'Federal', 'Local', 'Municipio'];
  distritos_federales = signal<IDistritosFederales[]>([])
  distritos_locales = signal<IDistritosLocales[]>([])
  municipios = signal<IMunicipios[]>([])


  ngOnInit(): void {
    this.obtenerDistritosFederales();
    this.obtenerDistritosLocales();
    this.obtenerMunicipios();

    this.crearFormularioCandidatura = this.fb.group({
      nombre: [
        this.candidatura?.nombre,
        [Validators.required],
        [nombreExistenteValidator.nombreUnico(this.candidaturasService, this.data.id_evento, this.candidatura?.nombre)]
      ],
      tipo: [this.candidatura?.tipo || '', [Validators.required]],
      clave: ['', []]
    });

    const tipo = this.candidatura?.tipo;
    let clave = null;

    switch (tipo) {
      case 'Estado':
        clave = this.candidatura?.estado_clave ?? null;
        break;
      case 'Federal':
        clave = this.candidatura?.distrito_federal_clave ?? null;
        break;
      case 'Local':
        clave = this.candidatura?.distrito_local_clave ?? null;
        break;
      case 'Municipio':
        clave = this.candidatura?.municipio_clave ?? null;
        break;
    }

    // Seteamos el valor antes de aplicar los validadores
    this.crearFormularioCandidatura.get('clave')?.setValue(clave);

    // Lógica de activación/desactivación inicial
    const claveControl = this.crearFormularioCandidatura.get('clave');
    if (tipo === 'Estado') {
      claveControl?.clearValidators();
      claveControl?.disable();
    } else {
      claveControl?.setValidators([Validators.required]);
      claveControl?.enable();
    }
    claveControl?.updateValueAndValidity();

    // Suscripción para futuros cambios
    this.crearFormularioCandidatura.get('tipo')?.valueChanges.subscribe(nuevoTipo => {
      if (!nuevoTipo) return;

      const claveControl = this.crearFormularioCandidatura.get('clave');
      if (nuevoTipo === 'Estado') {
        claveControl?.clearValidators();
        claveControl?.disable();
        claveControl?.setValue(null);
      } else {
        claveControl?.setValidators([Validators.required]);
        claveControl?.enable();
        claveControl?.reset(); // Solo reseteamos si cambió a algo diferente de Estado
      }
      claveControl?.updateValueAndValidity();
    });
  }

  obtenerDistritosFederales(){
    this.starterService.obtenerDistritosFederales().subscribe({
      next: (response: IDistritosFederales[]) => {
        this.distritos_federales.set(response);
      },
      error: (error) => {
        console.error("Error al obtener los distritos federales", error);
        this.toastr.error('Error al obtener los distritos federales');
      }
    });
  }

  obtenerDistritosLocales(){
    this.starterService.obtenerDistritosLocales().subscribe({
      next: (response: IDistritosLocales[]) => {
        this.distritos_locales.set(response);
      },
      error: (error) => {
        console.error("Error al obtener los distritos locales", error);
        this.toastr.error('Error al obtener los distritos locales');
      }
    });
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


  // crearCandidatura(){
  //   if(this.crearFormularioCandidatura.valid){
  //     this.loader.show();
  //     this.isSubmitting = true;
  //     const candidatura: CandidaturaCreate = this.crearFormularioCandidatura.value as CandidaturaCreate;
  //     candidatura.estatus = 1;
  //     this.candidaturasService.crearCandidatura(candidatura, this.id_evento).subscribe({
  //       next: (response: ResponseApi) => {
  //       this.isSubmitting = false;
  //         if(response.code === 200) {
  //           setTimeout(() => {
  //             this.loader.hide();
  //             this.toastr.success('¡Candidatura creada correctamente!');
  //             this.dialogRef.close('reload');
  //           }, 1000);
  //         }
  //         else{
  //           this.isSubmitting = false;
  //           this.toastr.error('Error al crear la candidatura');
  //           console.error("Error al crear el programa", response.message);
  //         }
  //       }
  //     })
  //   }
  // }

  crearCandidatura() {
    if (this.crearFormularioCandidatura.valid) {
      this.loader.show();
      this.isSubmitting = true;

      const formValue = this.crearFormularioCandidatura.value;

      // Inicializamos todos los campos en null
      const candidatura: CandidaturaCreate = {
        nombre: formValue.nombre,
        tipo: formValue.tipo,
        estatus: 1,
        estado_clave: null,
        distrito_federal_clave: null,
        distrito_local_clave: null,
        municipio_clave: null
      };

      // Asignamos la clave correspondiente según el tipo
      switch (formValue.tipo) {
        case 'Estado':
          candidatura.estado_clave = 29; // o algún valor fijo si así lo manejas
          break;
        case 'Federal':
          candidatura.distrito_federal_clave = formValue.clave;
          break;
        case 'Local':
          candidatura.distrito_local_clave = formValue.clave;
          break;
        case 'Municipio':
          candidatura.municipio_clave = formValue.clave;
          break;
      }

      this.candidaturasService.crearCandidatura(candidatura, this.id_evento).subscribe({
        next: (response: ResponseApi) => {
          this.isSubmitting = false;
          if (response.code === 200) {
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Candidatura creada correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          } else {
            this.toastr.error('Error al crear la candidatura');
            console.error("Error al crear la candidatura", response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loader.hide();
          this.toastr.error('Error inesperado al crear la candidatura');
          console.error("Error HTTP al crear la candidatura", error);
        }
      });
    }
  }

  //
  // actualizarCandidatura(){
  //   if(this.crearFormularioCandidatura.valid){
  //     this.loader.show();
  //     const candidatura: CandidaturaUpdate = this.crearFormularioCandidatura.value as CandidaturaUpdate;
  //     candidatura.id_candidatura = this.candidatura._id;
  //     this.candidaturasService.actualizarCandidatura(candidatura, this.id_evento).subscribe({
  //       next: (response: CandidaturaResponse) => {
  //         if(response.code === 200){
  //           setTimeout(() => {
  //             this.loader.hide();
  //             this.toastr.success('¡Candidatura actualizada correctamente!');
  //             this.dialogRef.close('reload');
  //           }, 1000);
  //         }
  //         else{
  //           this.toastr.error('Error al actualizar la candidatura');
  //           console.error("Error al actualizar la candidatura", response.message);
  //         }
  //       }
  //     })
  //   }
  // }

  actualizarCandidatura() {
    if (this.crearFormularioCandidatura.valid) {
      this.loader.show();
      this.isSubmitting = true;

      const formValue = this.crearFormularioCandidatura.value;

      // Inicializamos los campos
      const candidatura: CandidaturaUpdate = {
        id_candidatura: this.candidatura._id,
        nombre: formValue.nombre,
        tipo: formValue.tipo,
        estado_clave: null,
        distrito_federal_clave: null,
        distrito_local_clave: null,
        municipio_clave: null
      };

      // Asignamos solo el campo clave correcto según el tipo
      switch (formValue.tipo) {
        case 'Estado':
          candidatura.estado_clave = 29; // o el valor que uses por defecto
          break;
        case 'Federal':
          candidatura.distrito_federal_clave = formValue.clave;
          break;
        case 'Local':
          candidatura.distrito_local_clave = formValue.clave;
          break;
        case 'Municipio':
          candidatura.municipio_clave = formValue.clave;
          break;
      }

      this.candidaturasService.actualizarCandidatura(candidatura, this.id_evento).subscribe({
        next: (response: CandidaturaResponse) => {
          this.isSubmitting = false;
          if (response.code === 200) {
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Candidatura actualizada correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          } else {
            this.toastr.error('Error al actualizar la candidatura');
            console.error("Error al actualizar la candidatura", response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loader.hide();
          this.toastr.error('Error inesperado al actualizar la candidatura');
          console.error("Error HTTP al actualizar la candidatura", error);
        }
      });
    }
  }


  cancelar(){
    this.dialogRef.close();
  }


}

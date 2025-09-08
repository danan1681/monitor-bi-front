import {Component, inject, Inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {LoaderService} from "../../../core/services/loader.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ResponseApi} from "../../../core/models/response.model";
import {EventosService} from "../../../core/services/eventos.service";
import {EventoCreate, EventoResponse, EventoUpdate} from "../../../core/models/eventos.dto";
import {IEstados} from "../../../core/models/datos-estaticos1";
import {StarterServices} from "../../../core/services/starter.service";
import {CommonModule, NgIf} from "@angular/common";
import {MaterialModule} from "../../../material.module";
import Swal from "sweetalert2";

@Component({
  selector: 'app-eventos-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './eventos-dialog.component.html',
  styleUrl: './eventos-dialog.component.scss'
})
export class EventosDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EventosDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private eventosService: EventosService,
    private toastr: ToastrService,
    private loader: LoaderService,
    private starterService: StarterServices
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioEvento: FormGroup;
  estatusFormularioEvento: FormGroup;
  action = this.data.action
  evento = this.data.evento
  evento_estatus: any
  isSubmitting = false;
  estados = signal<IEstados[]>([])


  ngOnInit(): void {
    this.crearFormularioEvento = this.fb.group({
      nombre: [this.evento?.nombre, [Validators.required]],
      descripcion: [this.evento?.descripcion, [Validators.required]],
      tipo: [this.evento?.tipo, [Validators.required]],
      clave_estado: [this.evento?.clave_estado],
      fecha: [this.formatFecha(this.evento?.fecha), [Validators.required]],
    });

    this.estatusFormularioEvento = this.fb.group({
      clave_estatus: [this.evento?.clave_estatus, [Validators.required]],
      justificacion_estatus: ['', [Validators.required]],
    })

    this.crearFormularioEvento.get('tipo')?.valueChanges.subscribe((tipo) => {
      const claveEstadoCtrl = this.crearFormularioEvento.get('clave_estado');
      if (tipo === 'Estatal') {
        claveEstadoCtrl?.setValidators([Validators.required]);
        this.obtenerEstados();
      } else {
        claveEstadoCtrl?.clearValidators();
        claveEstadoCtrl?.setValue(null);
      }
      claveEstadoCtrl?.updateValueAndValidity();
    });

    this.obtenerEstados();

    this.starterService.getUsuariosEstatus().subscribe((data: any) => {
      this.evento_estatus = data
    })

  }

  crearEvento(){
    if(this.crearFormularioEvento.valid){
      this.loader.show();
      this.isSubmitting = true;
      const evento: EventoCreate = this.crearFormularioEvento.value as EventoCreate;
      this.eventosService.crearEvento(evento).subscribe({
        next: (response: ResponseApi) => {
          this.isSubmitting = false;
          if(response.code === 200) {
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Evento creado correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          }
          else{
            this.isSubmitting = false;
            this.toastr.error('Error al crear el evento');
            console.error("Error al crear el evento", response.message);
          }
        }
      })
    }
  }

  actualizarEvento(){
    if(this.crearFormularioEvento.valid){
      this.loader.show();
      const evento: EventoUpdate = this.crearFormularioEvento.value as EventoUpdate;
      evento.id_evento = this.evento._id;
      this.eventosService.actualizarEvento(evento).subscribe({
        next: (response: EventoResponse) => {
          if(response.code === 200){
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Evento actualizado correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          }
          else{
            this.toastr.error('Error al actualizar el evento');
            console.error("Error al actualizar el evento", response.message);
          }
        }
      })
    }
  }

  actualizarEstatus() {
    const id_evento = this.evento._id;
    const clave_estatus = this.estatusFormularioEvento.get('clave_estatus')?.value;
    let nombre_estatus = '';
    let mensajeConfirmacion = '';
    let textoConfirmar = '';

    if (clave_estatus === 1) {
      nombre_estatus = 'Habilitado';
      mensajeConfirmacion = '¿Estás seguro de que deseas habilitar este evento? Los usuarios relacionados también serán habilitados si aplica.';
      textoConfirmar = 'Sí, habilitar';
    } else if (clave_estatus === 2) {
      nombre_estatus = 'Deshabilitado';
      mensajeConfirmacion = '¿Estás seguro de que deseas deshabilitar este evento? Sus promotores y enlaces también serán desactivados, pero la información del evento permanecerá disponible.';
      textoConfirmar = 'Sí, deshabilitar';
    }

    const dataEstatus = {
      id_evento: id_evento,
      clave_estatus: clave_estatus,
      nombre_estatus: nombre_estatus,
      justificacion_estatus: this.estatusFormularioEvento.get('justificacion_estatus')?.value
    };

    Swal.fire({
      title: 'Confirmar acción',
      text: mensajeConfirmacion,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.loader.show();

        this.eventosService.actualizarEstatusEvento(dataEstatus).subscribe({
          next: (response: EventoResponse) => {
            if (response.code === 200) {
              setTimeout(() => {
                this.loader.hide();
                this.toastr.success(`¡Evento ${nombre_estatus.toLowerCase()} correctamente!`);
                this.dialogRef.close('reload');
              }, 1000);
            } else {
              this.loader.hide();
              this.toastr.error('Error al actualizar el evento');
              console.error("Error al actualizar el evento", response.message);
            }
          },
          error: (err) => {
            this.loader.hide();
            this.toastr.error('Error de comunicación con el servidor');
            console.error("Error HTTP:", err);
          }
        });
      }
    });
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

  get estatusNoModificado() {
    return this.estatusFormularioEvento.get('clave_estatus')?.value === this.evento.clave_estatus;
  }

  formatFecha(fechaISO: string | Date): string | null {
    if (!fechaISO) return null;
    const fecha = new Date(fechaISO);
    return fecha.toISOString().split('T')[0]; // "2025-06-05"
  }


  cancelar(){
    this.dialogRef.close();
  }


}

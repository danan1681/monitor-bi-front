import {Component, inject, Inject} from '@angular/core';
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {confirmarContrasenaValidator} from "../../../core/validators/validators";
import {CandidatoCreate, CandidatoResponse, CandidatoUpdate} from "../../../core/models/candidato.dto";
import {CandidatosService} from "../../../core/services/candidatos.service";
import {ResponseApi} from "../../../core/models/response.model";
import {ToastrService} from "ngx-toastr";
import { sha256 } from "js-sha256";
import {CandidaturasService} from "../../../core/services/candidaturas.service";
import {CasillasService} from "../../../core/services/casillas.service";
import {CandidaturaResponse, CandidaturaUpdate} from "../../../core/models/candidaturas.dto";
import {LoaderService} from "../../../core/services/loader.service";


@Component({
  selector: 'app-candidatos-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './candidatos-dialog.component.html',
  styleUrl: './candidatos-dialog.component.scss'
})
export class CandidatosDialogComponent {
  listaCandidaturas: any[] = [];
  listaCasillas: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CandidatosDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private candidatosService: CandidatosService,
    private candidaturasService: CandidaturasService,
    private casillasService: CasillasService,
    private toastr: ToastrService,
    private loader: LoaderService
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioCandidato: FormGroup;
  action = this.data.action
  candidato = this.data.candidato
  id_evento = this.data.id_evento;


  ngOnInit(): void {
    this.crearFormularioCandidato = this.fb.group({
      nombre: [this.candidato?.nombre, [Validators.required]],
      ap_paterno: [this.candidato?.ap_paterno, [Validators.required]],
      ap_materno: [this.candidato?.ap_materno, [Validators.required]],
      candidatura: [this.candidato?.candidatura, [Validators.required]],
      // tipo_candidatura: [this.candidato?.tipo_candidatura, [Validators.required]],
      // secciones: [this.candidato?.secciones || [], [Validators.required]],
      celular: [this.candidato?.celular, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      // contrasena: [this.candidato?.contrasena, this.action === 'crearCandidato' ? [Validators.required, Validators.minLength(8)] : []],
      // contrasena_verificar: [
      //   this.candidato?.contrasena_verificar,
      //   this.action === 'crearCandidato' ? [Validators.required, confirmarContrasenaValidator('contrasena')] : []
      // ],
    });

    // this.crearFormularioCandidato.get('contrasena')?.valueChanges.subscribe(() => {
    //   this.crearFormularioCandidato.get('contrasena_verificar')?.updateValueAndValidity();
    // });

    this.obtenerCandidaturas();
    this.obtenerCasillas();
  }

  crearCandidato(){
    if(this.crearFormularioCandidato.valid){
      const formvalue  = this.crearFormularioCandidato.value;

      const candidato: CandidatoCreate = {
        nombre: formvalue.nombre,
        ap_paterno: formvalue.ap_paterno,
        ap_materno: formvalue.ap_materno,
        candidatura: formvalue.candidatura,
        celular: formvalue.celular,
        clave_estatus: 1,
        nombre_estatus: "Habilitado",
        clave_rol: 55

      };

      // (candidato as CandidatoCreate).clave_estatus = 1;
      // (candidato as CandidatoCreate).nombre_estatus = 'Habilitado';
      // (candidato as CandidatoCreate).clave_rol = 55;
      // (candidato as CandidatoCreate).contrasena = sha256(candidato.contrasena);

      this.candidatosService.crearCandidato(candidato, this.id_evento).subscribe({
        next: (response: ResponseApi) => {
          if(response.code === 200){
            this.toastr.success('¡Candidato creado correctamente!');
            this.dialogRef.close('reload');
          }
          else{
            this.toastr.error('Error al crear el candidato');
            console.error("Error al crear el candidato", response.message);
          }
        }
      })
    }
  }

  actualizarCandidato(){
    if(this.crearFormularioCandidato.valid){
      this.loader.show();
      const candidato: CandidatoUpdate = this.crearFormularioCandidato.value as CandidatoUpdate;
      candidato.id_candidato = this.candidato._id;
      this.candidatosService.actualizarCandidato(candidato, this.id_evento).subscribe({
        next: (response: CandidatoResponse) => {
          if(response.code === 200){
            setTimeout(() => {
              this.loader.hide();
                this.toastr.success('¡Candidato actualizado correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          }
          else{
            this.toastr.error('Error al actualizar el candidato');
            console.error("Error al actualizar el candidato", response.message);
          }
        }
      })
    }
  }


  obtenerCandidaturas(){
    this.candidaturasService.obtenerCandidaturas(this.id_evento).subscribe({
      next: (response: any) => { // Idealmente usa una interfaz/tipo para 'response' también
        if (response.code === 200 && response.data) {
          // Asigna los datos obtenidos a la propiedad del componente
          this.listaCandidaturas = response.data;
          if (this.action === 'editarCandidato' && this.candidato?.candidaturaId) {
             const selectedCandidatura = this.listaCandidaturas.find(c => c.id === this.candidato.candidaturaId);
             if (selectedCandidatura) {
                 this.crearFormularioCandidato.patchValue({ candidatura: selectedCandidatura.nombre });
             }
          }

        } else {
          this.toastr.error('No se pudieron obtener las candidaturas', response.message);
          console.error("Error al obtener las candidaturas", response.message);
          this.listaCandidaturas = []; // Asegura que la lista esté vacía en caso de error
        }
      },
      error: (error) => {
        this.toastr.error('Error de conexión al obtener candidaturas', error.message);
        console.error('Error de conexión al obtener las candidaturas', error);
        this.listaCandidaturas = []; // Asegura que la lista esté vacía en caso de error
      }
    });
  }

  obtenerCasillas() {
    this.casillasService.obtenerSecciones(this.id_evento).subscribe({ // Asume que tienes este método en tu servicio
      next: (response: any) => { // Usa un tipo/interfaz específico si es posible
        if (response.code === 200 && response.data) {
          this.listaCasillas = response.data;

        } else {
          this.toastr.error('No se pudieron obtener las casillas', response.message);
          console.error("Error al obtener las casillas:", response.message);
          this.listaCasillas = []; // Limpia en caso de error
        }
      },
      error: (error) => {
        this.toastr.error('Error de conexión al obtener casillas', error.message);
        console.error('Error de conexión al obtener las casillas:', error);
        this.listaCasillas = []; // Limpia en caso de error
      }
    });
  }


  cancelar(){
    this.dialogRef.close();
  }
}

import {Component, OnInit, Inject, signal} from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuariosService } from 'src/app/core/services/usuarios.service';
import { StarterServices } from 'src/app/core/services/starter.service';
import {
  confirmarContrasenaValidator,
  correoExistenteValidator,
  curpExistenteValidator, telefonoExistenteValidator, telefonoUsuarioExistenteValidator
} from 'src/app/core/validators/validators';
import { sha256 } from "js-sha256";
import {ToastrService} from "ngx-toastr";
import { IDependenciaSelect, IRoles, IUsuarioEstatus } from 'src/app/core/models/datos-estaticos1';
import {EventosResponse} from "../../../core/models/eventos.dto";
import {Evento} from "../../../core/models/eventos.model";
import {EventosService} from "../../../core/services/eventos.service";



@Component({
  selector: 'app-usuarios-nuevo-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-dialog.component.html',
  styleUrl: './usuarios-dialog.component.scss'
})

export class UsuariosDialogComponent implements OnInit{

  textoDialog: string = 'Nuevo Usuario';

  constructor(
    public dialogRef: MatDialogRef<UsuariosDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
    private eventosService: EventosService,
    private starterData: StarterServices,
    private toastr: ToastrService
  ){
  }

    opcionSelect = this.data.action
    datoUsuario = this.data.dato_usuario
    id_evento: string | null = null;
    isSubmitting: boolean = false;
    eventos = signal<Evento[]>([]);

    roles: IRoles[]
    dependencias: IDependenciaSelect[]
    usuario_estatus: IUsuarioEstatus[]

    crearUsuarioForm : FormGroup
    actualizarUsuarioForm: FormGroup
    contrasenaNuevaForm: FormGroup
    estatusNuevoForm: FormGroup
    clave_rol_usuario: number = +localStorage.getItem('clave_rol')!;


  ngOnInit(){
    this.obtenerDatosEstaticos()
    this.definirTextoDialog()
    this.id_evento = this.data.id_evento || localStorage.getItem('id_evento');

    this.crearUsuarioForm = this.fb.group({
      nombreNuevo: ['', [Validators.required]],
      apPaternoNuevo: ['', [Validators.required]],
      apMaternoNuevo: ['', [Validators.required]],
      idRolNuevo: ['', [Validators.required]],
      // curpNuevo: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[0-9A-Z]{2}$/), Validators.minLength(18),
      //   Validators.maxLength(18)], [curpExistenteValidator(this.usuarioServices, undefined, this.id_evento ?? undefined)]],
      telefonoNuevo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.minLength(10), Validators.maxLength(10)], [telefonoUsuarioExistenteValidator(this.usuarioServices, undefined)]],
      correoNuevo: ['', [Validators.required, Validators.email], [correoExistenteValidator(this.usuarioServices)]],
      contrasenaNuevo1: ['', [Validators.required], ],
      contrasenaNuevo2: ['', [Validators.required, confirmarContrasenaValidator('contrasenaNuevo1')]]
    })

    this.actualizarUsuarioForm = this.fb.group({
      nombreActualizar: [this.datoUsuario.nombre, [Validators.required]],
      apPaternoActualizar: [this.datoUsuario.ap_paterno, [Validators.required]],
      apMaternoActualizar: [this.datoUsuario.ap_materno, [Validators.required]],
      idRolActualizar: [{ value: this.datoUsuario.clave_rol, disabled: true }, Validators.required],
      // curpActualizar: [this.datoUsuario.curp, [Validators.required,  Validators.pattern(/^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[0-9A-Z]{2}$/), Validators.minLength(18),
      //   Validators.maxLength(18)], [curpExistenteValidator(this.usuarioServices, this.datoUsuario.curp, this.id_evento ?? undefined)]],
      telefonoActualizar: [this.datoUsuario.telefono, Validators.required],
      correoActualizar: [this.datoUsuario.correo, [Validators.required, Validators.email], [correoExistenteValidator(this.usuarioServices, this.datoUsuario.correo)]],
    })

    this.contrasenaNuevaForm = this.fb.group({
      contrasenaModificada: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasenaModificada: ['', [Validators.required, confirmarContrasenaValidator('contrasenaModificada')]]
    })

    this.estatusNuevoForm = this.fb.group({
      estatusModificado : [this.datoUsuario.clave_estatus, [Validators.required]],
      justificacion_estatus: ['', [Validators.required]]
    })

    if (this.clave_rol_usuario === 27) {
      this.crearUsuarioForm.addControl('idEventoNuevo', this.fb.control(null, [Validators.required]));
      this.obtenerEventos(); // carga el catálogo
    } else {
      this.crearUsuarioForm.addControl('idEventoNuevo', this.fb.control(null)); // sin validators
    }
  }

  obtenerDatosEstaticos(){
    this.starterData.getDependencias().subscribe((data: IDependenciaSelect[]) => {
      this.dependencias = data.map(dep => ({
        clave_dependencia: dep.clave_dependencia,
        nombre_dependencia: dep.nombre_dependencia
      }))
    })

    this.starterData.getRoles().subscribe((data: any) => {
      this.roles = data
      if (this.clave_rol_usuario === 35) {
        if(this.data.id_evento){
          this.roles = this.roles.filter((rol: IRoles) => rol.clave_rol !== 35 && rol.clave_rol !== 49 && rol.clave_rol !== 74);
        } else {
        this.roles = this.roles.filter((rol: IRoles) => rol.clave_rol !== 35 && rol.clave_rol !== 49);
        }
      }
    })

    this.starterData.getUsuariosEstatus().subscribe((data: any) => {
      this.usuario_estatus = data
    })
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


  crearUsuario(){
    const rol = this.crearUsuarioForm.get('idRolNuevo')?.value;
    const clave_rol = rol?.clave_rol

    const dependencia  = this.crearUsuarioForm.get('idDependenciaNuevo')?.value;
    const clave_dependencia = dependencia?.clave_dependencia
    const id_evento_form = this.crearUsuarioForm.get('idEventoNuevo')?.value;

    this.isSubmitting = true;

    const dataNuevo = {
      correo: this.crearUsuarioForm.get('correoNuevo')?.value,
      contrasena: sha256(this.crearUsuarioForm.get('contrasenaNuevo2')?.value),

      //Persona
      nombre : this.crearUsuarioForm.get('nombreNuevo')?.value,
      ap_paterno: this.crearUsuarioForm.get('apPaternoNuevo')?.value,
      ap_materno: this.crearUsuarioForm.get('apMaternoNuevo')?.value,

      //Datos generales
      // curp: this.crearUsuarioForm.get('curpNuevo')?.value,
      telefono: this.crearUsuarioForm.get('telefonoNuevo')?.value,

      //Dependencia
      clave_dependencia: clave_dependencia,

      //Rol
      clave_rol: clave_rol,

      //Evento
      id_evento: this.clave_rol_usuario === 27 ? id_evento_form : (this.id_evento || null),
    }

    this.usuarioServices.createUsuario(dataNuevo).subscribe({
      next: () => {
        this.toastr.success('El usuario se ha registrado correctamente', 'Usuario registrado');
        this.cancelar();
      },
      error: () => {
        this.toastr.error('Hubo un error al registrar el usuario');
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false
    });


  }

  actualizarUsuario(){
    const dependencia = this.actualizarUsuarioForm.get('idDependenciaActualizar')?.value

    const dataActualizado = {
      //Usuario
      correo: this.actualizarUsuarioForm.get('correoActualizar')?.value,
      id_usuario: this.datoUsuario._id,

      //Persona
      nombre : this.actualizarUsuarioForm.get('nombreActualizar')?.value,
      ap_paterno: this.actualizarUsuarioForm.get('apPaternoActualizar')?.value,
      ap_materno: this.actualizarUsuarioForm.get('apMaternoActualizar')?.value,

      //Datos generales
      // curp: this.actualizarUsuarioForm.get('curpActualizar')?.value,
      telefono: this.actualizarUsuarioForm.get('telefonoActualizar')?.value,

      //Dependencia
      clave_dependencia: dependencia?.clave_dependencia,
    }

    this.usuarioServices.actualizarUsuario(dataActualizado).subscribe((res => {
      this.toastr.success('El usuario se ha actualizado correctamente', 'Usuario actualizado');
      setTimeout(() => {
      }, 2000);
      this.cancelar()
    }))
  }

  actualizarContrasena(){
    const id_usuario = this.datoUsuario._id
    const data = {
      id_usuario: id_usuario,
      contrasenaModificada: sha256(this.contrasenaNuevaForm.get('contrasenaModificada')?.value)
    }
    this.usuarioServices.updatePasswordUsuario(data).subscribe((res:any) => {
      if(res){
        this.toastr.success('La contraseña se ha actualizado correctamente', 'Contraseña actualizada');
        setTimeout(() => {
        }, 2000);
        this.cancelar()
      }
    })
  }

  actualizarEstatus(){
    const id_usuario = this.datoUsuario._id
    const clave_estatus = this.estatusNuevoForm.get('estatusModificado')?.value
    let nombre_estatus = ''

    if(clave_estatus === 1){
      nombre_estatus = 'Habilitado'
    }else if(clave_estatus === 2){
      nombre_estatus = 'Deshabilitado'
    }

    const dataEstatus = {
      id_usuario: id_usuario,
      clave_estatus: clave_estatus,
      nombre_estatus: nombre_estatus,
      justificacion_estatus: this.estatusNuevoForm.get('justificacion_estatus')?.value
    }

    this.usuarioServices.updateEstatusUsuario(dataEstatus).subscribe((res:any) => {
      if(!res.error){
        this.toastr.success('El estatus del usuario se ha actualizado correctamente', 'Estatus actualizado');
        this.cancelar()
      }
    })

  }

  get estatusNoModificado() {
    return this.estatusNuevoForm.get('estatusModificado')?.value === this.datoUsuario.clave_estatus;
  }

  cancelar(){
    this.dialogRef.close();
  }

  //FUNCIONES UTILIDAD
  soloNumeros(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
        event.preventDefault();
        return false;
    } else {
        return true;
    }
  }

  definirTextoDialog(): void {
    if (this.clave_rol_usuario === 27) {
      this.textoDialog = 'Nuevo Usuario';
    } else if (this.clave_rol_usuario === 35) {
      this.textoDialog = 'Nuevo Promotor'
    } else if (this.clave_rol_usuario === 48) {
      this.textoDialog = 'Nuevo Enlace';
    } else {
      this.textoDialog = 'Nuevo Usuario';
    }
    console.log(this.textoDialog);
  }
}

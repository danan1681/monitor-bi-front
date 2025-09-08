import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { NgIf } from '@angular/common';
import { CoreService } from 'src/app/core/services/core.service';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms'
import { LoginService } from '../../../core/services/login.service';

// @ts-ignore
import { sha256 } from 'js-sha256';
import { UsuariosService } from 'src/app/core/services/usuarios.service';
import { switchMap } from 'rxjs/operators';
import {local} from "d3-selection";
import {BrandingComponent} from "../../../layouts/full/vertical/sidebar/branding.component";

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, NgIf, FormsModule, ReactiveFormsModule,BrandingComponent],
  providers: [LoginService],
  templateUrl: './side-login.component.html',
    styleUrls: ['./side-login.component.scss']

})

export class AppSideLoginComponent {

    options = this.settings.getOptions();
    errorMessage = '';
    public datos = false;
    public solicitud = false;
    msg = '';
    datosUsuario: any;
    loginForm : FormGroup

  constructor(
      private settings: CoreService,
      private routes: Router,
      private loginServices: LoginService,
      private fb: FormBuilder,
      private usuarioService: UsuariosService) {

          this.loginForm = this.fb.group({
              correo : ['', [Validators.required, Validators.email]],
              contrasena: ['', [Validators.required]]
          })

      }

  login() {
      const {correo, contrasena} = this.loginForm.value
      const passEnc = sha256(contrasena);
      this.solicitud = true

      this.loginServices.login(correo, passEnc).pipe(switchMap((response: any) => {

          return this.usuarioService.obtenerDatosUsuario()
      })
      ).subscribe(
          (response: any) =>{
            console.log('response', response)
              localStorage.setItem('nombreCompleto', response.data.nombre_completo);
              localStorage.setItem('clave_rol', response.data.clave_rol);
              localStorage.setItem('clave_dependencia', response.data.clave_dependencia);
              localStorage.setItem('id_evento', response.data.id_evento || '');
              this.routes.navigate(['/starter']);
          }, (error: any) =>{
              this.solicitud = false
              this.errorMessage = error.error.message;
          }
      )
    }


}

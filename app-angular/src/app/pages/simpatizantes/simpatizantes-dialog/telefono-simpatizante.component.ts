import {Component, inject, Inject, ViewChild} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImageCropperComponent} from "ngx-image-cropper";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {LoaderService} from "../../../core/services/loader.service";
import {SimpatizantesService} from "../../../core/services/simpatizantes.service";
import {SimpatizanteResponse, SimpatizanteUpdate} from "../../../core/models/simpatizante.dto";
import {telefonoExistenteValidator} from "../../../core/validators/validators";

@Component({
  selector: 'app-telefono-simpatizante-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule, ImageCropperComponent],
  templateUrl: './telefono-simpatizante.component.html',
  styles: ''

})
export class TelefonoSimpatizanteComponent {

  constructor(
    public dialogRef: MatDialogRef<TelefonoSimpatizanteComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public simpatizanteService: SimpatizantesService,
    private toastr: ToastrService,
    private loader: LoaderService,
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioTelefonoS: FormGroup;
  action = this.data.action
  simpatizante = this.data.simpatizante
  isSubmitting = false;


  ngOnInit(): void {
    this.crearFormularioTelefonoS = this.fb.group({
      telefono_celular: [
        this.simpatizante?.telefono_celular, [Validators.required, Validators.pattern(/^[0-9]*$/)], [telefonoExistenteValidator(this.simpatizanteService, undefined, this.simpatizante.id_evento ?? undefined)]],
    });
  }


    actualizarTelefonoSimpatizante(){
    if(this.crearFormularioTelefonoS.valid){
      this.loader.show();
      const simpatizante: SimpatizanteUpdate = this.crearFormularioTelefonoS.value as SimpatizanteUpdate;
      simpatizante.id_simpatizante = this.simpatizante._id;
      this.simpatizanteService.actualizarTelefonoSimpatizante(simpatizante).subscribe({
        next: (response: SimpatizanteResponse) => {
          if(response.code === 200){
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Teléfono actualizado correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          }
          else{
            this.toastr.error('Error al actualizar el teléfono');
            console.error("Error al actualizar el teléfono", response.message);
          }
        }
      })
    }
  }

  cancelar(){
    this.dialogRef.close();
  }

}

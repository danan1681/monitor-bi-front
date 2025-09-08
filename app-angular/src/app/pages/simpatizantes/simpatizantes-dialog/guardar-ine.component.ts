import {Component, inject, Inject, ViewChild} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImageCropperComponent} from "ngx-image-cropper";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {LoaderService} from "../../../core/services/loader.service";
import {SimpatizantesService} from "../../../core/services/simpatizantes.service";
import {IneSimpatizanteComponent} from "./ine-simpatizante.component";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-guardar-ine-simpatizante-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule, ImageCropperComponent],
  templateUrl: './guardar-ine.component.html',
  styles: ''

})
export class GuardarIneSimpatizanteComponent {

  constructor(
    public dialogRef: MatDialogRef<GuardarIneSimpatizanteComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public simpatizanteService: SimpatizantesService,
    private toastr: ToastrService,
    private loader: LoaderService,
    private dialog: MatDialog,
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioTelefonoS: FormGroup;
  action = this.data.action
  simpatizante = this.data.simpatizante
  imagenRecortadaUrl: string | null = null;
  imagenRecortadaFile: File | null = null;
  isSubmitting = false;

  IMG_FOTO_INE = `${environment.IMG_FOTO_INE}`;



  ngOnInit(): void {

    if(this.action != 'guardarIne') {
      this.imagenRecortadaUrl = `${this.IMG_FOTO_INE}${this.simpatizante.foto_ine}`;
    } else {
      this.imagenRecortadaUrl = null;
    }

  }

  async onImageChange(event: any): Promise<void> {
    const dialogRef = this.dialog.open(IneSimpatizanteComponent, {
      width: '500px',
      data: { imageChangedEvent: event },
      disableClose: true
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      const blob = await fetch(result).then(r => r.blob());
      this.imagenRecortadaFile = new File([blob], 'ine_recortada.png', { type: blob.type });
      this.imagenRecortadaUrl = URL.createObjectURL(this.imagenRecortadaFile);
    }

  }

  guardarImagenIneSimpatizante() {
    if (!this.imagenRecortadaFile) return;

    this.isSubmitting = true;
    this.loader.show();

    const formData = new FormData();
    formData.append('simpatizant', this.imagenRecortadaFile); // el nombre debe coincidir con `uploadImage.single('simpatizant')`

    this.simpatizanteService.actualizarIneSimpatizante(this.simpatizante._id, formData).subscribe({
      next: (response) => {
        this.loader.hide();
        this.toastr.success('¡INE actualizada correctamente!');
        this.dialogRef.close('reload');
      },
      error: (error) => {
        this.loader.hide();
        this.toastr.error('Error al actualizar la INE');
        console.error("Error al actualizar la INE", error);
        this.isSubmitting = false;
      }
    });
  }

  cancelar(){
    this.dialogRef.close();
  }

}

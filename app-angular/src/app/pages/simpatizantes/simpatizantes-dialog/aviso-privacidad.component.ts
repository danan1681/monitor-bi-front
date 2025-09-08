import {Component, inject, Inject, ViewChild} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ImageCropperComponent} from "ngx-image-cropper";


@Component({
  selector: 'app-aviso-privacidad-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ImageCropperComponent,],
  templateUrl: './aviso-privacidad.component.html',
  styles: ''

})
export class AvisoPrivacidadComponent {

  constructor(
    public dialogRef: MatDialogRef<AvisoPrivacidadComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
  ) {
  }

  cancelar(){
    this.dialogRef.close();
  }

}

import {Component, Inject, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ImageCropperComponent} from 'ngx-image-cropper';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-ine-simpatizante-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule, ImageCropperComponent],
  templateUrl: './ine-simpatizante.component.html',
  styles: ''

})
export class IneSimpatizanteComponent {
  @ViewChild(ImageCropperComponent) cropper!: ImageCropperComponent;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  rotation = 0;

  constructor(
    public dialogRef: MatDialogRef<IneSimpatizanteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageChangedEvent: any }
  ) {
    this.imageChangedEvent = data.imageChangedEvent;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  rotateLeft(): void {
    this.rotation -= 90;
  }

  rotateRight(): void {
    this.rotation += 90;
  }

  onConfirm(): void {
    this.dialogRef.close(this.croppedImage);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

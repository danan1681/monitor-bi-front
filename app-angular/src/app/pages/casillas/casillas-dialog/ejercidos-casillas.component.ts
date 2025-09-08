import {Component, inject, Inject, ViewChild} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {LoaderService} from "../../../core/services/loader.service";
import {CasillasService} from "../../../core/services/casillas.service";
import {CasillaResponse, CasillaUpdate} from "../../../core/models/casillas.dto";
import {types} from "sass";

@Component({
  selector: 'app-ejercidos-casillas-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ejercidos-casillas.component.html',
  styles: ''

})
export class EjercidosCasillasComponent {

  constructor(
    public dialogRef: MatDialogRef<EjercidosCasillasComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public casillasService: CasillasService,
    private toastr: ToastrService,
    private loader: LoaderService,
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioEjercidos: FormGroup;
  action = this.data.action
  casilla = this.data.casilla
  isSubmitting = false;
  id_evento = this.data.id_evento;

  ngOnInit(): void {
    this.crearFormularioEjercidos = this.fb.group({
      ejercidos: [
        '', [Validators.required]],
    });
  }


  actualizarEjercidosCasilla(){
    if(this.crearFormularioEjercidos.valid){
      this.loader.show();
      const casilla: CasillaUpdate = this.crearFormularioEjercidos.value as CasillaUpdate;
      casilla.id_casilla = this.casilla._id;
      this.casillasService.actualizarEjercidosCasilla(casilla, this.id_evento).subscribe({
        next: (response: CasillaResponse) => {
          if(response.code === 200){
            setTimeout(() => {
              this.loader.hide();
              this.toastr.success('¡Ejercidos actualizado correctamente!');
              this.dialogRef.close('reload');
            }, 1000);
          }
          else{
            this.toastr.error('Error al actualizar ejercidos');
            console.error("Error al actualizar ejercidos", response.message);
          }
        }
      })
    }
  }

  cancelar(){
    this.dialogRef.close();
  }

  protected readonly types = types;
  protected readonly Number = Number;
}

import {Component, effect, Input} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatFormField, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatPaginator} from "@angular/material/paginator";
import {MatTooltip} from "@angular/material/tooltip";
import {TablerIconsModule} from "angular-tabler-icons";
import {MaterialModule} from "../../../material.module";
import {ToastrModule} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {CandidaturasService} from "../../../core/services/candidaturas.service";
import {MatDialog} from "@angular/material/dialog";
import {EventoTituloComponent} from "../../../components/evento-titulo/evento-titulo.component";

@Component({
  selector: 'app-evento-detalles',
  standalone: true,
  imports: [MaterialModule, ToastrModule, TablerIconsModule, CommonModule, EventoTituloComponent],
  templateUrl: './evento-detalles.component.html',
  styleUrl: './evento-detalles.component.scss'
})
export class EventoDetallesComponent {
  
  idEvento!: string;

  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private candidaturasService: CandidaturasService,
    private dialog: MatDialog
  ){}

  ngOnInit(): void{
    this.idEvento = this.route.snapshot.paramMap.get('id_evento')!;
  }

  verCandidaturas(): void {
    this.routes.navigate(['eventos', this.idEvento, 'candidaturas']);
  }

  verCandidatos(): void {
    this.routes.navigate(['eventos', this.idEvento, 'candidatos']);
  }

  verCasillas(): void {
    this.routes.navigate(['eventos', this.idEvento, 'casillas']);
  }

}

import { Component, Inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CasillasService } from "../../../core/services/casillas.service";
import { ToastrService } from "ngx-toastr";
import { LoaderService } from "../../../core/services/loader.service";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MaterialModule } from "../../../material.module";
import { CommonModule } from "@angular/common";

import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import {Casilla} from "../../../core/models/casillas.model";
import {seccionExisteValidator} from "../../../core/validators/validators";
import {StarterServices} from "../../../core/services/starter.service";

const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const shadowUrl = 'assets/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl, iconUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  tooltipAnchor: [16, -28], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-casillas-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './casillas-dialog.component.html',
  styleUrls: ['./casillas-dialog.component.scss']
})
export class CasillasDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  formulario_actualizar_casilla: FormGroup;
  tiposCasilla: string[] = ['B', 'C', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'E', 'S1'] ;
  actualizando: boolean = false;
  casilla: any;
  id_evento: string;


  private map!: L.Map;
  private marker: L.Marker | null = null;
  private direccionChangesSubscription: Subscription | undefined;
  private initialLat: number | null = null;
  private initialLng: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<CasillasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { casilla: any; id_evento: string },
    private fb: FormBuilder,
    private loader: LoaderService,
    private casillaService: CasillasService,
    private toastr: ToastrService,
    private starterService: StarterServices
  ) {
    this.casilla = data.casilla;
    this.id_evento = data.id_evento;

    if (this.casilla?.direccion?.coordinates && this.casilla.direccion.coordinates.length === 2) {
      this.initialLng = this.casilla.direccion.coordinates[0];
      this.initialLat = this.casilla.direccion.coordinates[1];
    } else {
      console.warn("Datos de dirección incompletos o en formato incorrecto recibidos:", this.casilla?.direccion);

    }

    this.formulario_actualizar_casilla = this.fb.group({
      // distritoFederal: [this.casilla?.distritoFederal || '', [Validators.required]],
      // distritoLocal: [this.casilla?.distritoLocal || '', [Validators.required]],
      // municipio: [this.casilla?.municipio || '', [Validators.required]],
      // seccion: [this.casilla?.seccion || '', [Validators.required, Validators.pattern('^[0-9]+$')]],
      seccion: [
        this.casilla?.seccion || '',
        {
          validators: [Validators.required, Validators.pattern('^[0-9]+$')],
          asyncValidators: [seccionExisteValidator(this.starterService)],
          updateOn: 'blur' // o 'change' si prefieres validación continua
        }
      ],
      tipoCasilla: [this.casilla?.tipoCasilla || '', [Validators.required]],
      totalVotos: [this.casilla?.totalVotos ?? 0, [Validators.required, Validators.min(0)]],
      listaNominal: [this.casilla?.listaNominal || '', [Validators.required, Validators.min(1)]],
      meta: [this.casilla?.meta || '', [Validators.required, Validators.min(1)]],
      direccion: this.fb.group({
        latitud: [this.initialLat ?? '', [
          Validators.required,
          Validators.min(-90),
          Validators.max(90),
          Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/)
        ]],
        longitud: [this.initialLng ?? '', [
          Validators.required,
          Validators.min(-180),
          Validators.max(180),
          Validators.pattern(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
        ]],
      })
    });
  }

  ngOnInit(): void {
    this.formulario_actualizar_casilla.valueChanges.subscribe(() => {
      if(this.formulario_actualizar_casilla.dirty) {
      }
    });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inicializarMapa();
      this.escucharCambiosDireccion();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.direccionChangesSubscription?.unsubscribe();
  }

  private inicializarMapa(): void {
    const centerLat = this.initialLat ?? 19.3190;
    const centerLng = this.initialLng ?? -98.2380;
    const zoomInicial = (this.initialLat && this.initialLng) ? 15 : 13;

    const mapContainerId = 'mapaDialogoCasilla';

    if (this.map) {
      this.map.remove();
    }


    try {
      this.map = L.map(mapContainerId, {
        center: [centerLat, centerLng],
        zoom: zoomInicial
      });

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });

      tiles.addTo(this.map);

      if (this.initialLat !== null && this.initialLng !== null) {
        this.actualizarMarcador(this.initialLat, this.initialLng);
      }

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        this.formulario_actualizar_casilla.get('direccion')?.patchValue({
          latitud: lat.toFixed(6),
          longitud: lng.toFixed(6)
        }, { emitEvent: false });

        this.formulario_actualizar_casilla.get('direccion.latitud')?.markAsDirty();
        this.formulario_actualizar_casilla.get('direccion.longitud')?.markAsDirty();
        this.formulario_actualizar_casilla.get('direccion')?.markAsDirty();
        this.formulario_actualizar_casilla.markAsDirty();

        this.actualizarMarcador(lat, lng);
        this.map.setView(e.latlng);
      });

      setTimeout(() => this.map.invalidateSize(), 100);

    } catch (error) {
      console.error("Error inicializando el mapa del diálogo:", error);
      this.toastr.error("No se pudo cargar el mapa.", "Error de Mapa");
    }

  }

  private escucharCambiosDireccion(): void {
    const direccionFormGroup = this.formulario_actualizar_casilla.get('direccion');
    if (!direccionFormGroup) return;

    this.direccionChangesSubscription = direccionFormGroup.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      filter(() => direccionFormGroup.valid)
    ).subscribe(values => {
      const lat = parseFloat(values.latitud);
      const lng = parseFloat(values.longitud);

      if (!isNaN(lat) && !isNaN(lng) && this.map) {
        this.actualizarMarcador(lat, lng);
        this.map.setView([lat, lng]);
      }
    });
  }

  private actualizarMarcador(lat: number, lng: number): void {
    const latLng = L.latLng(lat, lng);
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng(latLng);
    } else {
      this.marker = L.marker(latLng).addTo(this.map);
    }
    this.marker.bindPopup(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();
  }

  actualizarCasilla() {
    if (this.formulario_actualizar_casilla.invalid) {
      this.toastr.warning('Revisa los campos, hay datos inválidos.', 'Formulario Inválido');
      this.formulario_actualizar_casilla.markAllAsTouched();
      return;
    }

    this.actualizando = true;
    this.loader.show();

    const formValues = this.formulario_actualizar_casilla.getRawValue();
    const casillaIdOriginal = this.casilla?._id;

    const datosParaActualizar = {
      ...formValues,
      id_casilla: casillaIdOriginal,
      direccion: {
        type: 'Point',
        coordinates: [
          parseFloat(formValues.direccion.longitud), // Longitud primero
          parseFloat(formValues.direccion.latitud)  // Latitud segundo
        ]
      }
    };

    this.casillaService.actualizarCasilla(datosParaActualizar, this.id_evento)
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Casilla actualizada correctamente', 'Éxito');
          setTimeout(() => {
            this.loader.hide();
            this.actualizando = false;
            this.formulario_actualizar_casilla.markAsPristine();
            this.dialogRef.close('reload');
          }, 1000);
        },
        error: (error: any) => {
          this.loader.hide();
          this.actualizando = false;
          this.toastr.error('Error al actualizar la casilla.', 'Error');
          console.error("Error del servidor al actualizar:", error);
        }
      });
  }


  cancelar(){
    this.dialogRef.close();
  }

}

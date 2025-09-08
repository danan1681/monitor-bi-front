import {Component, AfterViewInit, OnDestroy, Input} from '@angular/core';
import { CommonModule, Location } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MaterialModule } from "../../../material.module";
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import {LoaderService} from "../../../core/services/loader.service";
import {CasillasService} from "../../../core/services/casillas.service";
import {distinctUntilChanged, Subscription} from "rxjs";
import {debounceTime, filter} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {seccionExisteValidator} from "../../../core/validators/validators";
import {StarterServices} from "../../../core/services/starter.service";

const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const shadowUrl = 'assets/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-registro-casillas',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  templateUrl: './registro-casillas.component.html',
  styleUrls: ['./registro-casillas.component.scss']
})
export class RegistroCasillasComponent implements AfterViewInit, OnDestroy {
  @Input() id_evento?: string | null ;
  crearFormularioCasilla: FormGroup;
  private map!: L.Map;
  private marker: L.Marker | null = null;
  private direccionChangesSubscription: Subscription | undefined;

  tiposCasilla: string[] = ['B', 'C', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'E', 'S1'] ;
  private idEventoEsInput: boolean = false;


  constructor(
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private location: Location,
    private toastr: ToastrService,
    private loader: LoaderService,
    private casillaService: CasillasService,
    private starterService: StarterServices  // 👈 AQUI se define this.starterService
  ) {
    this.crearFormularioCasilla = this.fb.group({
      // distritoFederal: ['', [Validators.required]],
      // distritoLocal: ['', [Validators.required]],
      // municipio: ['', [Validators.required]],
      // seccion: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      seccion: [
        '',
        {
          validators: [Validators.required, Validators.pattern('^[0-9]+$')],
          asyncValidators: [seccionExisteValidator(this.starterService)],
          updateOn: 'blur' // o 'change' si prefieres validación continua
        }
      ],
      tipoCasilla: ['', [Validators.required]],
      totalVotos: ['', [Validators.required, Validators.min(0)]],
      listaNominal: ['', [Validators.required, Validators.min(1)]],
      meta: ['', [Validators.required, Validators.min(1)]],
      direccion: this.fb.group({
        latitud: ['', [
          Validators.required,
          Validators.min(-90),
          Validators.max(90)
        ]],
        longitud: ['', [
          Validators.required,
          Validators.min(-180),
          Validators.max(180)
        ]],
      })
    });
  }

  ngAfterViewInit(): void {
    if (this.id_evento && this.id_evento !== 'null') {
      this.idEventoEsInput = true;
    }

    if (!this.idEventoEsInput) {
      const localEvento = localStorage.getItem('id_evento');
      if (localEvento && localEvento !== 'null') {
        this.id_evento = localEvento;
      }
    }
    this.inicializarMapa();
    this.escucharCambiosDireccion()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.direccionChangesSubscription?.unsubscribe();
  }

  private inicializarMapa(): void {
    const centroTlaxcala: L.LatLngTuple = [19.3190, -98.2380];
    const zoomInicial = 13;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('mapaCasilla', {
      center: centroTlaxcala,
      zoom: zoomInicial
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      this.crearFormularioCasilla.get('direccion')?.patchValue({
        latitud: lat.toFixed(6),
        longitud: lng.toFixed(6)
      }, { emitEvent: false });

      this.actualizarMarcador(lat, lng);
      this.map.setView(e.latlng, this.map.getZoom());
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private escucharCambiosDireccion(): void {
    const direccionFormGroup = this.crearFormularioCasilla.get('direccion');

    if (!direccionFormGroup) return;
    this.direccionChangesSubscription = direccionFormGroup.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      filter(() => direccionFormGroup.valid)
    ).subscribe(values => {
      const lat = parseFloat(values.latitud);
      const lng = parseFloat(values.longitud);

      if (!isNaN(lat) && !isNaN(lng) && this.map) {
        console.log('Actualizando mapa desde formulario:', lat, lng);
        this.actualizarMarcador(lat, lng);
        this.map.setView([lat, lng], this.map.getZoom() > 14 ? this.map.getZoom() : 14); // Centra y asegura un zoom mínimo
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

  guardarCasilla(): void {
    if (this.crearFormularioCasilla.invalid) {
      this.toastr.warning('Por favor, completa todos los campos requeridos y selecciona una ubicación en el mapa.', 'Formulario incompleto');
      this.crearFormularioCasilla.markAllAsTouched();
      return;
    }

    this.loader.show();

    this.crearFormularioCasilla.get('direccion.latitud')?.enable();
    this.crearFormularioCasilla.get('direccion.longitud')?.enable();
    this.crearFormularioCasilla.get('totalVotos')?.enable();

    const datosCasilla = this.crearFormularioCasilla.getRawValue();

    this.crearFormularioCasilla.get('direccion.latitud')?.disable();
    this.crearFormularioCasilla.get('direccion.longitud')?.disable();
    this.crearFormularioCasilla.get('totalVotos')?.disable();

    this.casillaService.crearCasilla(datosCasilla, this.id_evento)
      .subscribe({
        next: (respuesta:any) => {
          this.toastr.success('Casilla creada correctamente', 'Éxito');
          console.log('Respuesta del servidor:', respuesta);
          setTimeout(() => {
            this.loader.hide();
            this.location.back();
          }, 1000);

        },
        error: (err) => {
          this.loader.hide();
          this.toastr.error('Hubo un error al guardar la casilla.', 'Error');
          console.error('Error al guardar casilla:', err);
        }
      });
  }

  cancelar(): void {
    this.location.back();
  }
}

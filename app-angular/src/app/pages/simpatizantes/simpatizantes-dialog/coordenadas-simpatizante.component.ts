import {Component, inject, Inject, ViewChild} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImageCropperComponent} from "ngx-image-cropper";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {LoaderService} from "../../../core/services/loader.service";
import {SimpatizantesService} from "../../../core/services/simpatizantes.service";
import * as L from "leaflet";
import {distinctUntilChanged, Subscription} from "rxjs";
import {debounceTime, filter} from "rxjs/operators";

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
  selector: 'app-coordenadas-simpatizante-modal',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule, ImageCropperComponent],
  templateUrl: './coordenadas-simpatizante.component.html',
  styles: ''

})
export class CoordenadasSimpatizanteComponent {

  constructor(
    public dialogRef: MatDialogRef<CoordenadasSimpatizanteComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public simpatizanteService: SimpatizantesService,
    private toastr: ToastrService,
    private loader: LoaderService,
  ) {
  }

  private fb = inject(FormBuilder);
  crearFormularioCoordenadas: FormGroup;
  action = this.data.action
  simpatizante = this.data.simpatizante
  isSubmitting = false;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private coordenadasChangesSubscription: Subscription | undefined;


  ngOnInit(): void {
    const coords = this.simpatizante?.coordenadas?.coordinates;

    let latitud = null;
    let longitud = null;

    if (Array.isArray(coords) && coords.length === 2) {
      [longitud, latitud] = coords; // Recuerda: [lng, lat]
    }

    this.crearFormularioCoordenadas = this.fb.group({
      coordenadas: this.fb.group({
        latitud: [latitud, [Validators.required, Validators.min(-90), Validators.max(90)]],
        longitud: [longitud, [Validators.required, Validators.min(-180), Validators.max(180)]],
      })
    });
  }


  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.escucharCambiosDireccion();

    if (this.action == 'guardarCoordenadas') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            this.crearFormularioCoordenadas.get('coordenadas')?.patchValue({
              latitud: lat.toFixed(6),
              longitud: lng.toFixed(6)
            }, {emitEvent: false});

            this.actualizarMarcador(lat, lng);
            this.map.setView([lat, lng], 15);
          },
          (error) => {
            console.warn('Permiso de geolocalización denegado o no disponible');
          },
          {enableHighAccuracy: true}
        );
      }
    }

    const coords = this.simpatizante?.coordenadas?.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      const [lng, lat] = coords;
      this.actualizarMarcador(lat, lng);
      this.map.setView([lat, lng], 15);
    }


  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.coordenadasChangesSubscription?.unsubscribe();
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

      this.crearFormularioCoordenadas.get('coordenadas')?.patchValue({
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
    const coordenadasFormGroup = this.crearFormularioCoordenadas.get('coordenadas');

    if (!coordenadasFormGroup) return;
    this.coordenadasChangesSubscription = coordenadasFormGroup.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      filter(() => coordenadasFormGroup.valid)
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



  guardarCoordenadasSimpatizante() {
    if (this.crearFormularioCoordenadas.valid) {
      this.isSubmitting = true;
      this.loader.show();

      const { latitud, longitud } = this.crearFormularioCoordenadas.get('coordenadas')!.value;

      const data = {
        id_simpatizante: this.simpatizante._id,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud)
      };

      this.simpatizanteService.actualizarCoordenadasSimpatizante(data).subscribe({
        next: (res) => {
          setTimeout(() => {
            this.loader.hide();
            this.toastr.success('¡Coordenadas actualizadas correctamente!');
            this.dialogRef.close('reload');
          }, 1000);
        },
        error: (err) => {
          this.loader.hide();
          this.toastr.error('Error al guardar coordenadas');
          console.error(err);
        }
      });
    }
  }


  cancelar(){
    this.dialogRef.close();
  }

}

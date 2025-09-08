import {Component, OnInit, AfterViewInit, OnDestroy, Input} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { CasillasService} from '../../../core/services/casillas.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ToastrService } from 'ngx-toastr';

import * as L from 'leaflet';
import {CasillaUbicacion} from "../../../core/models/casillas.model";

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
  selector: 'app-casillas-mapa',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './casillas-mapa.component.html',
  styleUrl: './casillas-mapa.component.scss'
})
export class CasillasMapaComponent {
  @Input() id_evento?: string | null ;
  private map!: L.Map;
  private markersLayer = L.featureGroup();
  private idEventoEsInput: boolean = false;

  constructor(
    private casillasService: CasillasService,
    private loader: LoaderService,
    private toastr: ToastrService,
    private location: Location
  ) { }

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
  }

  ngOnDestroy(): void {
    this.markersLayer.clearLayers();
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    const centroTlaxcala: L.LatLngTuple = [19.3190, -98.2380];
    const zoomInicial = 11;

    const mapContainerId = 'mapaGeneralCasillas';

    try {
      this.map = L.map(mapContainerId, {
        center: centroTlaxcala,
        zoom: zoomInicial
      });

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 8,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });

      tiles.addTo(this.map);
      this.markersLayer.addTo(this.map);
      setTimeout(() => this.map?.invalidateSize(), 100);

      this.cargarMarcadores();

    } catch (error) {
      console.error("Error inicializando el mapa general:", error);
      this.toastr.error("No se pudo cargar el mapa.", "Error de Mapa");
    }
  }

  private cargarMarcadores(): void {
    setTimeout(() => this.loader.show(), 0);

    this.casillasService.verMapaCasilla(this.id_evento).subscribe({
      next: (respuesta: any) => {
        this.loader.hide();
        this.markersLayer.clearLayers();

        const casillasArray: CasillaUbicacion[] = respuesta?.data;

        if (!Array.isArray(casillasArray) || casillasArray.length === 0) {
          this.toastr.info("No hay ubicaciones de casillas para mostrar o la respuesta no es válida.");
          return;
        }
        casillasArray.forEach(casilla => {
          if (casilla.direccion?.coordinates?.length === 2) {
            const lng = casilla.direccion.coordinates[0];
            const lat = casilla.direccion.coordinates[1];
            const marker = L.marker([lat, lng]);

            // const tooltipContent = `
            //    <b>Municipio:</b> ${casilla.municipio || 'N/D'}<br>
            //   <b>Sección:</b> ${casilla.seccion || 'N/D'}<br>
            //   <b>Tipo:</b> ${casilla.tipoCasilla || 'N/D'}<br>
            //   <b>Distrito L.:</b> ${casilla.distritoLocal || 'N/D'}
            // `;

            const tooltipContent = `
              <b>Sección:</b> ${casilla.seccion || 'N/D'}<br>
              <b>Tipo:</b> ${casilla.tipoCasilla || 'N/D'}<br>
            `;
            marker.bindTooltip(tooltipContent);
            this.markersLayer.addLayer(marker);
          } else {
            console.warn("Casilla sin coordenadas válidas omitida:", casilla);
          }
        });

        if (this.markersLayer.getLayers().length > 0) {
          try {
            this.map.fitBounds(this.markersLayer.getBounds().pad(0.1));
          } catch (boundsError) {
            console.error("Error al ajustar los límites del mapa:", boundsError);
          }
        }

      },
      error: (err) => {
        this.loader.hide();
        this.toastr.error('Error al cargar las ubicaciones de las casillas.', 'Error de Datos');
        console.error("Error al obtener ubicaciones:", err);
      }
    });
  }

  regresar(): void {
    this.location.back();
  }

}

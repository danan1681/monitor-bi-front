import { Component } from '@angular/core';
import * as L from "leaflet";
import {LoaderService} from "../../../core/services/loader.service";
import {ToastrService} from "ngx-toastr";
import {Location} from "@angular/common";
import {SimpatizantesService} from "../../../core/services/simpatizantes.service";
import {ISimpatizanteUbicacion} from "../../../core/models/simpatizante.model";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";


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
  selector: 'app-mapa-simpatizantes',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatIcon
  ],
  templateUrl: './mapa-simpatizantes.component.html',
  styleUrl: './mapa-simpatizantes.component.scss'
})
export class MapaSimpatizantesComponent {

  private map!: L.Map;
  private markersLayer = L.featureGroup();

  constructor(
    private simpatizantesService: SimpatizantesService,
    private loader: LoaderService,
    private toastr: ToastrService,
    private location: Location
  ) { }

  ngAfterViewInit(): void {
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

    const mapContainerId = 'mapaGeneralSimpatizantes';

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

    this.simpatizantesService.verMapaSimpatizantes().subscribe({
      next: (respuesta: any) => {
        this.loader.hide();
        this.markersLayer.clearLayers();

        const simpatizantesArray: ISimpatizanteUbicacion[] = respuesta?.data;

        if (!Array.isArray(simpatizantesArray) || simpatizantesArray.length === 0) {
          this.toastr.info("No hay ubicaciones de simpatizantes para mostrar o la respuesta no es válida.");
          return;
        }
        simpatizantesArray.forEach(simpatizante => {
          if (simpatizante.coordenadas?.coordinates?.length === 2) {
            const lng = simpatizante.coordenadas.coordinates[0];
            const lat = simpatizante.coordenadas.coordinates[1];
            const marker = L.marker([lat, lng]);

            const tooltipContent = `
              <b>Teléfono celular:</b> ${simpatizante.telefono_celular || 'N/D'}<br>
              <b>Nombre completo:</b> ${simpatizante.nombre + ' ' + simpatizante.ap_paterno + ' ' + simpatizante.ap_materno || 'N/D'}<br>
              <b>CURP:</b> ${simpatizante.curp || 'N/D'}<br>
            `;
            marker.bindTooltip(tooltipContent);
            this.markersLayer.addLayer(marker);
          } else {
            console.warn("Simpatizante sin coordenadas válidas omitida:", simpatizante);
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
        this.toastr.error('Error al cargar las ubicaciones de los simpatizantes.', 'Error de Datos');
        console.error("Error al obtener ubicaciones:", err);
      }
    });
  }

  regresar(): void {
    this.location.back();
  }

}

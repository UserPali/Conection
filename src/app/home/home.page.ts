import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

  map: any = null;
  directionsService: any = null;
  directionsRenderers: any[] = [];
  markers: any[] = [];
  trafficLayer: any = null;
  clientes: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getClientes().subscribe(
      data => {
        this.clientes = data;
        this.loadMap();
      },
      error => {
        console.error('Error al recibir datos:', error);
      }
    );
  }

  loadMap() {
    const mapOptions = {
      zoom: 14,
      center: { lat: 14.603693930266232, lng: -90.53059215479514 } // Punto de partida 
    };

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.directionsService = new google.maps.DirectionsService();

    // Añadir la capa de tráfico al mapa
    this.trafficLayer = new google.maps.TrafficLayer();
    this.trafficLayer.setMap(this.map);

    const waypoints = this.clientes.map(cliente => ({
      location: { lat: cliente.GPS_LATITUD, lng: cliente.GPS_LONGITUD },
      stopover: true
    }));

    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'yellow','Black'];

    // Implementar el algoritmo de búsqueda del vecino más cercano
    const orderedWaypoints = this.nearestNeighbor(waypoints);

    for (let i = 0; i < orderedWaypoints.length - 1; i++) {
      const directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: colors[i % colors.length],
          strokeWeight: 3 // Ajustar el grosor de la línea
        }
      });
      directionsRenderer.setMap(this.map);
      this.directionsRenderers.push(directionsRenderer);

      // Ajustar las coordenadas ligeramente para separar las líneas
      const origin = this.adjustCoordinates(orderedWaypoints[i].location, i);
      const destination = this.adjustCoordinates(orderedWaypoints[i + 1].location, i + 1);

      const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(), // Considerar el tráfico en tiempo real
          trafficModel: 'bestguess'
        }
      };

      this.directionsService.route(request, (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderers[i].setDirections(result);
        } else {
          console.error('Error fetching directions', result);
        }
      });

      // Añadir marcadores con etiquetas y hacerlos arrastrables
      const marker = new google.maps.Marker({
        position: orderedWaypoints[i].location,
        map: this.map,
        label: String.fromCharCode('A'.charCodeAt(0) + i),
        draggable: true
      });

      // Añadir evento de escucha para detectar cuando se ha terminado de arrastrar el marcador
      marker.addListener('dragend', (event: any) => {
        this.updateMarkerPosition(i, event.latLng);
      });

      this.markers.push(marker);
    }

    // Añadir marcador para el último punto y hacerlo arrastrable
    const lastMarker = new google.maps.Marker({
      position: orderedWaypoints[orderedWaypoints.length - 1].location,
      map: this.map,
      label: String.fromCharCode('A'.charCodeAt(0) + orderedWaypoints.length - 1),
      draggable: true
    });

    lastMarker.addListener('dragend', (event: any) => {
      this.updateMarkerPosition(orderedWaypoints.length - 1, event.latLng);
    });

    this.markers.push(lastMarker);
  }

  nearestNeighbor(waypoints: any[]): any[] {
    const orderedWaypoints = [waypoints[0]];
    const remainingWaypoints = waypoints.slice(1);

    while (remainingWaypoints.length > 0) {
      const lastWaypoint = orderedWaypoints[orderedWaypoints.length - 1];
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(lastWaypoint.location, remainingWaypoints[0].location);

      for (let i = 1; i < remainingWaypoints.length; i++) {
        const distance = this.calculateDistance(lastWaypoint.location, remainingWaypoints[i].location);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      orderedWaypoints.push(remainingWaypoints.splice(nearestIndex, 1)[0]);
    }

    return orderedWaypoints;
  }

  calculateDistance(point1: any, point2: any): number {
    const lat1 = point1.lat;
    const lng1 = point1.lng;
    const lat2 = point2.lat;
    const lng2 = point2.lng;

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km

    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  adjustCoordinates(location: any, index: number): any {
    const offset = 0.0001 * (index % 2 === 0 ? 1 : -1); // Ajustar ligeramente las coordenadas
    return {
      lat: location.lat + offset,
      lng: location.lng + offset
    };
  }

  updateMarkerPosition(index: number, latLng: any) {
    // Actualizar la posición del marcador
    this.markers[index].setPosition(latLng);

    // Actualizar la posición en los waypoints ordenados
    const orderedWaypoints = this.markers.map(marker => ({
      location: marker.getPosition(),
      stopover: true
    }));

    // Recalcular y actualizar las rutas afectadas
    for (let i = 0; i < orderedWaypoints.length - 1; i++) {
      const origin = this.adjustCoordinates(orderedWaypoints[i].location, i);
      const destination = this.adjustCoordinates(orderedWaypoints[i + 1].location, i + 1);

      const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(), // Considerar el tráfico en tiempo real
          trafficModel: 'bestguess'
        }
      };

      this.directionsService.route(request, (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderers[i].setDirections(result);
        } else {
          console.error('Error fetching directions', result);
        }
      });
    }
  }
}
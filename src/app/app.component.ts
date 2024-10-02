import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{

  clientes: any[] = [];

  constructor(private dataService: DataService) {}

  
}
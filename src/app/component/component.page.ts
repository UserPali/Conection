import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-component',
  templateUrl: './component.page.html',
  styleUrls: ['./component.page.scss'],
})
export class ComponentPage implements OnInit {

  clientes: any[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getClientes().subscribe(
      data => {
        this.clientes = data;
      },
      (error: HttpErrorResponse) => {
        console.error('Error al recibir datos:', error);
      }
    );
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:8000/api/clientes'; // URL de tu API

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from  '@angular/common/http';

import { RolAsignado } from './rolAsignado';
import { Red } from './red';
import { Usuario } from './usuario';
import { ASIGNACIONES } from './mock-asignaciones';
import { API_URL } from './api-url';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private asignaciones: Array<RolAsignado> = [];

  constructor(private httpClient: HttpClient) { }

  getAsignaciones(): Observable<RolAsignado[]> {

    let options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };

    this.httpClient.get(`${API_URL}/asignaciones/`, options).subscribe((data: any) => {
      console.log('b');
      data.context.forEach( dataItem => {
        let asignacion1 = new RolAsignado();
        console.log('a');
        asignacion1.fechaInicio = dataItem.fecha_inicio;
        asignacion1.fechaFin = dataItem.fecha_fin === null ? '' : fecha_fin;
        asignacion1.rol = dataItem.rol.nombre;
        let red = new Red();
        red.codigo = dataItem.red.codigo;
        red.nombre = dataItem.red.nombre;
        red.nombreCorto = dataItem.red.nombre_corto;
        red.descripcion = dataItem.red.descripcion;
        red.fechaInicio = dataItem.red.fecha_inicio;
        red.fechaCierre = dataItem.red.fecha_cierre;
        red.fechaCreacion = '';
        red.porcentajeAvance = dataItem.red.porcentaje_avance;
        red.tipo = dataItem.red.tipo;
        red.solicitante = dataItem.red.solicitante;
        red.horasTrabajadas = dataItem.red.horas_trabajadas;
        red.horasEstimadas = dataItem.red.horas_estimadas;
        red.proyectoConectate = undefined;
        red.historialEstados = undefined;
        red.fase = '';
        asignacion1.red = red;
        let usuario = new Usuario();

        this.asignaciones.push(asignacion1)
      });
    });
    return of(this.asignaciones);
  }
}

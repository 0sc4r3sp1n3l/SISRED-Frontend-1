import { Component, OnInit } from '@angular/core';

import { ProyectoConectate } from '../proyectoConectate';
import { Red } from '../red';
import { RolAsignado } from '../rolAsignado';
import { PersonasPorRol } from '../personasPorRol';
import { ProyectoConectateService } from '../proyecto-conectate.service';
import { RolesEstadosFasesService } from '../roles-estados-fases.service';
import { REDS } from '../mock-reds';
import { ASIGNACIONES } from '../mock-asignaciones';
import { ROLES } from '../roles';
import { ESTADOS } from '../estados';
import { FASES } from '../fases';

@Component({
  selector: 'app-avance-proyecto-conectate',
  templateUrl: './avance-proyecto-conectate.component.html',
  styleUrls: ['./avance-proyecto-conectate.component.css']
})
export class AvanceProyectoConectateComponent implements OnInit {
  proyecto : ProyectoConectate;
  reds: Red[] = REDS;
  asignaciones: RolAsignado[] = ASIGNACIONES;
  difMeses: number = 0;
  redsTerminados: number = 0;
  avance: number = 0;
  personas: PersonasPorRol[] = [];
  roles: string[];
  horasEstimadas: number = 0;
  horasTrabajadas: number = 0;
  estados: string[];
  estadosReds: number[] = [];
  fases: string[]
  fasesReds: number[] = [];

  constructor(private proyectoService: ProyectoConectateService, private refService: RolesEstadosFasesService) { }

  ngOnInit() {
    this.getProyectoConectate();
    this.initHoras();
  }

  getProyectoConectate(): void {
    this.proyectoService.getProyecto(1)
      .subscribe(proyecto => {
        this.proyecto = proyecto;
        this.getRedsProyecto();
      });
  }

  getRedsProyecto(): void {
    this.proyectoService.getRedsProyecto(1)
      .subscribe(reds => {
        this.reds = reds;
        this.getRolesEstadosFases();
      });
  }

  getRolesEstadosFases(): void {
    this.refService.getRoles()
      .subscribe(roles => {
        this.roles = roles;
        this.initPersonasPorRol();
      });
    this.refService.getEstados()
      .subscribe(estados => {
        this.estados = estados;
        this.initEstadosReds();
      });
    this.refService.getFases()
      .subscribe(fases => {
        this.fases = fases;
        this.initFasesReds();
      });
  }

  initPersonasPorRol() {
    let fechaInicio = new Date(this.proyecto.fechaInicio);
    let fechaActual = new Date();
    this.difMeses = this.getDifMeses(fechaInicio, fechaActual);
    
    for(let i = 0; i<=this.difMeses; i++) {
      let roles = [];
      for(let i in this.roles) {
        roles[i] = 0
      }
      this.personas = this.personas.concat({
        roles,
      });
    }
    for(let asig of this.asignaciones) {
      let fechaInicioAsig = new Date(asig.fechaInicio);
      let fechaFinAsig = asig.fechaFin==='' ? fechaActual : new Date(asig.fechaFin);
      let difInicioAsig = this.getDifMeses(fechaInicio, fechaInicioAsig);
      let difFinAsig = this.getDifMeses(fechaInicio, fechaFinAsig);
      
      for(let p of this.personas) {
        if(difInicioAsig<=0 && difFinAsig>=0) {
          for(let i in this.roles) {
            if(asig.rol === this.roles[i]) {
              p.roles[i]++;
              break;
            }
          }
        }
        difInicioAsig--;
        difFinAsig--;
        
      }
    }
  }

  initHoras() {
    for(let red of this.reds) {
      this.horasEstimadas += red.horasEstimadas;
      this.horasTrabajadas += red.horasTrabajadas;
    }
  }

  initEstadosReds() {
    for(let i in this.estados) {
      this.estadosReds = this.estadosReds.concat(0);
    }
    for(let red of this.reds) {
      let estadoRed = this.getEstadoRed(red);
      for(let i in this.estados) {
        if(estadoRed === this.estados[i]) {
          if(estadoRed === 'Terminado') {
            this.redsTerminados++;
          }
          this.estadosReds[i]++;
          break;
        }
      }
    }
    this.avance = Math.round(100*this.redsTerminados/this.reds.length);
  }

  initFasesReds(): void {
    for(let i in this.fases) {
      this.fasesReds = this.fasesReds.concat(0);
    }
    for(let red of this.reds) {
      for(let i in this.estados) {
        if(red.fase === this.fases[i]) {
          this.fasesReds[i]++;
          break;
        }
      }
    }
  }

  getDifMeses(fechaInicio: Date, fechaFin: Date) {
    return fechaFin.getMonth()-fechaInicio.getMonth()+12*(fechaFin.getFullYear()-fechaInicio.getFullYear());
  }

  getEstadoRed(red: Red) {
    let estadoActual = '';
    let fechaEstado;
    if(red.historialEstados && red.historialEstados.length !== 0) {
      estadoActual = red.historialEstados[0].nombreEstado;
      fechaEstado = new Date(red.historialEstados[0].fechaCambio);
    }
    for(let estado of red.historialEstados) {
      let nuevaFecha = new Date(estado.fechaCambio);
      if(nuevaFecha>fechaEstado) {
        estadoActual = estado.nombreEstado;
        fechaEstado = nuevaFecha;
      }
    }
    return estadoActual;
  }

}

export class Personas {
  personas: string[]
}
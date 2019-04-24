import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { CrearVersionModel, Version } from './version.model';
import { Recurso } from '../recurso/recurso.model';
import { HttpClient } from '@angular/common/http';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';
import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VersionService {
  API_URL = environment.apiUrl + 'reds/{id}/versiones/';
  API_URL_CREAR = environment.apiUrl + 'reds/{id}/crear/';
  ACCESS_TOKEN = 'FOsYIGqxyoAAAAAAAAAACo5sRYD5XCAOZy15c341h99QLcgRWBeiWQfRgnCOt0Gq';
  MARCAR_VERSION_URL = environment.apiUrl + 'versiones/{id}/marcar';

  private versiones: Array<Version> = [];

  constructor(private httpClient: HttpClient) { }

  // Metodo que invoca al servicio que obtiene las versiones del RED
  getVersiones(idRed: number): Promise<Version[]> {
    this.versiones = [];
    const apiUrlFinal = this.API_URL.replace('{id}', idRed.toString());
    return new Promise((resolve, reject) => {
      this.httpClient.get(apiUrlFinal).subscribe((data: any) => {
        data.context.forEach(dataItem => {
          const version = new Version();
          version.id = dataItem.id;
          version.numero = dataItem.numero;
          version.fechaCreacion = dataItem.fecha_creacion;
          version.creadoPor = dataItem.creado_por.usuario.username;
          version.esFinal = dataItem.es_final;
          version.imagen = dataItem.imagen;
          version.url = '';
          this.versiones.push(version);
        });
        // Ordena la lista de versiones por fecha de manera descendiente
        let versionesSorted: Array<Version>;
        versionesSorted = this.versiones.slice(0);
        versionesSorted.sort((leftSide, rightSide): number => {
          const leftSideDate = new Date(leftSide.fechaCreacion);
          const rightSideDate = new Date(rightSide.fechaCreacion);
          if (leftSideDate < rightSideDate) { return 1; }
          if (leftSideDate > rightSideDate) { return -1; }
          return 0;
        });
        resolve(versionesSorted);
      });
    });
  }

  getImagenVersion(ruta: string): Promise<any> {
    const dbx = new Dropbox({ accessToken: this.ACCESS_TOKEN, fetch });
    return dbx.filesGetTemporaryLink({path: ruta});
  }

  crearVersionRed(model: CrearVersionModel, idRed: number): Observable<any> {
    const apiUrlCrearFinal = this.API_URL_CREAR.replace('{id}', idRed.toString());
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'my-auth-token'
      })
    };
    return this.httpClient.post<CrearVersionModel>(apiUrlCrearFinal, model, httpOptions);
  }

  uploadFiles(idRed: number, consecutivo: number, files: Array<File>) {
    const dbx = new Dropbox({ accessToken: this.ACCESS_TOKEN });
    const pathToVersion = '/REDs/' + idRed + '/Versiones/' + consecutivo;

    // Sube los archivos
    for (const file of files) {
      let relativeName = (file as any).webkitRelativePath;
      relativeName = relativeName.substring(relativeName.indexOf('/') + 1);
      dbx.filesUpload({path: pathToVersion + '/' + relativeName, contents: file.slice()})
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.error('dropbox error', error);
        });
    }
  }

  markAsFinal(versionNumero: number): Observable<Version> {
    const apiUrlMarcar = this.MARCAR_VERSION_URL.replace('{id}', versionNumero.toString());
    return this.httpClient.post<Version>(apiUrlMarcar, '');
  }
}
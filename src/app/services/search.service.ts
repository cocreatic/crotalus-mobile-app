import { BoaResource } from './../models/boa-resource.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  // private apiUri: string;
  private apiRequestsCounter: number;
  // filters: any[];
  // catalogues: any[];

  // TODO: app settings to be modified through app's config
  apiUri = 'http://boa.nuestroscursos.net/api';
  filters = [
    { meta: 'metadata.technical.format', value: ['image', 'video'] }
  ];
  catalogues = [
    { name: 'Contenido de BambuCo', key: 'bbco' },
    { name: 'Repo de prueba', key: 'repositorio-de-pruebas' }
  ];
  options =  {
    resultsResponseSize: 5,
    minLetters: 3,
  };


  constructor(private http: HttpClient) {
  }

  search(value: string, firstCall: boolean): Observable<any[]> {
    if (firstCall) {
      this.apiRequestsCounter = 0;
    }
    const cataloguesToSearchIn = this.catalogues.map(catalog => catalog.key);
    const requestsArray = cataloguesToSearchIn.map(catalogueKey =>
      this.http.get(this.createCatalogRequestUrl(value, catalogueKey))
    );
    return forkJoin([...requestsArray]).pipe(
      tap(() => {
        this.apiRequestsCounter += 1;
      }),
      map((multipleReposResults: any[]) => {
        return multipleReposResults.map((singleRepoResults: BoaResource[]) => {
          return singleRepoResults.map((result: BoaResource) => {
            result.type = result.metadata.technical.format.split('/')[0];
            return result;
          });
        });
      }),
    );
  }


  createCatalogRequestUrl(value: string, catalogKey: string) {
    return `${this.apiUri}/c/${catalogKey}/resources.json?q=${value}&${this.generateRequestParams()}`;
  }

  generateRequestParams() {
    const responseSize = this.options.resultsResponseSize;
    const resultsOffset = responseSize * this.apiRequestsCounter;
    const searchParams = `(n)=${responseSize}&(s)=${resultsOffset}`;
    const filters = this.filters.map(filter => {
      return filter.value.reduce((prevValue, actualItem, index) => {
        return prevValue + (index !== 0 ? '&' : '') + `(meta)[${filter.meta}][${index}]=${actualItem}`;
      }, '');
    });
    return `${searchParams}&${filters.join('&')}`;
  }

  getResourceAbout(about: string) {
    return this.http.get(about);
  }
}

import { StorageKeys } from './../models/storageKeys.enum';
import { BoaResource, BoaRepository, BoaCatalog } from './../models/boa-resource.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { forkJoin, Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private apiRequestsCounter: number;
  public repositories: BoaRepository[];
  public reposConnectedNumber = new BehaviorSubject<number>(0);


  filters = [
    { meta: 'metadata.technical.format', value: ['image', 'video'] }
  ];

  options = {
    resultsResponseSize: 5,
    minLetters: 3,
  };


  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) {
    this.updateReposConnectedNumber();
  }

  updateReposConnectedNumber(): void {
    this.getConnectedRepositories().then(() => {
      const totalConnected = this.repositories !== null ? this.repositories.length : 0;
      this.reposConnectedNumber.next(totalConnected);
    });
  }

  async getConnectedRepositories(): Promise<void> {
    this.repositories = await this.storage.get(StorageKeys.connectedRepositories);
  }

  public isThereAnyRepositoryConnected(): boolean {
    return this.repositories && this.repositories.length > 0;
  }

  async search(value: string, firstCall: boolean): Promise<Observable<any[]>> {
    if (firstCall) {
      this.apiRequestsCounter = 0;
    }
    return this.createSearchRequest(value);
  }

  createSearchRequest(value: string): Observable<any[]> {
    const requestToPerform = this.repositories.map(
      (repository: BoaRepository) => {
        return this.http.get(this.createRepositoryRequestUrl(value, repository)).pipe(
          map((singleRepoResults: BoaResource[]) => {
            return singleRepoResults.map((result: BoaResource) => {
              result.type = result.metadata.technical.format.split('/')[0];
              result.repositoryName = repository.name;
              return result;
            });
          })
        );
      }
    );

    return forkJoin([...requestToPerform]).pipe(
      tap((results) => {
        this.apiRequestsCounter += 1;
      })
    );
  }

  createRepositoryRequestUrl(value: string, repository: BoaRepository) {
    const repoCatalogues = repository.catalogs.map((catalog: BoaCatalog) => catalog.key).join('|');
    return `${repository.api}/c/[${repoCatalogues}]/resources.json?q=${value}&${this.generateRequestParams()}`;
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
    return this.http.get<BoaResource>(about);
  }
}

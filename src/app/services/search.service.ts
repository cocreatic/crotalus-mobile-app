import { LICENSES } from './../models/licenses.const';
import { SearchTypes, DocumentFormats} from './../models/search-type.enum';
import { StorageKeys } from './../models/storageKeys.enum';
import { BoaResource, BoaRepository, BoaCatalog } from './../models/boa-resource.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { forkJoin, Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { License } from '../models/license.interface';
import { getResourceType } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private apiRequestsCounter: number;
  private typesToSearchQueryString: string;
  private licenses: License[];
  private includeLicenses: boolean;
  private licensesFilterParam: string;
  public repositories: BoaRepository[];
  public reposConnectedNumber$ = new BehaviorSubject<number>(0);
  public licenses$ = new BehaviorSubject<License[]>([]);

  options = {
    // resultsResponseSize: 20,
    resultsResponseSize: 10,
    minLetters: 3,
  };



  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) {
    this.updateReposConnectedNumber();
    this.licenses = LICENSES.map(license => ({
      ...license,
      active: true,
    }));
    this.includeLicenses = false;
    this.licenses$.next(this.licenses);
  }

  updateReposConnectedNumber(): void {
    this.getConnectedRepositories().then(() => {
      const totalConnected = this.repositories !== null ? this.repositories.length : 0;
      this.reposConnectedNumber$.next(totalConnected);
    });
  }

  async getConnectedRepositories(): Promise<void> {
    this.repositories = await this.storage.get(StorageKeys.connectedRepositories);
  }

  public isThereAnyRepositoryConnected(): boolean {
    return this.repositories && this.repositories.length > 0;
  }

  async search(value: string, firstCall: boolean, searchType: SearchTypes): Promise<Observable<any[]>> {
    if (firstCall) {
      this.apiRequestsCounter = 0;
    }

    this.setTypeFilterForSearch(searchType);

    return this.createSearchRequest(value);
  }

  createSearchRequest(value: string): Observable<any[]> {
    const requestToPerform = this.repositories.map(
      (repository: BoaRepository) => {
        return this.http.get(this.createRepositoryRequestUrl(value, repository)).pipe(
          map((singleRepoResults: BoaResource[]) => {
            return singleRepoResults.map((result: BoaResource) => {
              result.type = getResourceType(result);
              result.repositoryName = repository.name;
              return result;
            });
          }),
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
    return `${repository.api}c/[${repoCatalogues}]/resources.json?q=${value}&${this.generateRequestParams()}`;
  }

  generateRequestParams() {
    const responseSize = this.options.resultsResponseSize;
    const resultsOffset = responseSize * this.apiRequestsCounter;
    const searchParams = `(n)=${responseSize}&(s)=${resultsOffset}`;
    // so far the only filter used is type of resource to search, but license will be another one.
    const filters = this.typesToSearchQueryString;
    const generatedRequestParams = this.includeLicenses ?
      `${searchParams}${filters ? '&'+filters : ''}&${this.licensesFilterParam}` : `${searchParams}${filters ? '&'+filters : ''}`;
    return generatedRequestParams;
  }

  getResourceAbout(about: string) {
    return this.http.get<BoaResource>(about);
  }

  setLicensesFilterForSearch(): void {
    const arrayOfActiveSelectors = this.licenses.reduce((activeLicenses: string[], license: License) => {
      return license.active ? [...activeLicenses, license.stringFilter] : activeLicenses
    }, []);
    let value = arrayOfActiveSelectors.join('||');
    if (arrayOfActiveSelectors.length > 1) {
      value = `(${value})`;
    }
    this.licensesFilterParam = `(meta)[metadata.rights.copyright]=${value}`
  }



  setTypeFilterForSearch(searchType: SearchTypes) {
    const metadataType = 'metadata.technical.format';
    // let targetTypes: string[];
    // if (searchTypes === SearchTypes.all) {
    //   targetTypes = Object.values(SearchTypes);
    //   targetTypes.shift();
    // } else {
    //   targetTypes = [searchTypes];
    // }
    // this.typesToSearchQueryString = targetTypes.reduce((prevValue, actualItem, index) => {
    //     return prevValue + (index !== 0 ? '&' : '') + `(meta)[${metadataType}][${index}]=${actualItem}`;
    //   }, '');

    if (searchType === SearchTypes.all) {
      this.typesToSearchQueryString = '';
    } else if (searchType === SearchTypes.document) {
      this.typesToSearchQueryString = DocumentFormats.reduce((prevValue, actualItem, index) => {
        return prevValue + (index !== 0 ? '&' : '') + `(meta)[${metadataType}][${index}]=${actualItem}`;
      }, '');
    } else if (searchType === SearchTypes.didacticUnit) {
      this.typesToSearchQueryString = '(meta)[metadata.educational.learning_resource_type]="temathic unit"'
    } else {
      this.typesToSearchQueryString = `(meta)[${metadataType}]=${searchType}`;
    }

  }

  updateActiveLicenses(filterValue: string, active: boolean) {
    const targetIndex = this.licenses.findIndex(({ value }) => filterValue === value);
    this.licenses[targetIndex].active = active;
    this.includeLicenses = this.licenses.some(license => !license.active);
    if (this.includeLicenses) {
      this.setLicensesFilterForSearch();
    }
    this.licenses$.next(this.licenses);
  }

  getLicenses(): Observable<License[]> {
    return this.licenses$;
  }

}

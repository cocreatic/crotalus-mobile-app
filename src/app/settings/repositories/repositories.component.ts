import { SearchService } from './../../services/search.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { BoaRepository } from './../../models/boa-resource.interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageKeys } from '../../models/storageKeys.enum';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss'],
})
export class RepositoriesComponent implements OnInit, OnDestroy {

  availableRepositories: any;
  fetchingAvailableRepositories: boolean;
  connectedRepositories: BoaRepository[];
  nonConnectedRepositories: BoaRepository[];
  currentToast: null | HTMLIonToastElement = null;

  registeredRepositoriesUrl = 'http://b.boaproject.net/index.json';
  registeredRepositories: any;
  initializing = true;

  constructor(
    private storage: Storage,
    public toastController: ToastController,
    private http: HttpClient,
    private searchService: SearchService,
  ) { }

  ngOnInit() {
    this.basicInit();
  }

  async basicInit(): Promise<void> {
    this.initializing = true;
    await this.getAvailableReposotories();
    if (!this.fetchingAvailableRepositories) {
      this.loadRepositoriesData();
    }
  }

  async getAvailableReposotories(): Promise<void> {
    const value = await this.storage.get(StorageKeys.availableRepositories);
    if (value) {
      this.availableRepositories = value;
    } else {
      this.updateRegisteredRepositoriesList();
      console.log('Fetching available repos');
    }
  }

  async getConnectedRepositories(): Promise<void> {
    const value = await this.storage.get(StorageKeys.connectedRepositories);
    if (value) {
      this.connectedRepositories = value;
    } else {
      this.connectedRepositories = [];
    }
  }

  async loadRepositoriesData(): Promise<void> {
    await this.getConnectedRepositories();
    this.updateRepositoriesToShow();
  }

  updateRepositoriesToShow(): void {
    if (this.connectedRepositories.length) {
      this.nonConnectedRepositories = this.availableRepositories.filter(
        (repository: BoaRepository) => !this.connectedRepositories.some((item: BoaRepository) => item.api === repository.api)
      );
    } else {
      setTimeout(() => {
        this.presentToast('No hay repositorios conectados para la búsqueda', 3000);
      }, 500);
      this.nonConnectedRepositories = [...this.availableRepositories];
    }
    if (this.initializing) {
      this.initializing = false;
    }
  }

  updateRegisteredRepositoriesList(): void {
    this.fetchingAvailableRepositories = true;
    this.http.get(this.registeredRepositoriesUrl).subscribe(async response => {
      const repositoriesFromResponse: any[] = response['sources'].filter(source => source.version >= 1.1);
      if (repositoriesFromResponse.length) {
        this.availableRepositories = this.sortReposByNameAscending(repositoriesFromResponse);
        await this.storage.set(StorageKeys.availableRepositories, this.availableRepositories);
        this.fetchingAvailableRepositories = false;
        this.loadRepositoriesData();
      } else {
        console.error('No respositories availabe from response');
      }
    });
  }


  getCataloguesList(repository: BoaRepository): string {
    return repository.catalogs.map(catalog => catalog.title).join(', ');
  }

  async toggleRepository(repository: BoaRepository, index?: number): Promise<void> {
    if (index !== undefined) {
      this.connectedRepositories.splice(index, 1);
    } else {
      this.connectedRepositories = this.sortReposByNameAscending([...this.connectedRepositories, repository]);
    }
    await this.storage.set(StorageKeys.connectedRepositories, this.connectedRepositories);
    this.searchService.updateReposConnectedNumber();
    this.updateRepositoriesToShow();
  }

  async presentToast(message: string, duration: number) {
    await this.dismissCurrentToast();
    this.currentToast = await this.toastController.create({
      message,
      duration
    });
    this.currentToast.present();
    this.currentToast.onDidDismiss().then(() => { this.currentToast = null; });
  }

  async dismissCurrentToast(): Promise<void> {
    if (this.currentToast) {
      await this.currentToast.dismiss();
    }
  }

  async resetCustomConfigs(): Promise<void> {
    await this.storage.remove(StorageKeys.connectedRepositories);
    await this.storage.remove(StorageKeys.availableRepositories);
    this.searchService.updateReposConnectedNumber();
    this.basicInit();
  }

  ionViewWillLeave(): void {
    this.dismissCurrentToast();
  }

  ngOnDestroy(): void {
    this.dismissCurrentToast();
  }


  /** Helpers */

  sortReposByNameAscending(repositoriesToSort: BoaRepository[]): BoaRepository[] {
    return repositoriesToSort.sort((a: BoaRepository, b: BoaRepository) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
  }

}

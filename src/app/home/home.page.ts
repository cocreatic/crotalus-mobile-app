import { Observable } from 'rxjs';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { BoaResource } from './../models/boa-resource.interface';
import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';
import { IonInfiniteScroll, ToastController, ModalController } from '@ionic/angular';
import { Plugins, PluginListenerHandle } from '@capacitor/core';

const { Keyboard, App } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewChecked {

  valueToSearch: string;
  lastValueSearched: string;
  results: any[];
  resultsSize: number;
  minLetters: number;
  searchDone = false;
  isSearching = false;
  noMoreResults = false;
  searchAvailableFilters: string[];
  pristine = true;
  addSearchToHeader = false;
  searchBoxBottomPosition: number;
  headerHeight: number;
  paramsFromViewReady = false;
  currentToast: null | HTMLIonToastElement = null;
  showSpinner = true;
  showSearch: boolean;
  showNoRepos: boolean;

  backButtonCounter = 0;
  backButtonEventlistener: PluginListenerHandle;

  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;
  @ViewChild('searchBarWrapper', { static: false }) searchBox: ElementRef<HTMLElement>;
  @ViewChild('content', { static: false }) content: any;
  @ViewChild('header', { static: false }) headerBox: any;

  constructor(
    private searchService: SearchService,
    private changeDetector: ChangeDetectorRef,
    public toastController: ToastController,
    public modalController: ModalController
  ) {
    this.resultsSize = this.searchService.options.resultsResponseSize;
    this.minLetters = this.searchService.options.minLetters;
    this.searchAvailableFilters = this.searchService.filters.filter(
      filterObject => filterObject.meta === 'metadata.technical.format'
    )[0].value;
  }

  ngOnInit(): void {
    this.searchService.reposConnectedNumber.subscribe((val) => {
      this.showSpinner = false;
      if (val) {
        this.initSearch();
        this.pristine = true;
        this.showNoRepos = false;
        this.showSearch = true;
        this.changeDetector.detectChanges();
        setTimeout(() => {
          this.getViewManipulationParams();
        }, 100);
      } else {
        this.initSearch();
        this.showSearch = false;
        this.showNoRepos = true;
      }
    });
  }


  ngAfterViewChecked(): void {
    if (!this.headerHeight) {
      this.headerHeight = this.headerBox.el.offsetHeight;
      this.content.el.style.setProperty('--padding-top', `${this.headerHeight}px`);
    }
  }


  getViewManipulationParams(): void {
    if (this.showSearch) {
      this.searchBoxBottomPosition = this.searchBox.nativeElement.offsetTop + this.searchBox.nativeElement.offsetHeight;
    }
  }

  initSearch(): void {
    this.results = [];
    this.noMoreResults = false;
  }

  search(firstCall: boolean): void {

    if (!this.valueToSearch || this.valueToSearch.length < this.minLetters) {
      this.showMinimumLettersRequired();
      return;
    }

    if (this.lastValueSearched !== this.valueToSearch) {
      this.lastValueSearched = this.valueToSearch;
    }

    if (firstCall) {
      this.initSearch();
      this.pristine = false;
      Keyboard.hide();
    }
    this.isSearching = true;
    this.searchService.search(this.valueToSearch, firstCall).then((searchRequest: Observable<any>) => {
      searchRequest.subscribe((results: BoaResource[]) => {
        this.searchDone = true;
        this.isSearching = false;
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
        const lastResults = results.flat();
        if (lastResults.length > 0 && lastResults.length < this.resultsSize) {
          this.results.push(...lastResults);
          this.showNoMoreResults();
        } else if (lastResults.length === 0) {
          this.showNoMoreResults();
        } else {
          this.results.push(...lastResults);
        }
      });
    });
  }

  showNoMoreResults(): void {
    this.noMoreResults = true;
    this.infiniteScroll.disabled = true;
    this.presentToast(`Ooops!! No encontramos${this.results.length ? ' más' : ''} resultados`, 3000);
  }

  showMinimumLettersRequired(): void {
    this.presentToast(`Debes ingresar mínimo ${this.minLetters} letras para realizar una búsqueda`, 3000);
  }

  bottomReached(): void {
    if (this.valueToSearch !== this.lastValueSearched) {
      this.valueToSearch = this.lastValueSearched;
    }
    this.search(false);
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

  getItemTypeIcon(itemType): string {
    switch (itemType) {
      case 'image':
        return 'image';

      case 'video':
        return 'videocam';

      default:
        return 'cube';
    }
  }

  getItemTypeLabel(itemType): string {
    switch (itemType) {
      case 'image':
        return 'Imagen';

      case 'video':
        return 'Video';

      default:
        return 'OVA';
    }
  }

  shouldAddSearchToHeader(event) {
    if (
      !this.addSearchToHeader &&
      event.detail.scrollTop > (this.searchBoxBottomPosition + this.headerHeight + 20) &&
      this.headerBox.el.classList.contains('already-hidden')
    ) {
      this.addSearchToHeader = true;
    } else if (this.addSearchToHeader && event.detail.scrollTop < 20) {
      this.addSearchToHeader = false;
    }
  }

  async openDetails(item: BoaResource): Promise<void> {
    const modal = await this.modalController.create({
      component: DetailsModalComponent,
      componentProps: {
        itemAboutString: item.about,
      }
    });
    this.dismissCurrentToast();
    modal.present();
    this.backButtonEventlistener.remove();
    modal.onDidDismiss().then(() => {
      this.setBackButtonListener();
    });
  }


  setBackButtonListener(): void {
    this.backButtonCounter = 0;
    this.backButtonEventlistener = App.addListener('backButton', (data: any) => {
      this.backButtonCounter++;
      if (this.backButtonCounter >= 2) {
        App.exitApp();
      }
      const message = 'Presiona el botón atrás de nuevo para salir de la aplicación.';
      this.presentToast(message, 3000);
      setTimeout(() => {
        this.backButtonCounter = 0;
      }, 3000);
    });
  }

  ionViewWillLeave(): void {
    this.dismissCurrentToast();
  }

  ionViewDidEnter(): void {
    this.setBackButtonListener();
  }

  ionViewDidLeave(): void {
    this.backButtonEventlistener.remove();
  }

}

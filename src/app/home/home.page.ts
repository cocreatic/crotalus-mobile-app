import { switchMap } from 'rxjs/operators';
import { License } from './../models/license.interface';
import { SearchTypes } from './../models/search-type.enum';
import { Observable, Subject } from 'rxjs';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { BoaResource } from './../models/boa-resource.interface';
import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';
import { IonInfiniteScroll, ToastController, ModalController } from '@ionic/angular';
import { Plugins, PluginListenerHandle } from '@capacitor/core';
import { Storage } from '@ionic/storage';
import { StorageKeys } from '../models/storageKeys.enum';
import { MenuController } from '@ionic/angular';

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
  pristine = true;
  addSearchToHeader = false;
  searchBoxBottomPosition: number;
  headerHeight: number;
  paramsFromViewReady = false;
  currentToast: null | HTMLIonToastElement = null;
  showSpinner = true;
  showSearch: boolean;
  showNoRepos: boolean;
  searchType: SearchTypes;
  searchTypes = SearchTypes;
  componentInitializing = true;
  audioCurrentlyPlaying: HTMLAudioElement | null = null;
  menuIsOpened: boolean;
  licenses: License[];
  activeLicensesCount: number;
  disableLastActiveLicense: boolean;
  searchRequest$ = new Subject<boolean>();
  detailsPageActive = false;
  searchResponse$: Observable<BoaResource[][]>;
  // searchResponse$: any;
    
  showNoResultsMessage = false;
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
    private menuController: MenuController,
    public modalController: ModalController,
    private storage: Storage,
  ) {
    this.resultsSize = this.searchService.options.resultsResponseSize;
    this.minLetters = this.searchService.options.minLetters;
  }

  async ngOnInit(): Promise<void> {
    this.searchService.reposConnectedNumber$.subscribe((val) => {
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

    this.searchService.getLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
      this.activeLicensesCount = this.licenses.filter(license => license.active).length;
      this.disableLastActiveLicense = this.activeLicensesCount === 1;
    })

    this.searchType = await this.getDefaultSearchType();
    this.setupSearchStream();
  }


  async getDefaultSearchType(): Promise<SearchTypes> {
    const val = await this.storage.get(StorageKeys.defaultSearchType);
    return val ? val : SearchTypes.all;
  }


  ngAfterViewChecked(): void {
    if (!this.headerHeight) {
      this.headerHeight = this.headerBox.el.offsetHeight;
      this.content.el.style.setProperty('--padding-top', `${this.headerHeight}px`);
      this.content.el.style.setProperty('--licenses-menu-margin-top', `${this.headerHeight}px`);
    }
  }

  async toggleLicensesMenu(): Promise<void> {
    if (this.menuIsOpened) {
      this.menuController.close('licencesMenu');
    } else {
      this.menuController.open('licencesMenu');
    }
  }

  setMenuState(open: boolean): void {
    this.menuIsOpened = open;
  }

  setMenuMarginTop(): void {
    const headerHeight = this.headerBox.el.offsetHeight;
    this.content.el.style.setProperty('--licenses-menu-margin-top', `${headerHeight}px`);
  }


  getViewManipulationParams(): void {
    if (this.showSearch) {
      this.searchBoxBottomPosition = this.searchBox.nativeElement.offsetTop + this.searchBox.nativeElement.offsetHeight;
    }
  }

  initSearch(): void {
    this.results = [];
    this.showNoResultsMessage = false;
    this.noMoreResults = false;
  }

  setupSearchStream(): void {
    this.searchResponse$ = this.searchRequest$.pipe(
      switchMap((firstCall: boolean) => this.searchService.search(this.valueToSearch, firstCall, this.searchType))
    );

    this.searchResponse$.subscribe((results: BoaResource[][]) => {
      this.searchDone = true;
      this.isSearching = false;
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      // debugger;
      const lastResults = results.flat().filter((resource: BoaResource) => resource.type);
      if (lastResults.length > 0 && results.flat().length < this.resultsSize) {
        this.results.push(...lastResults);
        this.showNoMoreResults();
      } else if (lastResults.length === 0) {
        this.showNoMoreResults();
      } else {
        this.results = [...this.results, ...lastResults];
        // if (this.searchType === SearchTypes.image) {
        // } else {
        //   this.results.push(...lastResults);
        // }
      }
    });
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
    this.searchRequest$.next(firstCall);
  }

  showNoMoreResults(): void {
    if (this.noMoreResults) {
      return;
    }
    this.showNoResultsMessage = !this.results.length;
    this.noMoreResults = true;

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
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
    if (this.detailsPageActive) {
      return;
    }
    this.detailsPageActive = true;
    this.shouldClearAudioPlaying();
    const modal = await this.modalController.create({
      cssClass: 'details-modal',
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
      this.detailsPageActive = false;
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

  playEvent(event: HTMLAudioElement): void {
    const audioPlayer = event;
    if (this.audioCurrentlyPlaying && !audioPlayer.paused) {
      this.audioCurrentlyPlaying.pause();
      this.audioCurrentlyPlaying.currentTime = 0;
      this.audioCurrentlyPlaying = audioPlayer;
    } else if (!this.audioCurrentlyPlaying && !audioPlayer.paused) {
      this.audioCurrentlyPlaying = audioPlayer;
    }
  }

  shouldClearAudioPlaying(): void {
    if (this.audioCurrentlyPlaying) {
      this.clearAudioCurrentlyPlaying();
    }
  }

  clearAudioCurrentlyPlaying(): void {
    this.audioCurrentlyPlaying.pause();
    this.audioCurrentlyPlaying.currentTime = 0;
    this.audioCurrentlyPlaying = null;
  }

  setSearchType(type: SearchTypes): void {
    this.searchType = type;
    if (!this.pristine) {
      if (!this.valueToSearch || this.valueToSearch.length < this.minLetters) {
        this.valueToSearch = this.lastValueSearched;
      }
      this.search(true);
    }
  }

  updateActiveLicenses(active: boolean, license: any) {
    this.searchService.updateActiveLicenses(license, active)
  }

  get showActiveLicensesCount(): boolean {
    return this.activeLicensesCount && this.activeLicensesCount < this.licenses.length;
  }

  async ionViewWillEnter() {
    if (this.componentInitializing) {
      this.componentInitializing = false;
      return;
    }

    if (this.searchService.getDefaultSearchChangedInSettings()) {
      const defaultSearchType = await this.getDefaultSearchType();
      if (this.searchType && this.searchType !== defaultSearchType) {
        this.initSearch();
        this.pristine = true;
        this.searchType = defaultSearchType;
      }
      this.searchService.setDefaultSearchChangedInSettings(false);
    }
  }

  ionViewWillLeave(): void {
    this.dismissCurrentToast();
  }
  
  ionViewDidEnter(): void {
    this.setBackButtonListener();
  }
  
  ionViewDidLeave(): void {
    if (this.menuIsOpened) {
      this.toggleLicensesMenu();
    }
    this.backButtonEventlistener.remove();
  }
}

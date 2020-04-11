import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SearchService } from '../services/search.service';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  valueToSearch: string;
  results: any[];
  // snackBarRef: MatSnackBarRef<SimpleSnackBar>;
  resultsSize: number;
  minLetters: number;
  searchDone = false;
  isSearching = false;
  noMoreResults = false;
  searchAvailableFilters: string[];
  pristine = true;

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  constructor(
    private searchService: SearchService,
    private changeDetector: ChangeDetectorRef,
    public toastController: ToastController,
  ) {
    this.resultsSize = this.searchService.options.resultsResponseSize;
    this.minLetters = this.searchService.options.minLetters;
    this.searchAvailableFilters = this.searchService.filters.filter(
      filterObject => filterObject.meta === 'metadata.technical.format'
    )[0].value;

  }

  search(firstCall: boolean): void {
    // if (this.snackBarRef) {
    //   this.snackBarRef.dismiss();
    // }

    // if (this.valueToSearch.length < this.minLetters) {
    //   const message = `Texto de búsqueda mínimo de ${this.minLetters} letras`;
    //   this.showSnackBar(message, 'Cerrar');
    //   return;
    // }

    if (firstCall) {
      this.pristine = false;
      this.results = [];
      this.noMoreResults = false;
      Keyboard.hide();
    }
    this.isSearching = true;
    this.searchService.search(this.valueToSearch, firstCall).subscribe((results: any[]) => {
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
        // this.scrollToBottom();
      } else {
        this.results.push(...lastResults);
      }
    });
  }

  showNoMoreResults(): void {
    this.noMoreResults = true;
    this.infiniteScroll.disabled = true;
    this.presentToast(`Ooops!! No encontramos${this.results.length ? ' más' : ''} resultados`);
  }

  bottomReached(): void {
    this.search(false);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
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
}

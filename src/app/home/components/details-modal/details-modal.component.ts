import { DownloadService } from './../../../services/download.service';
import { SearchService } from './../../../services/search.service';
import { BoaResource, BoaResourceManifest, Contribution, BoaResourceSocial } from './../../../models/boa-resource.interface';
import { Component, OnInit, Input, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import * as Helpers from "../../../helpers";
import { SearchTypes } from 'src/app/models/search-type.enum';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ActionSheetController } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { getResourceType } from '../../../helpers';
import { FileEntry } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent implements OnInit, AfterViewChecked {

  @Input() itemAboutString: string;

  @ViewChild('detailsHeader', { static: false }) headerElm: any;

  searchTypes = SearchTypes;
  itemData: BoaResource;
  manifest: BoaResourceManifest;
  title: string;
  description: string;
  alternateBaseRef: string;
  format: string;
  imageSrc: string;
  keywords: string[];
  publishDate: string;
  rights: any;
  contributions: Contribution[];
  social: BoaResourceSocial;
  currentDomain: string;
  resourceDomain: string;
  entrypointName: string;
  alternates = ['original'];
  itemType: string;
  showTopInfo = false;
  showVideoError = false;
  titleIcon: string;
  audioSrc: string;
  downloadItems: any[];
  readonly MAX_COMPANY_LABEL_LENGTH = 30;
  currentToast: null | HTMLIonToastElement = null;
  headerHeight: number;
  


  constructor(
    private searchService: SearchService,
    private modalController: ModalController,
    private socialSharing: SocialSharing,
    private actionSheetController: ActionSheetController,
    private downloadService: DownloadService,
    private fileOpener: FileOpener,
    public toastController: ToastController,
    private hostElement: ElementRef,
  ) {

  }

  ngOnInit() {
    this.searchService.getResourceAbout(this.itemAboutString).subscribe((response: BoaResource) => {
      this.itemData = response;
      this.assignLocalVariables();
    });
  }

  ngAfterViewChecked(): void {
    if (!this.headerHeight) {
      this.headerHeight = this.headerElm.el.offsetHeight;
      if (this.headerHeight && this.headerHeight !== 56) {
        this.hostElement.nativeElement.style.setProperty('--top-content-offset', `${this.headerHeight}px`);
      }
    }
  }

  assignLocalVariables() {
    const metadata = this.itemData.metadata;
    this.alternateBaseRef = this.itemData.id.split('/content/')[1];
    this.manifest = this.itemData.manifest;
    this.format = metadata.technical.format;
    this.itemType = getResourceType(this.itemData);
    this.title = metadata.general.title.none;
    this.titleIcon = Helpers.getItemTypeIcon(this.itemType);
    this.description = metadata.general.description.none;
    this.imageSrc = `${this.itemAboutString}/!/.alternate/${this.alternateBaseRef}/${this.manifest.alternate[1]}`;
    this.keywords = metadata.general.keywords.none;
    this.contributions = metadata.lifecycle && metadata.lifecycle.contribution;
    this.publishDate = this.manifest.lastpublished.split('T')[0];
    this.rights = metadata.rights;
    this.social = this.itemData.social;
    this.entrypointName = this.manifest.hasOwnProperty('entrypoint') ? this.manifest.entrypoint.split('.')[0] : '';
    this.alternates = [...this.alternates, ...this.manifest.alternate];
    if (this.itemType === this.searchTypes.audio) {
      this.audioSrc = this.originalFileUrl;
    }
  }

  cropContributionCompanyLabel(company: string): any {
    return company.length > this.MAX_COMPANY_LABEL_LENGTH;
  }

  closeModal(): void {
    this.dismissCurrentToast();
    this.modalController.dismiss();
  }

  getResourceDownloadUrl(size: string): string {
    if (size === 'original') {
      return this.originalFileUrl;
    } else {
      return `${this.itemAboutString}/!/.alternate/${this.alternateBaseRef}/${size}`;
    }
  }

  getSizeLabel(size: string) {
    return Helpers.getSizeLabel(size);
  }

  share(): void {
    const options = {
      message: 'Hola!!, mira este recurso:', // not supported on some apps (Facebook, Instagram)
      url: this.itemAboutString,
    };
    this.socialSharing.shareWithOptions(options)
      // .then(result => { this.onShareSuccess(result) })
      .catch(error => { this.onShareError(error); });
  }

  onShareError = (msg) => {
    console.log('Sharing failed with message: ' + msg);
  }

  async download(resource: any): Promise<FileEntry | string> {
    const fileNameInUrl: string = resource.url.slice(resource.url.lastIndexOf('/') + 1);
    const fileName = this.manifest.title ? this.manifest.title.slice(0, this.manifest.title.lastIndexOf('.')) : this.title;
    let fileNameExt: string;
    if (fileNameInUrl) {
      fileNameExt = fileNameInUrl.split('.').pop();
    } else {
      fileNameExt = this.format.split('/')[1];
    }
    return this.downloadService.download(resource, fileName, fileNameExt, this.itemType);
  }

  async openPdf(): Promise<void> {
    const resource = {
      name: '',
      url: this.getResourceDownloadUrl('original'),
    };
    const downloadedFile = await this.download(resource);
    if (downloadedFile === 'error') {
      this.presentToast('Error en la descarga. Inténtalo de nuevo', 2000);
      return;
    }
    this.fileOpener.open((downloadedFile as FileEntry).toURL(), 'application/pdf')
      .then(result => { console.log(' file opened OK') })
      .catch(error => { console.error(error) });
  }

  async presentActionSheet() {
    if (this.format === 'text/html') {
      this.presentToast('Este tipo de recurso no está disponible para descarga', 2000);
      return;
    }

    if (!this.downloadItems) {
      this.downloadItems = this.alternates.map(alternate => ({
        text: this.getSizeLabel(alternate),
        url: this.getResourceDownloadUrl(alternate),
        icon: 'chevron-forward',
        handler: async() => {
          const downloadResult = await this.download({ alternateName: this.getSizeLabel(alternate), url: this.getResourceDownloadUrl(alternate) });
          if (downloadResult === 'error') {
            this.presentToast('Error en la descarga. Inténtalo de nuevo', 2000);
          }
        }
      }));
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Descargas por tamaño',
      cssClass: 'download-action-sheet',
      buttons: [{
        text: 'Cancelar',
        role: 'cancel',
        icon: 'close',
        handler: () => {
          console.warn('Download cancelled');
        }
      }, ...this.downloadItems]
    });
    await actionSheet.present();
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

  get copyrightImageUrl(): string {
    if (this.rights.copyright === 'cc0') {
      return 'https://licensebuttons.net/l/zero/1.0/88x31.png';
    } else {
      const [license, version] = this.rights.copyright.split('cc ')[1].split(' ');
      return `https://licensebuttons.net/l/${license}/${version}/88x31.png`;
    }
  }

  get copyrightVersion(): any {
    if (this.rights.copyright === 'cc0') {
      return false;
    } else {
      return this.rights.copyright.split(' ').pop();
    }
  }

  // TODO: Unify all getOriginalFile used within multiple components.
  get originalFileUrl(): string {
    if (this.manifest.hasOwnProperty('entrypoint')) {
      return `${this.itemAboutString}/!/${this.manifest.entrypoint}`;
    }

    if (this.manifest.hasOwnProperty('url') && this.manifest.url) {
      return this.manifest.url;
    }

    return `${this.itemAboutString}/!/`;
  }

  get showDocumentPlayer(): boolean {
    return (this.format === 'text/html' || this.format === 'application/pdf')
  }
}

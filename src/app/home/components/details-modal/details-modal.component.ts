import { SearchService } from './../../../services/search.service';
import { BoaResource, BoaResourceManifest, Contribution, BoaResourceSocial } from './../../../models/boa-resource.interface';
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent implements OnInit {

  @Input() itemAboutString: string;

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
  readonly MAX_COMPANY_LABEL_LENGTH = 30;

  constructor(
    private searchService: SearchService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.searchService.getResourceAbout(this.itemAboutString).subscribe((response: BoaResource) => {
      this.itemData = response;
      this.assignLocalVariables();
    });
  }

  assignLocalVariables() {
    const metadata = this.itemData.metadata;
    this.alternateBaseRef = this.itemData.id.split('/content/')[1];
    this.manifest = this.itemData.manifest;
    this.format = metadata.technical.format;
    this.itemType = this.format.split('/')[0];
    this.title = metadata.general.title.none;
    this.titleIcon = this.getIconType();
    this.description = metadata.general.description.none;
    this.imageSrc = `${this.itemAboutString }/!/.alternate/${this.alternateBaseRef}/${this.manifest.alternate[1]}`;
    this.keywords = metadata.general.keywords.none;
    this.contributions = metadata.lifecycle.contribution;
    this.publishDate = this.manifest.lastpublished.split('T')[0];
    this.rights = metadata.rights;
    this.social = this.itemData.social;
    this.entrypointName = this.manifest.hasOwnProperty('entrypoint') ? this.manifest.entrypoint.split('.')[0] : '';
    this.alternates = [...this.alternates, ...this.manifest.alternate];
  }

  cropContributionCompanyLabel(company: string): any {
    return company.length > this.MAX_COMPANY_LABEL_LENGTH;
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  getIconType(): string {
    switch (this.itemType) {
      case 'image':
        return 'image';

      case 'video':
        return 'videocam';

      default:
        break;
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
}

import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { BoaResourceManifest, BoaResourceMetadata, BoaResource } from 'src/app/models/boa-resource.interface';

@Component({
  selector: 'app-image-player',
  templateUrl: './image-player.component.html',
  styleUrls: ['./image-player.component.scss'],
})
export class ImagePlayerComponent implements OnChanges {

  @Input() imageItem: BoaResource;

  resourceAboutUrl: string;
  alternateBaseRef: string;
  imageSrc: string;
  altText: string;
  manifest: BoaResourceManifest;
  originalFileRequested: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('imageItem') && changes.imageItem.currentValue) {
      this.setImageItemProperties();
    }
  }

  setImageItemProperties(): void {
    this.resourceAboutUrl = this.imageItem.about;
    this.manifest = this.imageItem.manifest;
    this.altText = this.imageItem.metadata.general.title.none;
    this.alternateBaseRef = this.imageItem.id.split('/content/')[1];
    const smallAlternateName = this.getSmallAlternateFileName();

    this.imageSrc = smallAlternateName ?
      `${this.resourceAboutUrl}/!/.alternate/${this.alternateBaseRef}/${smallAlternateName}` : this.originalFileUrl;
    this.originalFileRequested = !smallAlternateName;
  }

  imageLoadError(): void {
    if (!this.originalFileRequested) {
      this.imageSrc = this.originalFileUrl;
      this.originalFileRequested = true;
    } else {
      // TODO: show image load error
      console.warn('There was an error loading the image');
    }
  }

  getSmallAlternateFileName(): string {
    const smallAlternate = this.manifest.alternate.filter(alternate => alternate.includes('small'))[0];
    return smallAlternate ? smallAlternate : '';
  }

  get originalFileUrl(): string {
    if (this.manifest.hasOwnProperty('entrypoint')) {
      return `${this.resourceAboutUrl}/!/${this.manifest.entrypoint}`;
    }

    if (this.manifest.hasOwnProperty('url') && this.manifest.url) {
      return this.manifest.url;
    }

    return `${this.resourceAboutUrl}/!/`;
  }

}

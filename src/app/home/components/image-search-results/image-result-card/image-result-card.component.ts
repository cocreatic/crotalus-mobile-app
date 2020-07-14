import { BoaResource, BoaResourceMetadata } from './../../../../models/boa-resource.interface';
import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { BoaResourceManifest } from 'src/app/models/boa-resource.interface';

@Component({
  selector: 'app-image-result-card',
  templateUrl: './image-result-card.component.html',
  styleUrls: ['./image-result-card.component.scss'],
})
export class ImageResultCardComponent implements OnInit, OnChanges {

  @Input() imageItem: BoaResource;

  imageVisible = false;
  imageSrc: string;
  resourceAboutUrl: string;
  alternateBaseRef: string;
  manifest: BoaResourceManifest;
  metadata: BoaResourceMetadata;

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('imageItem') && changes.imageItem.currentValue) {
      this.setImageItemProperties();
    }
  }

  setImageItemProperties(): void {
    this.resourceAboutUrl = this.imageItem.about;
    this.manifest = this.imageItem.manifest;
    this.metadata = this.imageItem.metadata;
    this.alternateBaseRef = this.imageItem.id.split('/content/')[1];
    const smallAlternateName = this.getSmallAlternateFileName();
    this.imageSrc = smallAlternateName ?
      `${this.resourceAboutUrl}/!/.alternate/${this.alternateBaseRef}/${smallAlternateName}` : this.originalFileUrl;
  }

  imageLoadError(): void {
    this.imageSrc = this.originalFileUrl;
  }

  showImage(): void {
    this.imageVisible = true;
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

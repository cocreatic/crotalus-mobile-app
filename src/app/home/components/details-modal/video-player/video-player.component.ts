import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { BoaResource, BoaResourceManifest } from 'src/app/models/boa-resource.interface';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnChanges {

  @Input() videoItem: BoaResource;

  resourceAboutUrl: string;
  alternateBaseRef: string;
  videoSrc: string;
  format: string;
  manifest: BoaResourceManifest;
  originalFileRequested: boolean;
  showVideoError = false;
  videoLoaded = false;

  constructor() { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('videoItem') && changes.videoItem.currentValue) {
      this.setVideoProperties();
    }
  }

  setVideoProperties(): void {
    this.resourceAboutUrl = this.videoItem.about;
    this.manifest = this.videoItem.manifest;
    this.alternateBaseRef = this.videoItem.id.split('/content/')[1];
    this.format = this.videoItem.metadata.technical.format;
    const alternateAvailable = this.getVideoAlternate();
    this.videoSrc = alternateAvailable ?
      `${this.resourceAboutUrl}/!/.alternate/${this.alternateBaseRef}/${alternateAvailable}#t=0.1` : `${this.originalFileUrl}#t=0.1`;
  }

  getVideoAlternate(): string {
    let alternateAvailable = this.manifest.alternate.filter(alternate => alternate.includes('small'))[0];
    if (!alternateAvailable) {
      alternateAvailable = this.manifest.alternate.filter(alternate => alternate.includes('medium'))[0];
    }
    return alternateAvailable ? alternateAvailable : '';
  }

  videoDataReady(): void {
    this.videoLoaded = true;
  }

  handleVideoError(): void {
    this.videoLoaded = true;
    setTimeout(() => {
      this.showVideoError = true;
    }, 800);
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

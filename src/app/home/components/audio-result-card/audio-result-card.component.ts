import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { BoaResource, BoaResourceManifest, BoaResourceMetadata } from 'src/app/models/boa-resource.interface';

@Component({
  selector: 'app-audio-result-card',
  templateUrl: './audio-result-card.component.html',
  styleUrls: ['./audio-result-card.component.scss'],
})
export class AudioResultCardComponent implements OnChanges {

  @Input() audioItem: BoaResource;
  @Output() openDetails = new EventEmitter();
  @Output() playEvent = new EventEmitter<HTMLAudioElement>();
  // @ViewChild('previewBox', {static: false}) previewBox: ElementRef;

  // imageVisible = false;
  audioSource: string;
  resourceAboutUrl: string;
  manifest: BoaResourceManifest;
  metadata: BoaResourceMetadata;
  showPLayer = false;

  constructor() { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('audioItem') && changes.audioItem.currentValue) {
      this.setaudioItemProperties();
    }
  }

  setaudioItemProperties() {
    this.resourceAboutUrl = this.audioItem.about;
    this.manifest = this.audioItem.manifest;
    this.metadata = this.audioItem.metadata;
    // this.alternateBaseRef = this.audioItem.id.split('/content/')[1];
    this.audioSource = this.originalFileUrl;
    // this.previewUrl = this.getVideoPreviewUrl();
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

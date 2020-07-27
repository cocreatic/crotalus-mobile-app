import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef, AfterContentInit, AfterViewInit } from '@angular/core';
import { BoaResource, BoaResourceManifest, BoaResourceMetadata } from 'src/app/models/boa-resource.interface';

@Component({
  selector: 'app-video-result-card',
  templateUrl: './video-result-card.component.html',
  styleUrls: ['./video-result-card.component.scss'],
})
export class VideoResultCardComponent implements OnChanges, AfterViewInit {

  @Input() videoItem: BoaResource;
  @Output() openDetails = new EventEmitter();
  @ViewChild('previewBox', {static: false}) previewBox: ElementRef;

  imageVisible = false;
  thumbnailSrc: string;
  resourceAboutUrl: string;
  alternateBaseRef: string;
  manifest: BoaResourceManifest;
  metadata: BoaResourceMetadata;
  thumbnailAltText: string;
  previewUrl: string;
  showPreview = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('videoItem') && changes.videoItem.currentValue) {
      this.setVideoItemProperties();
    }
  }

  ngAfterViewInit(): void {
    if (this.previewUrl) {
      this.setBackgroundImg();
    }
  }

  setVideoItemProperties(): void {
    this.resourceAboutUrl = this.videoItem.about;
    this.manifest = this.videoItem.manifest;
    this.metadata = this.videoItem.metadata;
    this.thumbnailAltText = `${this.videoItem.metadata.general.title.none} video thumbnail`;
    this.alternateBaseRef = this.videoItem.id.split('/content/')[1];
    this.thumbnailSrc = this.getThumbnailUrl();
    this.previewUrl = this.getVideoPreviewUrl();
  }

  imageLoadError(): void {
    // TODO: show message when thumbnail no loaded
    console.warn('thumnail couldn\'t be loaded');
  }

  getThumbnailUrl(): string {
    return this.videoItem.manifest.customicon;
  }

  getVideoPreviewUrl(): string {
    return this.manifest.alternate.includes('preview.gif') ? this.getAlternateUrl('preview.gif') : '';
  }

  getAlternateUrl(alternate: string): string {
    return `${this.resourceAboutUrl}/!/.alternate/${this.alternateBaseRef}/${alternate}`;
  }

  setBackgroundImg(): void {
    this.previewBox.nativeElement.style.backgroundImage = `url('')`;
    this.previewBox.nativeElement.style.backgroundImage = `url('${this.previewUrl}')`;
  }

  togglePreview(show: boolean): void {
    if (show) {
      // next line resets animated gif preview to start from begining.
      this.setBackgroundImg();
    }
    this.showPreview = show;
  }
}

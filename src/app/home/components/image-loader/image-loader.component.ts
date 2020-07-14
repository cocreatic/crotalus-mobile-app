import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ElementRef } from '@angular/core';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss'],
})
export class ImageLoaderComponent implements OnChanges {

  @Input() imageSrc: string;
  @Input() altText: string;
  @Input() imageBorderRadius?: string;
  @Output() imageLoadFailed = new EventEmitter();

  imageVisible = false;

  constructor( private element: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('imageSrc') && changes.imageSrc.currentValue) {
      this.imageVisible = false;
    }

    if (changes.hasOwnProperty('imageBorderRadius') && changes.imageBorderRadius.currentValue) {
      (this.element.nativeElement as HTMLElement)
        .style.setProperty('--image-border-radius', changes.imageBorderRadius.currentValue);
    }
  }

  imageLoadError(): void {
    this.imageLoadFailed.emit();
  }

  showImage(): void {
    this.imageVisible = true;
  }

}

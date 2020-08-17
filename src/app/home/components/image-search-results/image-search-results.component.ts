import { BoaResource } from './../../../models/boa-resource.interface';
import {
  Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef,
  OnChanges, SimpleChanges, SimpleChange, HostListener, EventEmitter, Output
} from '@angular/core';

@Component({
  selector: 'app-image-search-results',
  templateUrl: './image-search-results.component.html',
  styleUrls: ['./image-search-results.component.scss'],
})
export class ImageSearchResultsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() results: BoaResource[];
  @Output() openDetails = new EventEmitter<BoaResource>();
  @ViewChild('contentWrapper', { static: false }) contentWrapper: ElementRef;

  availableWidth: number;
  columnCount: number;
  resultsInColumns: BoaResource[][];
  showResults = false;
  columnCountReady = false;
  readonly MIN_IMAGE_WIDTH = 180;
  currentDocumentWidth: number;


  constructor(
    private changeDetector: ChangeDetectorRef,
    private element: ElementRef,
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('results') && changes.results.currentValue) {
      this.getNewResultsChunk(changes.results);
    }
  }

  ngAfterViewInit(): void {
    this.currentDocumentWidth = document.documentElement.getBoundingClientRect().width;
    this.availableWidth = (this.contentWrapper.nativeElement as HTMLElement).offsetWidth;
    this.findColumnCount();
  }

  findColumnCount(): void {
    this.columnCount = Math.floor(this.availableWidth / this.MIN_IMAGE_WIDTH);
    (this.element.nativeElement as HTMLElement).style.setProperty('--column-flex-basis', `${100 / this.columnCount}%`);
    this.columnCountReady = true;
    if (this.results && this.results.length) {
      this.clearResultsInColumns();
      this.splitResultsInColumns(this.results);
      this.showResults = true;
      this.changeDetector.detectChanges();
    }
  }

  clearResultsInColumns(): void {
    this.resultsInColumns = [];
  }

  getNewResultsChunk(changes: SimpleChange): void {
    let newResults: BoaResource[];
    if (changes.firstChange) {
      newResults = changes.currentValue;
    } else {
      newResults = changes.currentValue.slice(changes.previousValue.length);
    }
    if (this.columnCountReady && this.resultsInColumns && newResults && newResults.length) {
      this.splitResultsInColumns(newResults);
    }
  }

  splitResultsInColumns(resultsChunk: BoaResource[]): void {
    const resultsToSplit = [...resultsChunk];
    let columnIndex = 0;
    while (resultsToSplit.length > 0) {
      if (!this.resultsInColumns[columnIndex]) {
        this.resultsInColumns[columnIndex] = [];
      }
      this.resultsInColumns[columnIndex].push(resultsToSplit.shift());
      columnIndex = columnIndex === this.columnCount - 1 ? 0 : columnIndex + 1;
    }
  }

  @HostListener('window:resize')
  onResize() {
    const updatedWidth = document.documentElement.getBoundingClientRect().width;
    if (this.currentDocumentWidth === updatedWidth) {
      return;
    }
    this.currentDocumentWidth = updatedWidth;
    this.availableWidth = (this.contentWrapper.nativeElement as HTMLElement).offsetWidth;
    this.findColumnCount();
  }


}

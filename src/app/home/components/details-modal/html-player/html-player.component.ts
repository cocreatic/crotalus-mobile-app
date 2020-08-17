import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;

@Component({
  selector: 'app-html-player',
  templateUrl: './html-player.component.html',
  styleUrls: ['./html-player.component.scss'],
})
export class HtmlPlayerComponent implements OnChanges {

  @Input() url: string;
  @Input() format: string;
  @Output() openPdf = new EventEmitter();

  enablePlayer = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('url') && changes.url.currentValue !== undefined) {
      this.enablePlayer = true;
    }
  }

  async openUrlInBrowser(): Promise<void> {
    await Browser.open({ url: this.url });
  }

  openDocument() {
    if (this.format === 'application/pdf') {
      this.openPdf.emit();
    } else {
      this.openUrlInBrowser();
    }
  }

}

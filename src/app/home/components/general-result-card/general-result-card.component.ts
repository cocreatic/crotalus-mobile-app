import { BoaResource } from 'src/app/models/boa-resource.interface';
import { SearchTypes } from 'src/app/models/search-type.enum';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Helpers from '../../../helpers';

@Component({
  selector: 'app-general-result-card',
  templateUrl: './general-result-card.component.html',
  styleUrls: ['./general-result-card.component.scss'],
})
export class GeneralResultCardComponent {

  @Input() itemInfo: BoaResource;
  @Output() openDetails = new EventEmitter();
  @Output() playEvent = new EventEmitter<HTMLAudioElement>();

  searchTypes = SearchTypes;

  getItemTypeLabel(itemType): string {
    return Helpers.getItemTypeLabel(itemType);
  }

  getItemTypeIcon(itemType): string {
    return Helpers.getItemTypeIcon(itemType);
  }

  get originalFileUrl(): string {
    if (this.itemInfo.manifest.hasOwnProperty('entrypoint')) {
      return `${this.itemInfo.about}/!/${this.itemInfo.manifest.entrypoint}`;
    }

    if (this.itemInfo.manifest.hasOwnProperty('url') && this.itemInfo.manifest.url) {
      return this.itemInfo.manifest.url;
    }

    return `${this.itemInfo.about}/!/`;
  }

}

import { BoaResource } from 'src/app/models/boa-resource.interface';
import { SearchTypes } from 'src/app/models/search-type.enum';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Helpers from '../../../helpers';

@Component({
  selector: 'app-document-result-card',
  templateUrl: './document-result-card.component.html',
  styleUrls: ['./document-result-card.component.scss'],
})
export class DocumentResultCardComponent {
  @Input() itemInfo: BoaResource;
  @Output() openDetails = new EventEmitter();
}

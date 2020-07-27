import { SearchTypes } from './../../../models/search-type.enum';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-type-selector',
  templateUrl: './search-type-selector.component.html',
  styleUrls: ['./search-type-selector.component.scss'],
})
export class SearchTypeSelectorComponent {

  @Input() pristine: boolean;
  @Input() searchType: SearchTypes;
  @Output() searchTypeChangeEvent = new EventEmitter<string>()
  searchTypes = SearchTypes;

  constructor() { }

  setSearchType(searchType: SearchTypes): void {
    this.searchTypeChangeEvent.emit(searchType);
  }
}

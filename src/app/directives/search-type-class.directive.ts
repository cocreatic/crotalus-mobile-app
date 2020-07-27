import { SearchService } from './../services/search.service';
import { SearchTypes } from './../models/search-type.enum';
import { Directive, Input, Renderer2, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appSearchTypeClass]',
})
export class SearchTypeClassDirective implements OnChanges {

  @Input('appSearchTypeClass') searchType: SearchTypes;
  // @Input() searchVisibleInHeader: boolean;


  private lastClassSet: string;
  private searchTypes = SearchTypes;

  // searchTypeClasses = {
  //   SearchTypes[SearchTypes.all]: 'all-type',
  //   SearchTypes[SearchTypes.audio]: 'audio-type',

  // };

  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController,
    private element: ElementRef,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchType.currentValue !== undefined) {
      this.setTypeClass();
    }
  }

  getTypeClass(): string {
    let targetClass: string;
    switch (this.searchType) {
      
      case SearchTypes.all:
          targetClass = 'all-type'
        break;
      
      case SearchTypes.image:
          targetClass = 'image-type'
        break;
        
      case SearchTypes.video:
          targetClass = 'video-type'
        break;
    
      case SearchTypes.audio:
          targetClass = 'audio-type'
        break;
        
      case SearchTypes.document:
          targetClass = 'document-type'
        break;
    
      case SearchTypes.didacticUnit:
          targetClass = 'didactic-unit-type'
        break;
    
      default:
        break;
    }

    return targetClass; 
  }

  setTypeClass(): void {
    const classToSet = this.getTypeClass();
    if (!classToSet) {
      return;
    }
    if (this.lastClassSet) {
      this.domCtrl.write(() => {
        this.renderer.removeClass(this.element.nativeElement, this.lastClassSet);
      });  
    }
    this.domCtrl.write(() => {
      this.renderer.addClass(this.element.nativeElement, classToSet);
      this.lastClassSet = classToSet
    });  
  }

}

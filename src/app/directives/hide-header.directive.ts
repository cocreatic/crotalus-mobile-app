import { Directive, HostListener, Input, OnInit, Renderer2, ElementRef, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appHideHeader]',
})
export class HideHeaderDirective implements OnInit, AfterViewChecked {

  @Input() header: any;
  @Input() searchVisibleInHeader: boolean;


  private lastY = 0;
  private hideScrollSensitivity = 1;
  private showScrollSensitivity = 15;
  private contentElement: HTMLElement;
  private searchBoxHeight: number;
  private searchBoxBottomPosition: number;
  private safeTranslateYammount = 250;
  private animationDuration = 400;


  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController,
    private element: ElementRef,
  ) { }

  ngOnInit(): void {
    this.header = this.header.el;
    this.contentElement = this.element.nativeElement;
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.header, 'transition', `transform ${this.animationDuration}ms`);
    });
  }

  ngAfterViewChecked(): void {
    const searchBox = (this.contentElement.querySelector('.search-area') as HTMLElement);
    if (searchBox && !this.searchBoxBottomPosition) {
      this.searchBoxBottomPosition = searchBox.offsetTop + searchBox.offsetHeight;
    }
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
    if (
      $event.detail.scrollTop > (this.header.offsetHeight + this.searchBoxBottomPosition) &&
      $event.detail.scrollTop > this.lastY + this.hideScrollSensitivity
    ) {

      this.domCtrl.write(() => {
        this.renderer.setStyle(this.header, 'transform', `translateY(-${this.safeTranslateYammount}px)`);
      });

      setTimeout(() => {
        this.header.classList.add('already-hidden');
      }, this.animationDuration);

    } else if ($event.detail.scrollTop < this.lastY - this.showScrollSensitivity || $event.detail.scrollTop === 0) {

      this.domCtrl.write(() => {
        this.renderer.setStyle(this.header, 'transform', 'translateY(0)');
      });

      setTimeout(() => {
        this.header.classList.remove('already-hidden');
      }, this.animationDuration);
    }

    this.lastY = $event.detail.scrollTop;
  }

}

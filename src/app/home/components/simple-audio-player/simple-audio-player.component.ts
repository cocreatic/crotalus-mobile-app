import { Component, SimpleChanges, ChangeDetectorRef, OnChanges} from '@angular/core';
import { BaseAudioPlayer } from '../base-audio-player/base-audio-player';

@Component({
  selector: 'app-simple-audio-player',
  templateUrl: './simple-audio-player.component.html',
  styleUrls: ['./simple-audio-player.component.scss'],
})
export class SimpleAudioPlayerComponent extends BaseAudioPlayer implements OnChanges {

  constructor(private changeDetector: ChangeDetectorRef) {
    super();
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('audioSrc') && changes.audioSrc.currentValue) {
      this.changeDetector.detectChanges();
      this.setAudio();
    }
  }

  // setAudio(): void {
  //   this._player = this.playerElementRef.nativeElement;
  //   // this._player.src = this.audioSrc;
  //   // this._player.src = 'https://freesound.org/data/previews/521/521275_2535988-lq.mp3';
  //   this._bindPlayerEvents();

  // }
}

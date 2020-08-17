import { BaseAudioPlayer } from './../../base-audio-player/base-audio-player';
import { Component, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent extends BaseAudioPlayer implements OnChanges{

  constructor(private changeDetector: ChangeDetectorRef) {
    super();
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('audioSrc') && changes.audioSrc.currentValue) {
      this.changeDetector.detectChanges();
      this.setAudio();
    }
  }

}

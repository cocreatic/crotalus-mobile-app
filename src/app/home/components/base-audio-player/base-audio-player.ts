import { ElementRef, ViewChild, Input, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material';

export class BaseAudioPlayer {
  @Input() audioSrc: string;
  @Output() playEvent = new EventEmitter<HTMLAudioElement>();

  @ViewChild('player', { static: false }) playerElementRef: ElementRef;

  isPlaying = false;
  isLoading = false;
  smoothMarker = false;
  isMuted = false;
  currentTime = 0;
  duration = 0;

  private _player: HTMLAudioElement;

  constructor() { }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes.hasOwnProperty('audioSrc') && changes.audioSrc.currentValue) {
  //     this.changeDetector.detectChanges();
  //     this.setAudio();
  //   }
  // }

  setAudio(): void {
    this._player = this.playerElementRef.nativeElement;
    // this._player.src = this.audioSrc;
    // this._player.src = 'https://freesound.org/data/previews/521/521275_2535988-lq.mp3';
    this._bindPlayerEvents();

  }

  play(): void {
    this._player.paused ? this._player.play() : this._player.pause();
    this.playEvent.emit(this._player);
  }

  toggleVolume(): void {
    this._player.muted = !this._player.muted;
  }

  seek(event: MatSliderChange): void {
    this._player.currentTime = event.value;
  }
  
  stop(): void {
    if (!this._player.paused) {
      this._player.pause();
    }
    this.playEvent.emit(this._player);
    this._player.currentTime = 0;
  }

  private _bindPlayerEvents(): void {
    this._player.addEventListener('playing', () => {
      this.isPlaying = true;
    });

    this._player.addEventListener('pause', () => {
      this.isPlaying = false;

    });

    this._player.addEventListener('timeupdate', () => {
      const roundedTime = Math.floor(this._player.currentTime);
      if (this.currentTime !== roundedTime) {
        this.currentTime = roundedTime;
      }
    });

    this._player.addEventListener('loadstart', () => {
      this.isLoading = true;
    });

    this._player.addEventListener('volumechange', () => {
      this.isMuted = !this.isMuted;
    });

    this._player.addEventListener('ended', () => {
      this.stop();
    });

    this._player.addEventListener('loadeddata', () => {
      this.isLoading = false;
      this.duration = Math.floor(this._player.duration) < 1 ? 1 : Math.floor(this._player.duration);
      setTimeout(() => {
        this.smoothMarker = true;
      }, 600);
    });
  }

  get durationFormatted(): string {
    if (this.duration >= 1) {
      const minutes = Math.floor(this.duration / 60);
      const seconds = this.duration - (minutes * 60);
      return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`
    } else {
      return '00:01'
    }
  }
  
  get currentTimeFormatted(): string {
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime - (minutes * 60);
    return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`
  }
}

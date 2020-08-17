import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatSliderModule } from '@angular/material/slider';
import { FileOpener } from '@ionic-native/file-opener/ngx';


import { HomePage } from './home.page';
import { HideHeaderDirective } from './../directives/hide-header.directive';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { GeneralResultCardComponent } from './components/general-result-card/general-result-card.component';
import { ImageSearchResultsComponent } from './components/image-search-results/image-search-results.component';
import { ImageResultCardComponent } from './components/image-search-results/image-result-card/image-result-card.component';
import { ImagePlayerComponent } from './components/details-modal/image-player/image-player.component';
import { ImageLoaderComponent } from './components/image-loader/image-loader.component';
import { VideoPlayerComponent } from './components/details-modal/video-player/video-player.component';
import { VideoResultCardComponent } from './components/video-result-card/video-result-card.component';
import { AudioResultCardComponent } from './components/audio-result-card/audio-result-card.component';
import { SimpleAudioPlayerComponent } from './components/simple-audio-player/simple-audio-player.component';
import { AudioPlayerComponent } from './components/details-modal/audio-player/audio-player.component';
import { HtmlPlayerComponent } from './components/details-modal/html-player/html-player.component';
import { DocumentResultCardComponent } from './components/document-result-card/document-result-card.component';
import { SearchTypeSelectorComponent } from './components/search-type-selector/search-type-selector.component';
import { SearchTypeClassDirective } from '../directives/search-type-class.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      },
    ]),
    MatSliderModule,
  ],
  declarations: [
    HomePage,
    HideHeaderDirective,
    DetailsModalComponent,
    GeneralResultCardComponent,
    ImageSearchResultsComponent,
    ImageResultCardComponent,
    ImageLoaderComponent,
    ImagePlayerComponent,
    VideoPlayerComponent,
    VideoResultCardComponent,
    AudioResultCardComponent,
    SimpleAudioPlayerComponent,
    AudioPlayerComponent,
    HtmlPlayerComponent,
    DocumentResultCardComponent,
    SearchTypeSelectorComponent,
    SearchTypeClassDirective
  ],
  providers: [FileOpener],
  entryComponents: [
    DetailsModalComponent
  ],
})
export class HomePageModule {}

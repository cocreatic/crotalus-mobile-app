import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { HideHeaderDirective } from './../directives/hide-header.directive';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
  ],
  declarations: [
    HomePage,
    HideHeaderDirective,
    DetailsModalComponent,
  ],
  entryComponents: [
    DetailsModalComponent
  ],
})
export class HomePageModule {}

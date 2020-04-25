import { AboutComponent } from './about/about.component';
import { RepositoriesComponent } from './repositories/repositories.component';
import { AppearanceComponent } from './appearance/appearance.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: 'settings',
    component: SettingsPage,
    children: [
      { path: 'appearance', component: AppearanceComponent },
      { path: 'repositories', component: RepositoriesComponent },
      { path: 'about', component: AboutComponent },
      { path: '', redirectTo: 'appearance' },
    ]
  },
  { path: '', redirectTo: 'settings'}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}

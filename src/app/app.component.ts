import { SearchService } from './services/search.service';
import { StorageKeys } from './models/storageKeys.enum';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as storageModels from './models/storageDataModels.interface';
import { Plugins } from '@capacitor/core';


const { SplashScreen } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  
  systemDarkModeOn: boolean;
  userDarkModeSettings: storageModels.darkModeData;

  constructor(
    private platform: Platform,
    private storage: Storage,
    private searchService: SearchService
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(async () => {
      window['StatusBar'].overlaysWebView(false);
      this.systemDarkModeOn = window.navigator.userAgent.includes('AndroidDarkMode');
      await this.shouldSetDarkMode();
      setTimeout(() => {
        SplashScreen.hide();
      }, 100);
    });
  }

  async shouldSetDarkMode(): Promise<void> {
    await this.storage.get(StorageKeys.darkMode).then((val) => {
      if (val) {
        this.userDarkModeSettings = val;
      } else {
        const defaultDarkModeSettings: storageModels.darkModeData = {
          useSystemDefault: true,
          darkModeEnabled: false,
        };
        this.userDarkModeSettings = defaultDarkModeSettings;
        this.storage.set(StorageKeys.darkMode, defaultDarkModeSettings);
      }

      if (this.userDarkModeSettings.useSystemDefault) {
        this.setTheme(window.navigator.userAgent.includes('AndroidDarkMode'));
      } else {
        this.setTheme(this.userDarkModeSettings.darkModeEnabled);
      }
    });
  }

  setTheme(dark: boolean) {
    document.body.classList.toggle('dark', dark);
    if (dark) {
      window['StatusBar'].styleLightContent();
    } else {
      window['StatusBar'].styleDefault();
    }
    const statusBarColor = getComputedStyle(document.body).getPropertyValue('--custom-background').trim();
    window['StatusBar'].backgroundColorByHexString(statusBarColor);
    if (this.platform.is('android') && window.hasOwnProperty('NavigationBar')) {
      const navigationBarColor = dark ? '#000000' : '#ffffff';
      const ligthNavigationBar = dark ? false : true;
      window['NavigationBar'].backgroundColorByHexString(navigationBarColor, ligthNavigationBar);
    }
  }
}

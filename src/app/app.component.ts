import { StorageKeys } from './models/storageKeys.enum';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as storageModels from './models/storageDataModels.interface';
import { Plugins } from '@capacitor/core';
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';


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
    private themeDetection: ThemeDetection,
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(async () => {
      if (window.hasOwnProperty('StatusBar')) {
        window['StatusBar'].overlaysWebView(false);
      }

      if (this.platform.is('android')) {
        this.systemDarkModeOn = window.navigator.userAgent.includes('AndroidDarkMode');
      } else if (this.platform.is('ios')) {
        try {
          const themeDetectionAvailable = (await this.themeDetection.isAvailable()).value;
          const systemDarkModeDetection = themeDetectionAvailable ? (await this.themeDetection.isDarkModeEnabled()).value : false;
          this.systemDarkModeOn = systemDarkModeDetection;
        } catch (error) {
          console.warn(error);
          this.systemDarkModeOn = false;
        }
      }

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
        this.setTheme(this.systemDarkModeOn);
      } else {
        this.setTheme(this.userDarkModeSettings.darkModeEnabled);
      }
    });
  }

  setTheme(dark: boolean) {
    document.body.classList.toggle('dark', dark);
    if (window.hasOwnProperty('StatusBar')) {
      if (dark) {
        window['StatusBar'].styleLightContent();
      } else {
        window['StatusBar'].styleDefault();
      }
      const statusBarColor = getComputedStyle(document.body).getPropertyValue('--custom-background').trim();
      window['StatusBar'].backgroundColorByHexString(statusBarColor);
    }
    if (this.platform.is('android') && window.hasOwnProperty('NavigationBar')) {
      const navigationBarColor = dark ? '#000000' : '#ffffff';
      const ligthNavigationBar = dark ? false : true;
      window['NavigationBar'].backgroundColorByHexString(navigationBarColor, ligthNavigationBar);
    }
  }
}

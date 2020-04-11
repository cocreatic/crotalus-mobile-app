import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(() => {
      this.shouldSetDarkMode();
      const statusBarColor = getComputedStyle(document.body).getPropertyValue('--custom-background').trim();
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString(statusBarColor);
      this.statusBar.overlaysWebView(false);
      this.splashScreen.hide();
    });
  }

  shouldSetDarkMode(): void {
    this.storage.get('darkMode').then((val) => {
      this.setTheme(!!val);
    });
  }

  setTheme(dark: boolean) {
    document.body.classList.toggle('dark', dark);
    if (dark) {
      this.statusBar.styleLightContent();
    } else {
      this.statusBar.styleDefault();
    }
    const statusBarColor = getComputedStyle(document.body).getPropertyValue('--custom-background').trim();
    this.statusBar.backgroundColorByHexString(statusBarColor);
  }
}

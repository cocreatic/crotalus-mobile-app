import { StorageKeys } from './../../models/storageKeys.enum';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
})
export class AppearanceComponent implements OnInit {

  darkThemeEnabled: boolean;
  defaultSearchType: string;


  constructor(
    private storage: Storage,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {
    this.storage.get(StorageKeys.darkMode).then((val) => {
      this.darkThemeEnabled = !!val;
    });

    this.storage.get(StorageKeys.defaultSearchType).then((val) => {
      this.defaultSearchType = val ? val : 'all';
    });
  }

  darkThemeChange(event): void {
    this.storage.set(StorageKeys.darkMode, event.detail.checked).then(
      () => { this.setTheme(event.detail.checked); },
      () => { console.log('couldn\'t set the value'); }
    );
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

  updateDefaultTypeForSearch(event): void {
    this.storage.set(StorageKeys.defaultSearchType, event.detail.value).then(
      () => { },
      () => { console.log('couldn\'t set the value'); }
    );
  }

  resetCustomConfigs(): void {
    this.storage.clear();
  }

}

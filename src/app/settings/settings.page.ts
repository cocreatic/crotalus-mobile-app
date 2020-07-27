import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  tabsCurrentValue: string;
  backButtonPrioritySubcription: Subscription;

  constructor(
    private router: Router,
    private platform: Platform,
  ) { }

  navSegmentChanged(event): void {
    this.tabsCurrentValue = event.detail.value;
    this.router.navigate([`/settings/${this.tabsCurrentValue}`]);
  }

  setBackButtonListener(): void {
    this.backButtonPrioritySubcription = this.platform.backButton.subscribeWithPriority(
      1,
      () => { this.router.navigate(['/home']); }
    );
  }

  ionViewWillEnter() {
    const targetRoute = this.router.url.split('/').pop();
    this.tabsCurrentValue = targetRoute === 'repositories' ? 'repositories' : 'appearance';
  }

  ionViewDidEnter(): void {
    this.setBackButtonListener();
  }

  ionViewDidLeave(): void {
    this.backButtonPrioritySubcription.unsubscribe();
  }
}

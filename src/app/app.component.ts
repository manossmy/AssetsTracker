import { Component, OnInit, Optional } from '@angular/core';
import { AlertController, IonRouterOutlet, Platform, NavController } from '@ionic/angular';
import { DailySyncService } from './services/daily-sync.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Location } from '@angular/common'
import { IonicService } from './services/ionic.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private canGoBack: any;
  @Optional() private routerOutlet!: IonRouterOutlet

  userId: any;
  userList: any = [];
  menuList: any = [];
  isLoadingMenuData: boolean = true;

  constructor(private dailySyncService: DailySyncService, public route: Router, private _location: Location,
    private alertController: AlertController, private router: Router, private platform: Platform,
    private navCtrl: NavController, private actRouter: ActivatedRoute,
    private ionicService: IonicService) {
    try {
      this.dailySyncService.sync();
    } catch (err: any) {
      this.ionicService.toster.error(`Error while calculating the profit, Message: ${err.message || err}`);
    }
  }

  async ngOnInit() {
    this.initMenuList();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initMenuList();
      }
    });
  }

  async ionMenuToggle() {
    this.initMenuList();
  }

  async initMenuList() {
    const userId: any = await this.ionicService.storage.get('USER_ID');
    this.menuList = [
      { name: 'Dashboard', link: `/user/${userId}/dashboard`, icon: 'apps-outline' },
      { name: 'Investment', link: `/user/${userId}/investment`, icon: 'cash-outline' },
      { name: 'Account', link: '/user/account', icon: 'person-outline' },
      { name: 'Setting', link: '/user/setting', icon: 'hammer-outline' }
    ];
    this.isLoadingMenuData = false;
  }

  async logoutConfirmation() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'You want to Logout ?',
      backdropDismiss: false,
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.router.navigate(['login'])
          }
        },
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
      ],
    });
    await alert.present();
  }

  async exitConfirmation() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'Want to exit',
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel btn-secondary',
        },
        {
          text: 'Leave',
          cssClass: 'alert-button-confirm btn-primary',
          handler: async () => {
            await App['exitApp']();
          }
        },
      ],
    });
    await alert.present();
  }

}
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDBService } from '../services/db/login-db.service';
import { UserDBService } from '../services/db/user-db.service';
import { IonicService } from '../services/ionic.service';
import { NPSService } from '../services/nps.service';
import { ImportDBService } from '../services/db/import-db.service';
import { ProfitService } from '../services/profit.service';
import { ExportDBService } from '../services/db/export-db.service';
import moment from 'moment';
import { Capacitor } from '@capacitor/core';
import { DailySyncService } from '../services/daily-sync.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {

  userPin: any;
  userDetails: any = {};
  view: string = 'VALIDATING'; /* VALIDATING / LOGIN / REGISTER */
  isLoginWithAutoBackup: any;

  constructor(private loginDBService: LoginDBService, private userDBService: UserDBService,
    private ionicService: IonicService, private router: Router, private npsService: NPSService,
    private importDBService: ImportDBService, private profitService: ProfitService,
    private dailySyncService: DailySyncService, private exportDBService: ExportDBService) {
    this.init();
  }

  async init() {
    if (await this.loginDBService.isUserSignedUp()) {
      this.view = 'LOGIN';
    } else {
      this.isLoginWithAutoBackup = true;
      this.view = 'REGISTER';
    }
    await this.initAutoBakup();
  }

  async login() {
    await this.ionicService.showLoader();
    try {
      if (!this.userPin) throw 'Please Enter a PIN';
      var auth = await this.loginDBService.authenticate(this.userPin);
      if (auth == true) {
        const user: any = await this.userDBService.getDefaultUser();
        await this.ionicService.storage.set('IS_LOGGED_IN', 'true');
        await this.ionicService.storage.set('USER_ID', user.id + '');
        await this.router.navigate(['/user', user.id, 'investment']);
      } else {
        throw 'Invalid Credientials';
      }
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
      this.ionicService.hideLoader();
    }
  }

  async signup() {
    try {
      this.ionicService.showLoader();
      if (!this.userDetails.name) throw 'Please enter Name';
      if (!this.userDetails.email) throw 'Please enter Email';
      if (!this.userDetails.phone_number) throw 'Please enter Phone Number';
      if (!this.userDetails.pan) throw 'Please enter PAN';
      if (!this.userDetails.family_name) throw 'Please enter Family Name';
      if (!this.userDetails.password) throw 'Please enter Pin';
      if (this.userDetails.password.length != 6) throw 'Please enter 6 digit Pin';
      if (!this.userDetails.confirmPassword) throw 'Pin and confirm pin not matched';

      var isUserSignedUp = await this.loginDBService.signupUser(this.userDetails);
      this.ionicService.hideLoader();
      if (isUserSignedUp) {
        this.ionicService.toster.success('User Registered successfully');
        this.view = 'LOGIN';
      } else {
        this.ionicService.toster.error('User Registered failed');
      }
    }
    catch (err: any) {
      this.ionicService.hideLoader();
      this.ionicService.toster.error(err.message || err);
    }

  }

  async restoreBackup(event: any) {
    try {
      await this.ionicService.showLoader();
      const file = event.target.files[0];
      if (file == null) throw "Please select file";
      if (!file.name.endsWith(".bak")) throw "Please select only .bak file";

      let reader = new FileReader();
      reader.onload = async () => {
        try {
          event.target.value = "";
          let data: any = reader.result;
          await this.importDBService.restore(JSON.parse(atob(data)));
          await this.dailySyncService.forceSync();
          this.ionicService.toster.success("Data restored successfully");
          this.isLoginWithAutoBackup = false;
          this.view = 'LOGIN';
        } catch (err: any) {
          this.ionicService.toster.error(err.message || err);
        }
        this.ionicService.hideLoader();
      };
      reader.readAsText(file);
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
      this.ionicService.hideLoader();
    }
  }

  async initAutoBakup() {
    const isAutoBackupEnabled: any = await this.ionicService.storage.get('ENABLE_AUTOBACKUP');
    const lastAutoBackupTime: any = await this.ionicService.storage.get('LAST_AUTOBACKUP_TIME');

    const targetDate = moment(Number(lastAutoBackupTime));
    if (isAutoBackupEnabled === "TRUE" && Capacitor.isNative && targetDate.isBefore(moment(), 'day')) {
      await this.exportDBService.exportAll(true);
      await this.ionicService.storage.set('LAST_AUTOBACKUP_TIME', String(new Date().getTime()));
    }
  }

}

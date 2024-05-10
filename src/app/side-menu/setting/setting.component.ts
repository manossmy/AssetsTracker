import moment from 'moment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AlertController, AnimationController } from '@ionic/angular';
import { DailySyncService } from 'src/app/services/daily-sync.service';
import { AppSettingsDBService } from 'src/app/services/db/app-settings-db.service';
import { ExportDBService } from 'src/app/services/db/export-db.service';
import { ImportDBService } from 'src/app/services/db/import-db.service';
import { IntrestDBService } from 'src/app/services/db/intrest-db.service';
import { LoginDBService } from 'src/app/services/db/login-db.service';
import { IonicService } from 'src/app/services/ionic.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  @ViewChild("intrestModal", { static: true }) intrestModal: any;
  @ViewChild("resetPwdModal", { static: true }) resetPwdModal: any;

  isDebugEnabled: boolean = false;
  isMaskAmountEnabled: boolean = true;
  isAutoBackupEnabled: boolean = false;
  intrestType: string = '';
  intrestList: any = [];
  resetPwd: any = {};
  userId: any;

  constructor(private loginDBService: LoginDBService, private ionicService: IonicService, private actRouter: ActivatedRoute,
    private dailySyncService: DailySyncService, private animationCtrl: AnimationController, private alertController: AlertController,
    private intrestDBService: IntrestDBService, private exportDBService: ExportDBService, private importDBService: ImportDBService,
    private appSettingsDBService: AppSettingsDBService) {
    this.actRouter.paramMap.subscribe((param: Params) => {
      this.userId = JSON.parse(param['get']('user_id'));
    });
  }

  isInitTriggered: boolean = false;

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave() {
    this.isInitTriggered = false;
  }

  async init() {
    if (this.isInitTriggered) return;
    this.isInitTriggered = true;
    await this.ionicService.showLoader();
    this.isDebugEnabled = (await this.ionicService.storage.get("ENABLE_DEBUG")) == "TRUE";
    this.isMaskAmountEnabled = !((await this.ionicService.storage.get("ENABLE_MASK_AMOUNT")) == "FALSE");
    this.isAutoBackupEnabled = (await this.ionicService.storage.get("ENABLE_AUTOBACKUP")) == "TRUE";
    this.ionicService.hideLoader();
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

  async clearDatabase() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'You want to Clear Database?',
      backdropDismiss: false,
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Confirm',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            await this.ionicService.showLoader();
            await this.importDBService.clearDatabase();
            this.ionicService.hideLoader();
            location.href = "/login";
          }
        }
      ],
    });
    await alert.present();
  }

  async export() {
    try {
      await this.ionicService.showLoader();
      await this.exportDBService.exportAll();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async updateMaskAmountOption() {
    const isMaskAmountEnabled = !this.isMaskAmountEnabled;
    await this.ionicService.showLoader();
    await this.ionicService.storage.set("ENABLE_MASK_AMOUNT", isMaskAmountEnabled ? "TRUE" : "FALSE");
    await this.appSettingsDBService.updateMaskAmount(isMaskAmountEnabled);
    this.ionicService.hideLoader();
  }

  async updateDebugOption() {
    const isDebugEnabled = !this.isDebugEnabled;
    await this.ionicService.showLoader();
    await this.ionicService.storage.set("ENABLE_DEBUG", isDebugEnabled ? "TRUE" : "FALSE");
    await this.appSettingsDBService.updateDevelopmentMode(isDebugEnabled);
    this.ionicService.hideLoader();
  }

  async updateAutoBackup() {
    const isAutoBackupEnabled = !this.isAutoBackupEnabled;
    await this.ionicService.showLoader();
    await this.ionicService.storage.set("ENABLE_AUTOBACKUP", isAutoBackupEnabled ? "TRUE" : "FALSE");
    await this.appSettingsDBService.updateAutoBackup(isAutoBackupEnabled);
    this.ionicService.hideLoader();
  }

  async updateNewPassword() {
    try {
      if (!this.resetPwd.old_password) throw 'Please enter old password';
      if (!this.resetPwd.new_password) throw 'Please enter New password';
      if ((this.resetPwd.new_password || "").length != 6) throw 'Please enter 6 digit password';
      if (!this.resetPwd.confirm_new_password) throw 'Please enter confirm password';
      if (this.resetPwd.new_password == this.resetPwd.new_password) {
        var credential = await this.loginDBService.getCredentials();
        if (credential.password == this.resetPwd.old_password) {
          await this.loginDBService.updateCredentials(credential.id, this.resetPwd.new_password);
          this.ionicService.toster.success("Password Updated Successfully");
          await this.resetPwdModal.dismiss();
        } else {
          throw 'Incorrect old password';
        }
      } else {
        throw 'New password and Confirm password are not matching';
      }

    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
  }

  async updateIntrest() {
    await this.ionicService.showLoader();
    try {
      this.intrestList.map((intrest: any) => {
        if (!intrest.isDefault) {
          if (!intrest.start_date) throw "Please enter start date";
          if (!intrest.end_date) throw "Please enter end date";
          if (!intrest.intrest) throw "Please enter intrest percentage";
        }
      });
      await this.intrestDBService.deleteAll(this.intrestType);
      await Promise.all(this.intrestList.map(async (intrest: any) => {
        if (!intrest.isDefault) {
          await this.intrestDBService.create(intrest, this.intrestType);
        }
      }));
      this.intrestModal.dismiss(null, 'cancel');
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async getAllIntrest(type: string) {
    this.intrestType = type;
    this.intrestModal.present();
    await this.ionicService.showLoader();
    this.intrestList = await this.intrestDBService.getAll(type);

    this.intrestList.forEach((ppfIntrest: any) => {
      ppfIntrest.start_date = moment(ppfIntrest.start_date).format('YYYY-MM-DD');
      ppfIntrest.end_date = moment(ppfIntrest.end_date).format('YYYY-MM-DD');
      ppfIntrest.isDefault = ppfIntrest.isDefault == 'true';
    });
    this.ionicService.hideLoader();
  }

  async showResetPwdModel() {
    this.resetPwd = {};
    await this.resetPwdModal.present();
  }

  async calculateProfit() {
    await this.ionicService.showLoader();
    try {
      await this.dailySyncService.forceSync();
      this.ionicService.toster.success('Profit Calculated Successfully');
    } catch (err: any) {
      this.ionicService.toster.error(`Error while calculating the profit, Message: ${err.message || err}`);
    }
    this.ionicService.hideLoader();
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root: any = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

}

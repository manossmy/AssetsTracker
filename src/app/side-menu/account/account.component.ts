import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController, AnimationController, ModalController } from '@ionic/angular';
import { FamilyDBService } from 'src/app/services/db/family-db.service';
import { UserDBService } from 'src/app/services/db/user-db.service';
import { IonicService } from 'src/app/services/ionic.service';
import { ProfitService } from 'src/app/services/profit.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  @ViewChild("addAccountOrFamilyModal", { static: true }) addAccountOrFamilyModal: any;

  activeTabName: string = 'ACCOUNT';
  userDetails: any = {};
  familyDetails: any = {};
  familyList: any = [];
  userList: any = [];
  familyMap: any = {};
  previousUserId: any = '';
  userId: any;

  userFieldList: any = [
    { name: 'Family Name', attr: 'family_name', type: 'TEXT' },
    { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Start Date', attr: 'start_date', type: 'DATE' },
    { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
    { name: 'Pension', attr: 'pension', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Wallet Balance', attr: 'wallet_balance', type: 'AMOUNT', precision: '.0-2' },
    { name: 'Lent Balance', attr: 'lent_balance', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Profit Calculated Date', attr: 'profit_calc_date', type: 'DATE' },
    { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.2-2' },
    { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.2-2' }
  ];

  familyFieldList: any = [
    { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Start Date', attr: 'start_date', type: 'DATE' },
    { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
    { name: 'Pension', attr: 'pension', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Lent Balance', attr: 'lent_balance', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Wallet Balance', attr: 'wallet_balance', type: 'AMOUNT', precision: '.0-2' },
    { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
    { name: 'Profit Calculated Date', attr: 'profit_calc_date', type: 'DATE' },
    { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.2-2' }
  ];

  constructor(public ionicService: IonicService, private profitService: ProfitService, private userDBService: UserDBService,
    private alertController: AlertController, private familyDBService: FamilyDBService, private actRouter: ActivatedRoute,
    private modalCntrl: ModalController, private animationCtrl: AnimationController, private router: Router) {
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
    await this.loadData();
    this.ionicService.hideLoader();
  }

  async getAllUser() {
    this.userList = await this.userDBService.getAllUser();
  }

  async loadData() {
    await Promise.all([this.getAllUser(), this.getAllFamily()]);
    this.userList.forEach((user: any) => {
      user.profit = user.current_value - user.investment;
      user.family_name = this.familyMap[user.family_id]?.name;
      if (user.pension == 0) user.hide_pension = true;
      if (user.wallet_balance == 0) user.hide_wallet_balance = true;
      if (user.lent_balance == 0) user.hide_lent_balance = true;
      if (user.return_amount == 0) user.hide_return_amount = true;
      if (user.dividend == 0) user.hide_dividend = true;
      if (!user.start_date) user.hide_start_date = true;
      if (!user.last_investment_date) user.hide_last_investment_date = true;
      if (!user.profit_calc_date) user.hide_profit_calc_date = true;
    });
    this.familyList.forEach((family: any) => {
      family.profit = family.current_value - family.investment;
      if (family.pension == 0) family.hide_pension = true;
      if (family.wallet_balance == 0) family.hide_wallet_balance = true;
      if (family.lent_balance == 0) family.hide_lent_balance = true;
      if (family.return_amount == 0) family.hide_return_amount = true;
      if (family.dividend == 0) family.hide_dividend = true;
      if (!family.start_date) family.hide_start_date = true;
      if (!family.last_investment_date) family.hide_last_investment_date = true;
      if (!family.profit_calc_date) family.hide_profit_calc_date = true;
    });
  }

  async getAllFamily() {
    this.familyList = await this.familyDBService.getAllFamily();
    this.familyMap = {};
    this.familyList.forEach((family: any) => this.familyMap[family.id] = family);
  }

  async openUserModel(user: any) {
    this.userDetails = JSON.parse(JSON.stringify(user));
    await this.addAccountOrFamilyModal.present();
  }

  async makeDefaultUser(id: number) {
    this.ionicService.showLoader();
    await this.userDBService.makeDefaultUser(id);
    await this.loadData();
    await this.ionicService.storage.set('USER_ID', id + '');
    this.ionicService.hideLoader();
  }

  async confirmDelete(id: any, isUser: boolean) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'You want to Delete ?',
      backdropDismiss: false,
      cssClass: 'custom-alert-style',
      buttons: [
        {
          text: 'Delete',
          cssClass: 'alert-button-confirm',

          handler: () => {
            if (isUser) this.deleteAccount(id);
            else this.deleteFamily(id);
          }
        },
        {
          text: 'Cancel',
          cssClass: 'alert-button-cancel',
        },
      ],
    });
    await alert.present();
  }

  async deleteAccount(id: any) {
    try {
      await this.ionicService.showLoader();
      await this.userDBService.deleteUser(id);
      await this.profitService.syncAllFamily();
      await this.loadData();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  cancelModalDismiss() {
    this.modalCntrl.dismiss();
    this.userDetails = {};
  }

  async addAccount() {
    try {
      this.ionicService.showLoader();
      this.validateAccount(this.userDetails);
      await this.userDBService.createUser(this.userDetails);
      this.ionicService.toster.success("User Registered Successfully");
      await this.loadData();
      this.cancelModalDismiss();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async updateAccount() {
    try {
      this.ionicService.showLoader();
      this.validateAccount(this.userDetails);
      await this.userDBService.updateUser(this.userDetails, this.userDetails.id);
      this.ionicService.toster.success("User Updated Successfully");
      await this.profitService.syncAllFamily();
      await this.loadData();
      this.cancelModalDismiss();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async viewUserData(id: any) {
    let userId = (await this.ionicService.storage.set("USER_ID", id + ''));
    this.router.navigate([`/user/${id}/investment`]);
  }

  validateAccount(userDetails: any) {
    if (!userDetails.name) throw 'Please enter Name';
    if (!userDetails.email) throw 'Please enter Email';
    if (!userDetails.phone_number) throw 'Please enter Phone Number';
    if (!userDetails.pan) throw 'Please enter PAN';
    if (!userDetails.family_id) throw 'Please select Family';
  }

  async addFamily() {
    try {
      this.ionicService.showLoader();
      if (!this.familyDetails.name) throw 'Please enter Name';
      await this.familyDBService.createFamily(this.familyDetails);
      this.ionicService.toster.success("Family Created Successfully");
      await this.loadData();
      this.cancelModalDismiss();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async updateFamily() {
    try {
      this.ionicService.showLoader();
      if (!this.familyDetails.name) throw 'Please enter Name';
      await this.familyDBService.updateFamily(this.familyDetails, this.familyDetails.id);
      this.ionicService.toster.success("Family Details Updated Successfully");
      await this.loadData();
      this.cancelModalDismiss();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async openFamilyModel(familyDetails: any) {
    this.familyDetails = JSON.parse(JSON.stringify(familyDetails));
    await this.addAccountOrFamilyModal.present();
  }

  async deleteFamily(id: any) {
    try {
      await this.ionicService.showLoader();
      await this.familyDBService.deleteFamily(id);
      await this.loadData();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
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

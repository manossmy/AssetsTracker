import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertController, AnimationController } from '@ionic/angular';
import { InvestmentDBService } from '../services/db/investment-db.service';
import { InvestmentSubtypeDBService } from '../services/db/investment-subtype-db.service';
import { UserDBService } from '../services/db/user-db.service';
import { IonicService } from '../services/ionic.service';
import { ProfitService } from '../services/profit.service';

import * as moment from 'moment';

@Component({
  selector: 'app-investment-page',
  templateUrl: './investment-page.component.html',
  styleUrls: ['./investment-page.component.scss'],
})
export class InvestmentPageComponent implements OnInit {
  @ViewChild("modal", { static: true }) modal: any;

  userId: any;
  userDetails: any = {};
  investmentList: any = [];
  uniqueInvestmentTypeList: any = [];
  investment: any = {};
  investmentLogos: any = {
    MF: '../../assets/fund-icons/mf.png',
    SM: '../../assets/fund-icons/sm.png',
    PPF: '../../assets/fund-icons/ppf.png',
    EPF: '../../assets/fund-icons/epf.png',
    NPS: '../../assets/fund-icons/nps.png',
    BANK: '../../assets/fund-icons/bank.png',
    PO: '../../assets/fund-icons/post.png',
    LIC: '../../assets/fund-icons/lic.png',
    SGB: '../../assets/fund-icons/gold.png',
    // FINANCE: '../../assets/fund-icons/finance.png',
    // CF: '../../assets/fund-icons/gold.png',
    // LENT: '../../assets/fund-icons/gold.png',
  };

  editInvestment: any = {};

  possibleInvestment = [
    { name: 'Mutual Fund', type: 'MF' },
    { name: 'Share Market', type: 'SM' },
    { name: 'Public Provident Fund', type: 'PPF' },
    { name: 'Employees Provident Fund', type: 'EPF' },
    { name: 'National Pension System', type: 'NPS' },
    { name: 'Bank', type: 'BANK' },
    { name: 'Post Office', type: 'PO' },
    { name: 'Life Insurance Corporation of India', type: 'LIC' },
    { name: 'Sovereign Gold Bond', type: 'SGB' },
    { name: 'Chit Fund', type: 'CF' },
    { name: 'Finance', type: 'FINANCE' },
    { name: 'Lent', type: 'LENT' }
  ];

  npsTypes = [
    { name: 'Aditya Birla Sun Life PENSION Management Limited', type: 'SM010' },
    { name: 'HDFC Pension Management Company Limited', type: 'SM008' },
    { name: 'ICICI Prudential Pension Funds Management Company Limited', type: 'SM007' },
    { name: 'Kotak Mahindra Pension Fund Limited', type: 'SM005' },
    { name: 'LIC pension Fund Limited', type: 'SM003' },
    { name: 'SBI Pension Fund Private Limited', type: 'SM001' },
    { name: 'UTI Retirement Limited', type: 'SM002' },
  ];

  fieldDetails: any = {
    'MF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'SM': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Wallet Balance', attr: 'wallet_balance', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'PPF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'EPF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Pension', attr: 'pension', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'NPS': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'BANK': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Maturity Amount', attr: 'maturity_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'PO': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'LIC': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Assured Bonus', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'SGB': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Amount Per Gram', attr: 'amount_per_quantity', type: 'AMOUNT', precision: '.0-2' },
      { name: 'No. of Grams', attr: 'quantity', type: 'TEXT' },
      { name: 'Wallet Balance', attr: 'wallet_balance', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Intrest Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'CF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Apx. Maturity Amount', attr: 'maturity_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'FINANCE': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-0' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'LENT': [
      { name: 'Total Amount Lented', attr: 'investment', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Balance Amount', attr: 'balance_amount', type: 'AMOUNT', precision: '.0-0' },
      { name: 'Issued Date', attr: 'start_date', type: 'DATE' },
      { name: 'Return Date', attr: 'maturity_date', type: 'DATE' }
    ]
  };

  constructor(private userDBService: UserDBService, private investmentDBService: InvestmentDBService,
    private investmentSubtypeDBService: InvestmentSubtypeDBService, private alertController: AlertController,
    public profitService: ProfitService, private actRouter: ActivatedRoute, public ionicService: IonicService,
    private animationCtrl: AnimationController, private router: Router) {
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
    try {
      this.loadData();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async loadData() {
    await Promise.all([this.getUserById(), this.getAllInvestmentType()]);

    await Promise.all(this.investmentList.map(async (obj: any) => {
      if (this.calculateDiff(obj.start_date) < 365) {
        obj.hide_xirr = true;
      } else {
        obj.hide_hpr = true;
      }
      if (!obj.last_investment_date) obj.hide_last_investment_date = true;
      if (obj.return_amount == 0) obj.hide_return_amount = true;
      if (obj.dividend == 0) obj.hide_dividend = true;

      obj.balance_amount = obj.investment - obj.return_amount;

      obj.profit = obj.current_value - obj.investment;
      obj.css_xirr = obj.css_hpr = obj.css_profit = obj.profit > 0 ? 'profit-color' : obj.profit < 0 ? 'loss-color' : 'neutral-color'

      if (obj.type == 'CF') {
        if (obj.profit == 0) obj.hide_profit = true;
        if (obj.xirr == 0) obj.hide_xirr = true;
        if (obj.hrp == 0) obj.hide_hpr = true;
      } else if (obj.type == 'SGB') {
        const sgbList: any = await this.investmentSubtypeDBService.getAllInvestmentSubtype(this.userId, obj.id);
        sgbList.forEach((sgbObj: any) => {
          obj.quantity = (obj.quantity || 0) + sgbObj.quantity;
          obj.amount_per_quantity = sgbObj.amount_per_quantity;
        });
      }
    }));
  }

  async getUserById() {
    this.userDetails = await this.userDBService.getUserById(this.userId);
  }

  async getAllInvestmentType() {
    this.investmentList = await this.investmentDBService.getAllInvestmentType(this.userId);
    this.uniqueInvestmentTypeList = this.investmentList.map((investment: any) => investment.type);
  }

  getPossibleInvestment() {
    return this.possibleInvestment.filter((investment: any) => this.uniqueInvestmentTypeList.indexOf(investment.type) == -1);
  }

  async addInvestmentType() {
    try {
      await this.ionicService.showLoader();
      if (!this.investment.type) throw "Please select Investment Type";
      this.investment.name = this.possibleInvestment.find((investment: any) => investment.type == this.investment.type)?.name;

      if (this.investment.type == 'NPS') {
        if (!this.investment.ref) throw "Please select Pension Fund Manager";
        this.investment.ref_name = this.npsTypes.find((nps: any) => nps.type == this.investment.ref)?.name;
      } else if (this.investment.type == 'PPF') {
        if (!this.investment.account_holder) throw "Please enter account holder";
        if (!this.investment.start_date) throw "Please enter start date";
        if (!this.profitService.ppfIntrest[moment(this.investment.start_date).format("YYYY-MM")]) throw "Please enter start date between " + moment(Object.keys(this.profitService.ppfIntrest).sort()[0]).format("DD-MMM-YYYY") + " and " + moment().format("DD-MMM-YYYY");
        if (!this.profitService.ppfIntrest[moment().format("YYYY-MM")]) throw "Intrest details not found for this month";
      }
      var investment_id = await this.investmentDBService.addInvestmentType(this.userId, this.investment);
      if (this.investment.type == 'PPF') {
        let investmentSubtype = {
          name: this.investment.account_holder,
          start_date: this.investment.start_date,
          ref: this.profitService.ppfIntrest[moment().format("YYYY-MM")],
          maturity_date: moment(this.investment.start_date).add(15, "years")
        };
        await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, investment_id, investmentSubtype);
      } else if (this.investment.type == 'SM') {
        let investmentSubtype = {
          name: this.investment.name,
          tags: { current_value: 0 }
        };
        await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, investment_id, investmentSubtype);
      } else if (this.investment.type == 'EPF') {
        let investmentSubtype = {
          name: this.investment.name,
          tags: {
            employee_share: 0,
            employer_share: 0,
            pension: 0,
            vpf: 0
          }
        };
        await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, investment_id, investmentSubtype);
      }
      await this.loadData();
      this.modelClose();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async deleteInvestmentType(investment: any) {
    try {
      await this.ionicService.showLoader();
      if (["PPF", "SM", "EPF"].indexOf(investment.type) != -1) {
        var investmentSubtypeList: any = await this.investmentSubtypeDBService.getAllInvestmentSubtype(this.userId, investment.id);
        if (investmentSubtypeList.length > 0) {
          await Promise.all(investmentSubtypeList.map(async (investmentSubtype: any) => {
            await this.investmentSubtypeDBService.deleteInvestmentSubtype(this.userId, investment.id, investmentSubtype.id);
          }));
        }
      }
      await this.investmentDBService.deleteInvestmentType(this.userId, investment.id);
      await this.profitService.syncUser(this.userId);
      await this.loadData();
      this.ionicService.hideLoader();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
      this.ionicService.hideLoader();
    }
  }

  // pop up modal
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

  modelClose() {
    this.modal.dismiss(null, 'cancel');
    this.investment = {};
  }

  // confirm delete function
  async confirmDelete(investment: any) {
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
            this.deleteInvestmentType(investment);
            this.investment = {};
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

  // find current date.... (calc number of days from started)
  calculateDiff(dataStart: any) {
    let currentDate = new Date();
    dataStart = new Date(dataStart);
    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dataStart.getFullYear(), dataStart.getMonth(), dataStart.getDate())) / (1000 * 60 * 60 * 24));
  }

  async confirmLogout() {
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

}
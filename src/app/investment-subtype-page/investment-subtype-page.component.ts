import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AlertController, AnimationController, ModalController } from '@ionic/angular';
import { InvestmentDBService } from '../services/db/investment-db.service';
import { InvestmentSubtypeDBService } from '../services/db/investment-subtype-db.service';
import { StatementDBService } from '../services/db/statement-db.service';
import { IonicService } from '../services/ionic.service';
import { MFService } from '../services/mf.service';
import { NPSService } from '../services/nps.service';
import { ProfitService } from '../services/profit.service';
import { SGBService } from '../services/sgb.service';
import { DailySyncService } from '../services/daily-sync.service';
import { UserDBService } from '../services/db/user-db.service';

import * as moment from 'moment';
import { SMService } from '../services/sm.service';

@Component({
  selector: 'app-investment-subtype-page',
  templateUrl: './investment-subtype-page.component.html',
  styleUrls: ['./investment-subtype-page.component.scss'],
})
export class InvestmentSubtypePageComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal: any;
  @ViewChild('editInvestmentModal', { static: true }) editInvestmentModal: any;
  @ViewChild('editInvestmentSubtypeModal', { static: true }) editInvestmentSubtypeModal: any;

  userId: any;
  investmentId: any
  user: any = {};
  investment: any = {};
  investmentSubtypeList: any = [];
  stockList: any = [];
  investmentSubtype: any = {};

  editInvestment: any = {};
  editInvestmentSubtype: any = {};

  mfNameSearchTimer: any = null;
  matchedMfList: any = [];

  uploadCams: any = { override: false };
  segment: string = 'UPLOAD';

  isCAMSGenerated: boolean = false;
  camsData: any = {};

  fieldDetails: any = {
    'MF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Last Nav Update Date', attr: 'price_updated_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'NPS': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Last Nav Update Date', attr: 'price_updated_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'SGB': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Amount Per Gram', attr: 'amount_per_quantity', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Price Updated Date', attr: 'price_updated_date', type: 'DATE' },
      { name: 'No. of Grams', attr: 'quantity', type: 'TEXT' },
      { name: 'Average Price per Gram', attr: 'average_price_per_quantity', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Credited Intrest', attr: 'dividend', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'BANK': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Investment Type', attr: 'category', type: 'TEXT' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Intrest (%)', attr: 'ref', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'Maturity Date', attr: 'maturity_date', type: 'DATE' },
      { name: 'Maturity Amount', attr: 'maturity_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'PO': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Investment Type', attr: 'category', type: 'TEXT' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Intrest (%)', attr: 'ref', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'Intrest Credited', attr: 'return_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Maturity Date', attr: 'maturity_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'PPF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Intrest (%)', attr: 'ref', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'Maturity Date', attr: 'maturity_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'LIC': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Next Investment Date', attr: 'next_investment_date', type: 'DATE' },
      { name: 'Maturity Date', attr: 'maturity_date', type: 'DATE' },
      { name: 'Maturity Amount', attr: 'maturity_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Assured Bonus', attr: 'assuredBonus', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'SM': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Dividend Amount', attr: 'dividend', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'SM-STOCKS': [
      { name: 'No. of Stocks', attr: 'quantity', type: 'NUMBER', precision: '.0-0' },
      { name: 'Stock Price', attr: 'amount_per_quantity', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Price Updated Date', attr: 'price_updated_date', type: 'DATE', pattern: 'dd-MMM-y HH:mm:ss' }
    ],
    'FINANCE': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Monthly Intrest (%)', attr: 'ref', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'Intrest Received', attr: 'return_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'CF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Next Investment Date', attr: 'next_investment_date', type: 'DATE' },
      { name: 'Apx. Maturity Amount', attr: 'maturity_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Installament Amount ', attr: 'installment_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Start Date', attr: 'start_date', type: 'DATE' },
      { name: 'Apx. Maturity Date', attr: 'maturity_date', type: 'DATE' },
      { name: 'Apx. No of Installament ', attr: 'approximate_no_of_installment', type: 'TEXT' },
      { name: 'Apx. Profit Amount', attr: 'apx_profit', type: 'AMOUNT', precision: '.0-2' }
    ],
    'EPF': [
      { name: 'Total Invested', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Last Investment Date', attr: 'last_investment_date', type: 'DATE' },
      { name: 'Next Investment Date', attr: 'next_investment_date', type: 'DATE' },
      { name: 'Employee Share', attr: 'employee_share', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Employer Share', attr: 'employer_share', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Pension', attr: 'pension', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Voluntary Provident Fund', attr: 'vpf', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Value', attr: 'current_value', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Current Profit Amount', attr: 'profit', type: 'AMOUNT', precision: '.0-2' },
      { name: 'XIRR', attr: 'xirr', type: 'PERCENTAGE', precision: '.0-2' },
      { name: 'HPR', attr: 'hpr', type: 'PERCENTAGE', precision: '.0-2' }
    ],
    'LENT': [
      { name: 'Total Amount Lented', attr: 'investment', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Return Amount', attr: 'return_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Balance Amount', attr: 'balance_amount', type: 'AMOUNT', precision: '.0-2' },
      { name: 'Issued Date', attr: 'start_date', type: 'DATE' },
      { name: 'Return Date', attr: 'maturity_date', type: 'DATE' }
    ]
  };

  constructor(private userDBService: UserDBService, private investmentDBService: InvestmentDBService, private investmentSubtypeDBService: InvestmentSubtypeDBService,
    private statementDBService: StatementDBService, public profitService: ProfitService, private npsService: NPSService, private dailySyncService: DailySyncService,
    private alertController: AlertController, private actRouter: ActivatedRoute, public ionicService: IonicService, private modalCtrl: ModalController,
    private animationCtrl: AnimationController, private mfService: MFService, private sgbService: SGBService, private modalCntrl: ModalController, private smService: SMService) {
    this.actRouter.paramMap.subscribe((param: Params) => {
      this.userId = JSON.parse(param['get']('user_id'));
      this.investmentId = JSON.parse(param['get']('investment_id'));
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
      this.isCAMSGenerated = false;
      this.investmentSubtype = {};
      await this.loadData();
      this.camsData = { period: 'ALL', startDate: null, endDate: null };
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async loadData() {
    await Promise.all([this.getUserById(), this.getInvestmentById(), this.getAllInvestmentSubtype()]);
    if (this.investment.type == 'MF') {
      this.investmentSubtypeList.forEach((obj: any) => obj.name = obj.name.split('-')[0]);
    } else if (this.investment.type == 'NPS' && this.investmentSubtypeList.length > 0) {
      const categoryMap: any = { 'Tier I': [], 'Tier II': [] };
      const orderList: any = ['Scheme E', 'Scheme C', 'Scheme G'];
      this.investmentSubtypeList.forEach((obj: any) => {
        obj.scheme = obj.name.split('-')[1].trim();
        obj.tags = JSON.parse(obj.tags);
        categoryMap[obj.category].push(obj)
      });
      this.investmentSubtypeList = [];
      ['Tier I', 'Tier II'].forEach((text: string) => {
        const subTypeList = categoryMap[text].sort((a: any, b: any) => {
          return orderList.indexOf(a.scheme) < orderList.indexOf(b.scheme) ? -1 : 1;
        });
        if (subTypeList.length > 0) {
          var { id, category, tags, start_date, investment_id, user_id, last_investment_date, quantity, amount_per_quantity, price_updated_date } = subTypeList[0];
          this.investmentSubtypeList.push({
            id,
            name: 'NPS (' + category + ' Account)',
            category,
            start_date,
            price_updated_date,
            last_investment_date,
            quantity,
            amount_per_quantity,
            investment: tags.investment || 0,
            additional_charges: tags.additional_charges || 0,
            service_charges: tags.total_service_charges || 0,
            current_value: tags.current_value || 0,
            return_amount: tags.return_amount || 0,
            xirr: tags.xirr || 0,
            hpr: tags.hpr || 0,
            investment_id,
            user_id,
            subTypeList
          });
        }
      });
    } else if (this.investment.type == 'SGB') {
      this.investmentSubtypeList.forEach((obj: any) => {
        obj.average_price_per_quantity = (obj.investment / obj.quantity) || 0;
        obj.maturity_date = new Date(obj.issued_date);
        obj.maturity_date.setFullYear(obj.maturity_date.getFullYear() + 8); // Adding 8 years for calculating maturity date
        obj.interest_date = new Date(obj.issued_date);
        do {
          obj.interest_date.setMonth(obj.interest_date.getMonth() + 6);
        } while (new Date().getTime() > obj.interest_date.getTime());
        var faceValue = Number(obj.ref);
        obj.interest_amount = ((faceValue * obj.quantity) / 100) * 1.25;
      });
    } else if (this.investment.type == 'LIC') {
      this.investmentSubtypeList.forEach((obj: any) => {
        var tags = obj.tags = JSON.parse(obj.tags);
        obj.assuredBonus = tags.assuredBonus;
        obj.next_investment_date = moment(obj.start_date);
        while (moment().diff(obj.next_investment_date, 'days') > 0) {
          obj.next_investment_date.add(tags.investment_term_in_months, 'months');
        }
      });
    } else if (this.investment.type == 'SM') {
      var investmentSubtypeList = this.investmentSubtypeList;
      this.investmentSubtypeList = [];
      investmentSubtypeList.forEach((obj: any) => {
        if (obj.category == 'SM-STOCKS') this.stockList.push(obj);
        else this.investmentSubtypeList.push(obj);
      });
    } else if (this.investment.type == 'EPF') {
      this.investmentSubtypeList.forEach((obj: any) => {
        if (obj.last_investment_date) obj.next_investment_date = moment(obj.last_investment_date).add(1, "month");
        var tags = obj.tags = JSON.parse(obj.tags);
        obj.employee_share = tags.employee_share;
        obj.employer_share = tags.employer_share;
        obj.vpf = tags.vpf;
      });
    } else if (this.investment.type == 'CF') {
      this.investmentSubtypeList.forEach((obj: any) => {
        const { installment_amount, installment_pay_at, approximate_no_of_installment } = obj.tags = JSON.parse(obj.tags);
        obj.installment_amount = installment_amount;
        obj.installment_pay_at = installment_pay_at;
        obj.approximate_no_of_installment = approximate_no_of_installment;
        obj.apx_profit = obj.maturity_amount - (obj.approximate_no_of_installment * obj.installment_amount);

        obj.next_investment_date = moment(obj.last_investment_date);
        if (installment_pay_at == 'QUARTERLY') {
          obj.next_investment_date.add(3, 'months');
        } else if (installment_pay_at == 'BI_MONTHLY') {
          obj.next_investment_date.add(2, 'months');
        } else {
          obj.next_investment_date.add(1, 'months');
        }
      });
    } else if (this.investment.type == 'LENT') {
      this.investmentSubtypeList.forEach((obj: any) => {
        obj.balance_amount = obj.investment - obj.return_amount;
      });
    }

    this.investmentSubtypeList.forEach((obj: any, index: number) => {
      if (this.calculateDiff(obj.start_date) < 365) {
        obj.hide_xirr = true;
      } else {
        obj.hide_hpr = true;
      }
      obj.profit = obj.current_value - obj.investment;
      obj.css_xirr = obj.css_hpr = obj.css_profit = obj.profit > 0 ? 'profit-color' : obj.profit < 0 ? 'loss-color' : 'neutral-color'
    });
  }

  async getUserById() {
    this.user = await this.userDBService.getUserById(this.userId);
  }

  async getInvestmentById() {
    this.investment = await this.investmentDBService.getInvestmentTypeById(this.userId, this.investmentId);
  }

  async getAllInvestmentSubtype() {
    this.stockList = [];
    this.investmentSubtypeList = await this.investmentSubtypeDBService.getAllInvestmentSubtype(this.userId, this.investmentId);
  }

  async onSubTypeModalOpen() {
    if (this.investment.type == 'SGB') {
      const { date, price } = await this.sgbService.getTodayPrice();
      if (price) {
        this.investmentSubtype.amount_per_quantity = price;
        this.investmentSubtype.price_updated_date = date;
      }
    }
  }

  async addInvestmentSubType() {
    try {
      await this.ionicService.showLoader();
      if (this.investment.type == 'MF') {
        await this.addMF();
      } else if (this.investment.type == 'SM') {
        await this.addSM();
      } else if (this.investment.type == 'NPS') {
        await this.addNPS();
      } else if (this.investment.type == 'SGB') {
        await this.addSGB();
      } else if (this.investment.type == 'BANK') {
        await this.addBank();
      } else if (this.investment.type == 'PO') {
        await this.addPO();
      } else if (this.investment.type == 'LIC') {
        await this.addLIC();
      } else if (this.investment.type == 'FINANCE') {
        await this.addFinance();
      } else if (this.investment.type == 'CF') {
        await this.addCF();
      } else if (this.investment.type == 'LENT') {
        await this.addLent();
      } else throw 'DEV In-Progress';
      await this.loadData();
      this.investmentSubtype = {};
      this.modalCtrl.dismiss();
      // this.modelClose();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async addMF() {
    if (!this.investmentSubtype.name || !this.investmentSubtype.ref || !this.investmentSubtype.category) throw 'Please Select Mutual fund Name';
    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
  }

  async addSM() {
    if (!this.investmentSubtype.ref) throw 'Please Enter Symbol';
    const stockDetails = await this.smService.getNSCStockName(this.investmentSubtype.ref);
    if (!stockDetails) throw 'Please Enter Valid Symbol Name';
    if (!this.investmentSubtype.quantity) throw 'Please Enter Quantity';

    var stockPrice: any = await this.smService.getNSCTradePrice(this.investmentSubtype.ref);
    if (!stockPrice) throw "Error while fetching stock price. Please try again";

    this.investmentSubtype.amount_per_quantity = stockPrice.amount_per_quantity;
    this.investmentSubtype.price_updated_date = stockPrice.price_updated_date;

    this.investmentSubtype.name = stockDetails.name;
    this.investmentSubtype.category = 'SM-STOCKS';

    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    await this.profitService.syncUser(this.userId);
  }

  async refreshStockPrice(symbol?: string) {
    try {
      await this.ionicService.showLoader();
      const symbolList: any = symbol ? [symbol] : (await this.investmentSubtypeDBService.getDistinctStockRef() as any).map((obj: any) => obj.ref);
      if (symbolList.length > 0) {
        var failedCount = 0;
        var successCount = 0;
        await Promise.all(symbolList.map(async (symbol: string) => {
          const stockPrice: any = await this.smService.getNSCTradePrice(symbol);
          if (stockPrice) {
            const investmentSubType: any = {};
            investmentSubType.amount_per_quantity = stockPrice.amount_per_quantity;
            investmentSubType.price_updated_date = stockPrice.price_updated_date;
            investmentSubType.last_updated_date = new Date().getTime();
            await this.investmentSubtypeDBService.updateStockPricePerQuantity(symbol, investmentSubType);
            successCount++;
          } else failedCount++;
        }));
        if (successCount > 0) {
          await this.profitService.syncUser(this.userId);
          await this.loadData();
        }
        if (failedCount > 0) throw `${failedCount} stocks failed to updated. Please try again.`
      }
      this.ionicService.toster.success('Stock price updated successfully');
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();

  }

  async addNPS() {
    if (!this.investmentSubtype.category) throw 'Please Select Account Type';
    if (this.investmentSubtype.category == 'Tier II') throw 'DEV In-Progress';
    if (!this.investmentSubtype.scheme_e) throw 'Please Enter Scheme E Percentage';
    if (!this.investmentSubtype.scheme_c) throw 'Please Enter Scheme C Percentage';
    if (!this.investmentSubtype.scheme_g) throw 'Please Enter Scheme G Percentage';
    if ((this.investmentSubtype.scheme_e + this.investmentSubtype.scheme_c + this.investmentSubtype.scheme_g) != 100) throw 'Sum of all scheme should be equal to 100';

    const schemeRefMap: any = {};
    const schemeDetails = await this.npsService.geAllScheme().toPromise();
    schemeDetails.data.forEach((scheme: any) => {
      if (scheme.pfm_id == this.investment.ref && scheme.name.endsWith(' - TIER I')) {
        schemeRefMap[scheme.name.charAt(scheme.name.length - 10)] = scheme;
      }
    });

    var navDetails: any = {};
    const navList = await this.npsService.geLatestNav();
    navList.forEach((data: any) => navDetails[data.scheme_id] = data);

    this.investmentSubtype.tags = { type: 'NPS', category: this.investmentSubtype.category };

    this.investmentSubtype.name = this.investment.ref_name + ' - Scheme E - ' + this.investmentSubtype.category;
    this.investmentSubtype.ref = schemeRefMap['E'].id;
    this.investmentSubtype.tags.allocation = this.investmentSubtype.scheme_e;
    this.investmentSubtype.amount_per_quantity = navDetails[this.investmentSubtype.ref].nav;
    this.investmentSubtype.price_updated_date = new Date(navDetails[this.investmentSubtype.ref].date).getTime();
    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);

    this.investmentSubtype.name = this.investment.ref_name + ' - Scheme C - ' + this.investmentSubtype.category;
    this.investmentSubtype.ref = schemeRefMap['C'].id;
    this.investmentSubtype.tags.allocation = this.investmentSubtype.scheme_c;
    this.investmentSubtype.amount_per_quantity = navDetails[this.investmentSubtype.ref].nav;
    this.investmentSubtype.price_updated_date = new Date(navDetails[this.investmentSubtype.ref].date).getTime();
    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);

    this.investmentSubtype.name = this.investment.ref_name + ' - Scheme G - ' + this.investmentSubtype.category;
    this.investmentSubtype.ref = schemeRefMap['G'].id;
    this.investmentSubtype.tags.allocation = this.investmentSubtype.scheme_g;
    this.investmentSubtype.amount_per_quantity = navDetails[this.investmentSubtype.ref].nav;
    this.investmentSubtype.price_updated_date = new Date(navDetails[this.investmentSubtype.ref].date).getTime();
    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
  }

  async addSGB() {
    if (!this.investmentSubtype.name) throw 'Please enter SGB series name';
    if (!this.investmentSubtype.ref) throw 'Please enter face value';
    if (!this.investmentSubtype.issued_date) throw 'Please select issued date';
    if (!this.investmentSubtype.amount_per_quantity) throw 'Please enter today price per gram'; //TODO: need to integrate this with any external api
    this.investmentSubtype.last_updated_date = new Date().getTime();
    await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    await this.investmentSubtypeDBService.updateSGBValue('SGB', this.investmentSubtype);
  }

  async addBank() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.category) throw 'Please select deposit type';
    if (!this.investmentSubtype.start_date) throw 'Please select start date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Start date should be less than or equal to current date';
    if (this.investmentSubtype.category == 'Fixed Deposit' && !this.investmentSubtype.investment) throw 'Please enter principle amount';
    if (!this.investmentSubtype.ref) throw 'Please enter intrest percentage';
    if (!this.investmentSubtype.maturity_date) throw 'Please enter maturity date';
    if (moment().diff(moment(this.investmentSubtype.maturity_date), 'days') > 0) throw 'Maturity date should be greater than current date';
    if (this.investmentSubtype.category == 'Fixed Deposit' && !this.investmentSubtype.maturity_amount) throw 'Please enter maturity amount';
    if (this.investmentSubtype.category == 'Recurring Deposit' && !this.investmentSubtype.monthlyInvestment) throw 'Please enter monthly recurring deposit amount';
    this.investmentSubtype.last_updated_date = new Date().getTime();
    if (this.investmentSubtype.monthlyInvestment) {
      this.investmentSubtype.tags = this.investmentSubtype.tags || {};
      this.investmentSubtype.tags.monthlyInvestment = this.investmentSubtype.monthlyInvestment;
    }
    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    if (this.investmentSubtype.category == 'Fixed Deposit') {
      let statement = {
        type: 'I',
        amount: this.investmentSubtype.investment * -1,
        ir_date: this.investmentSubtype.start_date,
        quantity: 1
      };
      await this.statementDBService.addStatement(this.userId, this.investmentId, investmentSubtypeId, statement);
      await this.profitService.syncUser(this.userId);
    } else if (this.investmentSubtype.category == 'Recurring Deposit' && this.investmentSubtype.autoAddInstallment) {
      await this.dailySyncService.bank_updateInvestment(investmentSubtypeId);
      await this.profitService.syncUser(this.userId);
    }
  }

  async addPO() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.category) throw 'Please select deposit type';
    if (!this.investmentSubtype.tenure) throw 'Please select tenure';
    if (!this.investmentSubtype.start_date) throw 'Please select start date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Start date should be less than or equal to current date';

    if (this.investmentSubtype.category == 'Term Deposit' && !this.investmentSubtype.investment) throw 'Please enter principle amount';
    if (!this.investmentSubtype.ref) throw 'Please enter intrest percentage';

    var tenure = Number(this.investmentSubtype.tenure);
    this.investmentSubtype.maturity_date = moment(this.investmentSubtype.start_date).add(tenure, 'years');
    this.investmentSubtype.last_updated_date = new Date().getTime();


    var yearlyInterest = this.profitService.getCurrentValueForBank(this.investmentSubtype, [], 'CALCULATE_YEARLY_INTREST');

    this.investmentSubtype.tags = { tenure, yearlyInterest };

    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    if (this.investmentSubtype.category == 'Term Deposit') {
      let statement = {
        type: 'I',
        amount: this.investmentSubtype.investment * -1,
        ir_date: this.investmentSubtype.start_date,
        quantity: 1
      };
      await this.statementDBService.addStatement(this.userId, this.investmentId, investmentSubtypeId, statement);
      await this.dailySyncService.updatePostOffice_TD_Intress();
      await this.profitService.syncUser(this.userId);
    }
  }

  async addLIC() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.start_date) throw 'Please select start date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Start date should be less than or equal to current date';
    if (!this.investmentSubtype.policy_term) throw 'Please enter policy term';
    if (!this.investmentSubtype.installment_amount) throw 'Please enter installment amount';
    if (!this.investmentSubtype.maturity_amount) throw 'Please enter maturity amount';
    if (!this.investmentSubtype.investment_term_in_months) throw 'Please enter investment term in months';

    this.investmentSubtype.maturity_date = moment(this.investmentSubtype.start_date).add(this.investmentSubtype.policy_term, 'years');
    this.investmentSubtype.last_updated_date = new Date().getTime();
    this.investmentSubtype.tags = {
      assuredBonus: this.investmentSubtype.assuredBonus || 0,
      installmentAmount: this.investmentSubtype.installment_amount,
      investment_term_in_months: this.investmentSubtype.investment_term_in_months,
      isGSTApplicable: this.investmentSubtype.isGSTApplicable || false
    };

    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    if (this.investmentSubtype.autoAddStatement) {
      var start_date = moment(this.investmentSubtype.start_date);
      do {
        let statement: any = {
          type: 'I',
          additional_charges: this.investmentSubtype.tags.isGSTApplicable ? (this.investmentSubtype.installment_amount / 100) * 2.25 : 0,
          tags: { premium: this.investmentSubtype.installment_amount, late_fee: 0 },
          ir_date: start_date.valueOf(),
          quantity: 1
        };
        statement.amount = (this.investmentSubtype.installment_amount + statement.additional_charges) * -1
        await this.statementDBService.addStatement(this.userId, this.investmentId, investmentSubtypeId, statement);
        start_date.add(this.investmentSubtype.investment_term_in_months, 'months');
      } while (moment().diff(start_date) >= 0);
      await this.profitService.syncUser(this.userId);
    }
  }

  async addFinance() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.start_date) throw 'Please select start date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Start date should be less than or equal to current date';
    if (!this.investmentSubtype.investment) throw 'Please enter finance amount';
    if (!this.investmentSubtype.ref) throw 'Please enter monthly intrest percentage';
    this.investmentSubtype.tags = {
      intrest_payout_in_months: this.investmentSubtype.intrest_payout_in_months || 0
    };

    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);

    let statement = {
      type: 'I',
      amount: this.investmentSubtype.investment * -1,
      ir_date: this.investmentSubtype.start_date,
      quantity: 1
    };
    await this.statementDBService.addStatement(this.userId, this.investmentId, investmentSubtypeId, statement);

    await this.profitService.syncUser(this.userId);
  }

  async addCF() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.start_date) throw 'Please select start date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Start date should be less than or equal to current date';
    if (!this.investmentSubtype.installment_amount) throw 'Please enter installment amount';
    if (!this.investmentSubtype.installment_pay_at) throw 'Please select Installment Pay At';
    if (!this.investmentSubtype.approximate_no_of_installment) throw 'Please enter approximate number of installment';
    if (!this.investmentSubtype.maturity_amount) throw 'Please enter approximate Maturity Amount';

    this.investmentSubtype.tags = {
      installment_amount: this.investmentSubtype.installment_amount,
      installment_pay_at: this.investmentSubtype.installment_pay_at,
      approximate_no_of_installment: this.investmentSubtype.approximate_no_of_installment
    };

    this.investmentSubtype.maturity_date = this.getCFMaturityDate(this.investmentSubtype);

    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);
    if (this.investmentSubtype.autoAddInstallment) {
      await this.dailySyncService.cf_updateInvestment(investmentSubtypeId);
      await this.profitService.syncUser(this.userId);
    }
  }

  async addLent() {
    if (!this.investmentSubtype.name) throw 'Please enter name';
    if (!this.investmentSubtype.investment) throw 'Please enter lented amount';
    if (!this.investmentSubtype.start_date) throw 'Please select issued date';
    if (moment().diff(moment(this.investmentSubtype.start_date), 'days') < 0) throw 'Issued date should be less than or equal to current date';
    if (!this.investmentSubtype.maturity_date) throw 'Please select maturity date';
    if (moment().diff(moment(this.investmentSubtype.maturity_date), 'days') > 0) throw 'Maturity date should be future date';

    var investmentSubtypeId = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtype);

    let statement = {
      type: 'I',
      amount: this.investmentSubtype.investment * -1,
      ir_date: this.investmentSubtype.start_date,
      quantity: 1
    };
    await this.statementDBService.addStatement(this.userId, this.investmentId, investmentSubtypeId, statement);

    await this.profitService.syncUser(this.userId);
  }


  getCFMaturityDate(_investmentSubtype: any) {
    var noOfMonths = _investmentSubtype.tags.approximate_no_of_installment - 1;
    if (_investmentSubtype.tags.installment_pay_at == 'QUARTERLY') {
      noOfMonths *= 3;
    } else if (_investmentSubtype.tags.installment_pay_at == 'BI_MONTHLY') {
      noOfMonths *= 2;
    }
    return moment(_investmentSubtype.start_date).startOf('day').add(noOfMonths, 'months').valueOf();
  }

  async deleteInvestmentSubType(obj: any) {
    try {
      await this.ionicService.showLoader();
      if (this.investment.type == 'NPS') {
        await this.investmentSubtypeDBService.deleteInvestmentSubtypeByCategory(this.userId, this.investmentId, obj.category);
      } else {
        await this.investmentSubtypeDBService.deleteInvestmentSubtype(this.userId, this.investmentId, obj.id);
      }
      await this.profitService.syncUser(this.userId);
      await this.loadData();
      this.ionicService.hideLoader();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
      this.ionicService.hideLoader();
    }
  }

  // pop up modal1
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

  // modelClose() {
  //   this.modal.dismiss(null, 'cancel');
  //   this.investmentSubtype = {};
  // }
  cancelModalDismiss() {
    this.modalCntrl.dismiss();
    this.investmentSubtype = {};
  }

  /* MF Code Start */
  async searchByschemeCode(schemeCode: string) {
    try {
      await this.ionicService.showLoader();
      const fundDetails = await this.loadInvestmentSubType_MF(schemeCode);
      if (fundDetails == null) {
        this.ionicService.toster.error('Invalid Scheme Code');
      }
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  searchByMfName(searchText: string) {
    if (this.mfNameSearchTimer) clearTimeout(this.mfNameSearchTimer);
    this.mfNameSearchTimer = setTimeout(async () => {
      this.matchedMfList = await this.mfService.searchByFundName(searchText).toPromise();
    }, 500);
  }

  dropdown(event: any) {
    this.investmentSubtype.mf_name = event.schemeName;
    this.investmentSubtype.selectedSchemeName = event.schemeCode;
    this.matchedMfList = [];
  }

  searchDetails() {
    if (this.investmentSubtype.mf_code != null) {
      this.searchByschemeCode(this.investmentSubtype.mf_code);
    } else {
      this.searchByschemeCode(this.investmentSubtype.selectedSchemeName);
    }
  }

  async loadInvestmentSubType_MF(schemeCode: any) {
    const fundDetails = await this.getFundDetails(schemeCode);
    if (fundDetails) {
      this.investmentSubtype.name = fundDetails.name;
      this.investmentSubtype.category = fundDetails.category;
      this.investmentSubtype.ref = fundDetails.ref;
      this.investmentSubtype.amount_per_quantity = fundDetails.amount_per_quantity;
      this.investmentSubtype.price_updated_date = fundDetails.price_updated_date;
      this.investmentSubtype.last_updated_date = fundDetails.last_updated_date;
    }
    return fundDetails;
  }

  async getFundDetails(schemeCode: any) {
    var resp: any = null;
    const fundDetails = (await this.mfService.getLatestNavBySchemeCode(schemeCode).toPromise())[0];
    if (fundDetails) {
      resp = { quantity: 0, investment: 0, additional_charges: 0 };
      resp.name = fundDetails['Scheme Name'];
      resp.ref = fundDetails['Scheme Code'];
      resp.category = fundDetails['Mutual Fund Family'];
      resp.amount_per_quantity = Number(fundDetails['Net Asset Value']);
      resp.price_updated_date = new Date(fundDetails['Date']).getTime();
      resp.last_updated_date = new Date().getTime();
    }
    return resp;
  }
  /* MF Code End */

  // confirm delete function
  async confirmDelete(obj: any) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'You want to Delete ?',
      cssClass: 'custom-alert-style',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Delete',
          cssClass: 'alert-button-confirm',

          handler: () => {
            this.deleteInvestmentSubType(obj);
            this.investmentSubtype = {};
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

  onFileChange(event: any) {
    this.uploadCams.file = event.target.files[0];
    this.uploadCams.password = this.uploadCams.password || this.user.pan;
  }
  // upload camps sheet
  async uploadMfCamsFunc() {
    try {
      var noOfStatement: number = 0;
      await this.ionicService.showLoader();

      const result: any = await this.mfService.convertPDFToJSON(this.uploadCams.file, this.uploadCams.password);

      if (this.uploadCams.override) {
        await this.investmentSubtypeDBService.deleteInvestmentSubtypeByInvestment(this.userId, this.investmentId);
      }
      const amfiMap: any = {};
      const schemeAmfiMap: any = {};
      for (var i = 0; i < result.data.folios.length; i++) {
        const folio = result.data.folios[i];
        for (var j = 0; j < folio.schemes.length; j++) {
          const scheme = folio.schemes[j];
          if (Number(scheme.close) == 0) continue;
          var amfi: any = scheme.amfi;
          if (!amfi) {
            const schemeName = scheme.scheme.split(' - ISIN: ')[0].split(' (Non-Demat)')[0];
            if (schemeAmfiMap[schemeName]) {
              amfi = schemeAmfiMap[schemeName];
            } else {
              const schemeList = await this.mfService.searchByFundName(schemeName).toPromise();
              const fund = schemeList.find((obj: any) => obj.schemeName == schemeName);
              if (fund) {
                amfi = fund.schemeCode;
                schemeAmfiMap[schemeName] = amfi;
              } else throw `SchemeCode not found for the scheme '${scheme.scheme}'`;
            }
          }
          var details: any = amfiMap[amfi];
          if (!details) {
            details = await this.getFundDetails(amfi);
            if (!details) throw `Fund Details not found for amfi [${amfi}] and Scheme Name [${scheme.scheme}]`;
            if (this.uploadCams.override) {
              details.id = await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, details);
            } else {
              const existingInvestmentSubtype = await this.investmentSubtypeDBService.getInvestmentSubtypeByName(this.userId, this.investmentId, details.name);
              details.id = existingInvestmentSubtype?.id || await this.investmentSubtypeDBService.addInvestmentSubtype(this.userId, this.investmentId, details);
            }
            amfiMap[amfi] = details;
          }
          await Promise.all(scheme.transactions.map(async (transaction: any, index: number) => {
            if (transaction.amount == null) return;
            const statement: any = {
              ir_date: transaction.date,
              description: transaction.description,
              amount: Number(transaction.amount) * -1,
              quantity: Number(transaction.units),
              amount_per_quantity: Number(transaction.nav),
              additional_charges: 0
            };
            const type = transaction.type;
            const nextTransaction: any = scheme.transactions[index + 1] || {};
            if (type == 'PURCHASE' || type == 'PURCHASE_SIP') {
              if (nextTransaction.type == 'REVERSAL') return;
              if (nextTransaction.type == 'REDEMPTION' && transaction.date == nextTransaction.date && transaction.units == nextTransaction.units * -1) return;
              if (nextTransaction.type == 'STAMP_DUTY_TAX') {
                statement.additional_charges = Number(nextTransaction.amount) * -1;
                statement.amount += statement.additional_charges;
              }
              statement.type = 'I'
            } else if (type == 'REDEMPTION') {
              var previousTransaction = scheme.transactions[index - 1] || {};
              if ((previousTransaction.type == 'PURCHASE' || previousTransaction.type == 'PURCHASE_SIP') && transaction.date == previousTransaction.date && transaction.units * -1 == previousTransaction.units) return;
              statement.type = 'R';
            } else if (type == 'REVERSAL' || type == 'STAMP_DUTY_TAX' || type == 'STT_TAX') {
              return;
            } else throw 'New type detected (' + type + ')';
            if (this.uploadCams.override) {
              await this.statementDBService.addStatement(this.userId, this.investmentId, details.id, statement);
              noOfStatement++;
            } else {
              const existingStatement = await this.statementDBService.getStatement(details.id, statement.type, statement.amount, statement.ir_date);
              if (!existingStatement) {
                await this.statementDBService.addStatement(this.userId, this.investmentId, details.id, statement);
                noOfStatement++;
              }
            }
          }));
        }
      }
      await this.profitService.syncUser(this.userId);
      this.ionicService.toster.success(`Mutual Fund Updated Successfully. ${noOfStatement} Entry Detected`);
      this.cancelModalDismiss()
      await this.loadData();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  reset() {
    this.investmentSubtype = {};
  }

  // find current date.... (calc number of days from started)
  calculateDiff(dataStart: any) {
    let currentDate = new Date();
    dataStart = new Date(dataStart);
    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dataStart.getFullYear(), dataStart.getMonth(), dataStart.getDate())) / (1000 * 60 * 60 * 24));
  }

  calculateFDMaturity() {
    if (this.investmentSubtype.category == 'Fixed Deposit') {
      var principle = this.investmentSubtype.investment;
      var percentage = this.investmentSubtype.ref;
      var start_date = this.investmentSubtype.start_date;
      var maturity_date = this.investmentSubtype.maturity_date;
      if (principle && percentage && start_date && maturity_date) {
        this.investmentSubtype.maturity_amount = this.profitService.getCurrentValueForBank(this.investmentSubtype, [], 'CALCULATE_MATURITY_AMOUNT');
      }
    } else {
      this.investmentSubtype.maturity_amount = 0;
    }
  }

  async showInvestmentEditView() {
    this.editInvestment = JSON.parse(JSON.stringify(this.investment));
    await this.editInvestmentModal.present();
  }

  async updateInvestment() {
    await this.ionicService.showLoader();
    try {
      await this.investmentDBService.updateWalletBalance(this.userId, this.investmentId, this.editInvestment.wallet_balance);
      this.editInvestmentModal.dismiss(null, 'cancel');
      await this.profitService.syncUser(this.userId);
      await this.loadData();
      this.ionicService.toster.success('Wallet Balance Updated Successfully');
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async showEditView(investmentSubtype: any) {
    this.editInvestmentSubtype = JSON.parse(JSON.stringify(investmentSubtype));
    this.editInvestmentSubtype.tags = this.editInvestmentSubtype.tags || {};
    await this.editInvestmentSubtypeModal.present();
  }

  async updateInvestmentSubType() {
    await this.ionicService.showLoader();
    try {
      if (this.investment.type == 'LIC') {
        await this.investmentSubtypeDBService.updateLICDetails(this.userId, this.investmentId, this.editInvestmentSubtype);
      } else if (this.investment.type == 'SM') {
        if (this.editInvestmentSubtype.category == 'SM-STOCKS') {
          await this.investmentSubtypeDBService.updateSMStockDetails(this.userId, this.investmentId, this.editInvestmentSubtype);
        } else {
          this.editInvestmentSubtype.tags.current_value = this.editInvestmentSubtype.tags.current_value || 0;
          await this.investmentSubtypeDBService.updateSMOrSGBDetails(this.userId, this.investmentId, this.editInvestmentSubtype);
        }
      } else if (this.investment.type == 'CF') {
        this.editInvestmentSubtype.maturity_date = this.getCFMaturityDate(this.editInvestmentSubtype);
        await this.investmentSubtypeDBService.updateCFDetails(this.userId, this.investmentId, this.editInvestmentSubtype);
      } else if (this.investment.type == 'BANK') {
        await this.investmentSubtypeDBService.updateBANKDetails(this.userId, this.investmentId, this.editInvestmentSubtype);
      }
      await this.profitService.syncUser(this.userId);
      await this.loadData();
      this.editInvestmentSubtypeModal.dismiss(null, 'cancel');
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async generateCAMS() {
    try {
      await this.ionicService.showLoader();
      var { period, startDate, endDate } = this.camsData;
      if (period == 'ALL') {
        startDate = '01-Jan-1970';
        endDate = moment().format('DD-MMM-YYYY');
      } else if (period == 'CURRENT_MONTH') {
        startDate = moment().startOf("month").format('DD-MMM-YYYY');
        endDate = moment().format('DD-MMM-YYYY');
      } else if (period == 'CURRENT_AND_PREVIOUS_MONTH') {
        startDate = moment().add(-1, "month").startOf("month").format('DD-MMM-YYYY');
        endDate = moment().format('DD-MMM-YYYY');
      } else if (period == 'CUSTOM') {
        if (!startDate) throw 'Please select start date';
        if (!endDate) throw 'Please select end date';
        var startDateMoment = moment(startDate);
        var endDateMoment = moment(endDate);
        if (moment().diff(startDateMoment) > 0) throw 'Start date should not greater than today date';
        if (moment().diff(endDateMoment) > 0) throw 'End date should not greater than today date';
        if (startDateMoment.diff(endDateMoment) > 0) throw 'Start date should be less than end date';
        startDate = moment(startDate).format('DD-MMM-YYYY');
        endDate = moment(endDate).format('DD-MMM-YYYY');
      } else {
        throw 'Invalid CAMS Statement Period';
      }
      this.isCAMSGenerated = await this.mfService.openInAppBrowser(this.user, { startDate, endDate }) as boolean;
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

}

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
import { ExportService } from '../services/db/export.service';

import * as moment from 'moment';

@Component({
  selector: 'app-statement-page',
  templateUrl: './statement-page.component.html',
  styleUrls: ['./statement-page.component.scss'],
})
export class StatementPageComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal: any;
  @ViewChild('uploadModal', { static: true }) uploadModal: any;

  userId: any;
  investmentId: any
  investmentSubtypeId: any
  npsSchemeList: any = [];

  investment: any = {};
  investmentSubtype: any = {};
  statementList: any = [];

  uploadDetails: any = {};

  statement: any = {};

  shareNameList: any = [];

  showSuggestions: boolean = false;

  fieldDetails: any = {
    'MF': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Stamp Duty', attr: 'additional_charges', isAmount: true, precision: '.2-2' },
      { name: 'No. of Units', attr: 'quantity' },
      { name: 'Nav', attr: 'amount_per_quantity', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'NPS': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Transactional Charges', attr: 'additional_charges', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'SGB': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Additional Charges', attr: 'additional_charges', isAmount: true, precision: '.2-2' },
      { name: 'No. of Grams', attr: 'quantity' },
      { name: 'Amount per Gram', attr: 'amount_per_quantity', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'BANK': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'PO': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'PPF': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.0-0' },
      { name: 'Type', attr: 'type_name' }
    ],
    'LIC': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' },
      { name: 'Late Fee', attr: 'late_fee', isAmount: true, precision: '.0-2' },
      { name: 'Tax', attr: 'additional_charges', isAmount: true, precision: '.0-2' }
    ],
    'SM': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' },
      { name: 'Dividend Share Name', attr: 'description', isCustomField: true }
    ],
    'FINANCE': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'EPF': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.0-2' },
      { name: 'Type', attr: 'type_name' },
      { name: 'Employee Share', attr: 'employee_share', isAmount: true, precision: '.0-2' },
      { name: 'Employer Share', attr: 'employer_share', isAmount: true, precision: '.0-2' },
      { name: 'Pension', attr: 'pension', isAmount: true, precision: '.0-2' },
      { name: 'Voluntary Provident Fund', attr: 'vpf', isAmount: true, precision: '.0-2' }
    ],
    'CF': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ],
    'LENT': [
      { name: 'Amount', attr: 'amount', isAmount: true, precision: '.2-2' },
      { name: 'Type', attr: 'type_name' }
    ]
  };

  uploadColumnDetails: any = {
    'NPS': [
      { name: 'Type', attr: 'type', data: 'I/C/RB-R/RB-I' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' },
      { name: 'Rebalancing - E', attr: 'rebalancing_e', type: 'AMOUNT' },
      { name: 'Rebalancing - C', attr: 'rebalancing_c', type: 'AMOUNT' },
      { name: 'Rebalancing - G', attr: 'rebalancing_g', type: 'AMOUNT' }
    ],
    'BANK': [
      { name: 'Type', attr: 'type', data: 'I/R' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' }
    ],
    'SGB': [
      { name: 'Type', attr: 'type', data: 'I/R/D' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Number of Grams', attr: 'quantity', type: 'QUANTITY' },
      { name: 'Amount per Grams', attr: 'amount_per_quantity', type: 'AMOUNT' },
      { name: 'Additional Charges', attr: 'additional_charges', type: 'AMOUNT' }
    ],
    'PPF': [
      { name: 'Type', attr: 'type', data: 'I' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' }
    ],
    'LIC': [
      { name: 'Type', attr: 'type', data: 'I' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' },
      { name: 'Late Fee', attr: 'late_fee', type: 'AMOUNT' }
    ],
    'SM': [
      { name: 'Type', attr: 'type', data: 'I/D' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' },
      { name: 'Dividend Share Name', attr: 'description' }
    ],
    'FINANCE': [
      { name: 'Type', attr: 'type', data: 'I/R' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' }
    ],
    'CF': [
      { name: 'Type', attr: 'type', data: 'I/R' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Amount', attr: 'amount', type: 'AMOUNT' }
    ],
    'EPF': [
      { name: 'Type', attr: 'type', data: 'I' },
      { name: 'Date', attr: 'ir_date' },
      { name: 'Employee Share', attr: 'employee_share', type: 'AMOUNT' },
      { name: 'Employer Share', attr: 'employer_share', type: 'AMOUNT' },
      { name: 'Pension', attr: 'pension', type: 'AMOUNT' },
      { name: 'Voluntary Provident Fund', attr: 'vpf', type: 'AMOUNT' }
    ]
  };

  constructor(private investmentDBService: InvestmentDBService, private investmentSubtypeDBService: InvestmentSubtypeDBService, private animationCtrl: AnimationController,
    private statementDBService: StatementDBService, private actRouter: ActivatedRoute, public ionicService: IonicService, private alertController: AlertController, private exportService: ExportService,
    private mfService: MFService, private npsService: NPSService, private sgbService: SGBService, public profitService: ProfitService, private modalCntrl: ModalController) {
    this.actRouter.paramMap.subscribe((param: Params) => {
      this.userId = JSON.parse(param['get']('user_id'));
      this.investmentId = JSON.parse(param['get']('investment_id'));
      this.investmentSubtypeId = JSON.parse(param['get']('sub_type_id'));
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
      await this.loadAllData();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async loadAllData() {
    await Promise.all([this.getInvestmentById(), this.getInvestmentSubtypeById()]);
    if (this.investmentSubtype.tags) this.investmentSubtype.tags = JSON.parse(this.investmentSubtype.tags);
    if (this.investment.type == 'NPS') {
      var nameSplit = this.investmentSubtype.name.split('-');
      this.investmentSubtype.name = nameSplit[0] + ' - ' + nameSplit[2] + ' Account';
      var tags = this.investmentSubtype.tags;
      this.investmentSubtype.investment = tags.investment;
      this.investmentSubtype.current_value = tags.current_value;
      this.investmentSubtype.xirr = tags.xirr;
      this.investmentSubtype.hpr = tags.hpr;

      const orderList: any = ['Scheme E', 'Scheme C', 'Scheme G'];
      this.npsSchemeList = await this.getAllInvestmentSubtypeByCategory(this.investmentSubtype.category);
      this.npsSchemeList.forEach((npsScheme: any) => npsScheme.tags = JSON.parse(npsScheme.tags));
      this.npsSchemeList.sort((a: any, b: any) => {
        return orderList.indexOf(a.scheme) < orderList.indexOf(b.scheme) ? -1 : 1;
      });
      this.statementList = [];
      const statementList: any = await this.statementDBService.getAllStatementByInvestmentAndCategory(this.userId, this.investmentId, this.investmentSubtype.category);
      var previousStatement: any = {};
      statementList.forEach((statement: any) => {
        statement.tags = JSON.parse(statement.tags);

        if (previousStatement.ir_date != statement.ir_date || previousStatement.type != statement.type) {
          previousStatement = statement;

          previousStatement.idList = [];
          previousStatement.amount_e = 0;
          previousStatement.quantity_e = 0;
          previousStatement.amount_per_quantity_e = 0;

          previousStatement.amount_c = 0;
          previousStatement.quantity_c = 0;
          previousStatement.amount_per_quantity_c = 0;

          previousStatement.amount_g = 0;
          previousStatement.quantity_g = 0;
          previousStatement.amount_per_quantity_g = 0;


          this.statementList.push(previousStatement);
        } else {
          previousStatement.amount += statement.amount;
        }
        if (statement.tags.scheme == 'E') {
          previousStatement.idList.push(statement.id);
          previousStatement.allocation_e = statement.tags.allocation;
          previousStatement.amount_e += statement.amount;
          previousStatement.quantity_e += statement.quantity;
          previousStatement.amount_per_quantity_e += statement.amount_per_quantity;
        } else if (statement.tags.scheme == 'C') {
          previousStatement.idList.push(statement.id);
          previousStatement.allocation_c = statement.tags.allocation;
          previousStatement.amount_c += statement.amount;
          previousStatement.quantity_c += statement.quantity;
          previousStatement.amount_per_quantity_c += statement.amount_per_quantity;
        } else if (statement.tags.scheme == 'G') {
          previousStatement.idList.push(statement.id);
          previousStatement.allocation_g = statement.tags.allocation;
          previousStatement.amount_g += statement.amount;
          previousStatement.quantity_g += statement.quantity;
          previousStatement.amount_per_quantity_g += statement.amount_per_quantity;
        }
      });
    } else {
      await this.getAllStatement();
    }
    if (this.investment.type == 'SM') {
      this.shareNameList = await this.statementDBService.getDistinctShareName(this.investmentSubtypeId);
    }
    this.statementList.forEach((statement: any) => {
      var tags = typeof (statement.tags) == 'string' ? JSON.parse(statement.tags || '{}') : statement.tags;
      if (this.investment.type == 'MF') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
          statement.additional_charges *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Sell';
          statement.additional_charges *= -1;
          statement.quantity *= -1;
        }
      } else if (this.investment.type == 'NPS') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
          statement.additional_charges *= -1;
        } else if (statement.type == 'C') {
          statement.type_name = 'Service Charges';
          statement.amount *= -1;
        } else if (statement.type == 'RB-R') {
          statement.type_name = 'Rebalancing Assets (Sell)';
          statement.amount *= -1;
        } else if (statement.type == 'RB-I') {
          statement.type_name = 'Rebalancing Assets (Buy)';
          statement.amount *= -1;
        }
      } else if (this.investment.type == 'SGB') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
          statement.additional_charges *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Sell';
          statement.additional_charges *= -1;
          statement.quantity *= -1;
        } else if (statement.type == 'D') {
          statement.type_name = 'Intrest';
        }
      } else if (this.investment.type == 'BANK') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Sell';
        }
      } else if (this.investment.type == 'PO') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Intrest Credited';
        }
      } else if (this.investment.type == 'PPF') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        }
      } else if (this.investment.type == 'LIC') {
        statement.late_fee = tags.late_fee || 0;
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        }
      } else if (this.investment.type == 'SM') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        } else if (statement.type == 'D') {
          statement.type_name = 'Dividend';
        }
      } else if (this.investment.type == 'FINANCE') {
        if (statement.type == 'I') {
          statement.type_name = 'Buy';
          statement.amount *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Intrest';
        }
      } else if (this.investment.type == 'EPF') {
        if (statement.type == 'I') {
          statement.type_name = 'Investment';
          statement.amount *= -1;
          statement.amount + statement.pension;
        }
      } else if (this.investment.type == 'CF') {
        if (statement.type == 'I') {
          statement.type_name = 'Investment';
          statement.amount *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Return';
        }
      } else if (this.investment.type == 'LENT') {
        if (statement.type == 'I') {
          statement.type_name = 'Issued';
          statement.amount *= -1;
        } else if (statement.type == 'R') {
          statement.type_name = 'Return';
        }
      }
    });
  }

  async getInvestmentById() {
    this.investment = await this.investmentDBService.getInvestmentTypeById(this.userId, this.investmentId);
  }

  async getInvestmentSubtypeById() {
    this.investmentSubtype = await this.investmentSubtypeDBService.getInvestmentSubtypeById(this.investmentSubtypeId);
  }

  async getAllStatement() {
    this.statementList = await this.statementDBService.getAllStatementBySubType(this.userId, this.investmentId, this.investmentSubtypeId);
  }

  async getAllInvestmentSubtypeByCategory(category: string) {
    return await this.investmentSubtypeDBService.getAllInvestmentSubtypeByCategory(this.userId, this.investmentId, category);
  }


  onFileChange(event: any) {
    this.uploadDetails.file = event.target.files[0];
  }

  async initUploadStatement() {
    this.uploadDetails = {};
    this.uploadModal.present();
  }

  async downloadTemplate() {
    try {
      var fieldList: any = this.uploadColumnDetails[this.investment.type] || [];
      if (fieldList.length == 0) return;

      await this.ionicService.showLoader();
      var header: any = [];
      var body: any = [];
      fieldList.forEach((field: any) => {
        header.push(field.name);
        body.push(field.data);
      });

      let csv = [];
      csv.push(header.join(','));
      csv.push(body.join(','));
      let csvArray = csv.join('\r\n');

      this.exportService.save('My Assets/Templates', `${this.investment.type}-Template.csv`, csvArray);
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async uploadStatement() {
    try {
      var fieldList: any = this.uploadColumnDetails[this.investment.type] || [];
      await this.ionicService.showLoader();
      if (!this.uploadDetails.file) throw 'Please upload csv file';
      if (!this.uploadDetails.file.name.endsWith('.csv')) throw 'Please upload only csv file';

      let reader = new FileReader();
      reader.onload = async () => {
        let csvData: any = reader.result;
        let csvRecordsArray: any = csvData.trim().split(/\r\n|\n/);
        if (csvRecordsArray.length < 2) throw 'No data found in the file';

        let headers = csvRecordsArray.shift().split(',');
        if (fieldList.length != headers.length) throw 'CSV should have only ' + fieldList.length + ' Column';
        if (this.uploadDetails.override) {
          if (this.investment.type == 'NPS') {
            await this.statementDBService.deleteAllStatementByInvestmentSubtypeCategory(this.userId, this.investmentId, this.investmentSubtype.category);
          } else {
            await this.statementDBService.deleteAllStatementByInvestmentSubtype(this.userId, this.investmentId, this.investmentSubtypeId);
          }
        }
        if (this.investment.type == 'NPS') {
          await Promise.all(this.npsSchemeList.map(async (npsScheme: any) => await this.npsService.geNavHistory(npsScheme.ref)));
        }

        await Promise.all(csvRecordsArray.map(async (data: any) => {
          let statement: any = {};
          let dataList = data.split(',');
          fieldList.forEach((field: any, index: number) => {
            if (field.type == 'AMOUNT' || field.type == 'QUANTITY') {
              statement[field.attr] = Number(dataList[index]);
            } else {
              statement[field.attr] = dataList[index]
            }
          });
          await this._addStatement(statement, true);
        }));

        await this.profitService.syncUser(this.userId);
        await this.loadAllData();
        this.ionicService.hideLoader();
        this.uploadModal.dismiss(null, 'cancel');
      };
      reader.readAsText(this.uploadDetails.file);

    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
      this.ionicService.hideLoader();
    }
  }

  getLastInvestmentStatement() {
    return this.statementList.filter((obj: any) => obj.type == 'I').sort((a: any, b: any) => b.ir_date - a.ir_date)[0];;
  }

  initAddStatement(isUploadCsv?: boolean) {
    this.statement = {};
    if (isUploadCsv) {
      this.initUploadStatement();
    } else {
      if (this.investment.type == 'LIC') {
        const { installmentAmount } = this.investmentSubtype.tags;
        this.statement = { type: 'I', amount: installmentAmount };
      } else if (this.investment.type == 'EPF') {
        const lastStatement = this.getLastInvestmentStatement();
        if (lastStatement) {
          const nextInvestmentDate = moment(lastStatement.ir_date).add(1, "month");
          if (moment().diff(nextInvestmentDate, "days") >= 0) {
            const { type, employee_share, employer_share, pension, vpf } = lastStatement;
            this.statement = { type, ir_date: nextInvestmentDate.format('YYYY-MM-DD'), employee_share, employer_share, pension, vpf };
          }
        }
      } else if (this.investment.type == 'MF') {
        const lastStatement = this.getLastInvestmentStatement();
        if (lastStatement) {
          const { type, amount } = lastStatement;
          this.statement = { type, amount };
        }
      }
    }
  }

  async addStatement() {
    var statement = JSON.parse(JSON.stringify(this.statement));
    await this._addStatement(statement);
  }

  async _addStatement(statement: any, isUpload: boolean = false) {
    try {
      if (!isUpload) await this.ionicService.showLoader();

      if (this.investment.type == 'MF') {
        await this.addMF(statement);
      } else if (this.investment.type == 'NPS') {
        await this.addNPS(statement);
      } else if (this.investment.type == 'SGB') {
        await this.addSGB(statement);
      } else if (this.investment.type == 'BANK') {
        await this.addBank(statement);
      } else if (this.investment.type == 'PPF') {
        await this.addPPF(statement);
      } else if (this.investment.type == 'LIC') {
        await this.addLIC(statement);
      } else if (this.investment.type == 'SM') {
        await this.addSM(statement);
      } else if (this.investment.type == 'FINANCE') {
        await this.addFinance(statement);
      } else if (this.investment.type == 'EPF') {
        await this.addEPF(statement);
      } else if (this.investment.type == 'CF') {
        await this.addCF(statement);
      } else if (this.investment.type == 'LENT') {
        await this.addLent(statement);
      } else throw 'DEV In-Progress';

      if (!isUpload) {
        await this.profitService.syncUser(this.userId);
        await this.loadAllData();
        this.cancelModalDismiss();
      }
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    if (!isUpload) this.ionicService.hideLoader();
  }

  async addMF(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (statement.type == 'I') {
      if (!statement.ir_date) throw 'Please Select Date';
      if (!statement.amount) throw 'Please Enter Amount';
      if (!statement.amount_per_quantity) throw 'Please Enter NAV';
      if (!statement.quantity) throw 'Please Enter Units';
      statement.amount *= -1;
    } else {
      throw 'DEV In-Progress';
    }
    statement.additional_charges *= -1;

    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addNPS(statement: any) {
    if (!statement.type) throw 'Please Select Type';

    if (!statement.ir_date) throw 'Please Select Date';
    if ((statement.type == 'RB-I' || statement.type == 'RB-R')) {
      statement.rebalancing_e = statement.rebalancing_e || 0;
      statement.rebalancing_c = statement.rebalancing_c || 0;
      statement.rebalancing_g = statement.rebalancing_g || 0;
      if (!statement.rebalancing_e && !statement.rebalancing_c && !statement.rebalancing_g) throw 'Please Enter Rebalancing Amount for atleast one of (E/C/G)';
    } else {
      if (!statement.amount) throw 'Please Enter Amount';
    }

    await this.loadNpsData(statement);

    //Scheme E
    statement.amount = statement.type == "RB-R" ? statement.amount_e : statement.amount_e * -1;
    statement.quantity = statement.quantity_e;
    if (['C', 'RB-R'].indexOf(statement.type) != -1) statement.quantity *= -1;
    statement.amount_per_quantity = statement.amount_per_quantity_e;
    statement.tags = { allocation: statement.allocation_e, scheme: 'E' };
    await this.statementDBService.addStatement(this.userId, this.investmentId, statement.investmentSubtypeId_e, statement);

    //Scheme C
    statement.amount = statement.type == "RB-R" ? statement.amount_c : statement.amount_c * -1;
    statement.quantity = statement.quantity_c;
    if (['C', 'RB-R'].indexOf(statement.type) != -1) statement.quantity *= -1;
    statement.amount_per_quantity = statement.amount_per_quantity_c;
    statement.tags = { allocation: statement.allocation_c, scheme: 'C' };
    await this.statementDBService.addStatement(this.userId, this.investmentId, statement.investmentSubtypeId_c, statement);

    //Scheme G
    statement.amount = statement.amount_g * -1;
    statement.amount = statement.type == "RB-R" ? statement.amount_g : statement.amount_g * -1;
    statement.quantity = statement.quantity_g;
    if (['C', 'RB-R'].indexOf(statement.type) != -1) statement.quantity *= -1;
    statement.amount_per_quantity = statement.amount_per_quantity_g;
    statement.tags = { allocation: statement.allocation_g, scheme: 'G' };
    await this.statementDBService.addStatement(this.userId, this.investmentId, statement.investmentSubtypeId_g, statement);

  }

  async addSGB(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (new Date(statement.ir_date).getTime() < new Date(this.investmentSubtype.issued_date).getTime()) throw 'Date range should be greater than or equal to issued date';
    if (!statement.quantity) throw 'Please Enter Number of Grams';
    if (!statement.amount_per_quantity) throw 'Please Enter Amount per Grams';

    if (statement.type == 'R') {
      statement.quantity *= -1;
    }

    statement.amount = (statement.amount_per_quantity * statement.quantity) + (statement.additional_charges || 0);
    statement.amount *= -1;
    statement.additional_charges *= -1;

    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
    await this.sgbService.syncIntrest(this.investmentSubtypeId);
  }

  async addBank(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (moment(this.investmentSubtype.start_date).startOf('day').diff(moment(statement.ir_date).startOf('day'), 'days') >= 0) throw 'Date range should be greater than or equal to investment start date';
    if (!statement.amount) throw 'Please Enter Amount';
    statement.quantity = 1;
    statement.amount *= -1;

    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addPPF(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (new Date(statement.ir_date).getTime() < new Date(this.investmentSubtype.start_date).getTime()) throw 'Date range should be greater than or equal to investment start date';
    if (!statement.amount) throw 'Please Enter Amount';
    statement.quantity = 1;
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addLIC(statement: any) {
    const { installmentAmount, isGSTApplicable } = this.investmentSubtype.tags;

    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (new Date(statement.ir_date).getTime() < new Date(this.investmentSubtype.start_date).getTime()) throw 'Date range should be greater than or equal to investment start date';
    if (!statement.amount) throw 'Please enter amount';
    if (installmentAmount > statement.amount) throw 'Installment amount should be greater than or equal to (' + installmentAmount + ')';
    statement.quantity = 1;
    statement.tags = { premium: statement.amount, late_fee: statement.late_fee || 0 };
    if (statement.type == 'I') {
      statement.additional_charges = isGSTApplicable ? ((statement.tags.premium + statement.tags.late_fee) / 100) * 2.25 : 0;
      statement.amount = (statement.amount + statement.additional_charges) * -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addSM(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (!statement.amount) throw 'Please enter amount';
    if (statement.type == 'D' && !statement.description) throw 'Please enter description';
    if (statement.type != 'D' && statement.description) statement.description = '';
    statement.quantity = 1;
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addFinance(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (!statement.amount) throw 'Please enter amount';
    statement.quantity = 1;
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addEPF(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (!statement.employee_share) throw 'Please enter Employee Share';
    if (!statement.employer_share) throw 'Please enter Employer Share';

    statement.pension = statement.pension || 0;
    statement.vpf = statement.vpf || 0;

    statement.amount = statement.employee_share + statement.employer_share + statement.vpf;

    statement.quantity = 1;
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addCF(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (!statement.amount) throw 'Please Enter Amount';
    statement.quantity = 1;
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async addLent(statement: any) {
    if (!statement.type) throw 'Please Select Type';
    if (!statement.ir_date) throw 'Please Select Date';
    if (moment(this.investmentSubtype.start_date).startOf('day').diff(moment(statement.ir_date).startOf('day'), 'days') >= 0) throw 'Date range should be greater than issued date';
    if (!statement.amount) throw 'Please Enter Amount';
    if (statement.type == 'I') {
      statement.amount *= -1;
    }
    statement.quantity = 1;
    await this.statementDBService.addStatement(this.userId, this.investmentId, this.investmentSubtypeId, statement);
  }

  async deleteStatement(obj: any) {
    try {
      await this.ionicService.showLoader();
      if (this.investment.type == 'NPS') {
        await Promise.all(obj.idList.map(async (id: any) => await this.statementDBService.deleteStatement(id)));
      } else {
        await this.statementDBService.deleteStatement(obj.id);
      }

      if (this.investment.type == 'SGB') {
        await this.sgbService.syncIntrest(this.investmentSubtypeId);
      }
      await this.profitService.syncUser(this.userId);
      await this.loadAllData();
      this.cancelModalDismiss();
    } catch (err: any) {
      this.ionicService.toster.error(err.message || err);
    }
    this.ionicService.hideLoader();
  }

  async loadData() {
    if (['MF'].indexOf(this.investment.type) != -1) {
      try {
        if (this.statement.type && this.statement.amount && this.statement.ir_date) {
          await this.ionicService.showLoader();
          if (this.investment.type == 'MF') {
            await this.loadMfStampDutyAndNAV();
          }
        }
      } catch (err: any) {
        this.ionicService.toster.error(err.message || err);
      }
      this.ionicService.hideLoader();
    }
  }

  async loadMfStampDutyAndNAV() {
    if (this.statement.type == 'I') {
      this.statement.additional_charges = Number(((this.statement.amount / 100) * 0.005).toFixed(2));
      const mfNavHistory = await this.mfService.getNavHistoryBySchemeCode(this.investmentSubtype.ref).toPromise();
      if (mfNavHistory && mfNavHistory.data) {
        const selectedDate = moment(this.statement.ir_date).format('DD-MM-YYYY');
        var navDetails = mfNavHistory.data.find((data: any) => data.date == selectedDate);
        if (!navDetails) {
          const latestNAV = (await this.mfService.getLatestNavBySchemeCode(this.investmentSubtype.ref).toPromise())[0];
          if (latestNAV && latestNAV.Date == moment(this.statement.ir_date).format('DD-MMM-YYYY')) {
            navDetails = { nav: latestNAV['Net Asset Value'] };
          }
        }
        if (navDetails) {
          this.statement.amount_per_quantity = navDetails.nav;
          this.statement.quantity = Number(((this.statement.amount - this.statement.additional_charges) / this.statement.amount_per_quantity).toFixed(3));
        } else throw 'NAV not found for the selected date';
      } else throw 'Date Not Found for this scheme';
    } else {
      this.statement.additional_charges = 0;
    }
  }

  async loadNpsData(statement: any) {
    const isRebalancing = (statement.type == 'RB-I' || statement.type == 'RB-R');
    const selectedDate = moment(statement.ir_date).format('YYYY-MM-DD');
    await Promise.all(this.npsSchemeList.map(async (npsScheme: any, index: number) => {
      var navList = await this.npsService.geNavHistory(npsScheme.ref);
      var navDetails = navList.find(((navObj: any) => navObj.date == selectedDate));
      if (navDetails) {
        if (index == 0) {
          statement.investmentSubtypeId_e = npsScheme.id;
          statement.allocation_e = npsScheme.tags.allocation;
          statement.amount_e = statement.amount_e || (isRebalancing ? statement.rebalancing_e : (statement.amount / 100) * statement.allocation_e);
          statement.amount_per_quantity_e = navDetails.nav;
          statement.quantity_e = Number((statement.amount_e / statement.amount_per_quantity_e).toFixed(4));
        } else if (index == 1) {
          statement.investmentSubtypeId_c = npsScheme.id;
          statement.allocation_c = npsScheme.tags.allocation;
          statement.amount_c = statement.amount_c || (isRebalancing ? statement.rebalancing_c : (statement.amount / 100) * statement.allocation_c);
          statement.amount_per_quantity_c = navDetails.nav;
          statement.quantity_c = Number((statement.amount_c / statement.amount_per_quantity_c).toFixed(4));
        } else if (index == 2) {
          statement.investmentSubtypeId_g = npsScheme.id;
          statement.allocation_g = npsScheme.tags.allocation;
          statement.amount_g = statement.amount_g || (isRebalancing ? statement.rebalancing_g : (statement.amount / 100) * statement.allocation_g);
          statement.amount_per_quantity_g = navDetails.nav;
          statement.quantity_g = Number((statement.amount_g / statement.amount_per_quantity_g).toFixed(4));
        }
      } else throw 'NAV not found for the selected date';
    }));
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

  cancelModalDismiss() {
    try {
      this.statement = {};
      this.modalCntrl.dismiss();
    } catch (e) {
      console.error(e);
    }
  }

  // confirm delete function
  async confirmDelete(obj: any) {
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
            this.deleteStatement(obj);
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

}

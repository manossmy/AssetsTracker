import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicService } from './ionic.service';
import { ProfitService } from './profit.service';
import { InvestmentSubtypeDBService } from './db/investment-subtype-db.service';
import { MFService } from './mf.service';
import { NPSService } from './nps.service';
import { SGBService } from './sgb.service';
import { StatementDBService } from './db/statement-db.service';
import { IntrestDBService } from './db/intrest-db.service';
import PPF_INTREST_LIST from './json/ppf_intrest.json';
import EPF_INTREST_LIST from './json/epf_intrest.json';

import * as moment from 'moment';
import { AppSettingsDBService } from './db/app-settings-db.service';
import { SMService } from './sm.service';

@Injectable({
    providedIn: 'root'
})
export class DailySyncService {

    constructor(private http: HttpClient, private profitService: ProfitService, private mfService: MFService,
        private npsService: NPSService, private sgbService: SGBService, private intrestDBService: IntrestDBService,
        private appSettingsDBService: AppSettingsDBService, private ionicService: IonicService, private smService: SMService,
        private investmentSubtypeDBService: InvestmentSubtypeDBService, private statementDBService: StatementDBService) { }

    currentSyncTime: any = null
    lastSyncTime: any = null;

    async forceSync() {
        await this.sync(true);
    }

    async sync(isForceSync: boolean = false) {
        this.profitService.isCalculationInProgress = true;
        await this.loadDefaultData();
        var lastSyncTime = isForceSync ? null : (await this.ionicService.storage.get("INVESTMENT-LAST-SYNC-TIME") || null);
        this.lastSyncTime = lastSyncTime ? new Date(Number(lastSyncTime)) : null;
        this.currentSyncTime = new Date();
        const results: any = await Promise.all([this.mf_nps_validateAndSync(), this.sm_validateAndSync(), this.sgb_validateAndSync(), this.po_validateAndSync(), this.cf_validateAndSync(), this.bank_validateAndSync()]);
        if (isForceSync || results.find((data: any) => data == true)) {
            await this.profitService.syncAllUser();
        }
        await this.ionicService.storage.set("INVESTMENT-LAST-SYNC-TIME", this.currentSyncTime.getTime() + '');
        this.profitService.isCalculationInProgress = false;
    }

    async loadDefaultData() {
        var loadAndGetDefaultData = async (type: string, intrestList: any) => {
            var intrestMap: any = {};
            var existingIntrestList: any = await this.intrestDBService.getAll(type);
            if (existingIntrestList.length == 0) {
                await Promise.all(intrestList.map(async (details: any) => {
                    details.isDefault = true;
                    await this.intrestDBService.create(details, type);
                }));
                existingIntrestList = await this.intrestDBService.getAll(type);
            }
            existingIntrestList.forEach((details: any) => {
                var start_date = moment(details.start_date);
                do {
                    intrestMap[start_date.format("YYYY-MM")] = details.intrest;
                    start_date.add(1, "months");
                } while (moment(start_date).isBetween(details.start_date, details.end_date));
            });
            return intrestMap;
        }
        [this.profitService.ppfIntrest, this.profitService.epfIntrest] = await Promise.all([
            loadAndGetDefaultData('PPF', PPF_INTREST_LIST),
            loadAndGetDefaultData('EPF', EPF_INTREST_LIST)
        ]);

        //Load Appsettings
        var appSettings = await this.appSettingsDBService.getAppSettings();
        if (appSettings == null) await this.appSettingsDBService.createDefault();
        if (await this.ionicService.storage.get("ENABLE_DEBUG") == null
            || await this.ionicService.storage.get("ENABLE_AUTOBACKUP") == null) {
            appSettings = appSettings || await this.appSettingsDBService.getAppSettings();
            await this.ionicService.storage.set("ENABLE_DEBUG", appSettings.development_mode ? "TRUE" : "FALSE");
            await this.ionicService.storage.set("ENABLE_AUTOBACKUP", appSettings.auto_backup ? "TRUE" : "FALSE");
        }
    }

    async mf_nps_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime) isSyncRequired = true;
            else { //Daily sync and re-sync after 9pm IST
                if (this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString()
                    || (this.lastSyncTime.getHours() < 21 && this.currentSyncTime.getHours() >= 21))
                    isSyncRequired = true;
            }
            if (isSyncRequired) await Promise.all([this.mf_updateLatestNav(), this.nps_updateLatestNav()]);
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async sm_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime) isSyncRequired = true;
            else { //Daily sync and re-sync after 4pm IST
                if (this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString()
                    || (this.lastSyncTime.getHours() < 16 && this.currentSyncTime.getHours() >= 16))
                    isSyncRequired = true;
            }
            if (isSyncRequired) this.sm_updateLatestSharePrice();
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async sgb_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime) isSyncRequired = true;
            else { //Daily sync and re-sync after 9am IST
                if ((this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString() || (this.lastSyncTime.getHours() < 10 && this.currentSyncTime.getHours() >= 10)))
                    isSyncRequired = true;
            }
            if (isSyncRequired) this.sgb_updateGoldPrice();
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async po_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime || this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString()) {
                isSyncRequired = await this.updatePostOffice_TD_Intress();
            }
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async cf_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime || this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString()) {
                isSyncRequired = await this.cf_updateInvestment();
            }
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async bank_validateAndSync() {
        var isSyncRequired = false;
        try {
            if (!this.lastSyncTime || this.lastSyncTime.toLocaleDateString() != this.currentSyncTime.toLocaleDateString()) {
                isSyncRequired = await this.bank_updateInvestment();
            }
        } catch (err: any) { console.error(err); }
        return isSyncRequired;
    }

    async mf_updateLatestNav() {
        const results: any = await this.investmentSubtypeDBService.getDistinctRefByType('MF');
        if (results.length > 0) {
            const mfCodeList = results.map((obj: any) => obj.ref).join(",");
            const schemeList = await this.mfService.getLatestNavBySchemeCode(mfCodeList).toPromise();
            await Promise.all(schemeList.map(async (scheme: any) => {
                const investmentSubType: any = {};
                investmentSubType.ref = scheme['Scheme Code'];
                investmentSubType.amount_per_quantity = Number(scheme['Net Asset Value']);
                investmentSubType.price_updated_date = new Date(scheme['Date']).getTime();
                investmentSubType.last_updated_date = this.currentSyncTime.getTime();
                await this.investmentSubtypeDBService.updateNavValue('MF', investmentSubType.ref, investmentSubType);
            }));
        }
    }

    async sm_updateLatestSharePrice() {
        const investment_subtypeList: any = await this.investmentSubtypeDBService.getDistinctStockRef();
        if (investment_subtypeList.length > 0) {
            await Promise.all(investment_subtypeList.map(async (investment_subtype: any) => {
                const symbol = investment_subtype.ref;
                const stockPrice: any = await this.smService.getNSCTradePrice(symbol);
                if (stockPrice) {
                    const investmentSubType: any = {};
                    investmentSubType.amount_per_quantity = stockPrice.amount_per_quantity;
                    investmentSubType.price_updated_date = stockPrice.price_updated_date;
                    investmentSubType.last_updated_date = this.currentSyncTime.getTime();
                    await this.investmentSubtypeDBService.updateStockPricePerQuantity(symbol, investmentSubType);
                }
            }));
        }
    }

    async nps_updateLatestNav() {
        const results: any = await this.investmentSubtypeDBService.getDistinctRefByType('NPS');
        if (results.length > 0) {
            const navList: any = await this.npsService.geLatestNav();
            const navMap: any = {};
            navList.forEach((details: any) => navMap[details.scheme_id] = details);
            await Promise.all(results.map(async (obj: any) => {
                const currentNavDetails = navMap[obj.ref];
                const investmentSubType: any = {};
                investmentSubType.ref = currentNavDetails.scheme_id;
                investmentSubType.amount_per_quantity = currentNavDetails.nav;
                investmentSubType.price_updated_date = new Date(currentNavDetails.date).getTime();
                investmentSubType.last_updated_date = this.currentSyncTime.getTime();
                await this.investmentSubtypeDBService.updateNavValue('NPS', investmentSubType.ref, investmentSubType);
            }));
        }
    }

    async sgb_updateGoldPrice() {
        const { date, price } = await this.sgbService.getTodayPrice();
        const investmentSubType: any = {};
        investmentSubType.amount_per_quantity = price;
        investmentSubType.price_updated_date = date;
        investmentSubType.last_updated_date = this.currentSyncTime.getTime();
        await this.investmentSubtypeDBService.updateSGBValue('SGB', investmentSubType);
        await this.sgbService.syncIntrest();
    }

    async updatePostOffice_TD_Intress() {
        var isSyncRequired = false;
        const investmentSubTypeList: any = await this.investmentSubtypeDBService.getInverstmentSubTypeByTypeAndCategory('PO', 'Term Deposit');
        if (investmentSubTypeList.length > 0) {
            await Promise.all(investmentSubTypeList.map(async (investmentSubType: any) => {
                var tags = JSON.parse(investmentSubType.tags);
                var maturity_date = moment(investmentSubType.maturity_date).startOf("day");
                var start_date = moment(investmentSubType.start_date).startOf("day");
                var current_date = moment().startOf("day");
                start_date.add(1, "years");
                var statementList: any = await this.statementDBService.getAllStatementBySubType(investmentSubType.user_id, investmentSubType.investment_id, investmentSubType.id);
                var statementMap: any = {};
                statementList.forEach((statement: any) => {
                    statementMap[moment(statement.ir_date).format("DD-MM-YYYY")] = statement;
                });
                while (current_date.diff(start_date, "days") >= 0 && maturity_date.diff(start_date, "days") >= 0) {
                    if (!statementMap[start_date.format("DD-MM-YYYY")]) {
                        isSyncRequired = true;
                        let statement = {
                            type: "R",
                            amount: tags.yearlyInterest,
                            ir_date: start_date.valueOf(),
                            quantity: 1
                        };
                        await this.statementDBService.addStatement(investmentSubType.user_id, investmentSubType.investment_id, investmentSubType.id, statement);
                    }
                    start_date.add(1, "years");
                }
            }));
        }
        return isSyncRequired;
    }

    async cf_updateInvestment(investmentSubtypeId = null) {
        var isSyncRequired = false;
        const investmentSubTypeList: any = await this.investmentSubtypeDBService.getInverstmentSubTypeByTypeAndAutoAddInstallment('CF');
        if (investmentSubTypeList.length > 0) {
            await Promise.all(investmentSubTypeList.map(async (investmentSubType: any) => {
                if (investmentSubtypeId && investmentSubType.id != investmentSubtypeId) return;
                var tags = JSON.parse(investmentSubType.tags);
                var maturity_date = moment(investmentSubType.maturity_date).startOf("day");
                var start_date = moment(investmentSubType.start_date).startOf("day");
                var current_date = moment().startOf("day");

                var statementList: any = await this.statementDBService.getAllStatementBySubType(investmentSubType.user_id, investmentSubType.investment_id, investmentSubType.id);
                var statementMap: any = {};
                statementList.forEach((statement: any) => {
                    statementMap[moment(statement.ir_date).format("DD-MM-YYYY")] = statement;
                });

                while (current_date.diff(start_date, "day") >= 0 && maturity_date.diff(start_date, "days") >= 0) {
                    if (!statementMap[start_date.format("DD-MM-YYYY")]) {
                        isSyncRequired = true;
                        let statement = {
                            type: "I",
                            amount: tags.installment_amount * -1,
                            ir_date: start_date.valueOf(),
                            quantity: 1
                        };
                        await this.statementDBService.addStatement(investmentSubType.user_id, investmentSubType.investment_id, investmentSubType.id, statement);
                    }
                    if (tags.installment_pay_at == "QUARTERLY") start_date.add(3, 'months');
                    else if (tags.installment_pay_at == "BI_MONTHLY") start_date.add(2, 'months');
                    else start_date.add(1, 'months');
                }
            }));
        }
        return isSyncRequired;
    }

    async bank_updateInvestment(investmentSubtypeId = null) {
        var isSyncRequired = false;
        const investmentSubTypeList: any = await this.investmentSubtypeDBService.getInverstmentSubTypeByTypeAndAutoAddInstallment('BANK');
        if (investmentSubTypeList.length > 0) {
            await Promise.all(investmentSubTypeList.map(async (investmentSubtype: any) => {
                if (investmentSubtypeId && investmentSubtype.id != investmentSubtypeId) return;
                investmentSubtype.tags = JSON.parse(investmentSubtype.tags);

                var statementList: any = await this.statementDBService.getAllStatementBySubType(investmentSubtype.user_id, investmentSubtype.investment_id, investmentSubtype.id);
                var statementMap: any = {};
                statementList.forEach((statement: any) => {
                    statementMap[moment(statement.ir_date).format("DD-MM-YYYY")] = statement;
                });

                var maturity_date = moment(investmentSubtype.maturity_date).startOf("day");
                var start_date = moment(investmentSubtype.start_date);
                var current_date = moment().startOf("day");

                while (current_date.diff(start_date, "day") >= 0 && maturity_date.diff(start_date, "days") >= 0) {
                    if (!statementMap[start_date.format("DD-MM-YYYY")]) {
                        isSyncRequired = true;
                        let statement = {
                            type: 'I',
                            amount: investmentSubtype.investment * -1,
                            ir_date: start_date.valueOf(),
                            quantity: 1
                        };
                        await this.statementDBService.addStatement(investmentSubtype.user_id, investmentSubtype.investment_id, investmentSubtype.id, statement);
                    }
                    start_date.add(1, 'months');
                }

            }));
        }
        return isSyncRequired;
    }

}
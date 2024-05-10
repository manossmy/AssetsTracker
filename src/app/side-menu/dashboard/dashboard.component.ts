import { Component, OnInit, ViewChild } from '@angular/core';
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart } from "ng-apexcharts";
import { UserDBService } from 'src/app/services/db/user-db.service';
import { IonicService } from 'src/app/services/ionic.service';

import * as moment from 'moment';
import { InvestmentDBService } from 'src/app/services/db/investment-db.service';

export type ChartOptions = { series: ApexNonAxisChartSeries; chart: ApexChart; responsive: ApexResponsive[]; labels: any; };

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('slider', { static: true }) private slider: any;

  @ViewChild('dtRangeMonth') dtRangeMonth: any;
  @ViewChild('dtRangeYear') dtRangeYear: any;
  @ViewChild('dtRangeFinancial') dtRangeFinancial: any;

  userId: any;
  portfolioChartOptions: Partial<ChartOptions> | any;
  monthlyInvestmentChartOptions: Partial<ChartOptions> | any;
  yearlyInvestmentChartOptions: Partial<ChartOptions> | any;
  financialInvestmentChartOptions: Partial<ChartOptions> | any;

  userDetails: any;

  public slideOpts = {
    initialSlide: 0,
    speed: 500
  };

  maxDate = new Date();
  filter: any = {};
  activeSilde: string = 'Monthly';

  investmentRefDetails: any = {
    'MF': 'Mutual Fund',
    'SM': 'Share Market',
    'PPF': 'Public Provident Fund',
    'EPF': 'Employees Provident Fund',
    'NPS': 'National Pension System',
    'BANK': 'Bank',
    'PO': 'Post Office',
    'LIC': 'Life Insurance Corporation of India',
    'SGB': 'Sovereign Gold Bond',
    'CF': 'Chit Fund',
    'FINANCE': 'Finance',
    'LENT': 'Lent'
  };

  constructor(private userDBService: UserDBService, private investmentDBService: InvestmentDBService, public ionicService: IonicService) {
    this.resetAll();
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

  resetAll() {
    this.filter = {
      monthly: {
        type: 'CURRENT',
        date_range: [],
        selectedMonth: ''
      },
      yearly: {
        type: 'CURRENT',
        date_range: [],
        selectedYear: ''
      },
      financial: {
        type: 'CURRENT',
        date_range: [],
        selectedYear: ''
      }
    }
  }

  async init() {
    try {
      if (this.isInitTriggered) return;
      this.isInitTriggered = true;
      this.resetAll();
      this.userId = parseInt(await this.ionicService.storage.get('USER_ID') as any);
      await this.loadData();
    } catch (err) {
      console.log(err);
    }
  }

  async loadData(){
    await Promise.all([
      this.loadPortfolioChart(),
      this.loadInvestmentStatistics('MONTHLY'),
      this.loadInvestmentStatistics('YEARLY'),
      this.loadInvestmentStatistics('FINANCIAL_YEAR')
    ]);
  }

  async loadPortfolioChart() {
    let userDetails = this.userDetails = await this.userDBService.getUserById(this.userId);
    let ionicService = this.ionicService;
    this.portfolioChartOptions = {
      series: [Math.round(userDetails.investment), Math.round(userDetails.current_value - userDetails.investment)],
      chart: { type: "donut", height: 250 },
      labels: ["Investment", "Profit"],
      colors: ['#ae52a7', '#25cfa1'],
      legend: { show: false },
      dataLabels: { enabled: false },
      responsive: [{ breakpoint: 480, options: { chart: { width: 250 } } }],
      stroke: { show: false },
      radialBar: { hollow: { size: "10%" } },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { fontSize: '14px', fontFamily: 'Arial, sans-serif', ontWeight: 400, color: 'white' },
              value: {
                ontSize: '14px', fontFamily: 'Arial, sans-serif', fontWeight: 600, color: 'white',
                formatter: function (w: any) {
                  return (ionicService.maskAmount ? '***' : Number(w).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }));
                }
              },
              total: {
                show: true, label: 'Portfolio Value', color: 'white', fontSize: '16px', fontWeight: 600, fontFamily: 'Inter',
                formatter: function (w: any) {
                  return  (ionicService.maskAmount ? '***' : Math.round(userDetails.investment + (userDetails.current_value - userDetails.investment)).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }));
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: true,
        custom: (data: any) => {
          const { labels, colors } = data.w.config;
          const formattedValue = data.series[data.seriesIndex].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
          return `<div class="custom-tooltip" style="background-color: ${colors[data.seriesIndex]}">
                    <span>${labels[data.seriesIndex]}: <b>${(ionicService.maskAmount ? '***' : formattedValue)}</b></span>
                  </div>`;
        }
      },
    };
  }

  getStartAndEndDate(type: string) {
    var result: any = {};
    if (type == "MONTHLY") {
      if (this.filter.monthly.type == 'CUSTOM') {
        result.start_date = moment(this.filter.monthly.selectedMonth).startOf("month");
        result.end_date = moment(this.filter.monthly.selectedMonth).endOf("month");
      } else if (this.filter.monthly.type == 'PREVIOUS') {
        result.start_date = moment().subtract(1, 'months').startOf("month");
        result.end_date = moment().subtract(1, 'months').endOf('month');
      } else {
        result.start_date = moment().startOf("month");
        result.end_date = moment();
      }
    } else if (type == "YEARLY") {
      if (this.filter.yearly.type == 'CUSTOM') {
        result.start_date = moment(this.filter.yearly.selectedYear).startOf("year");
        result.end_date = moment(this.filter.yearly.selectedYear).endOf("year");
      } else if (this.filter.yearly.type == 'PREVIOUS') {
        result.start_date = moment().subtract(1, 'years').startOf("year");
        result.end_date = moment().subtract(1, 'years').endOf('year');
      } else {
        result.start_date = moment().startOf("year");
        result.end_date = moment();
      }
    } else if (type == "FINANCIAL_YEAR") {
      if (this.filter.financial.type == 'CUSTOM') {
        if (moment(this.filter.financial.selectedYear).quarter() == 1) {
          result.start_date = moment(this.filter.financial.selectedYear).subtract(1, 'year').month(3).startOf('month');
          result.end_date = moment(this.filter.financial.selectedYear).month(2).endOf('month');
        } else {
          result.start_date = moment(this.filter.financial.selectedYear).month(3).startOf('month');
          result.end_date = moment(this.filter.financial.selectedYear).add(1, 'year').month(2).endOf('month');
        }
      } else if (this.filter.financial.type == 'PREVIOUS') {
        if (moment().quarter() == 1) {
          result.start_date = moment().subtract(2, 'year').month(3).startOf('month');
          result.end_date = moment().subtract(1, 'year').month(2).endOf('month');
        } else {
          result.start_date = moment().subtract(1, 'year').month(3).startOf('month');
          result.end_date = moment().month(2).endOf('month');
        }
      } else {
        if (moment().quarter() == 1) {
          result.start_date = moment().subtract(1, 'year').month(3).startOf('month');
        } else {
          result.start_date = moment().month(3).startOf('month');
        }
        result.end_date = moment();
      }
    }
    return result;
  }

  async loadInvestmentStatistics(type: string) {
    const { start_date, end_date } = this.getStartAndEndDate(type);
    const investmentStaticticsResult: any = await this.investmentDBService.getInvestmentStatictics(this.userId, start_date.valueOf(), end_date.valueOf());
    const seriesData: any = [];
    const categories: any = [];
    var totalAmount: number = 0;
    
    let ionicService = this.ionicService;

    investmentStaticticsResult.forEach((result: any) => {
      categories.push(result.type);
      seriesData.push(result.amount);
      totalAmount += result.amount;
    });

    const chartOptions = {
      noDataFound: investmentStaticticsResult.length == 0,
      series: [{
        name: 'Investment',
        data: seriesData
      }],
      chart: { height: 300, width: 350, type: 'bar', toolbar: { show: false } },
      tooltip: {
        enabled: true,
        custom: (data: any) => {
          const {xaxis, colors} = data.w.config;
          const categoryName = xaxis.categories[data.dataPointIndex];
          const formattedValue = data.series[data.seriesIndex][data.dataPointIndex].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
          const label: any = this.investmentRefDetails[categoryName] || categoryName;
          debugger;
          return `<div class="custom-tooltip-wrapper">${label}</div>
                  <div class="custom-tooltip" style="background-color: ${colors[data.seriesIndex]}">
                    <span>Investment: <b>${(ionicService.maskAmount ? '***' : formattedValue)}</b></span>
                  </div>`;
        }
      },
      title: {
        text: start_date.format('DD-MMM-YYYY') + ' to ' + end_date.format('DD-MMM-YYYY') + ' ( ' + (ionicService.maskAmount ? '***' : Math.round(totalAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })) + ' )',
        align: 'center',
        style: { color: 'white', fontSize: '14px', fontWeight: 400 }
      },
      colors: ['#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7', '#ae52a7'],
      plotOptions: {
        bar: { columnWidth: '45%', distributed: true }
      },
      dataLabels: { enabled: false },
      legend: { color: '#F71A1A', show: false },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
          style: {
            colors: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
            fontSize: '10px'
          }
        }
      },
      yaxis: {
        logarithmic: true,
        logBase: 10,
        forceNiceScale: true,
        decimalsInFloat: 0,
        labels: {
          show: true, style: { colors: 'white', fontSize: '10px' },
          formatter: function (value: any) {
            return (ionicService.maskAmount ? '***' : value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }));
          }
        }
      }
    };

    if (type == "MONTHLY") {
      this.monthlyInvestmentChartOptions = chartOptions;
    } else if (type == "YEARLY") {
      this.yearlyInvestmentChartOptions = chartOptions;
    } else if (type == "FINANCIAL_YEAR") {
      this.financialInvestmentChartOptions = chartOptions;
    }

  }

  async ionSlideDidChange() {
    const index = await this.slider.getActiveIndex();
    if (index == 0) {
      this.activeSilde = 'Monthly';
    } else if (index == 1) {
      this.activeSilde = 'Yearly';
    } else if (index == 2) {
      this.activeSilde = 'Financial Year';
    }
  }

}

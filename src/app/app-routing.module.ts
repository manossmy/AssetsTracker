import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { StatementPageComponent } from './statement-page/statement-page.component';
import { InvestmentPageComponent } from './investment-page/investment-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { InvestmentSubtypePageComponent } from './investment-subtype-page/investment-subtype-page.component';
import { AccountComponent } from './side-menu/account/account.component';
import { SettingComponent } from './side-menu/setting/setting.component';
import { DashboardComponent } from './side-menu/dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'user/:user_id/investment', component: InvestmentPageComponent, canActivate: [AuthGuard] },
  { path: 'user/:user_id/investment/:investment_id/sub-type', component: InvestmentSubtypePageComponent, canActivate: [AuthGuard] },
  { path: 'user/:user_id/investment/:investment_id/sub-type/:sub_type_id/statement', component: StatementPageComponent, canActivate: [AuthGuard] },
  { path: 'user/:user_id/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'user/account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'user/setting', component: SettingComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

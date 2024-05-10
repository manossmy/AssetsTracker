import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { IonicService } from './ionic.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private ionicService: IonicService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLoggedIn = await this.ionicService.storage.get('IS_LOGGED_IN');
    const userId = await this.ionicService.storage.get('USER_ID');

    if (isLoggedIn == "true" && userId) return true;

    this.router.navigate(['/login']);
    return false;
  }

}

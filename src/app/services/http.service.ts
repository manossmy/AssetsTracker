import { Injectable } from '@angular/core';
import { isPlatform } from '@ionic/angular';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { CapacitorHttp } from '@capacitor/core';


@Injectable({
  providedIn: 'root'
})
export class HTTPService {

  isCapacitorPlatform: boolean = isPlatform('capacitor');

  constructor() { }

  async get(url: string, headers?: any, responseType?: string) {
    return await this.send("GET", url, null, headers, responseType);
  }

  async post(url: string, data: any, headers?: any, responseType?: string) {
    return await this.send("POST", url, data, headers, responseType);
  }

  async put(url: string, data: any, headers?: any, responseType?: string) {
    return await this.send("PUT", url, data, headers, responseType);
  }

  async delete(url: string, data: any, headers?: any, responseType?: string) {
    return await this.send("DELETE", url, data, headers, responseType);
  }

  async send(method: string, url: string, data: any, headers?: any, responseType?: any) {
    if (this.isCapacitorPlatform) {
      return await from(CapacitorHttp.request({ method, url, data, headers, responseType }))
        .pipe(map((result: any) => {
          if (result.error) throw result.data;
          return { data: result.data, headers: result.headers };
        })).toPromise();
    } else {
      var response = await fetch(url, { method, headers, body: data });
      return response.json();
    }
  }

}

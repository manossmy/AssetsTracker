import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonicService {

  maskAmount: boolean = true;
  constructor(private toastController: ToastController, private loadingCtrl: LoadingController) {
    this.loadDefaultValue();
  }

  private async loadDefaultValue() {
    this.maskAmount = !((await this.storage.get("ENABLE_MASK_AMOUNT")) == "FALSE");
  }

  //toaster content
  toster = {
    success: (message: string) => {
      this.toster.show('SUCCESS', message);
    },
    error: (message: any) => {
      this.toster.show('ERROR', message);
    },
    show: async (type: string, message: any) => {
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
      });
      await toast.present();
    }
  }

  //spinner controller
  isLoaderDismissed: boolean = false;
  async showLoader() {
    this.isLoaderDismissed = false;
    const loader = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'lines-sharp',
      cssClass: 'ion-loading-class',
      translucent: true
    });
    if (!this.isLoaderDismissed && !(await this.loadingCtrl.getTop())) {
      await loader.present();
    }
  }

  async hideLoader() {
    try {
      this.isLoaderDismissed = true;
      if (await this.loadingCtrl.getTop()) {
        await this.loadingCtrl.dismiss();
      }
    } catch (e) {
      console.error(e);
    }
  }

  storage = {
    get: async (key: string) => {
      return ((await Preferences.get({ key })) || {}).value;
    },
    set: async (key: string, value: string) => {
      return await Preferences.set({ key, value });
    },
    remove: async (key: string) => {
      return await Preferences.remove({ key });
    },
    clear: async () => {
      return await Preferences.clear();
    },
  }

  async pauseExecution(timeoutInMs: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), timeoutInMs);
    });
  }

}

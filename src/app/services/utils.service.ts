import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private loadingController: LoadingController,
              private toastController: ToastController) { }

  async presentLoading(message:string,t?:number) {
    const loading = await this.loadingController.create({
      message,
      duration: t || 2000,
      spinner: 'bubbles'
    });
    await loading.present();
  }
  hideLoading(){
    this.loadingController.dismiss();
  }

  async presentToast(message:string,duration?:number) {
    const toast = await this.toastController.create({
      message,
      cssClass:'toast',
      duration: duration || 3000
    });
    toast.present();
  }

  isFirstUse():boolean{
    var firstUse=localStorage.getItem('firstUse');
    if(firstUse){
      return false
    }else{
      return true;
    }
  }
  setToNonFirtUse(){
    localStorage.setItem('firstUse','false');
  }
}

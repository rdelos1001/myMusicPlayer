import { Injectable } from '@angular/core';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import { Song } from '../interfaces/song';
import { LanguageService } from './language.service';
import { Plugins } from '@capacitor/core';
const {Filesystem} =Plugins

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private loadingController: LoadingController,
              private toastController: ToastController,
              private actionSheetController: ActionSheetController,
              private _language:LanguageService) { }
  async presentLoading(message:string,t?:number) {
    const loading = await this.loadingController.create({
      message,
      duration: t,
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
  async songSettingMenu(song:Song) {
    var addLabel=this._language.getActiveLanguage().addToPlayList;
    var cancelLabel=this._language.getActiveLanguage().cancel;
    var playLaterLabel=this._language.getActiveLanguage().playLater;

    const actionSheet = await this.actionSheetController.create({
      header: song.title,
      buttons: [/* {
        text: addLabel,
        icon: 'share',
        role: 'addToPlayList'
      }, */{
        text: playLaterLabel,
        icon: 'share',
        role: 'playLater'
      }, {
        text: cancelLabel,
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    return role;
  }
  async showOrderMenu(){
    var orderLbl= this._language.getActiveLanguage().order;
    var titleLbl= this._language.getActiveLanguage().title;
    var artistLbl= this._language.getActiveLanguage().artist;
    var genderLbl= this._language.getActiveLanguage().gender;
    var cancelLbl= this._language.getActiveLanguage().cancel;
    
    const actionSheet = await this.actionSheetController.create({
      header: orderLbl,
      buttons: [{
        text: titleLbl,
        role: 'title',
        icon: 'text-outline',
      }, {
        text: artistLbl,
        role: 'artist',
        icon: 'people-circle-outline',
      }, {
        text: genderLbl,
        role: 'gender',
        icon: 'musical-notes-outline',
      }, {
        text: cancelLbl,
        icon: 'close',
        role: 'cancel',
      }]
    });
  
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    return role;
  }
}

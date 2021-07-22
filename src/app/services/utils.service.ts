import { Injectable } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { PlayList } from '../interfaces/playList';
import { Song } from '../interfaces/song';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private loadingController: LoadingController,
              private toastController: ToastController,
              private actionSheetController: ActionSheetController,
              private _language:LanguageService,
              private alertController:AlertController)
               {               }
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
    var delSongLbl=this._language.getActiveLanguage().delSong;
    var cancelLbl=this._language.getActiveLanguage().cancel;
    var playLaterLbl=this._language.getActiveLanguage().playLater;
    var addToPlayListLbl=this._language.getActiveLanguage().addToPlayList;
    var detailsLbl=this._language.getActiveLanguage().details;

    const actionSheet = await this.actionSheetController.create({
      header: song.title,
      buttons: [
        {
          text:addToPlayListLbl,
          icon:"add-circle",
          role:"addToPlayList"
        },
        {
          text: playLaterLbl,
          icon: 'share',
          role: 'playLater'
        },{
          text: delSongLbl,
          icon: 'trash',
          role: 'delSong'
        },
        {
          text:detailsLbl,
          icon: 'reader-outline',
          role: 'details'
        },
        {
          text: cancelLbl,
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    return role;
  }
  async showOrderMenu(){
    var orderLbl= this._language.getActiveLanguage().order;
    var titleLbl= this._language.getActiveLanguage().title;
    var artistLbl= this._language.getActiveLanguage().artist;
    var genreLbl= this._language.getActiveLanguage().genre;
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
        text: genreLbl,
        role: 'genre',
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
  async presentAlertConfirm(header:string,message:string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Okay',
          role: 'ok'
        }
      ]
    });
  
    await alert.present();
    const {role}= await alert.onDidDismiss();
    if(role==="ok"){
      return true;
    }else{
      return false;
    }
  }
  async presentAlert(header:string,message:string,subHeader?:string) {
    const alert = await this.alertController.create({
      header,
      subHeader: subHeader||'',
      message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  async filterAlerts(header:string):Promise<string[]> {
    //"mp3", "mp4", "opus", "ogg", "wav", "aac", "m4a", "webm"
    var alertInputs:any[]=[]
    const allFormats=environment.ALL_FORMATS;
    var formatsAvaible:string[]= JSON.parse(localStorage.getItem('filters'))
    
    for (const format of allFormats) {
      let checked:boolean= formatsAvaible.includes(format);
      alertInputs.push({
        name: format,
        type: 'checkbox',
        label: format.toUpperCase(),
        value: format,
        checked
      })
    }
    const alert = await this.alertController.create({
      header,
      inputs: alertInputs,
      buttons: [
        {
          text: this._language.getActiveLanguage().cancel,
          role: 'cancel'
        }, {
          text: 'Ok',
          role: 'ok'
        }
      ]
    });

    await alert.present();
    var result =await alert.onWillDismiss();
    if(result.role==="ok"){
      return result.data.values
    }else{
      return null;
    }
  }
  async showAddToPlayListMenu(listPlayList:PlayList[]){
    var newPlayListLbl=this._language.getActiveLanguage().newPlayList;
    var playListLbl=this._language.getActiveLanguage().playList;
    
    let buttons=[
      {
        text: newPlayListLbl,
        icon: 'add-circle',
        role: 'newPlayList'
      }
    ]
    for (const playList of listPlayList) {
     buttons.push(
       {
         text: playList.name,
         icon: 'musical-note',
         role: 'addTo'+playList.id
       }
     ) 
    }
    const actionSheet = await this.actionSheetController.create({
      header: playListLbl,
      buttons
    });
  
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    return role;
  }
  async newPlayListAlert():Promise<string>{
    const cancelLbl= this._language.getActiveLanguage().cancel
    const alert = await this.alertController.create({
      header: this._language.getActiveLanguage().newPL,
      inputs:[
        {
          name: 'name',
          type: 'text',
          placeholder: this._language.getActiveLanguage().name
        },
      ],
      buttons: [
        {
          text: 'OK',
          role: 'ok'
        },{
          text: cancelLbl,
          role: 'cancel'
        }
      ]
    });
  
    await alert.present();
    const data = await alert.onDidDismiss()
    if(data.role=="ok"){
      return data.data.values.name;
    }else{
      return null;
    }
  }
  sleep(ms:number){
    return new Promise( resolve => setTimeout(resolve, ms) );    
  }
  /**
   * Devuelve los items que estén en los dos arrays
   *  */
  innerJoin<T>(array1:T[], array2:T[]):T[]{
    var array3:T[]=[];
    
    for (const i of array1) {
      if(array2.includes(i)){
        array3.push(i);
      }
    }

    return array3;
  }
}

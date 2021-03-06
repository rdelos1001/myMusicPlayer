import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonRow, ModalController } from '@ionic/angular';
import { PlayList } from 'src/app/interfaces/playList';
import { Song } from 'src/app/interfaces/song';
import { GetdataService } from 'src/app/services/getdata.service';
import { LanguageService } from 'src/app/services/language.service';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-view-edit-playlist',
  templateUrl: './view-edit-playlist.component.html',
  styleUrls: ['./view-edit-playlist.component.scss'],
})
export class ViewEditPlaylistComponent implements OnInit {

  @Input() pl:PlayList;
  songs:Song[]=[];
  language:any;
  @ViewChild('title')title:ElementRef;

  constructor(private _language:LanguageService,
              private modalController: ModalController,
              private _getData:GetdataService,
              private _theme:ThemeService,
              private _musicController:MusicControllerService,
              private _utils:UtilsService,
              private statusBar:StatusBar) {
    this.language=this._language.getActiveLanguage();
  }
  
  async ngOnInit() {
    this.updateSongList();
    if(this._theme.isDarkModeEnable()){
      this.statusBar.backgroundColorByHexString('008B8B')
    }else{
      this.statusBar.backgroundColorByHexString('ffe4c4')
    }
  }

  dismiss(){
    this.modalController.dismiss();
  }

  logScrolling(event){
    document.getElementById('pl_name').style.color = event.detail.scrollTop > 70 
      ? ( this._theme.isDarkModeEnable() 
          ? "white" 
          : "black" 
        )
      : "transparent";      
    let opacity=event.detail.scrollTop/100;
    let rgb=this._theme.getBackgroundColor2RGB();
    let background = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
    document.getElementById('title').style.background = background;
  }
  
  async playPlayList(){
    let newPlayList:Song[]=[];
    for (const songPath of this.pl.songsPath) {      
      newPlayList.push(await this._getData.getSong(songPath))
    }
    await this._musicController.start(newPlayList[0])
    this._musicController.setPlayList(newPlayList);
  }

  async delPl(){
    let confirm = await this._utils.presentAlertConfirm("Aviso","Estas seguro de eliminar la play list "+this.pl.name);
    if(confirm){
      this._getData.delPl(this.pl);
      this.modalController.dismiss();
    }
  }
  
  async removeSongFromPL(song:Song){
    let alertMessage:string = this._language.getActiveLanguage().alertMessageRemoveSongFromPl;

    alertMessage = alertMessage.replace('${song.title}',`<b>${song.title}</b>`);
    alertMessage = alertMessage.replace('${pl.name}',`<b>${this.pl.name}</b>`);
    
    let result = await this._utils.presentAlertConfirm('Aviso',alertMessage );
    if(result && this._getData.removeSongFromPL(this.pl,song)){
      this.updateSongList();
    }
  }

  async updateSongList(){
    this.songs = [];
    for (const sPath of this.pl.songsPath) {
      this.songs.push(await this._getData.getSong(sPath))
    }
  }
}

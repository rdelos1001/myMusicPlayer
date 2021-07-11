import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Song } from 'src/app/interfaces/song';
import { GetdataService } from 'src/app/services/getdata.service';
import { LanguageService } from 'src/app/services/language.service';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-reorder-play-list',
  templateUrl: './reorder-play-list.component.html',
  styleUrls: ['./reorder-play-list.component.scss'],
})
export class ReorderPlayListComponent implements OnInit {

  playList:Song[]
  language:any;
  selectedSongPath:string;
  constructor(private modalController: ModalController,
              private _language:LanguageService,
              private _musicController:MusicControllerService,
              private _theme:ThemeService,
              private _getdata:GetdataService) {
                this.language=this._language.getActiveLanguage();
               }

  
  ngOnInit() {
    this._musicController.$playList.subscribe((allsongs)=>{
      this.playList=this._musicController.$playList.getValue();
    })
    this.selectedSongPath= this._musicController.getActiveSong().path;
  }
  

  cancel(){
    this.modalController.dismiss();
  }
  dismiss(){
    this.modalController.dismiss(this.playList);
  }
  reorder(event){
    const itemMove= this.playList.splice(event.detail.from,1)[0];
    this.playList.splice(event.detail.to,0,itemMove);
    event.detail.complete();
  }
}

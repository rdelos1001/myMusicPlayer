import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Song } from 'src/app/interfaces/song';
import { LanguageService } from 'src/app/services/language.service';
import { MusicControllerService } from 'src/app/services/music-controller.service';

@Component({
  selector: 'app-view-play-list',
  templateUrl: './view-play-list.component.html',
  styleUrls: ['./view-play-list.component.scss'],
})
export class ViewPlayListComponent implements OnInit {

  playList:Song[]
  language:any;
  constructor(private modalController: ModalController,
              private _language:LanguageService,
              private _musicController:MusicControllerService) {
                this.language=this._language.getActiveLanguage();
               }

  
  ngOnInit() {
    this.playList=this._musicController.playList;
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

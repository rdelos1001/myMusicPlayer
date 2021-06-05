import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonRange, ModalController } from '@ionic/angular';
import { Song } from 'src/app/interfaces/song';
import { LanguageService } from 'src/app/services/language.service';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ViewPlayListComponent } from '../view-play-list/view-play-list.component';

@Component({
  selector: 'app-song-player',
  templateUrl: './song-player.component.html',
  styleUrls: ['./song-player.component.scss'],
})
export class SongPlayerComponent implements OnInit {
  
  @Input() song:Song;
  @Input() playList:Song[];
  @Input() viewSongOrPlaySong:boolean;
  @ViewChild('volumeRange',{static:false}) volumeRange:ElementRef;
  @ViewChild('progressRange',{static:false}) progressRange:IonRange;

  isPlaying:boolean=false;
  toggleProgressVolume: boolean;
  progress=0;
  volume=100;
  language;
  mod:number=1;
  currentTime={ 
    minutes:0,
    seconds:""
  };
  totalTime={
    minutes:0,
    seconds:""
  };
  constructor(private modalController: ModalController,
              private _musicController:MusicControllerService,
              private _language:LanguageService,
              private _theme:ThemeService
    ) { 
      this.language=_language.getActiveLanguage();
    }
  async ngOnInit() {
    if(!this.viewSongOrPlaySong){
      await this.start(this.song);
    }
    this.totalTime=this._musicController.totalTime;
    this.isPlaying=this._musicController.isPlaying;
    this.updateProgress();
    this._musicController.changeSong.subscribe((song)=>{
      this.song=song
    });
  }
  async start(song:Song){
    await this._musicController.start(song);
  }

  dismiss(){
    this.modalController.dismiss();
  }
  setMod(mod:number){
    this.mod=this._musicController.setMod(mod);
  }

  togglePlayer(){
    this._musicController.togglePlayer();
    this.isPlaying=this._musicController.isPlaying;
  }
  
  seek(){
    let aux=this.progressRange.value.valueOf();
    let newValue= Number.parseInt(aux.toString());
    this._musicController.seek(newValue);
  }
  updateProgress(){
    let aux= this._musicController.player.seek().toString();
    let seek:number = Number.parseInt(aux);
    this.currentTime= this._musicController.getTime(seek);
    this.progress=(seek/this._musicController.player.duration())*100||0;
    setTimeout(()=>{
      this.updateProgress();
    },1000);
  }
  changeVolume(volume?:number){
    let newVolume=volume==undefined?this.volume:volume;
    this.volume=newVolume;
    this._musicController.changeVolume(newVolume);
  }
  toggleVolumeBar(){
    this.toggleProgressVolume=!this.toggleProgressVolume;
  }

  async viewPlayList(){
      const modal = await this.modalController.create({
        component:ViewPlayListComponent,
        componentProps:{
          playList:this.playList
        },
        cssClass:"modal",
        mode:"ios",
        swipeToClose:true,
        showBackdrop:true
      });
    
      await modal.present();

      const {data} = await modal.onDidDismiss();
      if(data){
        this.playList=data
      }
      console.log(data)
  }
  prev(){
    this._musicController.prev();
  }
  next(){
    this._musicController.next();
  }
}

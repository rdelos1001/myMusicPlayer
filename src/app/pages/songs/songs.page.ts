import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { IonRange, ModalController, Platform } from '@ionic/angular';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { SongPlayerComponent } from 'src/app/components/song-player/song-player.component';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit {
  playList:Song[]=[  ]
  filterSong='';
  allSongs:Song[]=[ 
/*     {
      name:"A day to remember - It's Complicated",
      path:"assets/mp3/A day to remember - It's Complicated.mp3"
    },
    {
      name:"ACDC - Highway to Hell",
      path:"assets/mp3/ACDC - Highway to Hell.mp3"
    },
    {
      name:"ACDC - Thunderstruck",
      path:"assets/mp3/ACDC - Thunderstruck.mp3"
    } */
   ]
  SDCARD_DIR=""
  FILESYSTEM_DIR="";
  activeSong:Song =null;
  isPlaying:boolean=false;
  language;
  @ViewChild('volumeRange',{static:false}) volumeRange:ElementRef;
  @ViewChild('progressRange',{static:false}) progressRange:IonRange;
  constructor(public filePath: FilePath, 
              public platform: Platform,
              public file: File,
              private _utils:UtilsService,
              private _language:LanguageService,
              private _theme:ThemeService,
              private _musicController:MusicControllerService,
              private modalController: ModalController,
              private _getData:GetdataService) {
                
                this.language=this._language.getActiveLanguage();
              }
              
  async ngOnInit() {
    this._musicController.changeSong.subscribe(song=>{
      this.activeSong=song;
    })
    await this._utils.presentLoading(this.language.loadingSongs);
    this.allSongs.push(await this._getData.getSong("assets/mp3/ACDC - Highway to Hell.mp3"));
    this.allSongs.push(await this._getData.getSong("assets/mp3/ACDC - Thunderstruck.mp3"));
    this.allSongs.push(await this._getData.getSong("assets/mp3/A day to remember - It's Complicated.mp3"));    
    this.allSongs.push(await this._getData.getSong("assets/mp3/Beret - Si Por Mi Fuera.mp3"));

    this.playList=this.allSongs;    
 /*    this.allSongs.push(...await this._getData.findSongs(this._getData.FILESYSTEM_DIR+"/Music"));
    this.allSongs.push(...await this._getData.findSongs(this._getData.FILESYSTEM_DIR+"/Download"));
    this.allSongs.push(...await this._getData.findSongs(this._getData.SDCARD_DIR+"/Music"));
    this.allSongs.push(...await this._getData.findSongs(this._getData.SDCARD_DIR+"/Download"));
    
     */

    this._utils.hideLoading();
  }

  async clickSong(song:Song){
    this._musicController.setPlayList(this.allSongs);
    this.activeSong=song;
    this.isPlaying=true;
    const modal = await this.modalController.create({
      component: SongPlayerComponent,
      componentProps: { 
        song:song, 
        playList:this.playList,
        viewSongOrPlaySong:false 
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.activeSong=this._musicController.activeSong;
    this.isPlaying=this._musicController.isPlaying;
  }

  songSettings(song:Song){
    this._utils.songSettingMenu(song).then((role)=>{
      if(role==="playLater"){
        var currentSongIndex=this.playList.indexOf(this.activeSong);
        if(currentSongIndex!=-1){
          var moveSong=this.playList.splice(this.playList.indexOf(song),1)[0];
          this.playList.splice(this.playList.indexOf(this.activeSong)+1,0,moveSong);
          console.log(this.playList)
        }else{
          this._utils.presentToast(this.language.aSongMustBePlaying);
        }
      }
    });
  }
  togglePlayer(){
    this._musicController.togglePlayer();
    this.isPlaying=this._musicController.isPlaying;
  }
  async clickFooter(){
    const modal = await this.modalController.create({
      component: SongPlayerComponent,
      componentProps: { 
        song:this.activeSong, 
        playList:this.playList,
        viewSongOrPlaySong:true 
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.activeSong=this._musicController.activeSong;
    this.isPlaying=this._musicController.isPlaying;
  }
  next(){
    this._musicController.next();
  }
}
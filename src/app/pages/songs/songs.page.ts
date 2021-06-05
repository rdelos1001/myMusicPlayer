import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { IonRange, ModalController, Platform } from '@ionic/angular';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { Plugins } from '@capacitor/core';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { SongPlayerComponent } from 'src/app/components/song-player/song-player.component';
import { MusicControllerService } from 'src/app/services/music-controller.service';

const { Filesystem } = Plugins;
@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit {
  playList:Song[]=[
    {
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
    }
   ]
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
              private modalController: ModalController) {
                
                this.language=this._language.getActiveLanguage();
              }
              
  ngOnInit() {
    this._utils.presentLoading(this.language.loadingSongs);
    Filesystem.requestPermissions().then(async (resp)=>{
      var path="/storage";
      this.FILESYSTEM_DIR=path+"/emulated/0";
      await Filesystem.readdir({path})
      .then((dir)=>{
        dir.files.forEach((el)=>{
          if(el!="self" && el!="emulated"){
            this.SDCARD_DIR=path+"/"+el;
          }
        })
      })
      .catch((err)=>{
        console.error("ERROR LEYENDO /storage");
        console.error(err);
      });

      await this.findSongs(this.SDCARD_DIR+"/Music");
      await this.findSongs(this.SDCARD_DIR+"/Download");
      await this.findSongs(this.FILESYSTEM_DIR+"/Music");
      await this.findSongs(this.FILESYSTEM_DIR+"/Download");
      
      this.playList=this.allSongs;
      this._utils.hideLoading();
    })
  }

  async findSongs(path:string){
    Filesystem.readdir({path}).then((dir)=>{
      dir.files.forEach(async(el)=>{
        if(el.endsWith('.mp3')){
          var win:any=window;
          let songPath=win.Ionic.WebView.convertFileSrc(path+"/"+el.replace('%',escape("%")));
          this.allSongs.push({name:el.substring(0,el.lastIndexOf('.')),path:songPath})
          console.log(el.substring(0,el.lastIndexOf('.'))+" - RUTA:"+songPath)
/*           await Filesystem.stat({ path:path+"/" + el })
          .then((fileInfo)=>{
            var win: any = window;
            fileInfo.uri=win.Ionic.WebView.convertFileSrc(fileInfo.uri);
          }).catch((err)=>{
            console.error("ERROR EN FILEINFO",err);
          }); */
        }
      })
    })
    .catch((err)=>{
      console.error("ERROR EN EL DIRECTORIO ",path);
      console.error(err);
    });
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
    this.activeSong=this._musicController.song;
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
    this.activeSong=this._musicController.song;
    this.isPlaying=this._musicController.isPlaying;
  }
  next(){
    this._musicController.next().then(song=>{
      this.activeSong=song
    })
  }
}
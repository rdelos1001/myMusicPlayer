import { EventEmitter, Injectable } from '@angular/core';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { Howl, Howler } from 'howler';
import { Song } from '../interfaces/song';
import { LanguageService } from './language.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class MusicControllerService {
  player:Howl= null;
  isPlaying:boolean=false;
  progress=0;
  mod:number=1;
  currentTime={ 
    minutes:0,
    seconds:""
  };
  totalTime={
    minutes:0,
    seconds:""
  };
  toggleProgressVolume: boolean;
  activeSong: Song;
  changeSong:EventEmitter<Song>= new EventEmitter<Song>()
  playList: Song[];
  language:any;
  constructor(private musicControls:MusicControls,
              private _utils:UtilsService,
              private _language:LanguageService) {
                this.language=this._language.getActiveLanguage()
  }
  start(song:Song):Promise<Song>{
    return new Promise<Song>((resolve)=>{
      if (this.player){
        this.player.stop();
      }
      this.player= new Howl({
        src:[song.path],
        html5:true,
        onplay:()=>{
          this.setActiveSong(song);
          this.isPlaying=true;
          this.totalTime= this.getTime(this.player.duration());
          resolve(song);
        },
        onend:()=>{
          this.next();
        }
      })
      this.player.play();
      this.totalTime= this.getTime(this.player.duration());
      this.createMusicControls(song);
    })
  }
  async next():Promise<Song>{
    let index;
    var currentSong:Song;
    switch(this.mod){
      case 1:
        index=this.playList.indexOf(this.activeSong)+1;
        break;
      case 2:
        do{
          index= Math.round( Math.random()*(this.playList.length-1) );
        }while(index==this.playList.indexOf(this.activeSong));
        break;
      case 3:
        index=this.playList.indexOf(this.activeSong);
        break;
    }
    if(index==this.playList.length){
     currentSong= await this.start(this.playList[0]);
    }else{
      currentSong= await this.start(this.playList[index]);
    }
    this.setActiveSong(currentSong);
    return currentSong;
  }
  async prev():Promise<Song>{
    let index=this.playList.indexOf(this.activeSong);
    var currentSong:Song;
    if(index>0){
      currentSong=await this.start(this.playList[index-1]);
    }else{
      currentSong=await this.start(this.playList[this.playList.length-1]);
    }
    this.setActiveSong(currentSong);
    return currentSong;
  }
  seek(seek:number){
    let duration = this.player.duration();
    this.player.seek(duration * ( seek / 100));
  }
  changeVolume(volume:number){
    Howler.volume(volume/100);
  }
  public getTime(secondsNum:number){
    let minutes=0;
    let secondsStr="";
    while(secondsNum>=60){
      minutes++;
      secondsNum-=60;
    }
    secondsNum=Math.round(secondsNum);
    if(secondsNum<10){
      secondsStr="0"+secondsNum;
    }else{
      secondsStr=secondsNum+"";
    }

    return {
      minutes,
      seconds:secondsStr
    }
  }
  createMusicControls(song:Song){
    this.musicControls.destroy();
    this.musicControls.create({
      track       : song.title,		// optional, default : ''
      artist      : '',						// optional, default : ''
      album       : '',     // optional, default: ''
      cover       : '../../assets/icon/icon.png',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying   : true,			// optional, default : true
      dismissable : false,							// optional, default : false
    
      // hide previous/next/close buttons:
      hasPrev   : true,		// show previous button, optional, default: true
      hasNext   : true,		// show next button, optional, default: true
      hasClose  : false,		// show close button, optional, default: false
    
      // Android only, optional
      // text displayed in the status bar when the notification (and the ticker) are updated
      ticker	  : '',
      //All icons default to their built-in android equivalents
      //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
    	
      playIcon: 'media_play',

      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification'
    });
    this.musicControls.subscribe().subscribe((action)=>{
        const message = JSON.parse(action).message;
        switch(message) {
          case 'music-controls-next':
            this.next();
            // Do something
            break;
          case 'music-controls-previous':
            // Do something
            this.prev();
            break;
          case 'music-controls-pause':
            // Do something
            this.player.pause();
            this.isPlaying=false;
            this.musicControls.updateIsPlaying(false);
            break;
          case 'music-controls-play':
              this.player.play();
              this.isPlaying=true;
              this.musicControls.updateIsPlaying(true);
            break;
          case 'music-controls-destroy':
            // Do something
            this.player.stop();
            break;
          case 'music-controls-toggle-play-pause' :
            // Do something
            
            break;

          default:
            break;
        }      
      })
      // Start listening for events
      // The plugin will run the events function each time an event is fired
      this.musicControls.listen();
      this.musicControls.updateIsPlaying(true)
  }
  togglePlayer(){
    if(this.isPlaying){
      this.player.pause();
    }else{
      this.player.play();
    }
    this.isPlaying=!this.isPlaying;
  }
  setPlayList(playList:Song[]){
    this.playList=playList;
  }
  setMod(mod:number):number{
    this.mod=mod;
    switch(mod){
      case 1:
        this._utils.presentToast(this.language.changeToNormalPlay);
        break;
      case 2:
        this._utils.presentToast(this.language.changeToSufflePlay);
        break;
      case 3:
        this._utils.presentToast(this.language.changeToRepeatOne);
        break;
    }
    return mod;
  }
  setActiveSong(song:Song){
    this.activeSong=song;
    this.changeSong.emit(song);
  }
  playLater(song){
    var currentSongIndex=this.playList.indexOf(this.activeSong);
    console.log("PLAY LIST",this.playList);
    console.log("ACTIVE SONG",this.activeSong);
    
    if(currentSongIndex!=-1){
      var moveSong=this.playList.splice(this.playList.indexOf(song),1)[0];
      this.playList.splice(this.playList.indexOf(this.activeSong)+1,0,moveSong);
      console.log(this.playList);
      this._utils.presentToast(this.language.thisSongWillBePlayedNext);
    }else{
      this._utils.presentToast(this.language.aSongMustBePlaying);
    }
  }
}

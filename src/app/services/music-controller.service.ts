import { EventEmitter, Injectable } from '@angular/core';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { Howl, Howler } from 'howler';
import { type } from 'node:os';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../interfaces/song';
import { LanguageService } from './language.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class MusicControllerService {
  //Formatos "mp3", "opus", "ogg", "wav", "aac", "m4a", "mp4", "webm"
  public player:Howl= null;
  $changeSong:EventEmitter<Song>= new EventEmitter<Song>();
  $playList:BehaviorSubject<Song[]>=new BehaviorSubject<Song[]>([]);
  $isPlaying:EventEmitter<boolean> = new EventEmitter<boolean>();

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
  private activeSong: Song=null;


  language:any;
  constructor(private musicControls:MusicControls,
              private _utils:UtilsService,
              private _language:LanguageService) {
                this.language=this._language.getActiveLanguage();
                this.$isPlaying.subscribe((v)=>{
                  this.musicControls.updateIsPlaying(v)
                })
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
          this.totalTime= this.getTime(this.player.duration());
          this.setActiveSong(song);
          resolve(song);
        },
        onend:()=>{
          this.next();
        }
      })
      this.togglePlayer()
      this.totalTime= this.getTime(this.player.duration());
      this.createMusicControls(song);
    })
  }
  async next():Promise<Song>{
    let index;
    var currentSong:Song;
    switch(this.mod){
      case 1:
        index=this.$playList.getValue().indexOf(this.activeSong)+1;
        break;
      case 2:
        do{
          index= Math.round( Math.random()*(this.$playList.getValue().length-1) );
        }while(index==this.$playList.getValue().indexOf(this.activeSong));
        break;
      case 3:
        index=this.$playList.getValue().indexOf(this.activeSong);
        break;
    }
    if(index==this.$playList.getValue().length){
     currentSong= await this.start(this.$playList.getValue()[0]);
    }else{
      currentSong= await this.start(this.$playList.getValue()[index]);
    }
    this.setActiveSong(currentSong);
    return currentSong;
  }
  async prev():Promise<Song>{
    let index=this.$playList.getValue().indexOf(this.activeSong);
    var currentSong:Song;
    if(index>0){
      currentSong=await this.start(this.$playList.getValue()[index-1]);
    }else{
      currentSong=await this.start(this.$playList.getValue()[this.$playList.getValue().length-1]);
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
    let artist =""
    for(let SONGartist of song.artists){
      artist+=SONGartist+","
    }
    artist= artist.substring(0,artist.length-1)

    this.musicControls.destroy();
    this.musicControls.create({
      track       : song.title,		// optional, default : ''
      artist      ,						// optional, default : ''
      cover       : '/assets/icon/icon.png',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying   : true,			// optional, default : true
      dismissable : false,							// optional, default : false
    
      // hide previous/next/close buttons:
      hasPrev   : true,		// show previous button, optional, default: true
      hasNext   : true,		// show next button, optional, default: true
      hasClose  : true,		// show close button, optional, default: false    	
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
            this.togglePlayer();
            this.musicControls.updateIsPlaying(this.player.playing());
            break;
          case 'music-controls-play':
            this.togglePlayer();
            this.musicControls.updateIsPlaying(this.player.playing());
            break;
          case 'music-controls-destroy':
            // Do something
            this.player.stop();
            navigator['app'].exitApp();
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
    if(this.player.playing()){
      this.player.pause();
    }else{
      this.player.play();
    }
    this.$isPlaying.emit(this.player.playing());
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
  playLater(song){
    var currentSongIndex=this.$playList.getValue().indexOf(this.activeSong);    
    if(currentSongIndex!=-1){
      var moveSong=this.$playList.getValue().splice(this.$playList.getValue().indexOf(song),1)[0];
      this.$playList.getValue().splice(this.$playList.getValue().indexOf(this.activeSong)+1,0,moveSong);
      this._utils.presentToast(this.language.thisSongWillBePlayedNext);
    }else{
      this._utils.presentToast(this.language.aSongMustBePlaying);
    }
  }
  setActiveSong(song:Song){
    this.activeSong=song;
    this.$changeSong.emit(song);
  }
  getActiveSong():Song{
    return this.activeSong;
  }
  setPlayList(playList:Song[]){
    this.$playList.next(playList);
  }
  addSongToPlayList(songs:Song[]|Song){
    var playlist=this.$playList.getValue();

    var aux:any=songs;
    if(JSON.stringify(songs).charAt(0)=='['){
      playlist.push(...aux);
    }else if(JSON.stringify(songs).charAt(0)=='{'){
      playlist.push(aux);
    }
    this.$playList.next(playlist);
  }
}

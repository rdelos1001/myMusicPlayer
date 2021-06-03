import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { IonRange, Platform } from '@ionic/angular';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { Plugins } from '@capacitor/core';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { Howl, Howler } from 'howler';
import { ThemeService } from 'src/app/services/theme.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { FilterPipe } from 'src/app/pipes/filter.pipe';

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
  toggleProgressVolume:boolean=false;
  allSongs:Song[]=[ 
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
  songName="";
  SDCARD_DIR=""
  FILESYSTEM_DIR="";
  activeSong:Song =null;
  player:Howl= null;
  isPlaying=false;
  progress=0;
  language;
  mod:number=1;
  volume=100;
  currentTime={ 
    minutes:0,
    seconds:""
  };
  totalTime={
    minutes:0,
    seconds:""
  };
  @ViewChild('volumeRange',{static:false}) volumeRange:ElementRef;
  @ViewChild('progressRange',{static:false}) progressRange:IonRange;
  constructor(public filePath: FilePath, 
              public platform: Platform,
              public file: File,
              private _utils:UtilsService,
              private _language:LanguageService,
              private _theme:ThemeService,
              private navBar:NavigationBar,
              private musicControls:MusicControls ) { }

  ionViewWillEnter(){
    this.navBar.setUp()
    this.navBar.hideNavigationBar();
    this.language=this._language.getActiveLanguage().songsPage;
  }
  async ngOnInit() {
    console.log("ngOnInit");
    this.language=this._language.getActiveLanguage().songsPage;

    this._utils.presentLoading(this.language.loadingSongs);
    Filesystem.requestPermissions().then(async()=>{
      
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

      this.findSongs(this.SDCARD_DIR+"/Music");
      this.findSongs(this.SDCARD_DIR+"/Download");
      this.findSongs(this.FILESYSTEM_DIR+"/Music");
      this.findSongs(this.FILESYSTEM_DIR+"/Download");

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

  setMod(mod:number){
    this.mod=mod;
    switch(mod){
      case 1:
        this._utils.presentToast(this.language.changeToNormalPlay);
        break;
      case 2:
        this._utils.presentToast(this.language.changeToSufflePlay);
        break
    }
  }

  start(song:Song){
    this.toggleProgressVolume=false
    if(this.progressRange)
    this.progressRange.value=0;
    if (this.player){
      this.player.stop();
    }
    this.player= new Howl({
      src:[song.path],
      html5:true,
      onplay:()=>{
        this.activeSong=song;
        this.isPlaying=true;
        this.totalTime= this.getTime(this.player.duration());
        this.updateProgress();
      },
      onend:()=>{
        this.next();
      }
    })
    this.player.play();
    this.createMusicControls(song);
  }
  togglePlayer(){
    if(this.isPlaying){
      this.player.pause();
    }else{
      this.player.play();
    }
    this.isPlaying=!this.isPlaying;
  }

  next(){
    let index;
    switch(this.mod){
      case 1:
        index=this.playList.indexOf(this.activeSong)+1;
        break;
      case 2:
        index= Math.round( Math.random()*(this.playList.length-1) );
        break;
    }

    if(index==this.playList.length){
      this.start(this.playList[0]);
    }else{
      this.start(this.playList[index]);
    }
  }
  prev(){
    let index=this.playList.indexOf(this.activeSong);
    if(index>0){
      this.start(this.playList[index-1]);
    }else{
      this.start(this.playList[this.playList.length-1]);
    }
  }
  seek(){
    let aux=this.progressRange.value.valueOf();
    let newValue= Number.parseInt(aux.toString());
    let duration = this.player.duration();
    this.player.seek(duration * ( newValue / 100));
  }
  updateProgress(){
    let aux= this.player.seek().toString();
    let seek:number = Number.parseInt(aux);
    this.currentTime= this.getTime(seek);
    this.progress=(seek/this.player.duration())*100||0;
    setTimeout(()=>{
      this.updateProgress()
    },500);
  }
  changeVolume(volume?:number){
    let newVolume=volume==undefined?this.volume:volume;
    this.volume=newVolume
    Howler.volume(newVolume/100);
  }
  toggleVolumeBar(){
    this.toggleProgressVolume=!this.toggleProgressVolume
  }
  private getTime(secondsNum:number){
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
      track       : song.name,		// optional, default : ''
      artist      : '',						// optional, default : ''
      album       : '',     // optional, default: ''
      cover       : '/assets/icon/icon.png',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying   : true,							// optional, default : true
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
    	
      //Flaticon author Freepik
      //https://www.flaticon.com/free-icon/play_748134?term=play&page=1&position=12&page=1&position=12&related_id=748134&origin=search
      playIcon: 'play.png',

      //Flaticon author Freepik
      //https://www.flaticon.com/free-icon/play_748134?term=play&page=1&position=12&page=1&position=12&related_id=748134&origin=search
      pauseIcon: 'pause.png',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification'
    });
    this.musicControls.listen();
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
          case 'music-controls-pause' || 'music-controls-play':
            // Do something
            this.togglePlayer();
            this.musicControls.updateIsPlaying(false)
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
      
      // Start listening for events
      // The plugin will run the events function each time an event is fired
      this.musicControls.listen();
      this.musicControls.updateIsPlaying(true)
    })
  }
}

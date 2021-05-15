import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { IonLabel, IonRange, Platform } from '@ionic/angular';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { Plugins } from '@capacitor/core';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { Howl, Howler } from 'howler';
import { ThemeService } from 'src/app/services/theme.service';

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
              private _theme:ThemeService ) { }

  ionViewWillEnter(){
    this.language=this._language.getActiveLanguage().songsPage;
  }
  async ngOnInit() {
    console.log("ngOnInit");
    this.language=this._language.getActiveLanguage().songsPage;

    this._utils.presentLoading(this.language.loadingSongs);
    Filesystem.requestPermissions().then(async()=>{
      var path="/storage";
      this.FILESYSTEM_DIR=path+"/emulated";
      var dir= await Filesystem.readdir({path});
      dir.files.forEach((el)=>{
        if(el!="self" && el!="emulated"){
          this.SDCARD_DIR=path+"/"+el;
        }
      })

      this.findSongs(this.SDCARD_DIR+"/Music");
      this.findSongs(this.SDCARD_DIR+"/Download");
      this.findSongs(this.FILESYSTEM_DIR+"/Music");
      this.findSongs(this.FILESYSTEM_DIR+"/Download");

      this.findByName();
      this._utils.hideLoading();
    })
  }

  async findSongs(path:string){
    var dir =await Filesystem.readdir({path});
    dir.files.forEach(async(el)=>{
      if(el.endsWith('.mp3')){
        await Filesystem.stat({ path:path+"/" + el })
        .then((fileInfo)=>{
          var win: any = window;
          fileInfo.uri=win.Ionic.WebView.convertFileSrc(fileInfo.uri);
          this.allSongs.push({name:el.substring(0,el.lastIndexOf('.')),path:fileInfo.uri})
        }).catch((err)=>{
          console.error("ERROR EN FILEINFO",err);
        });
      }
    })
  }

  findByName(){
    this.songName;
    if(this.songName==""){
      this.playList=this.allSongs;
    }else{
      var regex=new RegExp(this.songName,'i');
      var aux2:Song[]=[];
      for (const song of this.allSongs) {
        if(regex.test(song.name)){
          aux2.push(song);
        }
      }
      this.playList=aux2;
    }
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
  removeFind(){
    this.songName="";
    this.findByName();
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
}

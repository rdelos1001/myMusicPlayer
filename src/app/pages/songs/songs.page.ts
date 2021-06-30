import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { Plugins } from '@capacitor/core';
import { IonRange, ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { SongPlayerComponent } from 'src/app/components/song-player/song-player.component';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { GetdataService } from 'src/app/services/getdata.service';
const { Filesystem } = Plugins;

@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit {
  filterSong='';
  orderedBy="";
  playList:Song[]=[];
  activeSong:Song =null;
  isPlaying:boolean=false;
  isLoading:boolean=false;
  language;
  progress:number=0;
  @ViewChild('volumeRange',{static:false}) volumeRange:ElementRef;
  @ViewChild('progressRange',{static:false}) progressRange:IonRange;
  @ViewChildren('h2')h2lbls:QueryList<ElementRef>;

  constructor(private _utils:UtilsService,
              private _language:LanguageService,
              private _theme:ThemeService,
              private _musicController:MusicControllerService,
              private modalController: ModalController,
              private _getData:GetdataService) {
                
                this.language=this._language.getActiveLanguage();
              }
  ionViewWillEnter(){    
    this.language= this.language.id!=this._language.getActiveLanguage()?this._language.getActiveLanguage():this.language
  }
  async ngOnInit() {
    this._musicController.$changeSong.subscribe(song=>{
      this.activeSong=song;
    });
    this._musicController.getAllSongs().subscribe((allsongs)=>{
      this.playList=allsongs;
    });
/*     this.playList.push(await this._getData.getSong("assets/mp3/ACDC - Highway to Hell.mp3"));
    this.playList.push(await this._getData.getSong("assets/mp3/ACDC - Thunderstruck.mp3"));
    this.playList.push(await this._getData.getSong("assets/mp3/A day to remember - It's Complicated.mp3"));    
    this.playList.push(await this._getData.getSong("assets/mp3/Beret - Si Por Mi Fuera.mp3"));
 */
    this.isLoading=true;
    var files =(await Filesystem.readdir({path:"/storage"})).files;
    const SDCARD_DIR="/storage/"+files.find((el)=>el!="self"&&el!="emulated");
    this._getData.SDCARD_DIR=SDCARD_DIR;
    
    let dirs:string[]=[
      this._getData.FILESYSTEM_DIR+"/Music",
      this._getData.FILESYSTEM_DIR+"/Download",
      SDCARD_DIR+"/Music",
      SDCARD_DIR+"/Download"
    ];
    
    for (const dir of dirs) {
      await this._getData.findSongs(dir);
    };

    this.order("title");
    this._utils.presentToast("Canciones encontradas")
    this.isLoading=false;
  }
  async clickSong(song:Song){
    this.activeSong=song;
    this.isPlaying=true;
    const modal = await this.modalController.create({
      component: SongPlayerComponent,
      componentProps: {
        song:song,
        viewSongOrPlaySong:false 
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.activeSong=this._musicController.getActiveSong();
    this.isPlaying=this._musicController.player?this._musicController.player.playing():false;
    this.updateProgress();
  }
  songSettings(song:Song){
    this._utils.songSettingMenu(song).then((role)=>{
      if(role==="playLater"){
        this._musicController.playLater(song);
      }
    });
  }
  togglePlayer(){
    this._musicController.togglePlayer();
    this.isPlaying=this._musicController.player.playing();
  }
  async clickFooter(){
    const modal = await this.modalController.create({
      component: SongPlayerComponent,
      componentProps: { 
        song:this.activeSong,
        viewSongOrPlaySong:true 
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.activeSong=this._musicController.getActiveSong();
    this.isPlaying=this._musicController.player?this._musicController.player.playing():false;
  }
  next(){
    this._musicController.next();
    this.isPlaying=true;
  }
  async order(filter?:string){
    var filter = filter?filter: await this._utils.showOrderMenu();
    if(filter=="title"){
      this.playList.sort((a,b)=>{
        var textA = a.title.toLowerCase();
        var textB = b.title.toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().title;
    }else if(filter=="artist"){
      this.playList.sort((a,b)=>{
        var textA = a.artist.toLowerCase();
        var textB = b.artist.toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().artist;
    }else if(filter=="gender"){
      this.playList.sort((a,b)=>{
        var textA = a.genre.toLowerCase();
        var textB = b.genre.toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().gender;
    }
    this._musicController.setPlayList(this.playList);
  }
  async updateProgress(){
    if(this.isPlaying){
      let aux= this._musicController.player.seek().toString();
      let seek:number = Number.parseInt(aux);
      this.progress=(seek/this._musicController.player.duration())||0;
    }
    setTimeout(()=>this.updateProgress(),1000)
  }
  async highlight(){
    await new Promise((resolve)=>{
      setTimeout(()=>resolve(""),250)
    })

    var color:string="";
    if(this._theme.isDarkModeEnable()){
      color="tomato";
    }else{
      color="blue"
    }
    this.h2lbls.forEach((h2)=>{
      var innerHTML:string=h2.nativeElement.innerHTML;
      innerHTML=innerHTML.replace(new RegExp("<span style=\"color:"+color+"\">","g"),"");
      innerHTML=innerHTML.replace(new RegExp("</span>","g"),"");
      innerHTML=innerHTML.replace(new RegExp(this.filterSong,"g"),
      "<span style=\"color:"+color+"\">"+this.filterSong+"</span>");
      h2.nativeElement.innerHTML=innerHTML;
    })
  }
}
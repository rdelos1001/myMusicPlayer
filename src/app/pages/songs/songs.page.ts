import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Song } from 'src/app/interfaces/song';
import { IonRange, IonSlides, ModalController, Platform } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { SongPlayerComponent } from 'src/app/components/song-player/song-player.component';
import { MusicControllerService } from 'src/app/services/music-controller.service';
import { GetdataService } from 'src/app/services/getdata.service';
import { PlayList } from 'src/app/interfaces/PlayList';
import * as musicMetadata from 'music-metadata-browser';
import { ViewEditPlaylistComponent } from 'src/app/components/view-edit-playlist/view-edit-playlist.component';

@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit {

  filterSong='';
  orderedBy="";
  allSongs:Song[]=[];
  activeSong:Song =null;
  isPlaying:boolean=false;
  isLoading:boolean=false;
  language;
  progress:number=0;
  plList:PlayList[]=[];
  isCoverLoading:boolean=false;
  editPlayListModalActive:boolean=false;
  @ViewChild('volumeRange',{static:false}) volumeRange:ElementRef;
  @ViewChild('progressRange',{static:false}) progressRange:IonRange;
  @ViewChildren('h2')h2lbls:QueryList<ElementRef>;
  @ViewChildren('p')pLbls:QueryList<ElementRef>;

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

    await this._getData.requestFilesystemPermission()
    this._musicController.$changeSong.subscribe(song=>{
      this.activeSong=song;
      this.isPlaying=this._musicController.player.playing();
      this.updateProgress();
    });
    this._getData.getAllSongs().subscribe((allsongs)=>{
      for (const song of allsongs) {
        const songFormat = song.path.substring(song.path.lastIndexOf('.')+1);
        if(this._getData.formatsSelected.includes(songFormat) && !this.allSongs.includes(song) ){
          this.allSongs.push(song);
        }
      }
    });
    this._getData.getPlayListsObs().subscribe((allPlaylist)=>{
      this.plList=allPlaylist;
      this.loadPLCover();
    })
    this.isLoading=true;
    
    const localFiles=[
      "assets/mp3/ACDC - Highway to Hell.mp3",
      "assets/mp3/oggExample.ogg",
      "assets/mp3/opusExample.opus",
      "assets/mp3/accExample.aac",
      "assets/mp3/m4aExample.m4a",
      "assets/mp3/mp4Example.mp4",
      "assets/mp3/wavExample.wav",
      "assets/mp3/webmExample.webm",
      "assets/mp3/AC Valhalla - My Mother Told Me.mp3",
      "assets/mp3/Evanescence - Bring Me To Life.mp3"
    ]
    for (const f of localFiles) {
      const song=await this._getData.getSong(f);      
      this._getData.addAllSongs(song);
    }

/*     var files =(await Filesystem.readdir({path:"/storage"})).files;
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
     */

    this.loadPLCover();
    this.allSongs=this._getData.$allSongs.getValue();
    this.loadFileSystemFilter();
    this.order("title");
    this._utils.presentToast( this._language.getActiveLanguage().SongsImported );
    this.isLoading=false;
  }
  async clickSong(song:Song){
    this._musicController.setPlayList(this._getData.$allSongs.getValue());
      const modal = await this.modalController.create({
      component: SongPlayerComponent,
      componentProps: {
        song,
        playSong:true 
      }
    });
    await modal.present();
    await modal.onWillDismiss();
    this.activeSong=this._musicController.getActiveSong();
    this.isPlaying=this._musicController.player?this._musicController.player.playing():false;
  }
  async songSettings(song:Song){
    let role = await this._utils.songSettingMenu(song);
    if(role==="playLater"){
      this._musicController.playLater(song);
    }else if(role==="delSong"){
      this._getData.delSong(song);
    }else if(role==="addToPlayList"){
      let role=await this._utils.showAddToPlayListMenu(this._getData.getPlayLists());
      if(role=="newPlayList"){
        let name =await this._utils.newPlayListAlert();
        if(name){
          if(name.length==0){
            this._utils.presentAlert("Error",this._language.getActiveLanguage().nameOfPlayListNotEmpty)
          }else{
            let newPlayList=this._getData.newPlayList(name);
            this._getData.addSongToPlayList(newPlayList.id,song)
          }
        }
      }else if(role.substring(0,5)=="addTo"){
        var id=role.substring(5);        
        this._getData.addSongToPlayList(id,song)
      }
    };
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
        playSong:false 
      }
    });
    await modal.present();
    await modal.onWillDismiss();
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
      this.allSongs.sort((a,b)=>{
        var textA = a.title.toLowerCase();
        var textB = b.title.toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().title;
    }else if(filter=="artist"){
      this.allSongs.sort((a,b)=>{
        var textA = a.artists[0].toLowerCase();
        var textB = b.artists[0].toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().artist;
    }else if(filter=="genre"){
      this.allSongs.sort((a,b)=>{
        var textA = a.genres[0].toLowerCase();
        var textB = b.genres[0].toLowerCase();
        return (textA>textB)?1: (textB>textA)?-1:0
      });
      this.orderedBy=this._language.getActiveLanguage().genre;
    }
    this._musicController.setPlayList(this.allSongs);
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
    await this._utils.sleep(250);

    var color:string="";
    if(this._theme.isDarkModeEnable()){
      color="tomato";
    }else{
      color="blue";
    }
    this.h2lbls.forEach((h2)=>{
      var innerHTML:string=h2.nativeElement.innerHTML;

      innerHTML=innerHTML.replace(new RegExp(/<span style="color:(tomato|blue)">/g),"");
      innerHTML=innerHTML.replace(new RegExp("</span>","g"),"");
      if(this.filterSong.trim() != ""){
        const originalText=innerHTML;
      
        let match=originalText.match(new RegExp(this.filterSong,"i"));
        var textToHighlight = match ? match[0] : "";
        
        innerHTML=innerHTML.replace(
          new RegExp(textToHighlight,"g"),
          "<span style=\"color:"+color+"\">"+ textToHighlight +"</span>"
          );
      }
        
      h2.nativeElement.innerHTML=innerHTML;
    })
    this.pLbls.forEach((p)=>{
      var innerText:string=p.nativeElement.innerText;
      innerText=innerText.replace(new RegExp("<span style=\"color:"+color+"\">","g"),"");
      innerText=innerText.replace(new RegExp("</span>","g"),"");
      const originalText=innerText;
      
      let match=originalText.match(new RegExp(this.filterSong,"i"));
      var textToHighlight = match ? match[0] : "" 
      
      innerText=innerText.replace(
        new RegExp(textToHighlight,"g"),
        "<span style=\"color:"+color+"\">"+ textToHighlight +"</span>"
      );
      p.nativeElement.innerHTML=innerText;
    })    
  }
  async filter(formatsSelected?:string[]){
    const allFormats=this._getData.ALLFORMATS;
    if(!formatsSelected)
    formatsSelected = await this._utils.filterAlerts( this._language.getActiveLanguage().audioFormat );
    //"mp3", "mp4", "opus", "ogg", "wav", "aac", "m4a", "webm";
    var newPlayList:Song[]=[];
    if(formatsSelected){
      for (const format of allFormats) {
        if(formatsSelected.includes(format)){
          newPlayList.push(...this._getData.$allSongs.getValue().filter((s)=>s.path.endsWith(format)))
        }
      }
      localStorage.setItem('filters',JSON.stringify(formatsSelected))
      this.allSongs=newPlayList;
    }
  }
  loadFileSystemFilter(){
    let filtersAvaible:string[]= JSON.parse(localStorage.getItem('filters'));
    this.filter(filtersAvaible);    
  }
  nextPage(slides:IonSlides){
    slides.slideNext();
  }
  async prevPage(slides:IonSlides){
    await this._utils.sleep(250);
    slides.slidePrev();
  }
  async loadPLCover(){
    this.isCoverLoading=true;
    for (const pl of this.plList) {
      let i =0;
      while(!pl.cover && i<pl.songsPath.length){      
        let metadata = await musicMetadata.fetchFromUrl(pl.songsPath[i])
        pl.cover  = metadata.common.picture? metadata.common.picture[0]:null;
        
        i++;
      }
      this.isCoverLoading=false;
    }    
  }
  async playPlayList(pl:PlayList){
    this.editPlayListModalActive = true;
    var sleep= this._utils.sleep(250);
    let newPlayList:Song[]=[];
    for (const songPath of pl.songsPath) {
      newPlayList.push(await this._getData.getSong(songPath))
    }
    if(!this._musicController.getActiveSong()){
      await this._musicController.start(newPlayList[0])
    }
    this._musicController.setPlayList(newPlayList);
    await sleep;
    const modal = await this.modalController.create({
      component:ViewEditPlaylistComponent,
      componentProps:{    pl    },
      cssClass:"modal",
      mode:"ios",
      swipeToClose:true,
      showBackdrop:true
    });
  
    await modal.present();
    await modal.onDidDismiss();
    this.editPlayListModalActive = false;
  }
}
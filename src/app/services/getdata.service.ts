import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Song } from '../interfaces/song';
import * as musicMetadata from 'music-metadata-browser';
import { MusicControllerService } from './music-controller.service';
import { UtilsService } from './utils.service';
import { BehaviorSubject } from 'rxjs';
import { PlayList } from '../interfaces/playList';
import { LanguageService } from './language.service';
const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class GetdataService {

  public SDCARD_DIR="";
  public FILESYSTEM_DIR="/storage/emulated/0";
  public ALLFORMATS=["mp3", "mp4", "opus", "ogg", "wav", "aac", "m4a", "webm"];
  public formatsSelected:string[]=[];
  $allSongs:BehaviorSubject<Song[]>=new BehaviorSubject<Song[]>([]);
  $allPlayList:BehaviorSubject<PlayList[]>=new BehaviorSubject<PlayList[]>([]);
  
  constructor(private _utils:UtilsService,
    private _language:LanguageService) { 
                for(let format of this.ALLFORMATS){
                  if(JSON.parse(localStorage.getItem(format))){
                    this.formatsSelected.push(format);
                  }
                }
                this.$allPlayList.next(this.getPlayLists())
              }
  
  async findSongs(path:string):Promise<Song[]>{
    await Filesystem.readdir({path}).then(async (dir)=>{
      // /\.[mp3]|[mp4]|[opus]|[ogg]|[wav]|[aac]|[m4a]|[webm]$/
      var formatsPatternStr="\.";
      this.formatsSelected.forEach((format)=>{
        formatsPatternStr+=`[${format}]|`
      })
      formatsPatternStr=formatsPatternStr.slice(0,-1)
      formatsPatternStr+="$";
      const formatsPattern= new RegExp(formatsPatternStr);
      
      var files =dir.files.filter((el)=>formatsPattern.test(el));

      for (const el of files) {
        var win:any=window;
        let songPath:string=win.Ionic.WebView.convertFileSrc(path+"/"+el.replace('%',escape("%")));
        let song = await this.getSong(songPath)
        this.addAllSongs( song );
      }      
    }).catch((e:Error)=>{
      console.error("ERROR EN DIRECTORIO "+path+"= "+e.message);
    });
    return this.$allSongs.getValue();  
  }
  async getSong(filepath:string):Promise<Song>{
    let metadata=await musicMetadata.fetchFromUrl(filepath,{
      skipCovers:true,
      skipPostHeaders:true
    });    
    let artists = metadata.common.artists? metadata.common.artists:["unknown"];
    let title  = metadata.common.title? metadata.common.title:filepath.substring(filepath.lastIndexOf("/")+1,filepath.length-4);
    let genres  = metadata.common.genre? metadata.common.genre:["unknown"];
    
    let song:Song={
      path:filepath,
      title,
      artists,
      genres
    }    
    return song
  }
  async requestFilesystemPermission(){
    return new Promise<boolean>(async (resolve)=>{
      await Filesystem.requestPermissions();
      resolve(true)
    })
  }
  async delSong(song:Song){
    var accepted=await this._utils.presentAlertConfirm("Aviso","¿Estas seguro de eliminar la canción "+song.title+"?");
    if(accepted){
      Filesystem.deleteFile({path:song.path}).then(()=>{
        this.removeToAllSongs(song);        
        this._utils.presentAlert("Éxito","La canción se ha eliminado correctamente");
      })
    }
  }
  getAllSongs(){
    return this.$allSongs.asObservable();
  }
  addAllSongs(songs:Song[]|Song){
    var allsongs=this.$allSongs.getValue();
    var aux:any=songs;
    if(JSON.stringify(songs).charAt(0)=='['){
      for (const s of aux) {
        if(!allsongs.includes(s))
        allsongs.push(...aux);
      }
    }else if(JSON.stringify(songs).charAt(0)=='{'){
      if(!allsongs.includes(aux))
      allsongs.push(aux);
    }    
    this.$allSongs.next(allsongs);
  }
  removeToAllSongs(song){
    var allsongs =this.$allSongs.getValue();
    allsongs.splice( allsongs.indexOf(song),1 );  
  }
  newPlayList(name:string):PlayList{
    let maxNum:number=0;
    for (let i = 0; i < localStorage.length; i++) {
      let item=localStorage.getItem(localStorage.key(i))
      if(item.charAt(0)=='{'){
        let playList:PlayList= JSON.parse(item);
        let num:number=Number.parseInt(playList.id.substring(3,4))
        if(num>maxNum){
          maxNum=num;
        }
      }
    }
    console.log(maxNum);
    
    let newPlayList:PlayList={
      id:'pl'+(maxNum+1),
      name,
      songsPath:[]
    }
    console.log(newPlayList);
    
    localStorage.setItem(newPlayList.id,JSON.stringify(newPlayList));
    this.$allPlayList.next(this.getPlayLists())
    return newPlayList;
  }

  addSongToPlayList(idPlayList:string,song:Song){
    let playList:PlayList=JSON.parse(localStorage.getItem(idPlayList))
    if(!playList.songsPath.includes(song.path)){
      playList.songsPath.push(song.path);
      localStorage.setItem(playList.id,JSON.stringify(playList))
      this._utils.presentToast(`${this._language.getActiveLanguage().songAddedToPL} ${playList.name}`);
      this.$allPlayList.next(this.getPlayLists())
    }else{
      this._utils.presentToast(this._language.getActiveLanguage().songAlreadyExistsInPL);
    }
    return playList;
  }

  getPlayLists(){
    let playLists:PlayList[]=[];
    for (let i = 0; i < localStorage.length; i++) {
      let item=localStorage.getItem(localStorage.key(i))
      if(item.charAt(0)=='{'){
        let playList:PlayList= JSON.parse(item);
        playLists.push(playList);
      }
    }
    return playLists;
  }

  getPlayListsObs(){
    return this.$allPlayList.asObservable()
  }
  delPl(pl: PlayList) {
    localStorage.removeItem(pl.id);
    this.$allPlayList.next(this.getPlayLists())
  }
}

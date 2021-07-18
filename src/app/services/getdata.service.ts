import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Song } from '../interfaces/song';
import * as musicMetadata from 'music-metadata-browser';
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
                if(this.formatsSelected.length == 0){
                  this.formatsSelected.push("mp4");
                  this.formatsSelected.push("mp3");
                }
                this.$allPlayList.next(this.getPlayLists())
              }
  
  async findSongs(path:string):Promise<Song[]>{
    await Filesystem.readdir({path}).then(async (dir)=>{
      // /\.[mp3]|[mp4]|[opus]|[ogg]|[wav]|[aac]|[m4a]|[webm]$/
      
      var files =dir.files.filter((el)=>{
        for (const format of this.ALLFORMATS) {
          return el.endsWith(format);
        }
      });

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
    var song:Song;
    await musicMetadata.fetchFromUrl(filepath,{
      skipCovers:true,
      skipPostHeaders:true
    })
    .then((metadata)=>{
      let artists = ( !metadata.common.artists || (metadata.common.artists.length == 1 && metadata.common.artists[0].trim() == "") )
                    ? ["unknown"]
                    : metadata.common.artists.map((art)=>art=art.trim());

      let title  = (metadata.common.title) 
                   ? metadata.common.title 
                   : filepath.substring(filepath.lastIndexOf("/")+1,filepath.length-4);

      let genres  = ( !metadata.common.genre || (metadata.common.genre.length == 1 && metadata.common.genre[0].trim() == "") ) 
                    ? ["unknown"]
                    : metadata.common.genre.map((gen)=>gen=gen.trim());
      
      song = {
        path:filepath,
        title,
        artists,
        genres
      }
    })
    .catch((e)=>{
      console.error(`Error en ${filepath} ${e}`);
    });
    
    return song
  }
  async requestFilesystemPermission(){
    return new Promise<boolean>(async (resolve)=>{
      await Filesystem.requestPermissions();
      resolve(true)
    })
  }
  async delSong(song:Song){  
    let messageAlert:string = this._language.getActiveLanguage().alertMessageDeleteSong;
    messageAlert = messageAlert.replace('${song.title}',song.title);
    var accepted=await this._utils.presentAlertConfirm(this._language.getActiveLanguage().warning,messageAlert);
    let path = song.path.substring( song.path.indexOf('/storage') )
    if(accepted){
      Filesystem.deleteFile({path}).then(()=>{
        this.removeToAllSongs(song);
        let successMessage:string = this._language.getActiveLanguage().songDeletedSuccessfully; 
        successMessage = successMessage.replace('${song.title}',song.title);
        this._utils.presentAlert(this._language.getActiveLanguage().success,successMessage);
      }).catch(()=>{
        let errorMessage:string = this._language.getActiveLanguage().errorDeletingSong;
        errorMessage=errorMessage.replace('${song.title}',song.title);
        console.error(`Error eliminando la canción ${JSON.stringify(song)}`);
        this._utils.presentAlert('Error',errorMessage);
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
        let num:number=Number.parseInt(playList.id.substring(2))
        if(num>maxNum){
          maxNum=num;
        }
      }
    }    
    let newPlayList:PlayList={
      id:'pl'+(maxNum+1),
      name,
      songsPath:[]
    }    
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

  removeSongFromPL(pl:PlayList,song:Song):boolean{    
    let i =pl.songsPath.findIndex(spath=>spath==song.path)
    if(i!=-1 && pl.songsPath.length!=1){
      pl.songsPath.splice(i,1);
      localStorage.setItem(pl.id,JSON.stringify(pl))
      return true;
    } else if(i==-1) {
      this._utils.presentAlert("Error",this._language.getActiveLanguage().songDoesntExistInPL);
    } else {
      this._utils.presentAlert( this._language.getActiveLanguage().warning , this._language.getActiveLanguage().cantRemoveTheLastSongFromPL)
    }
    return false;
  }
}

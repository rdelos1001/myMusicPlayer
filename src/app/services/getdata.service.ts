import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Song } from '../interfaces/song';
import * as musicMetadata from 'music-metadata-browser';
import { MusicControllerService } from './music-controller.service';
const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  public SDCARD_DIR="";
  public FILESYSTEM_DIR="/storage/emulated/0";
  constructor(private _musicCtrl:MusicControllerService) {  }
  
  async findSongs(path:string):Promise<Song[]>{
    await Filesystem.readdir({path}).then(async (dir)=>{
      var files =dir.files.filter((el)=>el.endsWith('.mp3'));

      for (const el of files) {
        var win:any=window;
        let songPath:string=win.Ionic.WebView.convertFileSrc(path+"/"+el.replace('%',escape("%")));
        this._musicCtrl.addAllSongs( await this.getSong(songPath) );
      }
    }).catch((e:Error)=>{
      console.error("ERROR EN DIRECTORIO "+path+"= "+e.message);
    });
    return this._musicCtrl.$allSongs.getValue();  
  }

  async getSong(filepath:string):Promise<Song>{
    let metadata=await musicMetadata.fetchFromUrl(filepath,{
      skipCovers:true,
      skipPostHeaders:true
    });
    
    let artist = metadata.common.artist? metadata.common.artist:"unknown"
    let title  = metadata.common.title? metadata.common.title:filepath.substring(filepath.lastIndexOf("/")+1,filepath.length-4)
    let genre  = metadata.common.genre? metadata.common.genre[0]:"unknown"
    let song:Song={
      path:filepath,
      title,
      artist,
      genre
    }    
    return song
  }
}

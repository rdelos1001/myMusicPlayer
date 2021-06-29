import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Song } from '../interfaces/song';
import * as musicMetadata from 'music-metadata-browser';
const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  public SDCARD_DIR=""
  public FILESYSTEM_DIR="/storage/emulated/0";
  constructor() { 
    Filesystem.requestPermissions().then(()=>{
      Filesystem.readdir({path:"/storage"})
      .then((dir)=>{
        dir.files.forEach((el)=>{
          if(el!="self" && el!="emulated"){
            this.SDCARD_DIR="/storage/"+el;
          }
        })
      })
    })
    this.getSong("assets/mp3/ACDC - Thunderstruck.mp3")
  }

  async findSongs(path:string):Promise<Song[]>{
    var songs:Song[]=[];
    var dir =await Filesystem.readdir({path})
    dir.files.forEach(async(el)=>{
      if(el.endsWith('.mp3')){
        var win:any=window;
        let songPath=win.Ionic.WebView.convertFileSrc(path+"/"+el.replace('%',escape("%")));
        songs.push(await this.getSong(songPath))
      }
    })
    return songs
  }

  async getSong(filepath:string):Promise<Song>{
    let metadata=await musicMetadata.fetchFromUrl(filepath);
    let artist = metadata.native.ID3v1? metadata.native.ID3v1.find(t=>t.id=="artist").value:"unknown"
    let title  = metadata.native.ID3v1? metadata.native.ID3v1.find(t=>t.id=="title").value:filepath.substring(filepath.lastIndexOf("/")+1,filepath.length-3)
    let genre  = metadata.native.ID3v1? metadata.native.ID3v1.find(t=>t.id=="genre").value:"unknown"
    let cover  = metadata.common.picture? metadata.common.picture[0]:null;
    let song:Song={
      path:filepath,
      title,
      artist,
      genre,
      cover
    }    
    return song
  }
}

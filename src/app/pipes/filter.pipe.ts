import { Pipe, PipeTransform } from '@angular/core';
import { Song } from '../interfaces/song';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value:Song[], arg: string):Song[] {
    var resultSongs:Set<Song>= new Set<Song>();
    if(!arg){
      return value;
    }
    
    for (const song of value) {
      if(song.title.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
        resultSongs.add(song);
      }else{
        if(song.artists){
          song.artists.forEach((artist)=>{
            if(artist.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
              resultSongs.add(song);
            }
          })
        }
        
        if(song.genres){
          song.genres.forEach((genres)=>{
            if(genres.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
              resultSongs.add(song);
            }
          })
        }
      };
    };
    console.log(resultSongs);
    return Array.from(resultSongs);
  };

}

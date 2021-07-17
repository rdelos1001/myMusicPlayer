import { Pipe, PipeTransform } from '@angular/core';
import { Song } from '../interfaces/song';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value:Song[], arg: string):any {
    var resultSongs=[];
    if(!arg){
      return value
    }
    for (const song of value) {
      if(song.title.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
        resultSongs.push(song);
      }else{
        if(song.artists){
          song.artists.forEach((artist)=>{
            if(artist.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
              resultSongs.push(song);
            }
          })
        }

        if(song.genres){
          song.genres.forEach((genres)=>{
            if(genres.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase()) > -1){
              resultSongs.push(song);
            }
          })
        }
      };
    };
    return resultSongs;
  };

}

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
      if(song.title.toLocaleLowerCase().indexOf(arg.toLocaleLowerCase())>-1){
        resultSongs.push(song);
      };
    };
    return resultSongs;
  };

}

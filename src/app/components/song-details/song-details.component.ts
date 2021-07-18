import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Song } from 'src/app/interfaces/song';
import * as musicMetadata from 'music-metadata-browser';
import { ThemeService } from 'src/app/services/theme.service';
import { LanguageService } from 'src/app/services/language.service';
import { IPicture } from "music-metadata-browser";

@Component({
  selector: 'app-song-details',
  templateUrl: './song-details.component.html',
  styleUrls: ['./song-details.component.scss'],
})
export class SongDetailsComponent implements OnInit {

  @Input() song:Song;
  loadingCover:boolean=true;
  language;
  songCovers:IPicture[]=[];

  constructor(private modalController: ModalController, 
              private _theme:ThemeService,
              private _language:LanguageService) {
                this.language = this._language.getActiveLanguage();
               }

  ngOnInit() {
    musicMetadata.fetchFromUrl(this.song.path,{skipPostHeaders:true}).then((metadata)=>{
      this.songCovers = metadata.common.picture
      console.log(`myLog ${this.songCovers.length}`);
      console.log(this.songCovers);
      
      this.loadingCover=false;
    })
  }

  dismiss(){
    this.modalController.dismiss();
  }
}

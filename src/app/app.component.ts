import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ThemeService } from './services/theme.service';
import { UtilsService } from './services/utils.service';
import { Platform } from '@ionic/angular';
import { SongsPage } from './pages/songs/songs.page';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GetdataService } from './services/getdata.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers:[SongsPage]
})
export class AppComponent{
  constructor(private _language:LanguageService,
              private backGroundMode:BackgroundMode,
              private _theme:ThemeService,
              private _utils:UtilsService,
              private platform:Platform,
              private statusBar:StatusBar
              ) {
    if(this._utils.isFirstUse()){
      this._language.setLanguage('sp');
      this._theme.setTheme(this._theme.DARK_THEME);
      this._utils.setToNonFirtUse();
    }else{
      this._language.setLanguage(this._language.getLanguage());
      this._theme.setTheme(this._theme.getTheme());
    }
    this.platform.ready().then(()=>{
      this.backGroundMode.setDefaults({
        silent:true
      });
    })
    this.platform.pause.subscribe(()=>{
      this.backGroundMode.enable();
    })
  }
}

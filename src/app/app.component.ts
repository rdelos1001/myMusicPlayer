import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ThemeService } from './services/theme.service';
import { UtilsService } from './services/utils.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { Platform } from '@ionic/angular';
import { SongsPage } from './pages/songs/songs.page';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers:[SongsPage]
})
export class AppComponent{
  constructor(private _language:LanguageService,
              private navbar:NavigationBar,
              private backGroundMode:BackgroundMode,
              private _theme:ThemeService,
              private _utils:UtilsService,
              private platform:Platform,
              private statusBar:StatusBar) {
    if(this._utils.isFirstUse()){
      this._language.setLanguage('sp');
      this._theme.setTheme(this._theme.DARK_THEME);
      this._utils.setToNonFirtUse();
    }else{
      this._language.setLanguage(this._language.getLanguage());
      this._theme.setTheme(this._theme.getTheme());
    }
    this.platform.resume.subscribe(()=>{
      this.navbar.hideNavigationBar();
    })
    this.platform.ready().then(()=>{
      this.navbar.hideNavigationBar();
      this.backGroundMode.setDefaults({
        silent:true
      });
      if(this._theme.getTheme()==this._theme.DARK_THEME){
        this.statusBar.backgroundColorByHexString('#222428');
      }else{
        this.statusBar.backgroundColorByName('tomato');
      }
    })
    this.platform.pause.subscribe(()=>{
      this.backGroundMode.enable();
    })
  }
}

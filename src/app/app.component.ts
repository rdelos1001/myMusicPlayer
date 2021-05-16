import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ThemeService } from './services/theme.service';
import { UtilsService } from './services/utils.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  constructor(private _language:LanguageService,
              private navbar:NavigationBar,
              private backGroundMode:BackgroundMode,
              private _theme:ThemeService,
              private _utils:UtilsService,
              private platform:Platform) {
    if(this._utils.isFirstUse()){
      this._language.setLanguage('sp');
      this._theme.setTheme(this._theme.DARK_THEME);
    }else{
      this._language.setLanguage(this._language.getLanguage());
      this._theme.setTheme(this._theme.getTheme());
    }
    document.addEventListener('deviceready',()=>{
      this.backGroundMode.enable();
    })
    this.navbar.hideNavigationBar();
    this.platform.resume.subscribe(()=>{
      this.navbar.hideNavigationBar();
    })
  }
}

import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private _language:LanguageService,
              private navBar:NavigationBar,
              private backGroundMode:BackgroundMode,
              private _theme:ThemeService) {
    if(!this._language.getLanguage()){
      this._language.setLanguage('sp');
    }
    if(this._language.getLanguage()=="sp"){
      this._language.loadSpanishLanguage();
    }else if(this._language.getLanguage()=="en"){
      this._language.loadEnglishLanguage();
    }
    document.addEventListener('deviceready',()=>{
      this.backGroundMode.enable();
      this.navBar.hideNavigationBar();
    })
    var theme= this._theme.getTheme();
    if(!theme){
      this._theme.setTheme(this._theme.DARK_THEME);
    }else{
      this._theme.setTheme(theme);
    }
  }
}

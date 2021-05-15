import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private _language:LanguageService,
              private navBar:NavigationBar,
              private backGroundMode:BackgroundMode) {
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
  }
}

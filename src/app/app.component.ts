import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private _language:LanguageService,private navBar:NavigationBar) {
    if(!this._language.getLanguage()){
      this._language.setLanguage('sp');
    }
    if(this._language.getLanguage()=="sp"){
      this._language.loadSpanishLanguage();
    }else if(this._language.getLanguage()=="en"){
      this._language.loadEnglishLanguage();
    }
    this.navBar.setUp();
  }
}

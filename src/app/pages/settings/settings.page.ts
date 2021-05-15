import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private appVersion:AppVersion,
              private _language:LanguageService,
              private router:Router) { }
  version:string;
  languageValue:string;
  language;

  async ngOnInit() {
    this.languageValue=this._language.getLanguage();
    this.language=this._language.getActiveLanguage().settingsPage;
    this.version=await this.appVersion.getVersionNumber();
  }
  setLanguage(){
    this._language.setLanguage(this.languageValue);
    if(this.languageValue=="sp"){
      this._language.loadSpanishLanguage();
    }else if( this.languageValue=="en"){
      this._language.loadEnglishLanguage();
    }
    //this.language=this._language.getActiveLanguage().settingsPage;
  }
}
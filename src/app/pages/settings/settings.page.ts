import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private appVersion:AppVersion,
              private _language:LanguageService,
              private router:Router,
              private _theme:ThemeService) { }
  version:string;
  languageValue:string;
  themeValue:string;
  language;
  theme:string;
  async ngOnInit() {
    this.themeValue=this._theme.isDarkModeEnable()?'dark':'light';
    this.languageValue=this._language.getLanguage();
    this.language=this._language.getActiveLanguage().settingsPage;
    this.version=await this.appVersion.getVersionNumber();
  }

  toggleTheme(){
    if(this._theme.isDarkModeEnable()){
      this._theme.setTheme(this._theme.LIGHT_THEME);
    }else{
      this._theme.setTheme(this._theme.DARK_THEME);
    }
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
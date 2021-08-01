import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LanguageService } from 'src/app/services/language.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private appVersion:AppVersion,
              private _language:LanguageService,
              private router:Router,
              private _theme:ThemeService,
              private _utils:UtilsService) { }
  version:string;
  languageValue:string;
  themeValue:string;
  language;
  theme:string;
  async ngOnInit() {
    this.themeValue=this._theme.isDarkModeEnable()?'dark':'light';
    this.languageValue=this._language.getLanguage();
    this.language=this._language.getActiveLanguage();
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
    if(this.languageValue===this._language.SPANISH){
      this._language.setLanguage(this._language.SPANISH);
    }else if( this.languageValue===this._language.ENGLISH){
      this._language.setLanguage(this._language.ENGLISH);
    }
    //this.language=this._language.getActiveLanguage().settingsPage;
  }
  showWelcomeAlert(){
    this._utils.showWelcomeAlert();
  }
}
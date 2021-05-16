import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private _http:HttpClient) { }
  SPANISH="sp";
  ENGLISH="en";
  language;
  language$=new EventEmitter()

  private loadSpanishLanguage(){
    return new Promise<any>(resolve =>{
      this._http.get<any>("assets/language/spanish.json").subscribe(resp=>{
       this.setActiveLanguage(resp);
        resolve(resp);
      })
    });
  }
  private loadEnglishLanguage(){
    return new Promise<any>(resolve =>{
      this._http.get<any>("assets/language/english.json").subscribe(resp=>{
       this.setActiveLanguage(resp);
        resolve(resp);
      })
    });
  }

  getActiveLanguage(){
    return this.language;
  }
  private setActiveLanguage(language){
    this.language=language;
    this.language$.emit();
  }
  getLanguage():string{
    return localStorage.getItem('language');
  }
  setLanguage(language:string):void{
    if(language===this.SPANISH){
      this.loadSpanishLanguage();
    }else if(language===this.ENGLISH){
      this.loadEnglishLanguage();
    }
    this.setActiveLanguage(language)
    localStorage.setItem('language',language);
  }
}
